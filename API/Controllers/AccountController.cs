using System.Security.Claims;
using System.Text;
using API.DTOs;
using API.Services;
using Domain;
using Infrastructure.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IEmailSender _emailSender;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public AccountController(UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager, IEmailSender emailSender,
            TokenService tokenService, IConfiguration config)
        {
            _config = config;
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
            _tokenService = tokenService;
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri("https://graph.facebook.com/")
            };
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users
                .Include(p => p.Photos)
                .SingleOrDefaultAsync(x => x.Email == loginDto.Email);

            if (user == null) return Unauthorized("Email or password is incorrect");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (result.Succeeded)
            {
                if(!user.EmailConfirmed) return Unauthorized("Email not confirmed");

                await SetRefreshToken(user);
                return CreateUserObject(user);
            }

            return Unauthorized("Email or password is incorrect");
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
            {
                ModelState.AddModelError("email", "Email is already taken");
                return ValidationProblem();
            }

            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.Username))
            {
                ModelState.AddModelError("username", "Username is already taken");
                return ValidationProblem();
            }

            var user = new AppUser
            {
                DisplayName = registerDto.DisplayName,
                Email = registerDto.Email,
                UserName = registerDto.Username
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded) return BadRequest("Problem registering user");

            var origin = Request.Headers["origin"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";

            var message = EmailTemplate.ConfirmEmail(verifyUrl);

            await _emailSender.SendEmailAsync(user.Email, "Please verify your email", message);

            return Ok("Registration successful - Please check your email to verify your account");
        }

        [AllowAnonymous]
        [HttpPost("verifyEmail")]
        public async Task<ActionResult> VerifyEmail(string token, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null) return Unauthorized();

            if (user.EmailConfirmed) return BadRequest("Email already confirmed");

            var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (!result.Succeeded) return BadRequest("Could not verify email address");

            return Ok("Email confirmed");
        }

        [AllowAnonymous]
        [HttpGet("resendEmailConfirmationLink")]
        public async Task<ActionResult> ResendEmailConfirmationLink(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null) return Unauthorized();

            if (user.EmailConfirmed) return Ok("Email already confirmed");

            var origin = Request.Headers["origin"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";

            var message = EmailTemplate.ConfirmEmail(verifyUrl);

            await _emailSender.SendEmailAsync(user.Email, "Please verify your email", message);

            return Ok("Resend email confirmation link - Please check your email to verify your account");
        }

        [AllowAnonymous]
        [HttpGet("sendEmailResetPasswordLink")]
        public async Task<ActionResult> SendEmailResetPasswordLink([FromQuery] string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null) return Unauthorized("Account does not exist");

            if (!user.EmailConfirmed) return Unauthorized("Account not verified");

            var origin = Request.Headers["origin"];
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var resetPasswordUrl = $"{origin}/account/resetPassword?token={token}&email={user.Email}";

            var message = EmailTemplate.ResetPassword(resetPasswordUrl);

            await _emailSender.SendEmailAsync(user.Email, "Reset your password", message);

            return Ok("Reset password email sent - Please check your email to reset your password");
        }

        [AllowAnonymous]
        [HttpPost("resetPassword")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPassDto resetPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);

            if (user == null) return Unauthorized();

            if (resetPasswordDto.NewPassword != resetPasswordDto.ConfirmPassword) return BadRequest("Passwords do not match");

            var decodedTokenBytes = WebEncoders.Base64UrlDecode(resetPasswordDto.Token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, resetPasswordDto.NewPassword);

            if (!result.Succeeded) return BadRequest("Could not reset password");

            return Ok("Password reset successful");
        }

        [AllowAnonymous]
        [HttpPost("fbLogin")]
        public async Task<ActionResult<UserDto>> FacebookLogin(string accessToken)
        {
            var fbVerifyKeys = _config["Facebook:AppId"] + "|" + _config["Facebook:AppSecret"];

            var verifyToken = await _httpClient.GetAsync($"debug_token?input_token={accessToken}&access_token={fbVerifyKeys}");

            if (!verifyToken.IsSuccessStatusCode)
            {
                return Unauthorized();
            }

            var fbUrl = $"me?access_token={accessToken}&fields=name,email,picture.width(100).height(100)";

            var fbInfo = await _httpClient.GetFromJsonAsync<FacebookDto>(fbUrl);

            var user = await _userManager.Users
                .Include(p => p.Photos)
                .SingleOrDefaultAsync(x => x.Email == fbInfo.Email);

            if (user != null)
            {
                return CreateUserObject(user);
            }

            user = new AppUser
            {
                DisplayName = fbInfo.Name,
                Email = fbInfo.Email,
                UserName = fbInfo.Email,
                Photos = new List<Photo>
                {
                    new Photo
                    {
                        Id = "fb_" + fbInfo.Id,
                        Url = fbInfo.Picture.Data.Url,
                        IsMain = true
                    }
                }
            };

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest("Problem creating user from Facebook account");
            }

            await SetRefreshToken(user);
            return CreateUserObject(user);
        }

        [Authorize]
        [HttpPost("refreshToken")]
        public async Task<ActionResult<UserDto>> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var user = await _userManager.Users
                .Include(r => r.RefreshTokens)
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.UserName == User.FindFirstValue(ClaimTypes.Name));

            if (user == null) return Unauthorized();

            var oldRefreshToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken);

            if (oldRefreshToken != null && !oldRefreshToken.IsActive) return Unauthorized();

            if (oldRefreshToken != null) oldRefreshToken.Revoked = DateTime.UtcNow;

            return CreateUserObject(user);
        }

        [Authorize]
        [HttpPost("changePassword")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByNameAsync(User.FindFirstValue(ClaimTypes.Name)!);

            if (user == null) return Unauthorized();

            if (!await _userManager.CheckPasswordAsync(user, changePasswordDto.CurrentPassword)) return Unauthorized("Incorrect current password");

            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmPassword) return BadRequest("Passwords do not match");

            if (await _userManager.CheckPasswordAsync(user, changePasswordDto.NewPassword)) return BadRequest("New password cannot be the same as old password");

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);

            if (!result.Succeeded) return BadRequest("Could not change password");

            return Ok("Password changed successfully");
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.Users
                .Include(p => p.Photos)
                .SingleOrDefaultAsync(x => x.Email == User.FindFirstValue(ClaimTypes.Email));

            await SetRefreshToken(user);
            return CreateUserObject(user);
        }

        private async Task SetRefreshToken(AppUser user)
        {
            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshTokens.Add(refreshToken);
            await _userManager.UpdateAsync(user);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7)
            };

            Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
        }

        private UserDto CreateUserObject(AppUser user)
        {
            return new UserDto
            {
                DisplayName = user.DisplayName,
                Image = user?.Photos?.FirstOrDefault(x => x.IsMain)?.Url,
                Token = _tokenService.CreateToken(user),
                Username = user.UserName
            };
        }
    }
}