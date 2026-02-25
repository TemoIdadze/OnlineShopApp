using Mapster;
using OnlineShop.Application.Categories.Repositories;
using OnlineShop.Application.Categories.Requests;
using OnlineShop.Application.Categories.Responses;
using OnlineShop.Domain.Categories;

namespace OnlineShop.Application.Categories
{
    public class CategoryService : ICategoryService
    {
        #region Private Members

        private readonly ICategoryRepository _repository;

        #endregion

        #region Constructor

        public CategoryService(ICategoryRepository repository)
        {
            _repository = repository;
        }

        #endregion

        #region Methods

        public async Task CreateAsync(CategoryCreateModel category, CancellationToken cancellationToken)
        {
            if (category == null)
            {
                throw new ArgumentNullException(nameof(category), "Category cannot be null.");
            }

            if (await _repository.ExistsByName(category.Name, cancellationToken))
            {
                throw new InvalidOperationException($"Category with name '{category.Name}' already exists.");
            }

            var newCategory = category.Adapt<Category>();

            try
            {
                await _repository.CreateAsync(newCategory, cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while creating the category.", ex);
            }
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken)
        {
            if (!await _repository.Exists(id, cancellationToken))
            {
                throw new KeyNotFoundException($"Category with ID {id} not found.");
            }

            await _repository.DeleteAsync(id, cancellationToken);
        }

        public async Task<List<CategoryResponseModel>> GetAllAsync(CancellationToken cancellationToken)
        {
            try
            {
                var list = await _repository.GetAllAsync(cancellationToken);
                return list?.Adapt<List<CategoryResponseModel>>() ?? new List<CategoryResponseModel>();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving categories.", ex);
            }
        }

        public async Task<CategoryResponseModel> GetAsync(int id, CancellationToken cancellationToken)
        {
            try
            {
                var category = await _repository.GetAsync(id, cancellationToken)
                    ?? throw new KeyNotFoundException($"Category with ID {id} not found.");
                return category.Adapt<CategoryResponseModel>();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving the category.", ex);
            }
        }

        public async Task UpdateAsync(CategoryUpdateModel category, CancellationToken cancellationToken)
        {
            if (category == null)
                throw new ArgumentNullException(nameof(category), "CategoryUpdateModel cannot be null.");

            if (!await _repository.Exists(category.Id, cancellationToken))
                throw new KeyNotFoundException($"Category with ID {category.Id} not found.");

            var updatedCategory = category.Adapt<Category>();

            await _repository.UpdateAsync(updatedCategory, cancellationToken);
        }

        #endregion
    }
}
