using OnlineShop.Domain.Products;

namespace OnlineShop.Application.Products.Repositories
{
    public interface IProductRepository
    {
        #region Methods
        Task<List<Product>> GetAllAsync(CancellationToken cancellationToken);
        Task<Product> GetAsync(int id, CancellationToken cancellationToken);
        Task CreateAsync(Product product, CancellationToken cancellationToken);
        Task UpdateAsync(Product product, CancellationToken cancellationToken);
        Task DeleteAsync(int id, CancellationToken cancellationToken);
        Task<bool> Exists(int id, CancellationToken cancellationToken);
        Task Detach(int id, CancellationToken cancellationToken);
        #endregion
    }
}
