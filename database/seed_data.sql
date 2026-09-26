-- Seed Data for Computer Hardware E-Commerce Platform
USE hardware_ecommerce;

-- 1. SEED USER ROLES AND DEMO ACCOUNTS
-- Default password: password123 (BCrypt hash)
INSERT INTO users (first_name, last_name, email, password, role) VALUES
('John', 'Doe', 'customer@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8GPuR9Nny8aGT093qXN5WjM0W7W8Lw7c.3e', 'CUSTOMER'),
('Admin', 'User', 'admin@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8GPuR9Nny8aGT093qXN5WjM0W7W8Lw7c.3e', 'ADMIN');

-- 2. SEED CATEGORIES
INSERT INTO categories (name, description) VALUES
('Processors (CPU)', 'Central Processing Units from Intel and AMD'),
('Motherboards', 'Core circuit boards linking all hardware components'),
('RAM', 'Random Access Memory modules'),
('Graphics Cards (GPU)', 'Dedicated graphic processing cards'),
('Storage (SSD/HDD)', 'Solid state drives and hard disks'),
('Power Supplies (PSU)', 'Power supply units with different wattage ratings'),
('CPU Coolers', 'AIO liquid coolers and air coolers'),
('PC Cases', 'Enclosures and tower chassis'),
('Monitors', 'Display screens'),
('Keyboards & Mice', 'Input peripherals');

-- 3. SEED BRANDS
INSERT INTO brands (brand_name) VALUES
('Intel'), ('AMD'), ('ASUS'), ('MSI'), ('Gigabyte'), ('Corsair'), ('NVIDIA'), ('G.Skill'), ('Samsung'), ('NZXT'), ('EVGA'), ('Noctua');

-- 4. SEED PRODUCTS
-- Let's insert CPUs
INSERT INTO products (product_id, category_id, brand_id, name, description, price, stock_quantity, image_url) VALUES
(1, 1, 2, 'AMD Ryzen 7 7800X3D', 'High-end gaming CPU with 3D V-Cache, 8 Cores, 16 Threads, AM5 socket.', 399.00, 25, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500'),
(2, 1, 1, 'Intel Core i9-14900K', 'Flagship 24-core processor, up to 6.0 GHz, LGA1700 socket.', 529.00, 15, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500'),
(3, 1, 2, 'AMD Ryzen 5 7600X', 'Excellent value AM5 6-core processor, speeds up to 5.3GHz.', 199.00, 40, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500');

-- Motherboards
INSERT INTO products (product_id, category_id, brand_id, name, description, price, stock_quantity, image_url) VALUES
(4, 2, 3, 'ASUS ROG STRIX B650-A GAMING WIFI', 'AM5 socket B650 motherboard, DDR5, ATX, PCIe 5.0, WiFi 6E.', 229.00, 18, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500'),
(5, 2, 4, 'MSI MPG Z790 CARBON WIFI', 'LGA1700 socket Z790 motherboard, DDR5, ATX, PCIe 5.0, WiFi 6E.', 349.00, 12, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500'),
(6, 2, 5, 'Gigabyte B650I AORUS ULTRA', 'Mini-ITX Motherboard for AM5 socket Ryzen CPUs, DDR5, PCIe 4.0.', 259.00, 8, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500');

-- RAM
INSERT INTO products (product_id, category_id, brand_id, name, description, price, stock_quantity, image_url) VALUES
(7, 3, 8, 'G.Skill Trident Z5 RGB 32GB DDR5 6000MHz', 'High-performance DDR5 dual-channel memory kit (2x16GB), CL30.', 119.00, 50, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500'),
(8, 3, 6, 'Corsair Vengeance LPX 16GB DDR4 3200MHz', 'Classic low-profile DDR4 memory kit (2x8GB), CL16.', 42.00, 80, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500');

-- GPUs
INSERT INTO products (product_id, category_id, brand_id, name, description, price, stock_quantity, image_url) VALUES
(9, 4, 3, 'ASUS ROG Strix RTX 4080 Super', 'NVIDIA GeForce RTX 4080 Super 16GB GDDR6X, extreme cooling performance.', 1099.00, 10, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTh95NCVsLq1XPkhD-pkUNQ6HY7cLEGs5qadddcOLg7Q&s=10'),
(10, 4, 4, 'MSI Gaming X Slim RTX 4070 Ti Super', 'RTX 4070 Ti Super 16GB GDDR6X, triple fan, quiet operations.', 799.00, 14, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=500'),
(11, 4, 2, 'AMD Radeon RX 7800 XT 16GB', 'RDNA 3 gaming graphics card, high value 1440p performer.', 499.00, 20, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=500');

-- CPU Coolers
INSERT INTO products (product_id, category_id, brand_id, name, description, price, stock_quantity, image_url) VALUES
(12, 7, 10, 'NZXT Kraken Elite 360 RGB AIO', '360mm liquid AIO cooler with customizable LCD display.', 279.00, 15, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'),
(13, 7, 12, 'Noctua NH-D15 chromax.black', 'Dual-tower premium air cooler for CPU, highly compatible and quiet.', 119.00, 30, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500');

-- PSUs
INSERT INTO products (product_id, category_id, brand_id, name, description, price, stock_quantity, image_url) VALUES
(14, 6, 6, 'Corsair RM850x 850W Gold', 'Fully modular 80 Plus Gold power supply unit.', 139.00, 25, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'),
(15, 6, 6, 'Corsair SF750 750W Platinum SFX', 'High quality SFX modular power supply for Mini-ITX cases.', 179.00, 12, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'),
(16, 6, 11, 'EVGA SuperNOVA 1000 G6', '1000W 80 Plus Gold compact premium PSU.', 189.00, 10, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500');

-- Cases
INSERT INTO products (product_id, category_id, brand_id, name, description, price, stock_quantity, image_url) VALUES
(17, 8, 10, 'NZXT H9 Flow White', 'Dual-chamber ATX mid-tower chassis, high airflow layout.', 159.00, 15, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500'),
(18, 8, 6, 'Corsair 4000D Airflow Black', 'Clean, high ventilation mid-tower ATX case.', 89.00, 25, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500'),
(19, 8, 3, 'ASUS ROG Z11 Mini-ITX', 'Premium small form factor ITX computer case, 11-degree tilt design.', 219.00, 5, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500');

-- Storage
INSERT INTO products (product_id, category_id, brand_id, name, description, price, stock_quantity, image_url) VALUES
(20, 5, 9, 'Samsung 990 Pro 2TB NVMe SSD', 'PCIe Gen4 M.2 SSD, speeds up to 7450 MB/s.', 169.00, 45, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500'),
(21, 5, 9, 'Samsung 980 1TB NVMe SSD', 'Entry level PCIe Gen3 M.2 SSD.', 89.00, 60, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500');


-- 5. SEED PRODUCT_SPECIFICATIONS
-- CPU Specs (Socket, TDP)
INSERT INTO product_specifications (product_id, specification_name, specification_value) VALUES
(1, 'socket', 'AM5'),
(1, 'tdp', '120W'),
(1, 'cores', '8'),
(1, 'threads', '16'),
(1, 'graphics_integrated', 'yes'),

(2, 'socket', 'LGA1700'),
(2, 'tdp', '125W'),
(2, 'cores', '24'),
(2, 'threads', '32'),
(2, 'graphics_integrated', 'yes'),

(3, 'socket', 'AM5'),
(3, 'tdp', '105W'),
(3, 'cores', '6'),
(3, 'threads', '12'),
(3, 'graphics_integrated', 'yes'),

-- Motherboard Specs (Socket, Ram Type, Form Factor)
(4, 'socket', 'AM5'),
(4, 'ram_type', 'DDR5'),
(4, 'form_factor', 'ATX'),
(4, 'm2_slots', '3'),

(5, 'socket', 'LGA1700'),
(5, 'ram_type', 'DDR5'),
(5, 'form_factor', 'ATX'),
(5, 'm2_slots', '5'),

(6, 'socket', 'AM5'),
(6, 'ram_type', 'DDR5'),
(6, 'form_factor', 'Mini-ITX'),
(6, 'm2_slots', '2'),

-- RAM Specs (Ram Type, Speed)
(7, 'ram_type', 'DDR5'),
(7, 'capacity', '32GB'),
(7, 'speed', '6000MHz'),

(8, 'ram_type', 'DDR4'),
(8, 'capacity', '16GB'),
(8, 'speed', '3200MHz'),

-- GPU Specs (TDP, Power, Length)
(9, 'tdp', '320W'),
(9, 'length', '357mm'),
(9, 'vram', '16GB'),
(9, 'power_connectors', '16-pin'),

(10, 'tdp', '285W'),
(10, 'length', '307mm'),
(10, 'vram', '16GB'),
(10, 'power_connectors', '16-pin'),

(11, 'tdp', '263W'),
(11, 'length', '267mm'),
(11, 'vram', '16GB'),
(11, 'power_connectors', '2x8-pin'),

-- CPU Cooler Specs (Supported Sockets, TDP rating)
(12, 'supported_sockets', 'AM5,LGA1700,LGA1200'),
(12, 'tdp_rating', '300W'),
(12, 'cooler_type', 'Liquid'),

(13, 'supported_sockets', 'AM5,LGA1700,LGA1200,AM4'),
(13, 'tdp_rating', '220W'),
(13, 'cooler_type', 'Air'),

-- PSU Specs (Wattage, Form Factor)
(14, 'wattage', '850W'),
(14, 'form_factor', 'ATX'),
(14, 'efficiency', '80+ Gold'),

(15, 'wattage', '750W'),
(15, 'form_factor', 'SFX'),
(15, 'efficiency', '80+ Platinum'),

(16, 'wattage', '1000W'),
(16, 'form_factor', 'ATX'),
(16, 'efficiency', '80+ Gold'),

-- Case Specs (Supported Form Factors)
(17, 'supported_form_factors', 'ATX,Micro-ATX,Mini-ITX'),
(17, 'max_gpu_length', '435mm'),
(17, 'max_cooler_height', '165mm'),

(18, 'supported_form_factors', 'ATX,Micro-ATX,Mini-ITX'),
(18, 'max_gpu_length', '360mm'),
(18, 'max_cooler_height', '170mm'),

(19, 'supported_form_factors', 'Mini-ITX'),
(19, 'max_gpu_length', '320mm'),
(19, 'max_cooler_height', '130mm'),

-- Storage Specs
(20, 'interface', 'PCIe Gen4 NVMe'),
(20, 'read_speed', '7450 MB/s'),
(21, 'interface', 'PCIe Gen3 NVMe'),
(21, 'read_speed', '3500 MB/s');
