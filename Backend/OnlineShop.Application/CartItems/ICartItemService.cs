using OnlineShop.Application.CartItems.Requests;
using OnlineShop.Application.CartItems.Responses;
using OnlineShop.Application.Products.Requests;
using OnlineShop.Application.Products.Responses;
using OnlineShop.Domain.CartItems;

namespace OnlineShop.Application.CartItems
{
    public interface ICartItemService
    {
        Task<List<CartItemResponseModel>> GetAllByUserIdAsync(string userId, CancellationToken cancellationToken);
        Task<CartItemResponseModel> GetAsync(int id, CancellationToken cancellationToken);
        Task CreateAsync(string usedId,CartItemCreateModel cartItem, CancellationToken cancellationToken);
        Task UpdateAsync(CartItemUpdateModel cartItem, CancellationToken cancellationToken);
        Task DeleteAsync(int id, CancellationToken cancellationToken);
    }
}
