using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.Products;
using OnlineShop.Application.Products.Requests;
using OnlineShop.Application.Products.Responses;

namespace OnlineShop.Ge.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _service;
        //private readonly IHttpContextAccessor _httpContextAccessor;
        //private readonly string userId;
        public ProductController(IProductService service/*, IHttpContextAccessor httpContextAccessor*/)
        {
            _service = service;
            //_httpContextAccessor = httpContextAccessor;
            //userId = _httpContextAccessor.HttpContext!.User.FindFirst("UserId")!.Value;
        }

        [HttpGet("{Id}")]
        public async Task<ProductResponseModel> GetById(int Id, CancellationToken cancellationToken)
        {
            return await _service.GetAsync(Id, cancellationToken);
        }
        [HttpGet("AllProducts")]
        public async Task<List<ProductResponseModel>> GetAll(CancellationToken cancellationToken)
        {
            return await _service.GetAllAsync(cancellationToken);
        }

        [HttpPost("NewProduct")]
        public async Task Post(ProductCreateModel request, CancellationToken cancellationToken)
        {

            await _service.CreateAsync(request, cancellationToken);
        }
        [HttpPut("UpdateProduct")]
        public async Task Put(ProductUpdateModel request, CancellationToken cancellationToken)
        {

            await _service.UpdateAsync(request, cancellationToken);
        }

        [HttpDelete("DeleteProduct/{id}")]
        public async Task Delete(int id, CancellationToken cancellationToken)
        {
            await _service.DeleteAsync(id, cancellationToken);
        }

    }
}
