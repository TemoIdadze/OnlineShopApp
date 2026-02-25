using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Categories.Repositories;
using OnlineShop.Domain.Categories;
using OnlineShop.Persistence.Context;

namespace OnlineShop.Infrastructure.Categories
{
    public class CategoryRepository : ICategoryRepository
    {
        #region Private Members

        private readonly ShopDbContext _context;

        #endregion

        #region Constructor

        public CategoryRepository(ShopDbContext context)
        {
            _context = context;
        }

        #endregion

        #region Methods

        public async Task CreateAsync(Category category, CancellationToken cancellationToken)
        {
            await _context.Categories.AddAsync(category, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken)
        {
            var category = await GetAsync(id, cancellationToken);
            _context.Categories.Remove(category!);
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
            return await _context.Categories.AnyAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<bool> ExistsByName(string name, CancellationToken cancellationToken)
        {
            return await _context.Categories.AnyAsync(x => x.Name.ToLower() == name.ToLower(), cancellationToken);
        }

        public async Task<List<Category>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await _context.Categories.ToListAsync(cancellationToken);
        }

        public async Task<Category> GetAsync(int id, CancellationToken cancellationToken)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            return category!;
        }

        public async Task UpdateAsync(Category category, CancellationToken cancellationToken)
        {
            await Detach(category.Id, cancellationToken);
            _context.Categories.Update(category);
            await _context.SaveChangesAsync(cancellationToken);
        }

        #endregion
    }
}
