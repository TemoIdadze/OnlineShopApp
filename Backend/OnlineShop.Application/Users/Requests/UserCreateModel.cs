using System.ComponentModel.DataAnnotations;

namespace OnlineShop.Application.Users.Requests;

public class UserCreateModel
{
    [Required] public string? UserName { get; set; }
    [Required] public string? Password { get; set; }
}