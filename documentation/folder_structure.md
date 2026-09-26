# Project Folder Structure

This file maps out the complete generated directory layout for the **Computer Hardware E-Commerce Website with AI Assistant** final-year project.

```
hardware-ecommerce-ai/
├── backend/                             # Spring Boot Maven Project
│   ├── pom.xml                          # Maven build dependencies config
│   └── src/
│       ├── main/
│       │   ├── java/com/hardware/ecommerce/
│       │   │   ├── config/              # Security configurations & JWT utilities
│       │   │   │   ├── CustomUserDetailsService.java
│       │   │   │   ├── JwtAuthenticationFilter.java
│       │   │   │   ├── JwtTokenProvider.java
│       │   │   │   └── SecurityConfig.java
│       │   │   ├── controller/          # REST API endpoints (controllers)
│       │   │   │   ├── AIController.java
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── CartController.java
│       │   │   │   ├── OrderController.java
│       │   │   │   └── PCBuildController.java
│       │   │   │   └── ProductController.java
│       │   │   ├── dto/                 # Data Transfer Objects (Payload models)
│       │   │   │   ├── AuthResponse.java
│       │   │   │   ├── CartItemDto.java
│       │   │   │   ├── ChatRequest.java
│       │   │   │   ├── ChatResponse.java
│       │   │   │   ├── CheckoutRequest.java
│       │   │   │   ├── CompatibilityCheckRequest.java
│       │   │   │   ├── CompatibilityCheckResponse.java
│       │   │   │   ├── LoginRequest.java
│       │   │   │   ├── PCBuildDto.java
│       │   │   │   └── RegisterRequest.java
│       │   │   ├── model/               # JPA Hibernate Entities
│       │   │   │   ├── Brand.java
│       │   │   │   ├── Cart.java
│       │   │   │   ├── CartItem.java
│       │   │   │   ├── Category.java
│       │   │   │   ├── ChatHistory.java
│       │   │   │   ├── Order.java
│       │   │   │   ├── OrderItem.java
│       │   │   │   ├── PCBuild.java
│       │   │   │   ├── Product.java
│       │   │   │   ├── ProductSpecification.java
│       │   │   │   └── User.java
│       │   │   ├── repository/          # JPA database search repos
│       │   │   │   ├── BrandRepository.java
│       │   │   │   ├── CartItemRepository.java
│       │   │   │   ├── CartRepository.java
│       │   │   │   ├── CategoryRepository.java
│       │   │   │   ├── ChatHistoryRepository.java
│       │   │   │   ├── OrderRepository.java
│       │   │   │   ├── PCBuildRepository.java
│       │   │   │   ├── ProductRepository.java
│       │   │   │   └── UserRepository.java
│       │   │   ├── service/             # E-commerce core services
│       │   │   │   ├── CartService.java
│       │   │   │   ├── GeminiAiService.java
│       │   │   │   ├── OrderService.java
│       │   │   │   ├── PCCompatibilityEngine.java
│       │   │   │   ├── ProductService.java
│       │   │   │   └── UserService.java
│       │   │   └── EcommerceAiApplication.java # Entry Main class
│       │   └── resources/
│       │       └── application.properties # Database & API settings file
│       └── test/                        # Backend testing scripts folder
├── frontend/                            # React.js Vite Application
│   ├── index.html                       # HTML main layout file
│   ├── package.json                     # NPM dependency config file
│   ├── vite.config.js                   # Vite config settings
│   └── src/
│       ├── components/                  # Global reusable UI modules
│       │   └── AIChatbot.jsx            # Floating AI assistant panel
│       ├── pages/                       # Screen routes of app
│       │   ├── AdminDashboard.jsx       # Admin analytics & CRUD controls
│       │   ├── Cart.jsx                 # Shopping cart manager lists
│       │   ├── Checkout.jsx             # Shipping inputs & order placement
│       │   ├── Home.jsx                 # Landing screen hero grids
│       │   ├── Login.jsx                # Session auth input form
│       │   ├── Orders.jsx               # Purchase tracking lines
│       │   ├── PCBuilder.jsx            # Configurator grid slot picker
│       │   ├── ProductDetails.jsx       # Spec grid sheets detail page
│       │   ├── Products.jsx             # Catalog item list filtering
│       │   └── Register.jsx             # User creation input form
│       ├── services/
│       │   └── api.js                   # Central Axios REST client
│       ├── App.jsx                      # Primary routing & frame class
│       ├── index.css                    # Glassmorphism design stylesheet
│       └── main.jsx                     # ReactDOM bootstrap mount file
├── database/                            # MySQL scripts folder
│   ├── schema.sql                       # DDL tables definition script
│   └── seed_data.sql                    # Product & test user mock seeds
└── documentation/                       # Capstone reports & guides folder
    ├── api_docs.md                      # REST request/response contracts
    ├── deployment_guide.md              # Installation DDL & command lists
    ├── diagrams.md                      # UML Use Case, Class, Activity Mermaid charts
    ├── folder_structure.md              # Project layout overview map
    ├── presentation.md                  # PowerPoint style thesis slide logs
    ├── srs.md                           # Functional & security specs report
    └── user_manual.md                   # Customer builder & adminCRUD manual
```
