using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string DisplayName { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [RegularExpression("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$", ErrorMessage = "Password must have 1 Uppercase, 1 Lowercase, 1 number, 1 non alphanumeric and at least 8 characters")]
        public string Password { get; set; }
    }
}