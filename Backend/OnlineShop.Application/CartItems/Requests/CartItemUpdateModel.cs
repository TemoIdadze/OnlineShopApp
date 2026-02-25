using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineShop.Application.CartItems.Requests
{
    public class CartItemUpdateModel
    {
        public int Id { get; set; }

        public string UserId { get; set; } = null!;

        public int ProductId { get; set; }

        public int Quantity { get; set; }
    }
}
