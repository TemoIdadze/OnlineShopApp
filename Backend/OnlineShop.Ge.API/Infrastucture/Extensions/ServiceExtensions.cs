using OnlineShop.Application.CartItems;
using OnlineShop.Application.CartItems.Repositories;
using OnlineShop.Application.Categories;
using OnlineShop.Application.Categories.Repositories;
using OnlineShop.Application.Products;
using OnlineShop.Application.Products.Repositories;
using OnlineShop.Application.Users;
using OnlineShop.Application.Users.Repositories;
using OnlineShop.Infrastructure.CartItems;
using OnlineShop.Infrastructure.Categories;
using OnlineShop.Infrastructure.Products;
using OnlineShop.Infrastructure.Users;

namespace OnlineShop.Ge.API.Infrastucture.Extensions
{
    public static class ServiceExtensions
    {
        public static void AddServices(this IServiceCollection services)
        {
            services.AddScoped<ICartItemService, CartItemService>();
            services.AddScoped<ICartItemRepository, CartItemRepository>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddTransient<IHttpContextAccessor, HttpContextAccessor>();

        }
    }
}
