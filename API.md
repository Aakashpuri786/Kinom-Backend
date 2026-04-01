# Kinom Backend API Documentation

This document describes all available endpoints, auth, request/response format, and usage rules for the Kinom backend.

## Base URL
- Local: `http://localhost:5000/api`
- LAN: `http://<YOUR-LAN-IP>:5000/api`

## Auth
- Protected endpoints require:
  - `Authorization: Bearer <token>`
- User auth returns a user token.
- Admin auth returns an admin token.

## Response Format

Success:
```json
{
  "success": true,
  "message": "optional",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "message": "error message"
}
```

## Content Types
- JSON requests: `Content-Type: application/json`
- Uploads: `multipart/form-data`

## Pagination
Many list endpoints support:
- `?page=1`
- `?limit=20`
Max limit is 100.

## Rate Limiting
Default: 300 requests per 60 seconds per IP.

## Health Check
- `GET /api/health`

---

## Auth (User)

1. `POST /api/auth/register`
- Auth: none
- Body:
```json
{ "name": "", "email": "", "password": "" }
```
- Returns: `{ token, user }`

2. `POST /api/auth/login`
- Auth: none
- Body:
```json
{ "email": "", "password": "" }
```
- Returns: `{ token, user }`

3. `GET /api/auth/me`
- Auth: user
- Returns: `{ user }`

---

## Auth (Admin)

1. `POST /api/admin-auth/login`
- Auth: none
- Body:
```json
{ "email": "", "password": "" }
```
- Returns: `{ token, admin }`

2. `POST /api/admin-auth/verify`
- Auth: none
- Body:
```json
{ "code": "" }
```

3. `GET /api/admin-auth/me`
- Auth: admin
- Returns: `{ admin }`

---

## Admin (All Require Admin Token)

1. `GET /api/admin/dashboard`
2. `GET /api/admin/products`
3. `GET /api/admin/sellers`
4. `GET /api/admin/sellers/:id`
5. `GET /api/admin/carts`
6. `GET /api/admin/carts/product/:productId/users`
7. `GET /api/admin/users`
8. `GET /api/admin/users/:id`
9. `GET /api/admin/chats`
10. `GET /api/admin/chat-profiles`
11. `GET /api/admin/chat-profiles/active`
12. `GET /api/admin/chat-profiles/username/:username`

---

## Support Chat (Admin)

1. `GET /api/admin/support-identities`
2. `POST /api/admin/support-identities`
- Body:
```json
{ "displayName": "" }
```
3. `POST /api/admin/support-identities/:id/switch`
4. `GET /api/admin/support-chat-accounts`
5. `POST /api/admin/support-chat-accounts`
- Body:
```json
{ "status": "online" }
```
6. `POST /api/admin/support-chat-accounts/:id/switch`
7. `GET /api/admin/support-chat-accounts/:id/conversations`
8. `POST /api/admin/support-chat-accounts/:id/start-direct`
- Body:
```json
{ "userId": "" }
```
9. `GET /api/admin/support-chat-accounts/:id/conversations/:conversationId/messages`
10. `POST /api/admin/support-chat-accounts/:id/conversations/:conversationId/messages`
- Body:
```json
{ "content": "", "senderType": "admin" }
```
11. `POST /api/admin/support-chat-accounts/:id/broadcast`
- Body:
```json
{ "content": "" }
```

---

## Chat (User Token Required)

1. `GET /api/chat/profile`
2. `GET /api/chat/username-available?username=...`
3. `POST /api/chat/profile`
- Body:
```json
{ "username": "", "bio": "", "avatar": "" }
```
4. `PATCH /api/chat/profile`
- Body:
```json
{ "username": "", "bio": "", "avatar": "" }
```
5. `GET /api/chat/users/search?q=...`
6. `GET /api/chat/conversations`
7. `POST /api/chat/conversations/direct`
- Body:
```json
{ "userId": "" }
```
8. `POST /api/chat/conversations/group`
- Body:
```json
{ "name": "", "participants": ["userId"] }
```
9. `GET /api/chat/conversations/:id/messages`
10. `POST /api/chat/conversations/:id/messages`
- Body:
```json
{ "content": "" }
```
11. `POST /api/chat/conversations/:id/seen`
12. `PATCH /api/chat/messages/:id`
- Body:
```json
{ "content": "" }
```
13. `DELETE /api/chat/messages/:id`
14. `POST /api/chat/messages/:id/reaction`
- Body:
```json
{ "emoji": "" }
```

---

## Seller Account (User Token Required)

1. `POST /api/seller-account/request-otp`
- Body:
```json
{ "fullName": "", "phoneNumber": "", "address": "", "zipCode": "" }
```
2. `POST /api/seller-account/verify-otp`
- Body:
```json
{ "otp": "" }
```
3. `POST /api/seller-account/ensure`
4. `GET /api/seller-account/me`
5. `GET /api/seller-account/public/:id`

---

## Seller Products (User Token Required)

1. `GET /api/seller-products`
2. `GET /api/seller-products/my`
3. `GET /api/seller-products/all`
4. `GET /api/seller-products/:id`
5. `POST /api/seller-products`
- Body:
```json
{ "imageUrl": "", "moneyValue": "", "price": 0, "category": "", "symbol": "", "dob": "", "description": "" }
```
6. `PATCH /api/seller-products/:id`
7. `DELETE /api/seller-products/:id`

---

## Orders (User Token Required)

1. `GET /api/orders`
2. `POST /api/orders`
- Body:
```json
{ "items": [{ "productId": "", "quantity": 1 }], "total": 0, "sellerId": "" }
```
3. `PATCH /api/orders/:id/status`
- Body:
```json
{ "status": "" }
```
4. `DELETE /api/orders/:id`

---

## Cart (User Token Required)

1. `GET /api/cart`
2. `POST /api/cart`
- Body:
```json
{ "productId": "", "quantity": 1 }
```
3. `DELETE /api/cart/:productId`
4. `DELETE /api/cart`

---

## Dashboard (User Token Required)

1. `GET /api/dashboard/overview`

---

## Posts

1. `GET /api/posts` (public)
2. `GET /api/posts/:id` (public)
3. `POST /api/posts` (user token required)
- Body:
```json
{ "title": "", "content": "", "imageUrl": "", "tags": [] }
```
4. `PUT /api/posts/:id` (user token required)
5. `DELETE /api/posts/:id` (user token required)

---

## Gallery

1. `GET /api/gallery` (public)
2. `GET /api/gallery/:id` (public)
3. `POST /api/gallery` (user or admin token)
- Body:
```json
{ "title": "", "imageUrl": "", "description": "", "date": "" }
```
4. `PUT /api/gallery/:id` (user or admin token)
5. `DELETE /api/gallery/:id` (user or admin token)

---

## Reviews

1. `GET /api/reviews` (public)
2. `GET /api/reviews/:id` (public)
3. `POST /api/reviews` (public)
- Body:
```json
{ "name": "", "title": "", "quote": "", "avatarUrl": "", "rating": 5 }
```
4. `PUT /api/reviews/:id` (user or admin token)
5. `DELETE /api/reviews/:id` (user or admin token)

---

## Contact

1. `POST /api/contact` (public)
- Body:
```json
{ "name": "", "email": "", "subject": "", "message": "" }
```
2. `GET /api/contact` (public)
3. `GET /api/contact/:id` (public)
4. `PUT /api/contact/:id` (public)
5. `DELETE /api/contact/:id` (public)

---

## Uploads (User Token Required)

1. `POST /api/uploads`
- FormData: `file`
- Returns: `{ file: { path, url } }`

---

## Product Images (Beginner Guide)

This is the simplest way to show the correct product image in both the product list and product detail screens.

### Step 1: Upload the image
Endpoint:
- `POST /api/uploads`
- Auth: user token required
- Content-Type: `multipart/form-data`
- Field: `file`

Response example:
```json
{
  "success": true,
  "data": {
    "file": {
      "path": "uploads/1711900000000-photo.jpg",
      "url": "http://localhost:5000/uploads/1711900000000-photo.jpg"
    }
  }
}
```

Important:
- Save `data.file.url` from this response. This is the full image URL your app can display directly.

### Step 2: Create the product with imageUrl
Endpoint:
- `POST /api/seller-products`

Body example:
```json
{
  "imageUrl": "http://localhost:5000/uploads/1711900000000-photo.jpg",
  "moneyValue": "USD",
  "price": 1200,
  "category": "Electronics",
  "symbol": "$",
  "dob": "",
  "description": "Product description here"
}
```

### Step 3: Show product list with images
Endpoint:
- `GET /api/seller-products/all`

Each product has `imageUrl`, so your UI should render it directly.

### Step 4: Show product details with image
Endpoint:
- `GET /api/seller-products/:id`

The response includes `imageUrl`, so the product detail page can show the same image.

### Notes for beginners
- Images are served by the backend at `/uploads/...`.
- If you saved only `uploads/filename.jpg` in the database, you must add the server base URL in the frontend.
  Example: `http://localhost:5000/` + `uploads/filename.jpg`
- Best practice: always save the full URL returned by the upload endpoint (`data.file.url`).

## Socket.io (Real-Time)

- URL: `http://localhost:5000`
- Events:
1. `join` (client -> server)
- Payload: `room` string
2. `message` (client -> server)
- Payload: `{ room, ...data }`
3. `message` (server -> client)
- Broadcast to room

---

## Environment Variables (Backend)

- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `FRONTEND_URL`
- `CORS_ORIGIN`
- `JWT_SECRET`
- `JWT_ADMIN_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `BASE_URL`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `UPLOAD_DIR`

---

## Quick Test

1. Health check:
```bash
curl http://localhost:5000/api/health
```
2. Register user:
```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com","password":"123456"}'
```

---
