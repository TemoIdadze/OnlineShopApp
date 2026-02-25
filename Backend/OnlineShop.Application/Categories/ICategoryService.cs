using OnlineShop.Application.Categories.Requests;
using OnlineShop.Application.Categories.Responses;

namespace OnlineShop.Application.Categories
{
    public interface ICategoryService
    {
        Task<List<CategoryResponseModel>> GetAllAsync(CancellationToken cancellationToken);
        Task<CategoryResponseModel> GetAsync(int id, CancellationToken cancellationToken);
        Task CreateAsync(CategoryCreateModel category, CancellationToken cancellationToken);
        Task UpdateAsync(CategoryUpdateModel category, CancellationToken cancellationToken);
        Task DeleteAsync(int id, CancellationToken cancellationToken);
    }
}
