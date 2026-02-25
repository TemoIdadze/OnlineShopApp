using OnlineShop.Application.Products.Requests;
using OnlineShop.Application.Products.Responses;

namespace OnlineShop.Application.Products
{
    public interface IProductService
    {
        Task<List<ProductResponseModel>> GetAllAsync(CancellationToken cancellationToken);
        Task<ProductResponseModel> GetAsync(int id, CancellationToken cancellationToken);
        Task CreateAsync(ProductCreateModel product, CancellationToken cancellationToken);
        Task UpdateAsync(ProductUpdateModel product, CancellationToken cancellationToken);
        Task DeleteAsync(int id, CancellationToken cancellationToken);

    }
}
