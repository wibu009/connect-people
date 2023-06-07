using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; }
    [Required]
    [RegularExpression("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$", ErrorMessage = "Password must have 1 Uppercase, 1 Lowercase, 1 number, 1 non alphanumeric and at least 8 characters")]
    public string NewPassword { get; set; }
    [Required]
    public string ConfirmPassword { get; set; }
}