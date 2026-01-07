# JWT Authentication Implementation Summary

## Overview
JWT (JSON Web Token) authentication has been implemented across all APIs. The system uses token-based authentication for securing protected endpoints.

## Authentication Details

### Token Generation
- **Location**: `backend/src/utils/JWT.php`
- **Expiration**: 24 hours (86400 seconds)
- **Secret Key**: Uses `JWT_SECRET` environment variable (fallback: 'your-secret-key-change-in-production')
- **Algorithm**: HS256 (HMAC SHA-256)

### Login/Registration Flow
- **Register**: `POST /api/auth/register`
  - Returns: JWT token + user data
  - No authentication required
  
- **Login**: `POST /api/auth/login`
  - Returns: JWT token + user data
  - No authentication required

### Token Format
```
Authorization: Bearer <jwt_token>
```

## Protected Endpoints

### Products API
- **GET** `/api/products` - Public (no auth required)
- **POST** `/api/products` - Protected (requires JWT + admin role)
- **PUT** `/api/products/{id}` - Protected (requires JWT + admin role)
- **DELETE** `/api/products/{id}` - Protected (requires JWT + admin role)

### Reviews API
- **GET** `/api/reviews` - Public (no auth required)
- **POST** `/api/reviews` - Optional auth (allows guest reviews)
- **PUT** `/api/reviews/{id}` - Protected (requires JWT, user must own review)
- **DELETE** `/api/reviews/{id}` - Protected (requires JWT, user must own review)

### Orders API
- **GET** `/api/orders` - Protected (requires JWT)
- **POST** `/api/orders` - Protected (requires JWT)

### Users API
- **GET** `/api/users` - Protected (requires JWT)
- **PUT** `/api/users` - Protected (requires JWT)

### Upload Image API
- **POST** `/api/upload-image` - Protected (requires JWT + admin role)

## Usage Examples

### 1. Register a New User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Make Authenticated Request
```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### 4. Create Product (Admin Only)
```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Product Name",
    "price": 99.99,
    "description": "Product description"
  }'
```

## Error Responses

### Missing Token
```json
{
  "success": false,
  "status": "error",
  "message": "Authorization token required",
  "code": 401
}
```

### Invalid/Expired Token
```json
{
  "success": false,
  "status": "error",
  "message": "Invalid or expired token",
  "code": 401
}
```

### Insufficient Permissions
```json
{
  "success": false,
  "status": "error",
  "message": "Admin access required",
  "code": 403
}
```

### Unauthorized Resource Access
```json
{
  "success": false,
  "status": "error",
  "message": "Unauthorized to update this review",
  "code": 403
}
```

## Role-Based Access Control

### Admin Role
- Can create/update/delete products
- Can upload images
- Can manage all reviews

### User Role
- Can read products and reviews
- Can create own reviews
- Can update/delete own reviews
- Can view own orders

### Guest (No Auth)
- Can read products and reviews
- Can create reviews (guest reviews)

## Security Features

1. **Password Hashing**: Uses bcrypt (PASSWORD_BCRYPT)
2. **Token Expiration**: Tokens expire after 24 hours
3. **Token Verification**: Validates signature and expiration on every protected request
4. **Role-Based Authorization**: Admin operations require admin role
5. **Resource Ownership**: Users can only modify their own resources

## Database Changes Required

Ensure the `users` table has a `role` column:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE id = 1; -- Set first user as admin if needed
```

## Frontend Integration

Update your frontend to:
1. Store token in localStorage after login
2. Include token in Authorization header for all requests
3. Handle 401/403 errors appropriately
4. Redirect to login on token expiration

Example:
```javascript
const token = localStorage.getItem('token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

fetch('http://localhost:8000/api/products', { headers })
```

## Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Get products without token
- [ ] Create product with valid admin token
- [ ] Create product without token (should fail)
- [ ] Create product with user token (should fail)
- [ ] Get user profile with token
- [ ] Get user profile without token (should fail)
- [ ] Create review as guest
- [ ] Update own review
- [ ] Delete review from another user (should fail)
- [ ] Upload image with admin token
- [ ] Upload image with user token (should fail)
