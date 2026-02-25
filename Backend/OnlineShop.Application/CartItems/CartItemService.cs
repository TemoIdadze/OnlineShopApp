using Mapster;
using OnlineShop.Application.CartItems.Repositories;
using OnlineShop.Application.CartItems.Requests;
using OnlineShop.Application.CartItems.Responses;
using OnlineShop.Application.Products.Repositories;
using OnlineShop.Application.Products.Requests;
using OnlineShop.Application.Products.Responses;
using OnlineShop.Domain.CartItems;
using OnlineShop.Domain.Products;

namespace OnlineShop.Application.CartItems
{
    public class CartItemService : ICartItemService
    {
        #region Private Fields

        private readonly ICartItemRepository _repository;
        #endregion

        #region Constructor
        public CartItemService(ICartItemRepository repository)
        {
            _repository = repository;
        }
        #endregion

        #region Methods
        public async Task CreateAsync(
       string userId,
       CartItemCreateModel cartItem,
       CancellationToken cancellationToken)
        {
            if (cartItem == null)
                throw new ArgumentNullException(nameof(cartItem));

            var newCartItem = cartItem.Adapt<CartItem>();

            // ✅ CRITICAL LINE (YOU WERE MISSING THIS)
            newCartItem.UserId = userId;

            await _repository.CreateAsync(newCartItem, cancellationToken);
        }
        public async Task DeleteAsync(int id, CancellationToken cancellationToken)
        {
            if (!await _repository.Exists(id, cancellationToken))
            {
                throw new KeyNotFoundException($"Product with ID {id} not found.");
            }

            await _repository.DeleteAsync(id, cancellationToken);
        }

        public async Task<List<CartItemResponseModel>> GetAllByUserIdAsync(string userId, CancellationToken cancellationToken)
        {

            var cartItems = await _repository.GetAllByUserIdAsync(userId, cancellationToken);



            return cartItems.Adapt<List<CartItemResponseModel>>();
        }


        public async Task<CartItemResponseModel> GetAsync(int id, CancellationToken cancellationToken)
        {
            try
            {
                var cartItem = await _repository.GetAsync(id, cancellationToken) ?? throw new KeyNotFoundException($"cartItem with ID {id} not found.");
                return cartItem.Adapt<CartItemResponseModel>();
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while retrieving the product.", ex);
            }
        }

        public async Task UpdateAsync(CartItemUpdateModel cartItem, CancellationToken cancellationToken)
        {
            if (cartItem == null)
                throw new ArgumentNullException(nameof(cartItem), "ProductUpdateModel cannot be null.");

            if (!await _repository.Exists(cartItem.Id, cancellationToken))
                throw new KeyNotFoundException($"Product with ID {cartItem.Id} not found.");

            var updatedCartItem = cartItem.Adapt<CartItem>();

            await _repository.UpdateAsync(updatedCartItem, cancellationToken);
        }
        #endregion
    }
}
