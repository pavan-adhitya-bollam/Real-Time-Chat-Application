# Postman API Testing Guide

## Base URL
```
http://localhost:5000
```

## 1. Register User

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "654a1b2c3d4e5f6a7b8c9d0e",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "User already exists"
}
```

---

## 2. Login User

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "654a1b2c3d4e5f6a7b8c9d0e",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

---

## 3. Get Messages (Protected Route)

**Endpoint:** `GET /api/chat/messages`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**Expected Response (200 OK):**
```json
[
  {
    "_id": "654a1b2c3d4e5f6a7b8c9d0f",
    "user": "654a1b2c3d4e5f6a7b8c9d0e",
    "username": "john_doe",
    "text": "Hello everyone!",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "__v": 0
  }
]
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Not authorized, token failed"
}
```

---

## 4. Send Message (Protected Route)

**Endpoint:** `POST /api/chat/messages`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**Body (raw JSON):**
```json
{
  "text": "Hello from Postman!"
}
```

**Expected Response (201 Created):**
```json
{
  "_id": "654a1b2c3d4e5f6a7b8c9d10",
  "user": "654a1b2c3d4e5f6a7b8c9d0e",
  "username": "john_doe",
  "text": "Hello from Postman!",
  "createdAt": "2024-01-15T10:35:00.000Z",
  "__v": 0
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Not authorized, token failed"
}
```

---

## Postman Collection Setup

### Step 1: Create Environment Variables
1. Click on the gear icon (Manage Environments)
2. Create a new environment called "Chat App"
3. Add the following variables:
   - `base_url`: `http://localhost:5000`
   - `token`: (leave empty initially)

### Step 2: Configure Login Request to Save Token
In the Tests tab of the Login request, add:

```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set("token", responseJson.token);
    pm.environment.set("user_id", responseJson.user.id);
    pm.environment.set("username", responseJson.user.username);
}
```

### Step 3: Use Token in Protected Routes
In the Authorization tab of protected routes:
- Type: `Bearer Token`
- Token: `{{token}}`

Or in Headers:
- Key: `Authorization`
- Value: `Bearer {{token}}`

---

## Testing Checklist

- [ ] Register a new user
- [ ] Try to register the same user again (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect password (should fail)
- [ ] Login with non-existent email (should fail)
- [ ] Access protected route without token (should fail)
- [ ] Access protected route with invalid token (should fail)
- [ ] Access protected route with valid token (should succeed)
- [ ] Send a message with valid token
- [ ] Get all messages with valid token

---

## Common Issues & Solutions

### Issue: "Not authorized, token failed"
**Solution:** 
- Ensure you're using the correct token format: `Bearer <token>`
- Check if the token has expired (30 days by default)
- Verify the JWT_SECRET in .env matches

### Issue: "User already exists"
**Solution:**
- Use a different email or username
- Or delete the user from MongoDB database

### Issue: "Invalid credentials"
**Solution:**
- Verify email and password are correct
- Check if the user exists in the database

### Issue: Connection refused
**Solution:**
- Ensure the server is running on port 5000
- Check if MongoDB is running
- Verify the MONGODB_URI in .env is correct

---

## Database Verification

### Using MongoDB Shell
```bash
# Connect to MongoDB
mongosh

# Switch to chatapp database
use chatapp

# View all users
db.users.find()

# View all messages
db.messages.find()

# Delete a user
db.users.deleteOne({ email: "john@example.com" })
```

### Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select `chatapp` database
4. View `users` and `messages` collections
