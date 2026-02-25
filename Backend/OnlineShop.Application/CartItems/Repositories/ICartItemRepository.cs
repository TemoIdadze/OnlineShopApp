using OnlineShop.Domain.CartItems;
using OnlineShop.Domain.Products;

namespace OnlineShop.Application.CartItems.Repositories
{
    public interface ICartItemRepository
    {
        Task<List<CartItem>> GetAllByUserIdAsync(string userId, CancellationToken cancellationToken);
        Task<CartItem> GetAsync(int id, CancellationToken cancellationToken);
        Task CreateAsync(CartItem cartItem, CancellationToken cancellationToken);
        Task DeleteAsync(int id, CancellationToken cancellationToken);
        Task UpdateAsync(CartItem cartItem, CancellationToken cancellationToken);
        Task<bool> Exists(int id, CancellationToken cancellationToken);
        Task Detach(int id, CancellationToken cancellationToken);
    }
}
