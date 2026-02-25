using Mapster;
using OnlineShop.Application.Products.Responses;
using OnlineShop.Domain.Products;

namespace OnlineShop.Application.Mapster
{
    public static class MappingConfig
    {
        public static void RegisterMappings()
        {
            // Product to ProductResponseModel mapping
            TypeAdapterConfig<Product, ProductResponseModel>
                .NewConfig()
                .Map(dest => dest.CategoryId, src => src.Category != null ? src.Category.Id : 0)
                .Map(dest => dest.CategoryName, src => src.Category != null ? src.Category.Name : null)
                .Compile();
        }
    }
}
