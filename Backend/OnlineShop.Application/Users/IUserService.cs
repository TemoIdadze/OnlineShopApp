using OnlineShop.Application.Users.Requests;
using OnlineShop.Application.Users.Responses;

namespace OnlineShop.Application.Users
{
    public interface IUserService
    {
        Task<List<object>> AuthenticateAsync(string username, string password, CancellationToken cancellationToken);
        Task<UserResponseModel> CreateAsync(UserCreateModel user, CancellationToken cancellationToken);
    }
}
