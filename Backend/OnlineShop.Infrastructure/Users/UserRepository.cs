using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Users.Repositories;
using OnlineShop.Domain.Users;
using OnlineShop.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace OnlineShop.Infrastructure.Users
{
    public class UserRepository : IUserRepository
    {
        #region Private Members
        private readonly ShopDbContext _context;
        #endregion
        #region Constructor
        public UserRepository(ShopDbContext context)
        {
            _context = context;
        }
        #endregion
        #region Methods
        public async Task<User> CreateAsync(User user, CancellationToken cancellationToken)
        {
            await _context.Users.AddAsync(user, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return user;
        }

        public async Task DeleteAsync(string id, CancellationToken cancellationToken)
        {
            var user = await GetByIdAsync(id, cancellationToken);

            if (user != null)
                _context.Users.Remove(user);

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task Detach(string id, CancellationToken cancellationToken)
        {
            var entity = await GetByIdAsync(id, cancellationToken);
            if (entity != null)
            {
                var entry = _context.Entry(entity);
                if (entry.State != EntityState.Detached)
                {
                    entry.State = EntityState.Detached;
                }
            }
        }

        public async Task<bool> Exists(string username, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                throw new ArgumentException("Username cannot be null or empty.", nameof(username));
            }

            return await _context.Users.AnyAsync(x => x.UserName == username, cancellationToken);
        }

        public async Task<List<User>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await _context.Users.ToListAsync(cancellationToken);
        }

        public async Task<User> GetAsync(string username, string password, CancellationToken cancellationToken)
        {


            var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == username, cancellationToken);

            if (user != null && password == user.PasswordHash)
            {
                return user;
            }

            return null;

        }
        public async Task<User> GetByIdAsync(string id, CancellationToken cancellationToken)
        {
            return await _context.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        }

        public async Task UpdateAsync(User user, CancellationToken cancellationToken)
        {
            await Detach(user.Id, cancellationToken);
            _context.Users.Update(user);
            await _context.SaveChangesAsync(cancellationToken);
        }
        #endregion
    }
}
