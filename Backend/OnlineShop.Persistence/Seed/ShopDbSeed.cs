using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OnlineShop.Application.Users;
using OnlineShop.Domain.CartItems;
using OnlineShop.Domain.Categories;
using OnlineShop.Domain.Products;
using OnlineShop.Domain.Users;
using OnlineShop.Persistence.Context;

namespace OnlineShop.Persistence.Seed
{
    public class ShopDbSeed
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var database = scope.ServiceProvider.GetRequiredService<ShopDbContext>();

            Migrate(database);
            SeedEverything(database);
        }

        private static void Migrate(ShopDbContext context)
        {
            context.Database.Migrate();
        }

        private static void SeedEverything(ShopDbContext context)
        {
            var seeded = false;

            SeedUsers(context, ref seeded);
            SeedCategories(context, ref seeded);

            if (seeded)
            {
                context.SaveChanges();
                seeded = false;
            }

            SeedProducts(context, ref seeded);

            if (seeded)
            {
                context.SaveChanges();
                seeded = false;
            }

            SeedCartItems(context, ref seeded);

            if (seeded)
                context.SaveChanges();
        }

        private static void SeedUsers(ShopDbContext context, ref bool seeded)
        {
            var users = new List<User>()
            {
                new()
                {
                    Id = "8e445865-a24d-4543-a6c6-9443d048cdb9",
                    UserName = "admin",
                    NormalizedUserName = "ADMIN",
                    Email = "admin@myshop.com",
                    NormalizedEmail = "ADMIN@MYSHOP.COM",
                    PasswordHash = CustomPasswordHasher.GenerateHash("Admin123"),
                    LockoutEnabled = true
                },
                new()
                {
                    Id = "eae85ec6-546e-41bb-afdf-f33324422ab5",
                    UserName = "john",
                    NormalizedUserName = "JOHN",
                    Email = "john@example.com",
                    NormalizedEmail = "JOHN@EXAMPLE.COM",
                    PasswordHash = CustomPasswordHasher.GenerateHash("John123"),
                    LockoutEnabled = true
                },
                new()
                {
                    Id = "f3b8a2d1-9c44-4f7e-bc91-2c6d7a9e1f02",
                    UserName = "demo",
                    NormalizedUserName = "DEMO",
                    Email = "demo@myshop.com",
                    NormalizedEmail = "DEMO@MYSHOP.COM",
                    PasswordHash = CustomPasswordHasher.GenerateHash("Demo123"),
                    LockoutEnabled = true
                }
            };

            foreach (var user in users)
            {
                if (context.Users.Any(x => x.UserName == user.UserName)) continue;
                context.Users.Add(user);
                seeded = true;
            }
        }

        private static void SeedCategories(ShopDbContext context, ref bool seeded)
        {
            var categories = new List<Category>()
            {
                new()
                {
                    Name = "Fruits",
                    Description = "Fresh and delicious fruits from local farms",
                    ImageUrl = "/images/categories/fruits.png"
                },
                new()
                {
                    Name = "Vegetables",
                    Description = "Healthy and nutritious vegetables",
                    ImageUrl = "/images/categories/vegetables.png"
                },
                new()
                {
                    Name = "Dairy",
                    Description = "Fresh milk, cheese, yogurt and more",
                    ImageUrl = "/images/categories/dairy.png"
                },
                new()
                {
                    Name = "Bakery",
                    Description = "Freshly baked bread, pastries and cakes",
                    ImageUrl = "/images/categories/bakery.png"
                },
                new()
                {
                    Name = "Beverages",
                    Description = "Refreshing drinks and juices",
                    ImageUrl = "/images/categories/beverages.png"
                },
                new()
                {
                    Name = "Snacks",
                    Description = "Delicious snacks and treats",
                    ImageUrl = "/images/categories/snacks.png"
                },
                new()
                {
                    Name = "Meat & Seafood",
                    Description = "Premium quality meat and fresh seafood",
                    ImageUrl = "/images/categories/meat.png"
                },
                new()
                {
                    Name = "Frozen Foods",
                    Description = "Convenient frozen meals and ingredients",
                    ImageUrl = "/images/categories/frozen.png"
                }
            };

            foreach (var category in categories)
            {
                if (context.Categories.Any(x => x.Name == category.Name)) continue;
                context.Categories.Add(category);
                seeded = true;
            }
        }

        private static void SeedProducts(ShopDbContext context, ref bool seeded)
        {
            // Get all categories
            var fruits = context.Categories.FirstOrDefault(c => c.Name == "Fruits");
            var vegetables = context.Categories.FirstOrDefault(c => c.Name == "Vegetables");
            var dairy = context.Categories.FirstOrDefault(c => c.Name == "Dairy");
            var bakery = context.Categories.FirstOrDefault(c => c.Name == "Bakery");
            var beverages = context.Categories.FirstOrDefault(c => c.Name == "Beverages");
            var snacks = context.Categories.FirstOrDefault(c => c.Name == "Snacks");
            var meat = context.Categories.FirstOrDefault(c => c.Name == "Meat & Seafood");
            var frozen = context.Categories.FirstOrDefault(c => c.Name == "Frozen Foods");

            var products = new List<Product>();

            // Fruits
            if (fruits != null)
            {
                products.AddRange(new[]
                {
                    new Product
                    {
                        Name = "Red Apple",
                        Description = "Crisp and sweet red apples, perfect for snacking",
                        Price = 2.99m,
                        StockQuantity = 150,
                        ImageUrl = "/images/products/apple.png",
                        CategoryId = fruits.Id
                    },
                    new Product
                    {
                        Name = "Banana",
                        Description = "Ripe yellow bananas, rich in potassium",
                        Price = 1.49m,
                        StockQuantity = 200,
                        ImageUrl = "/images/products/banana.png",
                        CategoryId = fruits.Id
                    },
                    new Product
                    {
                        Name = "Orange",
                        Description = "Juicy navel oranges, full of vitamin C",
                        Price = 3.49m,
                        StockQuantity = 120,
                        ImageUrl = "/images/products/orange.png",
                        CategoryId = fruits.Id
                    },
                    new Product
                    {
                        Name = "Strawberry Pack",
                        Description = "Sweet and fresh strawberries, 1lb pack",
                        Price = 4.99m,
                        StockQuantity = 80,
                        ImageUrl = "/images/products/strawberry.png",
                        CategoryId = fruits.Id
                    },
                    new Product
                    {
                        Name = "Watermelon",
                        Description = "Refreshing seedless watermelon",
                        Price = 6.99m,
                        StockQuantity = 40,
                        ImageUrl = "/images/products/watermelon.png",
                        CategoryId = fruits.Id
                    },
                    new Product
                    {
                        Name = "Grapes",
                        Description = "Sweet green seedless grapes",
                        Price = 3.99m,
                        StockQuantity = 90,
                        ImageUrl = "/images/products/grapes.png",
                        CategoryId = fruits.Id
                    },
                    new Product
                    {
                        Name = "Mango",
                        Description = "Tropical sweet mangoes",
                        Price = 2.49m,
                        StockQuantity = 60,
                        ImageUrl = "/images/products/mango.png",
                        CategoryId = fruits.Id
                    },
                    new Product
                    {
                        Name = "Pineapple",
                        Description = "Fresh golden pineapple",
                        Price = 4.49m,
                        StockQuantity = 35,
                        ImageUrl = "/images/products/pineapple.png",
                        CategoryId = fruits.Id
                    }
                });
            }

            // Vegetables
            if (vegetables != null)
            {
                products.AddRange(new[]
                {
                    new Product
                    {
                        Name = "Tomatoes",
                        Description = "Vine-ripened red tomatoes",
                        Price = 2.99m,
                        StockQuantity = 100,
                        ImageUrl = "/images/products/tomato.png",
                        CategoryId = vegetables.Id
                    },
                    new Product
                    {
                        Name = "Cucumber",
                        Description = "Fresh crispy cucumbers",
                        Price = 1.29m,
                        StockQuantity = 80,
                        ImageUrl = "/images/products/cucumber.png",
                        CategoryId = vegetables.Id
                    },
                    new Product
                    {
                        Name = "Carrots",
                        Description = "Organic baby carrots, 1lb bag",
                        Price = 2.49m,
                        StockQuantity = 120,
                        ImageUrl = "/images/products/carrot.png",
                        CategoryId = vegetables.Id
                    },
                    new Product
                    {
                        Name = "Broccoli",
                        Description = "Fresh green broccoli crowns",
                        Price = 2.79m,
                        StockQuantity = 70,
                        ImageUrl = "/images/products/broccoli.png",
                        CategoryId = vegetables.Id
                    },
                    new Product
                    {
                        Name = "Spinach",
                        Description = "Organic baby spinach, 5oz bag",
                        Price = 3.99m,
                        StockQuantity = 60,
                        ImageUrl = "/images/products/spinach.png",
                        CategoryId = vegetables.Id
                    },
                    new Product
                    {
                        Name = "Bell Peppers",
                        Description = "Mixed color bell peppers, 3 pack",
                        Price = 4.49m,
                        StockQuantity = 55,
                        ImageUrl = "/images/products/bellpepper.png",
                        CategoryId = vegetables.Id
                    },
                    new Product
                    {
                        Name = "Potatoes",
                        Description = "Russet potatoes, 5lb bag",
                        Price = 4.99m,
                        StockQuantity = 90,
                        ImageUrl = "/images/products/potato.png",
                        CategoryId = vegetables.Id
                    },
                    new Product
                    {
                        Name = "Onions",
                        Description = "Yellow onions, 3lb bag",
                        Price = 2.99m,
                        StockQuantity = 100,
                        ImageUrl = "/images/products/onion.png",
                        CategoryId = vegetables.Id
                    }
                });
            }

            // Dairy
            if (dairy != null)
            {
                products.AddRange(new[]
                {
                    new Product
                    {
                        Name = "Whole Milk",
                        Description = "Fresh whole milk, 1 gallon",
                        Price = 4.29m,
                        StockQuantity = 80,
                        ImageUrl = "/images/products/milk.png",
                        CategoryId = dairy.Id
                    },
                    new Product
                    {
                        Name = "Greek Yogurt",
                        Description = "Plain Greek yogurt, 32oz",
                        Price = 5.99m,
                        StockQuantity = 60,
                        ImageUrl = "/images/products/yogurt.png",
                        CategoryId = dairy.Id
                    },
                    new Product
                    {
                        Name = "Cheddar Cheese",
                        Description = "Sharp cheddar cheese block, 8oz",
                        Price = 4.49m,
                        StockQuantity = 70,
                        ImageUrl = "/images/products/cheese.png",
                        CategoryId = dairy.Id
                    },
                    new Product
                    {
                        Name = "Butter",
                        Description = "Unsalted butter, 1lb",
                        Price = 5.49m,
                        StockQuantity = 90,
                        ImageUrl = "/images/products/butter.png",
                        CategoryId = dairy.Id
                    },
                    new Product
                    {
                        Name = "Eggs",
                        Description = "Large eggs, dozen",
                        Price = 3.99m,
                        StockQuantity = 150,
                        ImageUrl = "/images/products/eggs.png",
                        CategoryId = dairy.Id
                    },
                    new Product
                    {
                        Name = "Cream Cheese",
                        Description = "Philadelphia cream cheese, 8oz",
                        Price = 3.49m,
                        StockQuantity = 50,
                        ImageUrl = "/images/products/creamcheese.png",
                        CategoryId = dairy.Id
                    }
                });
            }

            // Bakery
            if (bakery != null)
            {
                products.AddRange(new[]
                {
                    new Product
                    {
                        Name = "Sourdough Bread",
                        Description = "Artisan sourdough loaf",
                        Price = 4.99m,
                        StockQuantity = 30,
                        ImageUrl = "/images/products/bread.png",
                        CategoryId = bakery.Id
                    },
                    new Product
                    {
                        Name = "Croissants",
                        Description = "Butter croissants, 4 pack",
                        Price = 5.49m,
                        StockQuantity = 25,
                        ImageUrl = "/images/products/croissant.png",
                        CategoryId = bakery.Id
                    },
                    new Product
                    {
                        Name = "Bagels",
                        Description = "Plain bagels, 6 pack",
                        Price = 4.29m,
                        StockQuantity = 40,
                        ImageUrl = "/images/products/bagel.png",
                        CategoryId = bakery.Id
                    },
                    new Product
                    {
                        Name = "Chocolate Muffins",
                        Description = "Double chocolate muffins, 4 pack",
                        Price = 5.99m,
                        StockQuantity = 35,
                        ImageUrl = "/images/products/muffin.png",
                        CategoryId = bakery.Id
                    },
                    new Product
                    {
                        Name = "Baguette",
                        Description = "French baguette, fresh baked",
                        Price = 2.99m,
                        StockQuantity = 20,
                        ImageUrl = "/images/products/baguette.png",
                        CategoryId = bakery.Id
                    }
                });
            }

            // Beverages
            if (beverages != null)
            {
                products.AddRange(new[]
                {
                    new Product
                    {
                        Name = "Orange Juice",
                        Description = "Fresh squeezed orange juice, 52oz",
                        Price = 5.99m,
                        StockQuantity = 60,
                        ImageUrl = "/images/products/orangejuice.png",
                        CategoryId = beverages.Id
                    },
                    new Product
                    {
                        Name = "Mineral Water",
                        Description = "Sparkling mineral water, 6 pack",
                        Price = 4.49m,
                        StockQuantity = 100,
                        ImageUrl = "/images/products/water.png",
                        CategoryId = beverages.Id
                    },
                    new Product
                    {
                        Name = "Green Tea",
                        Description = "Organic green tea bags, 20 count",
                        Price = 4.99m,
                        StockQuantity = 80,
                        ImageUrl = "/images/products/greentea.png",
                        CategoryId = beverages.Id
                    },
                    new Product
                    {
                        Name = "Coffee Beans",
                        Description = "Premium arabica coffee beans, 12oz",
                        Price = 9.99m,
                        StockQuantity = 50,
                        ImageUrl = "/images/products/coffee.png",
                        CategoryId = beverages.Id
                    },
                    new Product
                    {
                        Name = "Apple Juice",
                        Description = "100% apple juice, no sugar added",
                        Price = 3.99m,
                        StockQuantity = 70,
                        ImageUrl = "/images/products/applejuice.png",
                        CategoryId = beverages.Id
                    },
                    new Product
                    {
                        Name = "Lemonade",
                        Description = "Fresh lemonade, 64oz",
                        Price = 4.49m,
                        StockQuantity = 45,
                        ImageUrl = "/images/products/lemonade.png",
                        CategoryId = beverages.Id
                    }
                });
            }

            // Snacks
            if (snacks != null)
            {
                products.AddRange(new[]
                {
                    new Product
                    {
                        Name = "Potato Chips",
                        Description = "Classic salted potato chips, 10oz",
                        Price = 3.99m,
                        StockQuantity = 100,
                        ImageUrl = "/images/products/chips.png",
                        CategoryId = snacks.Id
                    },
                    new Product
                    {
                        Name = "Mixed Nuts",
                        Description = "Roasted mixed nuts, 16oz",
                        Price = 8.99m,
                        StockQuantity = 60,
                        ImageUrl = "/images/products/nuts.png",
                        CategoryId = snacks.Id
                    },
                    new Product
                    {
                        Name = "Chocolate Bar",
                        Description = "Dark chocolate bar, 70% cacao",
                        Price = 3.49m,
                        StockQuantity = 80,
                        ImageUrl = "/images/products/chocolate.png",
                        CategoryId = snacks.Id
                    },
                    new Product
                    {
                        Name = "Granola Bars",
                        Description = "Oat and honey granola bars, 6 pack",
                        Price = 4.49m,
                        StockQuantity = 70,
                        ImageUrl = "/images/products/granola.png",
                        CategoryId = snacks.Id
                    },
                    new Product
                    {
                        Name = "Popcorn",
                        Description = "Butter popcorn, microwave 3 pack",
                        Price = 3.29m,
                        StockQuantity = 90,
                        ImageUrl = "/images/products/popcorn.png",
                        CategoryId = snacks.Id
                    },
                    new Product
                    {
                        Name = "Cookies",
                        Description = "Chocolate chip cookies, 12 pack",
                        Price = 4.99m,
                        StockQuantity = 55,
                        ImageUrl = "/images/products/cookies.png",
                        CategoryId = snacks.Id
                    }
                });
            }

            // Meat & Seafood
            if (meat != null)
            {
                products.AddRange(new[]
                {
                    new Product
                    {
                        Name = "Chicken Breast",
                        Description = "Boneless skinless chicken breast, 1lb",
                        Price = 7.99m,
                        StockQuantity = 50,
                        ImageUrl = "/images/products/chicken.png",
                        CategoryId = meat.Id
                    },
                    new Product
                    {
                        Name = "Ground Beef",
                        Description = "Lean ground beef, 1lb",
                        Price = 6.99m,
                        StockQuantity = 40,
                        ImageUrl = "/images/products/beef.png",
                        CategoryId = meat.Id
                    },
                    new Product
                    {
                        Name = "Salmon Fillet",
                        Description = "Atlantic salmon fillet, 8oz",
                        Price = 12.99m,
                        StockQuantity = 30,
                        ImageUrl = "/images/products/salmon.png",
                        CategoryId = meat.Id
                    },
                    new Product
                    {
                        Name = "Pork Chops",
                        Description = "Bone-in pork chops, 1lb",
                        Price = 5.99m,
                        StockQuantity = 35,
                        ImageUrl = "/images/products/pork.png",
                        CategoryId = meat.Id
                    },
                    new Product
                    {
                        Name = "Shrimp",
                        Description = "Large shrimp, peeled and deveined, 1lb",
                        Price = 14.99m,
                        StockQuantity = 25,
                        ImageUrl = "/images/products/shrimp.png",
                        CategoryId = meat.Id
                    }
                });
            }

            // Frozen Foods
            if (frozen != null)
            {
                products.AddRange(new[]
                {
                    new Product
                    {
                        Name = "Frozen Pizza",
                        Description = "Pepperoni pizza, 12 inch",
                        Price = 6.99m,
                        StockQuantity = 40,
                        ImageUrl = "/images/products/pizza.png",
                        CategoryId = frozen.Id
                    },
                    new Product
                    {
                        Name = "Ice Cream",
                        Description = "Vanilla ice cream, 1.5qt",
                        Price = 5.49m,
                        StockQuantity = 50,
                        ImageUrl = "/images/products/icecream.png",
                        CategoryId = frozen.Id
                    },
                    new Product
                    {
                        Name = "Frozen Vegetables",
                        Description = "Mixed vegetables, 16oz bag",
                        Price = 2.99m,
                        StockQuantity = 60,
                        ImageUrl = "/images/products/frozenveggies.png",
                        CategoryId = frozen.Id
                    },
                    new Product
                    {
                        Name = "Frozen Berries",
                        Description = "Mixed berries, 12oz bag",
                        Price = 4.99m,
                        StockQuantity = 45,
                        ImageUrl = "/images/products/frozenberries.png",
                        CategoryId = frozen.Id
                    },
                    new Product
                    {
                        Name = "Chicken Nuggets",
                        Description = "Breaded chicken nuggets, 24oz",
                        Price = 7.49m,
                        StockQuantity = 35,
                        ImageUrl = "/images/products/nuggets.png",
                        CategoryId = frozen.Id
                    }
                });
            }

            foreach (var product in products)
            {
                if (context.Products.Any(x => x.Name == product.Name)) continue;
                context.Products.Add(product);
                seeded = true;
            }
        }

        private static void SeedCartItems(ShopDbContext context, ref bool seeded)
        {
            const string demoUserId = "f3b8a2d1-9c44-4f7e-bc91-2c6d7a9e1f02";

            var apple = context.Products.FirstOrDefault(p => p.Name == "Red Apple");
            var milk = context.Products.FirstOrDefault(p => p.Name == "Whole Milk");
            var bread = context.Products.FirstOrDefault(p => p.Name == "Sourdough Bread");

            var cartItems = new List<CartItem>();

            if (apple != null)
            {
                cartItems.Add(new CartItem
                {
                    UserId = demoUserId,
                    ProductId = apple.Id,
                    Quantity = 3
                });
            }

            if (milk != null)
            {
                cartItems.Add(new CartItem
                {
                    UserId = demoUserId,
                    ProductId = milk.Id,
                    Quantity = 1
                });
            }

            if (bread != null)
            {
                cartItems.Add(new CartItem
                {
                    UserId = demoUserId,
                    ProductId = bread.Id,
                    Quantity = 2
                });
            }

            foreach (var cartItem in cartItems)
            {
                if (context.CartItems.Any(x => x.UserId == cartItem.UserId && x.ProductId == cartItem.ProductId)) continue;
                context.CartItems.Add(cartItem);
                seeded = true;
            }
        }
    }
}
