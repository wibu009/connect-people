using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ResetPassDto
{
    [Required]
    public string Email { get; set; }
    [Required]
    public string Token { get; set; }
    [Required]
    public string Password { get; set; }
}