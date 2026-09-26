# System Architecture & Design Diagrams

This document contains visual diagrams for the **Computer Hardware E-Commerce Website with AI Assistant**. These diagrams are formatted in **Mermaid.js** syntax and render natively in modern Markdown viewers.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        React[React.js SPA]
        CSS[Vanilla CSS / Glassmorphic Layout]
        Axios[Axios API Client]
        React --> Axios
    end

    subgraph Security & Route Gateway
        JWT[JWT Authentication Filter]
        SecConfig[Spring Security Config]
    end

    subgraph Backend Logic Layer (Spring Boot)
        AuthCtrl[AuthController]
        ProdCtrl[ProductController]
        OrderCtrl[OrderController]
        AICtrl[AIController]
        
        UserService[UserService]
        ProdService[ProductService]
        OrderService[OrderService]
        CompatEngine[PCCompatibilityEngine]
        GeminiService[GeminiAiService]
    end

    subgraph Data & External Services
        MySQL[(MySQL Database 3NF)]
        GeminiAPI[Gemini 1.5 Flash API]
    end

    Axios -->|Bearer Token| JWT
    JWT --> SecConfig
    SecConfig --> AuthCtrl
    SecConfig --> ProdCtrl
    SecConfig --> OrderCtrl
    SecConfig --> AICtrl

    AuthCtrl --> UserService
    ProdCtrl --> ProdService
    OrderCtrl --> OrderService
    AICtrl --> CompatEngine
    AICtrl --> GeminiService

    UserService --> MySQL
    ProdService --> MySQL
    OrderService --> MySQL
    CompatEngine --> MySQL
    GeminiService -->|HTTP POST| GeminiAPI
```

---

## 2. Entity Relationship Diagram (ERD)

Representing normalized database relationships in Crow's Foot style mapping primary and foreign keys:

```mermaid
erDiagram
    USERS {
        int user_id PK
        string first_name
        string last_name
        string email UK
        string password
        string role
        timestamp created_at
    }
    CATEGORIES {
        int category_id PK
        string name UK
        text description
    }
    BRANDS {
        int brand_id PK
        string brand_name UK
    }
    PRODUCTS {
        int product_id PK
        int category_id FK
        int brand_id FK
        string name
        text description
        decimal price
        int stock_quantity
        string image_url
    }
    PRODUCT_SPECIFICATIONS {
        int specification_id PK
        int product_id FK
        string specification_name
        string specification_value
    }
    ORDERS {
        int order_id PK
        int user_id FK
        decimal total_amount
        string order_status
        timestamp order_date
        text shipping_address
        text billing_address
    }
    ORDER_ITEMS {
        int order_item_id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    CART {
        int cart_id PK
        int user_id FK "Unique"
    }
    CART_ITEMS {
        int cart_item_id PK
        int cart_id FK
        int product_id FK
        int quantity
    }
    WISHLIST {
        int wishlist_id PK
        int user_id FK
        int product_id FK
    }
    CHAT_HISTORY {
        int chat_id PK
        int user_id FK
        text question
        text response
        timestamp created_at
    }
    PC_BUILDS {
        int build_id PK
        int user_id FK
        string build_name
        int cpu_id FK
        int motherboard_id FK
        int ram_id FK
        int gpu_id FK
        int cooler_id FK
        int psu_id FK
        int case_id FK
        int storage_id FK
        decimal total_price
        timestamp created_at
    }

    USERS ||--o| CART : "has"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ WISHLIST : "saves"
    USERS ||--o{ CHAT_HISTORY : "queries"
    USERS ||--o{ PC_BUILDS : "designs"
    
    CATEGORIES ||--o{ PRODUCTS : "contains"
    BRANDS ||--o{ PRODUCTS : "manufactures"
    
    PRODUCTS ||--o{ PRODUCT_SPECIFICATIONS : "defines"
    PRODUCTS ||--o{ ORDER_ITEMS : "included-in"
    PRODUCTS ||--o{ CART_ITEMS : "holds"
    
    CART ||--o{ CART_ITEMS : "contains"
    ORDERS ||--o{ ORDER_ITEMS : "details"
```

---

## 3. Use Case Diagram

```mermaid
left-to-right direction
actor Customer as "Customer Role"
actor Admin as "Administrator Role"

rectangle Platform {
    usecase UC_Register as "Register & Login"
    usecase UC_Browse as "Browse / Search Products"
    usecase UC_PCBuilder as "Configure Custom PC"
    usecase UC_AIChat as "Consult Gemini Assistant"
    usecase UC_Cart as "Manage Shopping Cart"
    usecase UC_Checkout as "Check Out Order"
    usecase UC_Orders as "Track Purchase History"
    
    usecase UC_AdminProducts as "Manage Store Catalog (CRUD)"
    usecase UC_AdminOrders as "Update Order Status"
    usecase UC_AdminAlerts as "Monitor Low Stock Alerts"
}

Customer --> UC_Register
Customer --> UC_Browse
Customer --> UC_PCBuilder
Customer --> UC_AIChat
Customer --> UC_Cart
Customer --> UC_Checkout
Customer --> UC_Orders

Admin --> UC_Register
Admin --> UC_AdminProducts
Admin --> UC_AdminOrders
Admin --> UC_AdminAlerts
```

---

## 4. Activity Diagram - Checkout Workflow

```mermaid
stateDiagram-v2
    [*] --> ClickCheckout : Cart Summary Reviewed
    ClickCheckout --> VerifySession : Token verified?
    
    state VerifySession {
        NoSession --> RedirectLogin : Redirect
        YesSession --> EnterAddresses : Provide Shipping Location
    }
    
    EnterAddresses --> ConfirmCODOrder : Choose Cash On Delivery (COD)
    
    state ConfirmCODOrder {
        [*] --> CheckStock : Query Inventory Levels
        CheckStock --> OutOfStock : Stock < Quantity
        CheckStock --> InStock : Stock >= Quantity
        
        OutOfStock --> TerminateOrder : Throw Warning
        InStock --> DeductInventory : Decrement stock_quantity
        DeductInventory --> CreateOrderRecords : Write Orders & Order_Items
        CreateOrderRecords --> PurgeCart : Clear Cart_Items
    }
    
    TerminateOrder --> [*] : Cancelled
    PurgeCart --> DisplaySuccessScreen : Return Confirmed ID
    DisplaySuccessScreen --> [*] : Completed
```

---

## 5. Sequence Diagram - PC Compatibility Check

```mermaid
sequenceDiagram
    autonumber
    actor Customer as User (React Client)
    participant UI as PC Builder UI
    participant API as AIController (Spring Boot)
    participant Engine as PCCompatibilityEngine
    participant DB as ProductRepository (MySQL)

    Customer->>UI: Select CPU component
    UI->>Customer: Render component in CPU slot
    Customer->>UI: Select Motherboard component
    UI->>Customer: Render component in Mobo slot
    
    Note over UI, API: Asynchronously trigger checks
    UI->>API: HTTP POST /api/compatibility-check (cpuId, motherboardId)
    API->>Engine: checkCompatibility(RequestDTO)
    
    Engine->>DB: Fetch details & product_specifications for CPU
    DB-->>Engine: CPU spec list (socket=AM5, tdp=120W)
    
    Engine->>DB: Fetch details & product_specifications for Motherboard
    DB-->>Engine: Mobo spec list (socket=LGA1700, ram_type=DDR5)
    
    Note over Engine: Run rules:<br/>AM5 (CPU) != LGA1700 (Motherboard)
    
    Engine-->>API: Return CompatibilityResponse (compatible=false, warnings=[socket mismatch])
    API-->>UI: Return JSON Response
    UI->>Customer: Render AlertBox (Rose Red): "Incompatible CPU & Motherboard socket mismatch."
```

---

## 6. Class Diagram (Core Backend Classes)

```mermaid
classDiagram
    class User {
        +Long userId
        +String firstName
        +String lastName
        +String email
        +String password
        +String role
        +LocalDateTime createdAt
    }
    
    class Product {
        +Long productId
        +String name
        +String description
        +Double price
        +Integer stockQuantity
        +String imageUrl
        +Category category
        +Brand brand
        +List specifications
    }
    
    class PCCompatibilityEngine {
        -ProductRepository productRepository
        +CompatibilityCheckResponse checkCompatibility(CompatibilityCheckRequest)
        -String getSpec(Product, String)
        -int parseWattage(String, int)
    }

    class GeminiAiService {
        -ProductRepository productRepository
        -String apiKey
        -String apiUrl
        +String generateResponse(String)
        -String generateMockResponse(String)
    }

    class AIController {
        -GeminiAiService geminiAiService
        -PCCompatibilityEngine compatibilityEngine
        +ResponseEntity chat(ChatRequest)
        +ResponseEntity checkCompatibility(CompatibilityCheckRequest)
    }

    AIController --> PCCompatibilityEngine : uses
    AIController --> GeminiAiService : uses
    PCCompatibilityEngine --> Product : queries specs
    GeminiAiService --> Product : feeds catalog context
```
