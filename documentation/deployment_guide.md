# Deployment & Setup Guide

This guide provides step-by-step instructions to configure, initialize, and execute the **Computer Hardware E-Commerce Website with AI Assistant** on a local development machine.

---

## Prerequisites

Ensure the following tools are installed:
1. **Java JDK 17 or higher** (JDK 23 confirmed ready).
2. **Apache Maven 3.x** (Maven 3.9.15 confirmed ready).
3. **Node.js v18.x or higher** (Node v24.14.1 confirmed ready).
4. **XAMPP Control Panel** (for Apache and MySQL).

---

## Step 1: Database Initialization (MySQL)

1. Launch the **XAMPP Control Panel** on your machine.
2. Start the **MySQL** module (this starts MySQL on standard port `3306`).
3. Click the **Admin** button next to MySQL or browse to `http://localhost/phpmyadmin` in your web browser.
4. Click **New** in phpMyAdmin to create a database named `hardware_ecommerce`.
5. Click on the SQL tab and import/run the DDL schema script:
   - Path: [database/schema.sql](file:///C:/Users/mufla/.gemini/antigravity/scratch/hardware-ecommerce-ai/database/schema.sql)
6. Once the tables are created, import/run the seed data script:
   - Path: [database/seed_data.sql](file:///C:/Users/mufla/.gemini/antigravity/scratch/hardware-ecommerce-ai/database/seed_data.sql)

---

## Step 2: Configure & Launch Backend (Spring Boot)

1. Open a command prompt or terminal in the backend directory:
   - Cwd: `C:\Users\mufla\.gemini\antigravity\scratch\hardware-ecommerce-ai\backend`
2. Open the properties file in a text editor:
   - Path: [application.properties](file:///C:/Users/mufla/.gemini/antigravity/scratch/hardware-ecommerce-ai/backend/src/main/resources/application.properties)
3. If you have a Gemini API key, add it to `gemini.api.key`. If left as `mock_mode_key`, the backend will run using an intelligent offline mock assistant automatically.
4. Build the Maven package:
   ```bash
   mvn clean package -DskipTests
   ```
5. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
6. The REST API server will run at `http://localhost:8080`.

---

## Step 3: Configure & Launch Frontend (React.js)

Due to Windows PowerShell script execution constraints, Node/NPM commands must be executed using `.cmd` variations on Windows:

1. Open a PowerShell terminal in the frontend directory:
   - Cwd: `C:\Users\mufla\.gemini\antigravity\scratch\hardware-ecommerce-ai\frontend`
2. Install the necessary dependencies:
   ```powershell
   npm.cmd install
   ```
3. Boot the Vite local development server:
   ```powershell
   npm.cmd run dev
   ```
4. Once running, open your web browser and navigate to the local React application:
   - URL: `http://localhost:5173`

---

## Step 4: Verification & Login

To verify system functionality:
1. Access the web page at `http://localhost:5173`.
2. Click **Login** and authenticate using the test credentials:
   - **Customer account**: `customer@example.com` / `password123`
   - **Administrator account**: `admin@example.com` / `password123`
3. Click on the **PC Builder** and test selecting components. Ensure that checking a motherboard size mismatch gives appropriate color alerts (amber/rose red) and updates the wattage draws dynamically.
4. Open the floating **AI Chatbot** icon at the bottom right, ask questions like *"Suggest a budget gaming PC build."*, and verify the AI replies correctly.
