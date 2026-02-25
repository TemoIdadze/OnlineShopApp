using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OnlineShop.Application.Users.Requests;
using OnlineShop.Application.Users.Responses;
using OnlineShop.Application.Users;
using System.IdentityModel.Tokens.Jwt;
using OnlineShop.Ge.API.Infrastucture.Auth.JWT;
using System.Threading;

namespace OnlineShop.Ge.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IOptions<JWTConfiguration> _options;
        //private readonly HttpContent _httpContextAccecor;
        public UserController(IUserService userService, IOptions<JWTConfiguration> options)
        {
            _userService = userService;
            _options = options;
        }

        //[Route("Register")]
        [HttpPost("Register")]
        public async Task<UserResponseModel> Register(UserCreateModel user, CancellationToken cancellationToken)
        {
            return await _userService.CreateAsync(user, cancellationToken);
        }

        //[Route("LogIn")]
        [HttpPost("LogIn")]
        public async Task<string> LogIn(UserCreateModel request, CancellationToken cancellationToken)
        {
            var result = await _userService.AuthenticateAsync(request.UserName!, request.Password!, cancellationToken);

            var username = (string)result[0];
            var userId = (string)result[1];
            return JWTHelper.GenerateSecurityToken(username, userId, _options);
        }
    }
}
