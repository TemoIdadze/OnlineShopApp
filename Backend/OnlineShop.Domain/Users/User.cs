namespace OnlineShop.Domain.Users;

using Microsoft.AspNetCore.Identity;
using OnlineShop.Domain.CartItems;

public class User : IdentityUser
{
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
