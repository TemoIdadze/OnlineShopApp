using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OnlineShop.Domain.CartItems;
using OnlineShop.Domain.Categories;
using OnlineShop.Domain.Products;
using OnlineShop.Domain.Users;

namespace OnlineShop.Persistence.Context;

public class ShopDbContext : IdentityDbContext<User>
{
    public ShopDbContext(DbContextOptions<ShopDbContext> options)
        : base(options)
    {
    }
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<CartItem> CartItems { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(ShopDbContext).Assembly);
    }
}