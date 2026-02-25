using OnlineShop.Domain.Categories;

namespace OnlineShop.Application.Categories.Repositories
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync(CancellationToken cancellationToken);
        Task<Category> GetAsync(int id, CancellationToken cancellationToken);
        Task CreateAsync(Category category, CancellationToken cancellationToken);
        Task UpdateAsync(Category category, CancellationToken cancellationToken);
        Task DeleteAsync(int id, CancellationToken cancellationToken);
        Task<bool> Exists(int id, CancellationToken cancellationToken);
        Task<bool> ExistsByName(string name, CancellationToken cancellationToken);
        Task Detach(int id, CancellationToken cancellationToken);
    }
}
