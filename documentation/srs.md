# Software Requirement Specification (SRS)

## Project Title: Computer Hardware E-Commerce Website with AI Assistant

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the "Computer Hardware E-Commerce Platform with AI Assistant". It describes the scopes, objectives, roles, architecture, and constraints of the system to serve as a blueprint for development and testing.

### 1.2 Document Conventions
All requirements listed are prioritized as:
- **M (Must have)**: Crucial for basic operations.
- **S (Should have)**: Highly desirable features.
- **C (Could have)**: Nice to have if resources permit.

### 1.3 Intended Audience
This specification is designed for academic examiners, system architects, software developers, database designers, and QA engineers reviewing this final-year capstone project.

---

## 2. Overall Description

### 2.1 Product Perspective
Modern hardware stores struggle to handle inventory, track orders, and resolve customer technical questions manually. Many customers lack technical hardware knowledge, leading to purchases of incompatible parts (e.g., LGA1700 CPU paired with an AM5 motherboard, or DDR4 RAM slotted into a DDR5 board).
This platform combines traditional e-commerce CRUD capabilities with an **AI assistant** powered by the Gemini API and a **deterministic rules-based compatibility check matrix** to eliminate buyer error and automate order execution.

### 2.2 Product Functions
1. **User Authentication**: Secure JWT-based registration and logins.
2. **Catalog Browser**: Search, brand filter, and price slider.
3. **Shopping Cart & Checkout**: Transaction items accumulation and COD order creation.
4. **PC Builder**: Interactive slot configuration with instant power and socket checks.
5. **AI Tech Chatbot**: Real-time advice referencing actual database stock records.
6. **Admin Portal**: Revenue monitoring, stock addition, and order tracking.

### 2.3 User Classes and Personas
- **Visitor/Guest**: Can view products and descriptions.
- **Customer**: Registered user who can configure custom builds, buy products, and chat with the AI.
- **Administrator**: Store manager who can modify catalog products and transition order statuses.

---

## 3. System Features

### 3.1 Authentication Module (Priority: Must Have)
- **FR-AUTH-1**: The system shall encrypt passwords using BCrypt encryption.
- **FR-AUTH-2**: The system shall generate stateless JWT tokens upon successful login valid for 24 hours.
- **FR-AUTH-3**: The system shall protect customer/admin paths using HTTP interceptors.

### 3.2 Product Catalog & Search (Priority: Must Have)
- **FR-CAT-1**: The catalog shall display names, specs, brand details, prices, and stock indicators.
- **FR-CAT-2**: The catalog shall offer real-time search inputs and category filters.

### 3.3 PC Rig Builder (Priority: Must Have)
- **FR-BLD-1**: The PC Builder shall permit selecting items for 8 core slots: CPU, Motherboard, RAM, GPU, Cooler, PSU, Case, Storage.
- **FR-BLD-2**: The system shall trigger a compatibility check on every selection.
- **FR-BLD-3**: Sockets, memory generation limits, and motherboard size dimensions must be validated.
- **FR-BLD-4**: System TDP draw must be computed dynamically.

### 3.4 AI Assistant Interface (Priority: Should Have)
- **FR-AI-1**: The chatbot shall answer tech questions using Gemini API instructions.
- **FR-AI-2**: The assistant shall suggest configurations using only products present in database inventories.
- **FR-AI-3**: If a Gemini API key is missing, the chatbot must fall back to a high-quality offline script.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance
- **NFR-PERF-1**: Catalog indexing queries shall respond in under 1.5 seconds.
- **NFR-PERF-2**: Compatibility engine calculations must complete in under 500 milliseconds.

### 4.2 Security
- **NFR-SEC-1**: Cross-Origin Resource Sharing (CORS) shall block unlisted domains.
- **NFR-SEC-2**: The database must resist SQL injections via JPA parameter bindings.

### 4.3 Scalability & Reliability
- **NFR-REL-1**: Database transactions must roll back during checkouts if a component stock deduction fails.
- **NFR-SCAL-2**: Project layout must follow modular packages to support microservice divisions in future cloud environments.
