using System.ComponentModel.DataAnnotations;

namespace OnlineShop.Application.Categories.Requests
{
    public class CategoryUpdateModel
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        public string? ImageUrl { get; set; }
    }
}
