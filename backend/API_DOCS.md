# BookBridge API Documentation

**Base URL:** `http://localhost:8001/api/v1`  
**Version:** 1.0.0  
**Content-Type:** `application/json`

---

## Authentication

Protected endpoints require a JWT Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```

Obtain a token by calling `POST /auth/login`.

---

## Response Format

All responses follow this consistent structure.

**Success**
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

**Error**
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

**Validation Error (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (business rule violation or validation error) |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (authenticated but not permitted) |
| `404` | Not Found |
| `409` | Conflict (duplicate email, duplicate category name) |
| `500` | Internal Server Error |

---

## Enums

### BookStatus
| Value | Description |
|-------|-------------|
| `AVAILABLE` | Book is available to borrow |
| `BORROWED` | Book is currently borrowed |
| `UNAVAILABLE` | Book is not available (set manually by owner) |

### BorrowRequestStatus
| Value | Description |
|-------|-------------|
| `PENDING` | Request submitted, awaiting owner decision |
| `APPROVED` | Owner approved — book is now `BORROWED` |
| `REJECTED` | Owner rejected the request |
| `RETURNED` | Borrower returned the book — book is now `AVAILABLE` |

---

# 1. Auth

---

### POST `/auth/register`

Register a new user account.

**Auth required:** No

**Request Body**
```json
{
  "name": "Ruhit",
  "email": "ruhit@example.com",
  "password": "secret123"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | ✅ | min 2 characters |
| `email` | string | ✅ | valid email |
| `password` | string | ✅ | min 6 characters |

**Success Response `201`**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "id": "759731c5-1f2e-47bc-8c8e-f8ef9b56a13d",
    "name": "Ruhit",
    "email": "ruhit@example.com",
    "createdAt": "2026-08-13T05:33:53.720Z",
    "updatedAt": "2026-08-13T05:33:53.720Z"
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `400` | Validation failed |
| `409` | An account with this email already exists. |

---

### POST `/auth/login`

Authenticate and receive a JWT.

**Auth required:** No

**Request Body**
```json
{
  "email": "ruhit@example.com",
  "password": "secret123"
}
```

**Success Response `200`**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "759731c5-1f2e-47bc-8c8e-f8ef9b56a13d",
      "name": "Ruhit",
      "email": "ruhit@example.com",
      "isDeleted": false,
      "createdAt": "2026-08-13T05:33:53.720Z",
      "updatedAt": "2026-08-13T05:33:53.720Z"
    }
  }
}
```

> **Note:** The JWT expires in **7 days**. Store it securely (e.g. `localStorage` or `httpOnly` cookie).

**Error Responses**

| Status | Message |
|--------|---------|
| `400` | Validation failed |
| `401` | Invalid email or password. |

---

# 2. Users

---

### GET `/users`

Get all active (non-deleted) users.

**Auth required:** No

**Success Response `200`**
```json
{
  "success": true,
  "message": "Users retrieved successfully.",
  "data": [
    {
      "id": "759731c5-...",
      "name": "Ruhit",
      "email": "ruhit@example.com",
      "isDeleted": false,
      "createdAt": "2026-08-13T05:33:53.720Z",
      "updatedAt": "2026-08-13T05:33:53.720Z"
    }
  ]
}
```

> Passwords are **never** returned in any response.

---

### GET `/users/:id`

Get a single user by ID.

**Auth required:** No

**Success Response `200`**
```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "id": "759731c5-...",
    "name": "Ruhit",
    "email": "ruhit@example.com",
    "isDeleted": false,
    "createdAt": "2026-08-13T05:33:53.720Z",
    "updatedAt": "2026-08-13T05:33:53.720Z"
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `404` | User not found. |

---

### PATCH `/users/:id`

Update own user profile. Only the authenticated account owner can update.

**Auth required:** ✅ Yes

**Request Body** *(all fields optional)*
```json
{
  "name": "Ruhit Updated",
  "email": "newemail@example.com"
}
```

**Success Response `200`**
```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {
    "id": "759731c5-...",
    "name": "Ruhit Updated",
    "email": "newemail@example.com",
    "isDeleted": false,
    "createdAt": "2026-08-13T05:33:53.720Z",
    "updatedAt": "2026-08-13T05:45:00.000Z"
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `401` | Access denied. No token provided. |
| `403` | You are not authorised to update this account. |
| `404` | User not found. |
| `409` | An account with this email already exists. |

---

### DELETE `/users/:id`

Soft-delete own user account. Only the authenticated account owner can delete.

**Auth required:** ✅ Yes

**Success Response `200`**
```json
{
  "success": true,
  "message": "User deleted successfully.",
  "data": null
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `401` | Access denied. No token provided. |
| `403` | You are not authorised to delete this account. |
| `404` | User not found. |

---

# 3. Categories

---

### POST `/categories`

Create a new book category.

**Auth required:** ✅ Yes

**Request Body**
```json
{
  "name": "Fiction"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | ✅ | min 1, max 100 characters |

**Success Response `201`**
```json
{
  "success": true,
  "message": "Category created successfully.",
  "data": {
    "id": "da486039-...",
    "name": "Fiction",
    "isDeleted": false,
    "createdAt": "2026-08-13T05:46:55.000Z",
    "updatedAt": "2026-08-13T05:46:55.000Z"
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `400` | Validation failed |
| `401` | Access denied. No token provided. |
| `409` | A category with this name already exists. |

---

### GET `/categories`

Get all active categories sorted alphabetically.

**Auth required:** No

**Success Response `200`**
```json
{
  "success": true,
  "message": "Categories retrieved successfully.",
  "data": [
    { "id": "...", "name": "Academic", "isDeleted": false, "createdAt": "...", "updatedAt": "..." },
    { "id": "...", "name": "Technology", "isDeleted": false, "createdAt": "...", "updatedAt": "..." }
  ]
}
```

---

### GET `/categories/:id`

Get a single category including its non-deleted books.

**Auth required:** No

**Success Response `200`**
```json
{
  "success": true,
  "message": "Category retrieved successfully.",
  "data": {
    "id": "da486039-...",
    "name": "Technology",
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "...",
    "books": [
      {
        "id": "7a9fc8ac-...",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "status": "AVAILABLE",
        "condition": "Good",
        "createdAt": "..."
      }
    ]
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `404` | Category not found. |

---

### PATCH `/categories/:id`

Update a category name.

**Auth required:** ✅ Yes

**Request Body**
```json
{
  "name": "Science Fiction"
}
```

**Success Response `200`**
```json
{
  "success": true,
  "message": "Category updated successfully.",
  "data": {
    "id": "da486039-...",
    "name": "Science Fiction",
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `401` | Access denied. No token provided. |
| `404` | Category not found. |
| `409` | A category with this name already exists. |

---

### DELETE `/categories/:id`

Soft-delete a category.

**Auth required:** ✅ Yes

**Success Response `200`**
```json
{
  "success": true,
  "message": "Category deleted successfully.",
  "data": null
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `401` | Access denied. No token provided. |
| `404` | Category not found. |

---

# 4. Books

---

### POST `/books`

List a new book for borrowing. The authenticated user automatically becomes the owner.

**Auth required:** ✅ Yes

> **Important:** Do NOT send `ownerId` in the request body. It is always taken from the JWT.

**Request Body**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "description": "A handbook of agile software craftsmanship",
  "condition": "Good",
  "categoryId": "da486039-a43c-4612-b38f-cc1cc291c2ae"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string | ✅ | min 1 character |
| `author` | string | ✅ | min 1 character |
| `description` | string | — | optional |
| `condition` | string | — | optional (e.g. "New", "Good", "Worn") |
| `categoryId` | string | ✅ | must be an existing, non-deleted category |

**Success Response `201`**
```json
{
  "success": true,
  "message": "Book listed successfully.",
  "data": {
    "id": "7a9fc8ac-...",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "description": "A handbook of agile software craftsmanship",
    "condition": "Good",
    "status": "AVAILABLE",
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "...",
    "ownerId": "759731c5-...",
    "categoryId": "da486039-...",
    "owner": { "id": "759731c5-...", "name": "Ruhit", "email": "ruhit@example.com" },
    "category": { "id": "da486039-...", "name": "Technology" }
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `400` | Validation failed |
| `401` | Access denied. No token provided. |
| `404` | Category not found. |

---

### GET `/books`

Browse all non-deleted books.

**Auth required:** No

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status: `AVAILABLE`, `BORROWED`, or `UNAVAILABLE` |

**Example:** `GET /books?status=AVAILABLE`

**Success Response `200`**
```json
{
  "success": true,
  "message": "Books retrieved successfully.",
  "data": [
    {
      "id": "7a9fc8ac-...",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "status": "AVAILABLE",
      "condition": "Good",
      "owner": { "id": "...", "name": "Ruhit", "email": "ruhit@example.com" },
      "category": { "id": "...", "name": "Technology" }
    }
  ]
}
```

---

### GET `/books/:id`

Get full book details including owner, category, and borrow requests.

**Auth required:** No

**Success Response `200`**
```json
{
  "success": true,
  "message": "Book retrieved successfully.",
  "data": {
    "id": "7a9fc8ac-...",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "description": "...",
    "condition": "Good",
    "status": "AVAILABLE",
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "...",
    "owner": { "id": "...", "name": "Ruhit", "email": "ruhit@example.com" },
    "category": { "id": "...", "name": "Technology" },
    "requests": [
      {
        "id": "...",
        "status": "RETURNED",
        "message": "I would love to read this!",
        "requesterId": "...",
        "createdAt": "..."
      }
    ]
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `404` | Book not found. |

---

### PATCH `/books/:id`

Update a book. Only the book owner can update.

**Auth required:** ✅ Yes

**Request Body** *(all fields optional)*
```json
{
  "title": "Clean Code 2nd Edition",
  "author": "Robert C. Martin",
  "description": "Updated description",
  "condition": "Like New",
  "categoryId": "new-category-id",
  "status": "UNAVAILABLE"
}
```

**Success Response `200`**
```json
{
  "success": true,
  "message": "Book updated successfully.",
  "data": { "...updated book with owner and category..." }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `401` | Access denied. No token provided. |
| `403` | You are not authorised to update this book. |
| `404` | Book not found. / Category not found. |

---

### DELETE `/books/:id`

Soft-delete a book. Only the book owner can delete.

**Auth required:** ✅ Yes

**Success Response `200`**
```json
{
  "success": true,
  "message": "Book deleted successfully.",
  "data": null
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `401` | Access denied. No token provided. |
| `403` | You are not authorised to delete this book. |
| `404` | Book not found. |

---

# 5. Borrow Requests

---

### POST `/borrow-requests`

Submit a request to borrow a book.

**Auth required:** ✅ Yes

**Business Rules**
- Cannot request your own book → `400`
- Book must have status `AVAILABLE` → `400`

**Request Body**
```json
{
  "bookId": "7a9fc8ac-68df-4365-a115-b55d9d604ef0",
  "message": "I would love to read this!"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `bookId` | string | ✅ | must be an existing, available book |
| `message` | string | — | optional note to the book owner |

**Success Response `201`**
```json
{
  "success": true,
  "message": "Borrow request submitted successfully.",
  "data": {
    "id": "req-id-...",
    "message": "I would love to read this!",
    "status": "PENDING",
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "...",
    "bookId": "...",
    "requesterId": "...",
    "book": {
      "id": "...",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "status": "AVAILABLE",
      "condition": "Good",
      "owner": { "id": "...", "name": "Ruhit", "email": "ruhit@example.com" }
    },
    "requester": { "id": "...", "name": "Borrower Bob", "email": "bob@example.com" }
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `400` | You cannot request to borrow your own book. |
| `400` | This book is not available for borrowing. |
| `401` | Access denied. No token provided. |
| `404` | Book not found. |

---

### GET `/borrow-requests`

Get borrow requests relevant to the authenticated user.

**Auth required:** ✅ Yes

**Query Parameters**

| Param | Value | Returns |
|-------|-------|---------|
| `role` | `requester` | Only requests I submitted |
| `role` | `owner` | Only requests for books I own |
| *(none)* | — | Both — all requests involving me |

**Example:** `GET /borrow-requests?role=owner`

**Success Response `200`**
```json
{
  "success": true,
  "message": "Borrow requests retrieved successfully.",
  "data": [ { "...borrow request with book and requester..." } ]
}
```

---

### GET `/borrow-requests/:id`

Get a single borrow request. Only accessible by the requester or the book owner.

**Auth required:** ✅ Yes

**Success Response `200`**
```json
{
  "success": true,
  "message": "Borrow request retrieved successfully.",
  "data": { "...full borrow request..." }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `401` | Access denied. No token provided. |
| `403` | You are not authorised to view this borrow request. |
| `404` | Borrow request not found. |

---

### PATCH `/borrow-requests/:id`

Update the status of a borrow request.

**Auth required:** ✅ Yes

**Request Body**
```json
{
  "status": "APPROVED"
}
```

**Allowed Transitions**

| Status value | Who can set it | Condition | Side effect |
|---|---|---|---|
| `APPROVED` | Book owner only | Request must be `PENDING` | Book status → `BORROWED` |
| `REJECTED` | Book owner only | Request must be `PENDING` | — |
| `RETURNED` | Requester only | Request must be `APPROVED` | Book status → `AVAILABLE` |

> **Tip:** APPROVE and RETURN update both the request status and book status in a single **atomic transaction**.

**Success Response `200`**
```json
{
  "success": true,
  "message": "Borrow request approved. Book is now BORROWED.",
  "data": { "...updated borrow request..." }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `400` | Only pending requests can be approved or rejected. |
| `400` | Only approved requests can be marked as returned. |
| `401` | Access denied. No token provided. |
| `403` | Only the book owner can approve or reject borrow requests. |
| `403` | Only the borrower can mark a book as returned. |
| `404` | Borrow request not found. |

---

### DELETE `/borrow-requests/:id`

Withdraw (soft-delete) a borrow request. Only the requester can do this, and only when status is `PENDING`.

**Auth required:** ✅ Yes

**Success Response `200`**
```json
{
  "success": true,
  "message": "Borrow request withdrawn successfully.",
  "data": null
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| `400` | Only pending borrow requests can be withdrawn. |
| `401` | Access denied. No token provided. |
| `403` | You are not authorised to delete this borrow request. |
| `404` | Borrow request not found. |

---

## Complete Borrowing Lifecycle

```
POST /books                      → Book status: AVAILABLE
    ↓
POST /borrow-requests            → Request status: PENDING
    ↓
PATCH /borrow-requests/:id       → status: "APPROVED"
    Book status → BORROWED         Request status: APPROVED
    ↓
PATCH /borrow-requests/:id       → status: "RETURNED"
    Book status → AVAILABLE        Request status: RETURNED
```

**Alternative path (owner rejects):**
```
PATCH /borrow-requests/:id       → status: "REJECTED"
    Book stays: AVAILABLE          Request status: REJECTED
```

**Requester withdraws before decision:**
```
DELETE /borrow-requests/:id      → (soft deleted, book stays AVAILABLE)
```
