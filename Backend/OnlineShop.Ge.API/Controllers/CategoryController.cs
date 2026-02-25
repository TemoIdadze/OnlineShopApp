using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.Categories;
using OnlineShop.Application.Categories.Requests;
using OnlineShop.Application.Categories.Responses;

namespace OnlineShop.Ge.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CategoryController(ICategoryService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<CategoryResponseModel> GetById(int id, CancellationToken cancellationToken)
        {
            return await _service.GetAsync(id, cancellationToken);
        }

        [HttpGet("AllCategories")]
        public async Task<List<CategoryResponseModel>> GetAll(CancellationToken cancellationToken)
        {
            return await _service.GetAllAsync(cancellationToken);
        }

        [HttpPost("NewCategory")]
        public async Task<IActionResult> Post(CategoryCreateModel request, CancellationToken cancellationToken)
        {
            await _service.CreateAsync(request, cancellationToken);
            return Ok(new { message = "Category created successfully" });
        }

        [HttpPut("UpdateCategory")]
        public async Task<IActionResult> Put(CategoryUpdateModel request, CancellationToken cancellationToken)
        {
            await _service.UpdateAsync(request, cancellationToken);
            return Ok(new { message = "Category updated successfully" });
        }

        [HttpDelete("DeleteCategory/{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _service.DeleteAsync(id, cancellationToken);
            return Ok(new { message = "Category deleted successfully" });
        }
    }
}
