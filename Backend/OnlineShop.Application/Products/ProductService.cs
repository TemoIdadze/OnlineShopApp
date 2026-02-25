using Mapster;
using OnlineShop.Application.Products.Repositories;
using OnlineShop.Application.Products.Requests;
using OnlineShop.Application.Products.Responses;
using OnlineShop.Domain.Products;

namespace OnlineShop.Application.Products
{
    public class ProductService : IProductService
    {
        #region Private Members 

        private readonly IProductRepository _repository;
        #endregion

        #region Constructor
        public ProductService(IProductRepository repository)
        {
            _repository = repository;
        }
        #endregion

        #region Methods

        public async Task CreateAsync(ProductCreateModel product, CancellationToken cancellationToken)
        {
            if (product == null)
            {
                throw new ArgumentNullException(nameof(product), "Product cannot be null.");
            }

            var newProduct = product.Adapt<Product>();

            try
            {
                await _repository.CreateAsync(newProduct, cancellationToken);
            }
            catch (Exception ex)
            {

                throw new Exception("An error occurred while creating the product.", ex);
            }
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken)
        {
            if (!await _repository.Exists(id, cancellationToken))
            {
                throw new KeyNotFoundException($"Product with ID {id} not found.");
            }

            await _repository.DeleteAsync(id, cancellationToken);
        }

        public async Task<List<ProductResponseModel>> GetAllAsync(CancellationToken cancellationToken)
        {
            try
            {
                var list = await _repository.GetAllAsync(cancellationToken);


                return list?.Adapt<List<ProductResponseModel>>() ?? new List<ProductResponseModel>();
            }
            catch (Exception ex)
            {

                throw new Exception("An error occurred while retrieving products.", ex);
            }
        }

        public async Task<ProductResponseModel> GetAsync(int id, CancellationToken cancellationToken)
        {
            try
            {
                var product = await _repository.GetAsync(id, cancellationToken) ?? throw new KeyNotFoundException($"Product with ID {id} not found.");
                return product.Adapt<ProductResponseModel>();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving the product.", ex);
            }
        }

        public async Task UpdateAsync(ProductUpdateModel product, CancellationToken cancellationToken)
        {
            if (product == null)
                throw new ArgumentNullException(nameof(product), "ProductUpdateModel cannot be null.");

            if (!await _repository.Exists(product.Id, cancellationToken))
                throw new KeyNotFoundException($"Product with ID {product.Id} not found.");

            var updatedProduct = product.Adapt<Product>();

            await _repository.UpdateAsync(updatedProduct, cancellationToken);
        }

        #endregion
    }
}
