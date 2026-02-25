using OnlineShop.Domain.Users;

namespace OnlineShop.Application.Users.Repositories;

public interface IUserRepository
{
    #region Methods
    Task<List<User>> GetAllAsync(CancellationToken cancellationToken);
    Task<User> CreateAsync(User user, CancellationToken cancellationToken);
    Task<User> GetAsync(string username, string password, CancellationToken cancellationToken);
    Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task DeleteAsync(string id, CancellationToken cancellationToken);
    Task UpdateAsync(User user, CancellationToken cancellationToken);
    Task<bool> Exists(string username, CancellationToken cancellationToken);
    Task Detach(string id, CancellationToken cancellationToken);
    #endregion
}