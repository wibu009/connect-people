namespace Infrastructure.Email;

public static class EmailTemplate
{
    private const string ContainerStyle = "font-family: Arial, Helvetica, sans-serif; box-sizing: border-box; padding: 20px; text-align: center;";
    private const string LogoStyle = "width: 100px; margin-bottom: 10px";
    private const string HeadingStyle = "font-size: 24px; margin-bottom: 15px; color: #3498db";
    private const string ParagraphStyle = "font-size: 16px;";
    private const string ButtonStyle = "background-color: #3498db; border: none; border-radius: 3px; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;";

    public static string ResetPassword(string url)
    {
        return $@"
             <div style='{ContainerStyle}'>
                 <img style='{LogoStyle}' src='https://cdn-icons-png.flaticon.com/512/1570/1570240.png' alt='logo' />
                 <h1 style='{HeadingStyle}'>Reset Password</h1>
                 <p style='{ParagraphStyle}'>A password change has been requested for your account. If this was you, please use the button below to reset your password.</p>
                 <a href='{url}' style='{ButtonStyle}'>Reset Password</a>
             </div>";
    }

    public static string ConfirmEmail(string url)
    {
        return $@"
             <div style='{ContainerStyle}'>
                 <img style='{LogoStyle}' src='https://cdn-icons-png.flaticon.com/512/1570/1570240.png' alt='logo' />
                 <h1 style='{HeadingStyle}'>Confirm Email</h1>
                 <p style='{ParagraphStyle}'>Please click the button below to verify your email address.</p>
                 <a href='{url}' style='{ButtonStyle}'>Confirm Email</a>
             </div>";
    }
}