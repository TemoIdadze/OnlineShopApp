# OnlineShopApp

A full-stack e-commerce application built with Angular 19 and .NET 8.

## Tech Stack

**Frontend:**
- Angular 19 (standalone components)
- TypeScript
- JWT Authentication

**Backend:**
- .NET 8 / ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT Authentication

## Demo Users

| Username | Password | Email |
|----------|----------|-------|
| demo | Demo123 | demo@myshop.com |
| admin | Admin123 | admin@myshop.com |
| john | John123 | john@example.com |

## Getting Started

### Prerequisites

- Node.js 20+
- .NET 8 SDK
- SQL Server (LocalDB or SQL Server Express)
- Angular CLI (`npm install -g @angular/cli`)

### Backend Setup

1. Navigate to the Backend folder:
   ```bash
   cd Backend
   ```

2. Update the connection string in `OnlineShop.Ge.API/appsettings.json` if needed:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Database=ShopDB;Trusted_Connection=True;Encrypt=False"
   }
   ```

3. Run the API:
   ```bash
   cd OnlineShop.Ge.API
   dotnet run
   ```

   The API will start at `https://localhost:7029`

   > The database will be created and seeded automatically on first run.

### Frontend Setup

1. Navigate to the Frontend folder:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open `http://localhost:4200` in your browser.

## Features

- User authentication (login/register)
- Product catalog with categories
- Shopping cart management
- Responsive design

## Project Structure

```
OnlineShopApp/
├── Backend/
│   ├── OnlineShop.Ge.API/        # Web API project
│   ├── OnlineShop.Application/   # Business logic & services
│   ├── OnlineShop.Domain/        # Domain entities
│   ├── OnlineShop.Infrastructure/# Repository implementations
│   └── OnlineShop.Persistence/   # EF Core, migrations, seeding
│
└── Frontend/
    └── src/
        └── app/
            ├── auth.service.ts   # Authentication
            ├── cart/             # Cart page
            ├── home/             # Home page
            ├── login/            # Login page
            ├── register/         # Registration page
            ├── shop-details/     # Products catalog
            └── shared/           # Shared components & services
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/User/login` | User login |
| POST | `/api/User/register` | User registration |
| GET | `/api/Product` | Get all products |
| GET | `/api/Product/{id}` | Get product by ID |
| GET | `/api/Category` | Get all categories |
| GET | `/api/CartItem` | Get user's cart items |
| POST | `/api/CartItem` | Add item to cart |
| PUT | `/api/CartItem/{id}` | Update cart item |
| DELETE | `/api/CartItem/{id}` | Remove from cart |

## License

MIT
