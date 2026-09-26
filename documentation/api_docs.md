# REST API Documentation

All API requests default to baseline path: `http://localhost:8080/api`

---

## 1. Authentication Endpoints

### 1.1 User Registration
- **Endpoint**: `POST /auth/register`
- **Security**: Public
- **Request Body (JSON)**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "customer@example.com",
    "password": "password123"
  }
  ```
- **Responses**:
  - `200 OK`: `"User registered successfully with ID: 1"`
  - `400 Bad Request`: `"Email address already in use."`

### 1.2 User Login
- **Endpoint**: `POST /auth/login`
- **Security**: Public
- **Request Body (JSON)**:
  ```json
  {
    "email": "customer@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK - JSON)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "email": "customer@example.com",
    "role": "CUSTOMER",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

---

## 2. Product Catalog Endpoints

### 2.1 Search and Filter Catalog
- **Endpoint**: `GET /products`
- **Security**: Public
- **Query Parameters**:
  - `keyword` (Optional, string): Search name/description
  - `categoryId` (Optional, number): Filter by category primary key
  - `brandId` (Optional, number): Filter by brand primary key
  - `minPrice` (Optional, number): Lower pricing bound
  - `maxPrice` (Optional, number): Upper pricing bound
- **Response (200 OK - JSON Array)**:
  ```json
  [
    {
      "productId": 1,
      "name": "AMD Ryzen 7 7800X3D",
      "price": 399.00,
      "stockQuantity": 25,
      "imageUrl": "https://...",
      "brand": { "brandId": 2, "brandName": "AMD" },
      "category": { "categoryId": 1, "name": "Processors (CPU)" },
      "specifications": [
        { "specificationId": 1, "specificationName": "socket", "specificationValue": "AM5" }
      ]
    }
  ]
  ```

### 2.2 Get Product Details
- **Endpoint**: `GET /products/{id}`
- **Security**: Public
- **Response (200 OK - JSON)**:
  - Full product record including specification details block. Returns `404 Not Found` if index does not exist.

---

## 3. Shopping Cart Endpoints

### 3.1 Get Cart Contents
- **Endpoint**: `GET /cart`
- **Security**: Authenticated (`Authorization: Bearer <token>`)
- **Response (200 OK - JSON)**:
  ```json
  {
    "cartId": 1,
    "user": { "userId": 1, "email": "customer@example.com" },
    "cartItems": [
      {
        "cartItemId": 1,
        "product": { "productId": 1, "name": "AMD Ryzen 7 7800X3D", "price": 399.00 },
        "quantity": 1
      }
    ]
  }
  ```

### 3.2 Add Component to Cart
- **Endpoint**: `POST /cart/add`
- **Security**: Authenticated
- **Request Body (JSON)**:
  ```json
  {
    "productId": 1,
    "quantity": 1
  }
  ```
- **Response**: `200 OK` returning updated Cart JSON.

---

## 4. Orders Endpoints

### 4.1 Check Out Cart
- **Endpoint**: `POST /orders`
- **Security**: Authenticated
- **Request Body (JSON)**:
  ```json
  {
    "shippingAddress": "46/12 Nawam Mawatha, Colombo 2.",
    "billingAddress": "fill with your address"
  }
  ```
- **Response (200 OK - JSON)**: Returns created Order object, status set to `PENDING`. Cart is cleared, inventory stock decremented.

---

## 5. AI Module & Compatibility Endpoints

### 5.1 Chat with AI Assistant
- **Endpoint**: `POST /chat`
- **Security**: Authenticated
- **Request Body (JSON)**:
  ```json
  {
    "message": "Suggest a budget gaming PC build."
  }
  ```
- **Response (200 OK - JSON)**:
  ```json
  {
    "reply": "Here is a balanced High-Performance Gaming PC configuration..."
  }
  ```

### 5.2 Validate Component Compatibility
- **Endpoint**: `POST /compatibility-check`
- **Security**: Authenticated / Public
- **Request Body (JSON)**:
  ```json
  {
    "cpuId": 1,
    "motherboardId": 5,
    "ramId": 7,
    "gpuId": null
  }
  ```
- **Response (200 OK - JSON)**:
  ```json
  {
    "compatible": false,
    "messages": [
      "Incompatible CPU & Motherboard: CPU uses socket AM5 but Motherboard uses socket LGA1700."
    ],
    "warnings": [],
    "totalWattage": 270
  }
  ```
