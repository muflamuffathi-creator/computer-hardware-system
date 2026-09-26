# Project Presentation Slides

---

## Slide 1: Project Title
### **Computer Hardware E-Commerce Platform with AI Assistant**
*Final-Year Capstone Project*

**Presented by:** [Your Name]  
**Role:** Full-Stack Developer & AI Engineer  
**Core Stack:** React.js, Spring Boot, MySQL, Gemini API

---

## Slide 2: Problem Statement
### **Why traditional PC shopping is broken:**
* **Compatibility Confusion**: Customers struggle matching sockets, form factors, RAM types, and wattage draws (e.g. DDR4 vs DDR5 RAM, AM5 vs LGA1700 CPU socket).
* **Manual Shop Operations**: Local shops handle product specifications, inventory, and invoices manually.
* **Lack of Instant Support**: No immediate technical support to guide configurations online.

---

## Slide 3: Main Objectives
### **What this platform solves:**
* **Develop Secure E-Commerce System**: Customer logins (JWT), catalogs search, shipping checkout.
* **Build an AI Assistant**: Integrate Gemini API for real-time technical questions and specs advice.
* **PC Rig Builder Engine**: Implement custom component slot checking for socket, sizing, and power matches.
* **Admin Dashboard**: Monitor stock balances, low stock warnings, and order status updates.

---

## Slide 4: System Architecture
### **Three-Tier Modular Architecture:**
1. **Frontend Presentation**: React.js SPA, custom design variables (Vanilla CSS), Lucide React vector icons.
2. **Backend API Logic**: Spring Boot REST services, JWT security filters, password encryption (BCrypt).
3. **Database & Services**: Normalized MySQL (3NF) database, direct HTTP integration with Gemini 1.5 Flash.

---

## Slide 5: Database Design (3NF)
### **Data Integrity and Normalization:**
* **12 Tables**: `users`, `categories`, `brands`, `products`, `product_specifications`, `orders`, `order_items`, `cart`, `cart_items`, `wishlist`, `chat_history`, `pc_builds`.
* **Normalization (3NF)**: Redundancy is minimized. Specifications are isolated as key-value pairs linked to products via foreign keys, supporting flexible component comparisons.
* **Foreign Key Constraints**: Proper cascading actions maintain data integrity across dependencies.

---

## Slide 6: Compatibility Guard Logic
### **Deterministic Check Metrics:**
* **Socket Check**: CPU socket === Motherboard socket.
* **RAM Generation**: Motherboard RAM type === RAM memory standard (DDR4 vs DDR5).
* **Motherboard Size**: Motherboard size fits within PC Case form factor listings.
* **Cooler Fitting**: CPU cooler bracket supports CPU socket.
* **PSU Wattage Check**: PSU wattage > (CPU TDP + GPU TDP + 150W safety margin).

---

## Slide 7: AI Chatbot Integration
### **Context-Aware Recommendations:**
* **Gemini API Integration**: Uses system instructions to make Gemini act as a hardware specialist.
* **Inventory Context Feeding**: The backend fetches all in-stock database products and feeds them to the Gemini API prompt context.
* **Offline Mock Fallback**: If the api key is missing or offline, a local pattern matcher generates immediate hardware advice.

---

## Slide 8: Platform Demo
### **Key Screens & Workflows:**
* **Home Page**: Futuristic glassmorphic tech design with category quick links.
* **Rig Builder**: Interactive grid with real-time green/red compatibility flags.
* **AI Chat Sidebar**: Persistent assistant resolving questions and suggesting upgrades.
* **Admin Panel**: Analytical overview, low stock alerts, product insertions.

---

## Slide 9: Conclusion
### **Summary of achievements:**
* Completed a production-ready, fully responsive e-commerce web platform.
* Successfully merged AI capability (Gemini) with deterministic validation rules to build a smart assistant.
* Provided 3NF normalized tables schema and secure REST APIs.
* **Future scope**: Integration of credit card payment gateways and AR build preview features.
