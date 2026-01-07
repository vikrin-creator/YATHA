# Yatha Backend - PHP API

## Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE yatha_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Import Migrations
```bash
mysql -u root yatha_db < database/migrations/create_tables.sql
```

### 3. Environment Setup
Copy `.env.example` to `.env` and update with your database credentials:
```bash
cp .env.example .env
```

### 4. Seed Database (Optional)
```bash
php database/seeds/seed_database.php
```

### 5. Start Development Server
```bash
cd public
php -S localhost:8000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (requires auth)

### Reviews
- `GET /api/reviews?product_id=1` - Get reviews for product
- `POST /api/reviews` - Create review (requires auth)

### Orders
- `GET /api/orders` - Get user orders (requires auth)
- `POST /api/orders` - Create order (requires auth)

### Users
- `GET /api/users` - Get user profile (requires auth)
- `PUT /api/users` - Update user profile (requires auth)

## Project Structure

```
backend/
├── public/
│   ├── index.php           # Main router
│   ├── .htaccess           # URL rewriting
│   └── uploads/
│       └── images/         # Product images
├── src/
│   ├── config/
│   │   └── Database.php    # Database connection
│   ├── controllers/        # Business logic
│   ├── middleware/
│   │   └── AuthMiddleware.php
│   ├── models/             # Data models
│   ├── routes/             # API route handlers
│   │   ├── auth.php
│   │   ├── products.php
│   │   ├── reviews.php
│   │   ├── orders.php
│   │   └── users.php
│   └── utils/
│       ├── JWT.php         # JWT token handling
│       └── Response.php    # Response formatting
└── database/
    ├── migrations/         # Database schemas
    └── seeds/              # Sample data
```

## Requirements
- PHP 7.4+
- MySQL 5.7+
- Apache with mod_rewrite enabled

## Notes
- Change JWT_SECRET in production
- Update database credentials in .env
- Ensure uploads/images directory has write permissions
