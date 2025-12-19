# Yatha Backend

PHP REST API for Yatha application.

## Quick Start

1. Configure database in `config/database.php`

2. Import database schema:
```bash
mysql -u root -p yatha_db < database/schema.sql
```

3. Start PHP server:
```bash
php -S localhost:8000 -t .
```

## Project Structure

```
backend/
├── config/          # Configuration files
│   └── database.php # Database connection
├── routes/          # API routes
│   └── api.php      # Route definitions
├── utils/           # Utility classes
│   └── Response.php # Response helper
├── database/        # Database files
│   └── schema.sql   # Database schema
└── index.php        # Entry point
```

## API Endpoints

- `GET /` - API welcome message
- `GET /api/test` - Test endpoint

## Database Configuration

Edit `config/database.php` to set your MySQL credentials:
```php
private $host = 'localhost';
private $db_name = 'yatha_db';
private $username = 'root';
private $password = '';
```

## Adding New Routes

Add routes in `routes/api.php`:
```php
case '/api/your-route':
    if ($method === 'GET') {
        Response::success(['data' => 'value']);
    }
    break;
```
