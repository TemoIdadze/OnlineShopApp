using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Products.Repositories;
using OnlineShop.Domain.Products;
using OnlineShop.Persistence.Context;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineShop.Infrastructure.Products
{
    public class ProductRepository : IProductRepository
    {
        #region Private Members
        private readonly ShopDbContext _context;
        #endregion

        #region Constructor
        public ProductRepository(ShopDbContext context)
        {
            _context = context;
        }
        #endregion

        #region Methods
        public async Task CreateAsync(Product product, CancellationToken cancellationToken)
        {
            await _context.Products!.AddAsync(product, cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);

        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken)
        {
            var product = await GetAsync(id, cancellationToken);

            _context.Products!.Remove(product!);

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
            return await _context.Products!.AnyAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<List<Product>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await _context.Products!
                .Include(p => p.Category)
                .ToListAsync(cancellationToken);
        }

        public async Task<Product> GetAsync(int id, CancellationToken cancellationToken)
        {
            var product = await _context.Products!
                .Include(p => p.Category)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            return product!;
        }

        public async Task UpdateAsync(Product product, CancellationToken cancellationToken)
        {
            await Detach(product.Id, cancellationToken);

            _context.Products!.Update(product);

            await _context.SaveChangesAsync(cancellationToken);

        }
        #endregion
    }
}
