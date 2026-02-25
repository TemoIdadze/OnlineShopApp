using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.CartItems;
using OnlineShop.Application.CartItems.Requests;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace OnlineShop.Ge.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartItemController : ControllerBase
    {
        private readonly ICartItemService _service;

        public CartItemController(ICartItemService service)
        {
            _service = service;
        }

        [HttpGet("GetCartItems")]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Invalid token: user id not found");

            var cartItems = await _service.GetAllByUserIdAsync(userId, cancellationToken);
            return Ok(cartItems);
        }

        [HttpPost("NewCartItem")]
        [Authorize]
        public async Task<IActionResult> Post(
     [FromBody] CartItemCreateModel request,
     CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Invalid token: user id not found");

            await _service.CreateAsync(userId, request, cancellationToken);

            return Ok();
        }

        [HttpDelete("DeleteCartItem/{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _service.DeleteAsync(id, cancellationToken);
            return NoContent();
        }

        [HttpPut("UpdateCartItem")]
        public async Task<IActionResult> Put(CartItemUpdateModel request, CancellationToken cancellationToken)
        {
            await _service.UpdateAsync(request, cancellationToken);
            return NoContent();
        }
    }
}