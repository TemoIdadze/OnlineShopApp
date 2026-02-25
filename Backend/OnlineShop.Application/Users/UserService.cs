using Mapster;
using OnlineShop.Application.Users.Repositories;
using OnlineShop.Application.Users.Requests;
using OnlineShop.Application.Users.Responses;
using OnlineShop.Domain.Users;

namespace OnlineShop.Application.Users
{
    public class UserService : IUserService
    {
        #region Private Members

        private readonly IUserRepository _repository;

        #endregion

        #region Constructor

        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }

        #endregion

        #region Methods
        public async Task<List<object>> AuthenticateAsync(string username, string password, CancellationToken cancellationToken)
        {
            password = CustomPasswordHasher.GenerateHash(password);

            var userEntity = await _repository.GetAsync(username, password, cancellationToken) ?? throw new Exception("username or password is incorrect");

            List<object> result = new()
            {
                userEntity.UserName,userEntity.Id
            };
            return result;
        }

        public async Task<UserResponseModel> CreateAsync(UserCreateModel user, CancellationToken cancellationToken)
        {
            var exists = await _repository.Exists(user.UserName!, cancellationToken);

            if (exists)
                throw new Exception("user already exists");
            user.Password = CustomPasswordHasher.GenerateHash(user.Password!);

            var userEntity = user.Adapt<User>();

            userEntity.PasswordHash = user.Password;

            userEntity.Email = userEntity.UserName;

            userEntity.NormalizedUserName = userEntity.UserName.ToUpper();

            userEntity.NormalizedEmail = userEntity.NormalizedUserName;

            userEntity.LockoutEnabled = true;


            var exisedUser = await _repository.CreateAsync(userEntity, cancellationToken);

            return exisedUser.Adapt<UserResponseModel>();
        }

        #endregion
    }
}
