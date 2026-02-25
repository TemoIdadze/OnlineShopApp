using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.CartItems.Repositories;
using OnlineShop.Domain.CartItems;
using OnlineShop.Domain.Products;
using OnlineShop.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineShop.Infrastructure.CartItems
{
    public class CartItemRepository : ICartItemRepository
    {
        private readonly ShopDbContext _context;
        public CartItemRepository(ShopDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(CartItem cartItem, CancellationToken cancellationToken)
        {
            await _context.CartItems!.AddAsync(cartItem,cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<CartItem> GetAsync(int id, CancellationToken cancellationToken)
        {
            var CartItem = await _context.CartItems!.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            return CartItem!;
        }



        public async Task DeleteAsync(int id, CancellationToken cancellationToken)
        {
            var cartItem = await GetAsync(id, cancellationToken);

            _context.CartItems!.Remove(cartItem!);

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task Detach(int id, CancellationToken cancellationToken)
        {
            var entity = await GetAsync(id, cancellationToken);
            if (entity != null)
            {
                var entry = _context.Entry(entity);
                if (entry.State != EntityState.Detached)
                {
                    entry.State = EntityState.Detached;
                }
            }
        }

        public async Task<bool> Exists(int id, CancellationToken cancellationToken)
        {
            return await _context.CartItems!.AnyAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<List<CartItem>> GetAllByUserIdAsync(string userId, CancellationToken cancellationToken)
        {
            return await _context.CartItems!
             .Include(c => c.Product)
             .Where(c => c.UserId == userId)
             .ToListAsync( cancellationToken);
        }

        public Task RemoveAsync(int id, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateAsync(CartItem cartItem, CancellationToken cancellationToken)
        {
            var existing = await GetAsync(cartItem.Id, cancellationToken);
            existing.Quantity = cartItem.Quantity;
            await _context.SaveChangesAsync(cancellationToken);
        }

    }
}
