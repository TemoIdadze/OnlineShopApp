using OnlineShop.Application.Products.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineShop.Application.CartItems.Responses
{
    public class CartItemResponseModel
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public ProductResponseModel Product { get; set; }
    }
}
