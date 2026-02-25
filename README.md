# MyShop — Angular Online Shop

A frontend Angular 19 application for browsing products and managing a shopping cart. Communicates with a .NET backend REST API.

## Tech Stack

- **Angular 19** (standalone components, signals-ready)
- **.NET backend** — REST API at `https://localhost:7029/api`
- **JWT authentication** — token stored in `localStorage`

## Prerequisites

- Node.js 20+
- Angular CLI 19 (`npm install -g @angular/cli`)
- The .NET backend must be running locally before starting the dev server

## Getting Started

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200`. The app reloads automatically on file changes.

## Environment Configuration

API base URL is set in `src/environments/`:

| File | Used for |
|------|----------|
| `environment.development.ts` | `ng serve` |
| `environment.ts` | `ng build` (production) |

Update `apiBaseUrl` in both files if your backend runs on a different port.

## Key Features

- **Home** — featured product showcase
- **Products** (`/products`) — full catalog with search and add-to-cart
- **Cart** (`/cart`) — quantity management, order summary, free-shipping progress bar
- **Auth** — JWT-based login and registration with token expiry check

## Build

```bash
ng build
```

Output goes to `dist/online-shop-app/`. Production builds are optimized and hashed.

## Running Tests

```bash
ng test
```

## Project Structure

```
src/
├── app/
│   ├── auth.guard.ts          # Route guard (delegates to AuthService)
│   ├── auth.interceptor.ts    # Attaches Bearer token to every HTTP request
│   ├── auth.service.ts        # Token parsing, expiry, login/logout
│   ├── cart/                  # Cart page component
│   ├── home/                  # Home page component
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── shop-details/          # Products catalog page
│   └── shared/
│       ├── cart.service.ts    # Cart API calls + cart count state
│       ├── cart-item.model.ts
│       ├── shop-details.service.ts
│       ├── shop-details.model.ts
│       ├── header/
│       └── footer/
├── environments/
└── styles.css                 # Global styles + consolidated Google Fonts import
```