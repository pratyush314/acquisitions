# User CRUD API Documentation

This document describes the complete User CRUD (Create, Read, Update, Delete) operations for the Acquisitions API.

## Authentication

All user endpoints require authentication via JWT token stored in HTTP-only cookies. Users must be signed in to access these endpoints.

### Authorization Levels

- **User**: Can view, update, and delete their own profile
- **Admin**: Can perform all operations on any user

## Endpoints

### 1. Get All Users

**GET** `/api/users`

**Authorization**: Admin only

**Description**: Retrieves a list of all users in the system.

**Response** (200 OK):

```json
{
  "message": "Successfully retrieved users.",
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses**:

- `401 Unauthorized`: No authentication token or invalid token
- `403 Forbidden`: User is not an admin

---

### 2. Get User by ID

**GET** `/api/users/:id`

**Authorization**: Authenticated users

**Description**: Retrieves a specific user by ID.

**Parameters**:

- `id` (URL parameter): User ID (must be a valid number)

**Response** (200 OK):

```json
{
  "message": "Successfully retrieved user.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid user ID format
- `401 Unauthorized`: No authentication token or invalid token
- `404 Not Found`: User not found

---

### 3. Update User

**PUT** `/api/users/:id`

**Authorization**:

- Users can update their own profile
- Admins can update any user
- Only admins can change user roles

**Description**: Updates user information.

**Parameters**:

- `id` (URL parameter): User ID (must be a valid number)

**Request Body** (all fields are optional):

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123",
  "role": "admin"
}
```

**Field Validation**:

- `name`: 2-255 characters, trimmed
- `email`: Valid email format, lowercase, trimmed
- `password`: 6-128 characters
- `role`: Either "user" or "admin" (admin only)

**Response** (200 OK):

```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "user",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: No authentication token or invalid token
- `403 Forbidden`:
  - User trying to update another user's profile
  - Non-admin trying to change role
- `404 Not Found`: User not found
- `409 Conflict`: Email already exists

---

### 4. Delete User

**DELETE** `/api/users/:id`

**Authorization**:

- Users can delete their own account
- Admins can delete any user

**Description**: Deletes a user from the system.

**Parameters**:

- `id` (URL parameter): User ID (must be a valid number)

**Response** (200 OK):

```json
{
  "message": "User deleted successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid user ID format
- `401 Unauthorized`: No authentication token or invalid token
- `403 Forbidden`: User trying to delete another user's account (non-admin)
- `404 Not Found`: User not found

## Example Usage with cURL

### 1. Get All Users (Admin only)

```bash
curl -X GET "http://localhost:3000/api/users" \
  -H "Cookie: token=your_jwt_token_here"
```

### 2. Get User by ID

```bash
curl -X GET "http://localhost:3000/api/users/1" \
  -H "Cookie: token=your_jwt_token_here"
```

### 3. Update User

```bash
curl -X PUT "http://localhost:3000/api/users/1" \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your_jwt_token_here" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

### 4. Delete User

```bash
curl -X DELETE "http://localhost:3000/api/users/1" \
  -H "Cookie: token=your_jwt_token_here"
```

## Error Handling

All endpoints return consistent error responses with appropriate HTTP status codes:

**Validation Error** (400):

```json
{
  "error": "Validation failed",
  "details": "Specific validation error message"
}
```

**Authentication Error** (401):

```json
{
  "error": "Unauthorized",
  "message": "No authentication token provided"
}
```

**Authorization Error** (403):

```json
{
  "error": "Forbidden",
  "message": "You can only update your own profile"
}
```

**Not Found Error** (404):

```json
{
  "error": "Not found",
  "message": "User not found"
}
```

**Conflict Error** (409):

```json
{
  "error": "Conflict",
  "message": "Email already exists"
}
```

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Password Hashing**: Passwords are hashed with bcrypt (10 rounds)
3. **Role-based Authorization**: Different permissions for users and admins
4. **Input Validation**: All inputs are validated with Zod schemas
5. **Email Uniqueness**: Email addresses must be unique across users
6. **Self-modification Protection**: Users can only modify their own data (unless admin)

## Business Logic

1. **Update User**:
   - Password is automatically hashed if provided
   - Email uniqueness is checked before updating
   - Users cannot change their own role (admin only)
   - Timestamp is automatically updated

2. **Delete User**:
   - User existence is verified before deletion
   - Soft delete could be implemented in the future if needed

3. **Authorization Matrix**:
   | Action | Own Profile | Other Users (User Role) | Other Users (Admin Role) |
   |--------|-------------|------------------------|-------------------------|
   | View | ✅ | ❌ | ✅ |
   | Update | ✅ | ❌ | ✅ |
   | Delete | ✅ | ❌ | ✅ |
   | Change Role | ❌ | ❌ | ✅ |

## Testing

To test these endpoints:

1. **Sign up or sign in** to get a JWT token
2. **Use the token** in the Cookie header for all requests
3. **Create test users** with different roles to test authorization
4. **Test validation** by sending invalid data
5. **Test authorization** by trying to access resources as different user types
