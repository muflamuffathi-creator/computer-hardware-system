# User Operation Manual

This guide describes how to operate the **Computer Hardware E-Commerce Website with AI Assistant** for customers and store administrators.

---

## 1. Customer User Guide

### 1.1 Account Access
1. Open the website at `http://localhost:5173`.
2. Click **Login** in the navigation bar.
3. Authenticate with your email and password, or click **Register here** to create a new account.
4. Once logged in, your name will be displayed in the navigation bar, and the floating **AI Chatbot button** (Bot icon) will appear in the bottom-right corner.

### 1.2 Custom PC Rig Configurator
1. Click **PC Builder** in the navigation header.
2. The page displays a list of 8 core PC component slots (CPU, Motherboard, RAM, GPU, Cooler, PSU, Case, SSD).
3. Click the **Choose** button next to a slot. A modal will open listing the stocked hardware items matching that category.
4. Click **Select** on the component of your choice.
5. In the **Rig Status** sidebar:
   - The cumulative cost updates instantly.
   - The system power draw (TDP) calculates dynamically.
   - The **Compatibility Guard** flags any engineering violations. If you pair an Intel LGA1700 motherboard with an AMD Ryzen CPU, or slot DDR4 memory into a DDR5 board, a red box with detailed warnings will be displayed.
6. Once configured, you can:
   - Click **Save Config** to save the build to your profile.
   - Click **Add Rig to Cart** to inject all selected components into your shopping cart in one click.

### 1.3 Consulting the Gemini Assistant
1. Click the floating **Bot icon** in the bottom right of the screen.
2. The tech chatbot panel will slide open from the right.
3. Type a query into the chat input, for example: *"Recommend a budget gaming PC build"* or *"Can a Ryzen 5 7600X fit this motherboard?"* and click Send.
4. The chatbot will review the store catalog database dynamically and suggest compatible parts with prices.
5. You can also click the predefined action pills at the bottom (e.g., 🎮 Budget Build, 🔧 Check AM5 Mobo) for quick queries.

---

## 2. Store Administrator Guide

### 2.1 Accessing the Admin Dashboard
1. Log in using an administrator account (e.g., `admin@example.com` / `password123`).
2. Click the **Admin Panel** link (highlighted in pink) in the navigation bar.
3. You will be redirected to `http://localhost:5173/admin`.

### 2.2 Monitoring Analytics & Stock Warnings
- The **Stats Summary Cards** show total sales revenue (completed orders), total orders placed, unique products cataloged, and low stock alarms.
- The **Low Stock Warnings** panel lists any components where inventory levels have dropped to 5 items or fewer. Use this to contact vendors for restocking.

### 2.3 Product Catalog CRUD Controls
1. To add a new component, locate the **Add Component Stock** form.
2. Fill in the name, category, brand, price, stock quantity, image URL, and description, and click **Save New Product**.
3. The new component will instantly appear in the catalog database.
4. To remove an out-of-date product, locate the **Catalog Inventory** list and click the trash can icon next to the product name.

### 2.4 Transitioning Customer Orders
1. Scroll down to the **Process Customer Orders** panel.
2. Active customer orders are listed showing order IDs and totals.
3. Use the status dropdown next to an order to transition states:
   - `PENDING` (Received) -> `PROCESSING` (Assembling/Packing) -> `COMPLETED` (Delivered/Paid) -> `CANCELLED`.
   - Changing status updates customer tracking lists in real time.
