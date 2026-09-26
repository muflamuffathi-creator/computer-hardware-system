-- Seed Data for Computer Hardware E-Commerce Platform
-- Expanded product catalog with 80+ items

-- 1. SEED CATEGORIES
INSERT INTO categories (name, description) VALUES
('CPUs', 'Processors from Intel and AMD'),
('Motherboards', 'Core circuit boards for your system'),
('RAM', 'Memory modules and kits'),
('GPUs', 'Graphics cards for gaming and work'),
('Storage', 'SSDs and HDDs'),
('Power Supplies', 'PSU units with various wattages'),
('Coolers', 'CPU and case cooling solutions'),
('Cases', 'PC enclosures and chassis'),
('Monitors', 'Display screens'),
('Peripherals', 'Keyboards, mice, and accessories');

-- 2. SEED BRANDS
INSERT INTO brands (brand_name) VALUES
('Intel'),
('AMD'),
('ASUS'),
('MSI'),
('Gigabyte'),
('Corsair'),
('NVIDIA'),
('G.Skill'),
('Samsung'),
('NZXT'),
('EVGA'),
('Noctua'),
('Kingston'),
('Western Digital'),
('Seagate'),
('LG'),
('Dell'),
('Razer'),
('SteelSeries'),
('Logitech');

-- 3. SEED DEMO USERS
INSERT INTO users (first_name, last_name, email, password, role) VALUES
('Dev', 'User', 'dev@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8GPuR9Nny8aGT093qXN5WjM0W7W8Lw7c.3e', 'CUSTOMER'),
('Admin', 'User', 'admin@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8GPuR9Nny8aGT093qXN5WjM0W7W8Lw7c.3e', 'ADMIN'),
('John', 'Doe', 'customer@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8GPuR9Nny8aGT093qXN5WjM0W7W8Lw7c.3e', 'CUSTOMER'),
('Mufla', 'Muffathi', 'mufla@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8GPuR9Nny8aGT093qXN5WjM0W7W8Lw7c.3e', 'CUSTOMER');

-- 4. SEED PRODUCTS - CPUs (10 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('AMD Ryzen 9 7950X3D', 'High-end 16-core CPU with 3D V-Cache, AM5 socket, excellent for gaming.', 499.00, 20, 1, 2, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
('Intel Core i9-14900K', 'Flagship 24-core processor, LGA1700, up to 6.0 GHz performance.', 529.00, 15, 1, 1, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
('AMD Ryzen 7 7700X', '8-core AM5 processor, great for balanced gaming and productivity.', 299.00, 25, 1, 2, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
('Intel Core i7-14700K', '20-core desktop processor, LGA1700, excellent multitasking CPU.', 399.00, 18, 1, 1, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
('AMD Ryzen 5 7600X', 'Budget-friendly 6-core AM5 processor, great for entry-level builds.', 199.00, 40, 1, 2, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
('Intel Core i5-14600K', 'Mid-range 14-core processor, LGA1700, solid performance for gaming.', 249.00, 35, 1, 1, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
('AMD Ryzen 9 5950X', 'High-core-count productivity CPU, AM4 socket, 16-core powerhouse.', 349.00, 12, 1, 2, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
('Intel Core i3-14100', 'Budget quad-core processor, LGA1700, perfect for office work.', 129.00, 50, 1, 1, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
('AMD Ryzen 5 5600X', 'Previous gen 6-core AM4 CPU, still great value for gaming.', 149.00, 30, 1, 2, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400'),
('Intel Core Ultra 9', 'Latest generation efficiency cores, LGA1851, AI-optimized.', 589.00, 8, 1, 1, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400');

-- 5. SEED PRODUCTS - MOTHERBOARDS (8 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('ASUS ROG STRIX B850-E', 'Premium AM5 socket B850 motherboard with DDR5, PCIe 5.0, WiFi 7.', 349.00, 12, 2, 3, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400'),
('MSI MPG Z790 EDGE WIFI', 'High-end LGA1700 Z790 with DDR5, PCIe 5.0, 18+2+1 power phases.', 369.00, 10, 2, 4, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400'),
('Gigabyte X870 ELITE', 'Mid-range AM5 socket X870 motherboard, excellent value AM5 option.', 249.00, 18, 2, 5, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400'),
('ASUS ProArt Z890-CREATOR', 'Professional-grade LGA1851 motherboard for content creators.', 429.00, 6, 2, 3, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400'),
('MSI B450-A PRO MAX', 'Budget AM4 socket motherboard, excellent value for older Ryzen CPUs.', 99.00, 35, 2, 4, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400'),
('Gigabyte Z690 AORUS MASTER', 'Flagship LGA1700 with excellent BIOS and 20-phase power delivery.', 299.00, 14, 2, 5, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400'),
('ASUS ROG STRIX B650I-E', 'Mini-ITX AM5 motherboard for compact builds with premium features.', 299.00, 8, 2, 3, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400'),
('MSI MPG B550 EDGE WIFI', 'Mid-range AM4 socket board with good VRM and WiFi 6E.', 179.00, 22, 2, 4, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400');

-- 6. SEED PRODUCTS - RAM (10 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('Corsair Dominator Platinum RGB 64GB', 'Premium DDR5 64GB (2x32GB) 6000MHz, RGB lighting, extreme performance.', 349.00, 8, 3, 6, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('G.Skill Trident Z5 RGB 32GB DDR5', 'High-performance DDR5 32GB (2x16GB) 6000MHz, CL30, excellent gaming RAM.', 119.00, 45, 3, 8, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Kingston Fury Beast 32GB DDR5', 'Solid DDR5 32GB (2x16GB) 5600MHz, good value option.', 89.00, 55, 3, 12, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Corsair Vengeance RGB PRO 64GB DDR4', 'DDR4 64GB (4x16GB) 3600MHz, great for productivity workloads.', 159.00, 18, 3, 6, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('G.Skill Ripjaws S5 16GB DDR5', 'Budget DDR5 16GB (2x8GB) 5600MHz, perfect for entry-level builds.', 49.00, 80, 3, 8, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Corsair Vengeance LPX 32GB DDR5', 'Low-profile DDR5 32GB (2x16GB) 6000MHz, compatible with most coolers.', 129.00, 40, 3, 6, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Kingston HyperX Fury 32GB DDR4', 'DDR4 32GB (2x16GB) 3200MHz, reliable and affordable.', 69.00, 60, 3, 12, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('G.Skill Trident Z Neo 32GB DDR4', 'Premium DDR4 32GB (2x16GB) 3600MHz for Ryzen systems.', 99.00, 35, 3, 8, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Corsair Vengeance LPX 16GB DDR5', 'Budget-friendly DDR5 16GB (2x8GB) 5600MHz, entry-level performance.', 49.00, 75, 3, 6, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Kingston Fury Renegade 32GB DDR5', 'High-speed DDR5 32GB (2x16GB) 6400MHz, extreme gaming performance.', 149.00, 25, 3, 12, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400');

-- 7. SEED PRODUCTS - GPUs (12 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('NVIDIA RTX 4090 Founders Edition', 'Flagship graphics card, 24GB GDDR6X, best-in-class gaming and 4K performance.', 1599.00, 5, 4, 7, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('AMD Radeon RX 7900 XTX', 'Flagship AMD GPU, 24GB GDDR6, excellent 4K gaming and content creation.', 899.00, 12, 4, 2, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('NVIDIA RTX 4080 Super', 'High-end gaming GPU, 16GB GDDR6X, 1440p ultra high performance.', 999.00, 10, 4, 7, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('AMD Radeon RX 7800 XT', 'Mid-high GPU, 16GB GDDR6, excellent 1440p performance and value.', 499.00, 25, 4, 2, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('NVIDIA RTX 4070 Ti Super', 'Balanced high-end GPU, 16GB GDDR6X, great 1440p gaming card.', 799.00, 18, 4, 7, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('Intel Arc A770 16GB', 'Budget gaming GPU, 16GB GDDR6, new entrant with solid 1080p performance.', 299.00, 22, 4, 1, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('NVIDIA RTX 4070', 'Mid-range GPU, 12GB GDDR6X, excellent 1080p/1440p card for content creators.', 569.00, 20, 4, 7, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('AMD Radeon RX 7700 XT', 'Budget gaming GPU, 12GB GDDR6, solid 1080p ultra gaming performance.', 349.00, 30, 4, 2, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('NVIDIA RTX 4060 Ti', 'Entry-level gaming GPU, 8GB GDDR6, perfect for 1080p gaming.', 249.00, 40, 4, 7, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('AMD Radeon RX 6600', 'Budget 1080p GPU, 8GB GDDR6, great value entry-level card.', 179.00, 50, 4, 2, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('NVIDIA RTX 4090 ASUS ROG Strix', 'Custom RTX 4090, premium cooling, 24GB GDDR6X, best gaming performance.', 1799.00, 3, 4, 3, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400'),
('MSI Gaming X RTX 4080 Super', 'Custom RTX 4080 Super, triple-fan cooling, 16GB GDDR6X, efficient design.', 1099.00, 8, 4, 4, 'https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=400');

-- 8. SEED PRODUCTS - STORAGE (10 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('Samsung 990 Pro 4TB', 'PCIe 4.0 NVMe SSD, 4TB, 7100 MB/s read speeds, excellent for gaming/content creation.', 349.00, 15, 5, 9, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Western Digital Black SN850X 2TB', 'PCIe 4.0 NVMe SSD, 2TB, 7100 MB/s, premium gaming SSD.', 139.00, 35, 5, 14, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Samsung 870 QVO 4TB SATA', '2.5" SATA SSD, 4TB, 560 MB/s, great for bulk storage.', 229.00, 20, 5, 9, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Corsair MP60 GS 2TB', 'PCIe 4.0 NVMe SSD, 2TB, 4950 MB/s, balanced performance.', 139.00, 40, 5, 6, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Kingston A2000 1TB', 'PCIe 3.0 NVMe SSD, 1TB, 2200 MB/s, budget-friendly performance.', 59.00, 70, 5, 12, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Seagate Barracuda 8TB HDD', '3.5" SATA HDD, 8TB, 5400 RPM, great for bulk archival storage.', 99.00, 25, 5, 15, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('WD Blue SN550 1TB', 'PCIe 3.0 NVMe SSD, 1TB, 2400 MB/s, reliable budget option.', 49.00, 85, 5, 14, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Samsung 980 Pro 2TB', 'PCIe 4.0 NVMe SSD, 2TB, 7100 MB/s, top-tier performance.', 179.00, 28, 5, 9, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Crucial MX500 2TB', '2.5" SATA SSD, 2TB, 560 MB/s, reliable workhorse storage.', 99.00, 45, 5, 6, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400'),
('Intel 970 EVO Plus 1TB', 'PCIe 4.0 NVMe SSD, 1TB, 5150 MB/s, great all-around NVMe.', 69.00, 55, 5, 1, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400');

-- 9. SEED PRODUCTS - POWER SUPPLIES (8 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('Corsair HX1500i 1500W Platinum', 'Fully modular 80+ Platinum PSU, 1500W, WiFi enabled, premium build quality.', 399.00, 8, 6, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('EVGA SuperNOVA 850W Gold', 'Fully modular 80+ Gold PSU, 850W, reliable workhorse power supply.', 139.00, 35, 6, 11, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Seasonic PRIME GX-1000', 'Fully modular 80+ Gold PSU, 1000W, excellent efficiency and ripple control.', 199.00, 20, 6, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Corsair RM850x 850W Gold', 'Fully modular 80+ Gold PSU, 850W, compact size, great for most builds.', 139.00, 40, 6, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('NZXT E850 850W Gold', 'Fully modular 80+ Gold PSU, 850W, 10-year warranty, sleeved cables.', 169.00, 25, 6, 10, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Corsair SF750 750W Platinum SFX', 'Modular SFX PSU, 750W, 80+ Platinum, perfect for small form factor builds.', 179.00, 15, 6, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Be Quiet! Dark Power Pro 12 1500W', 'Fully modular 80+ Titanium PSU, 1500W, ultra-quiet, premium option.', 449.00, 6, 6, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('MSI MAG A750GL 750W Gold', 'Fully modular 80+ Gold PSU, 750W, 10-year warranty, modular design.', 119.00, 45, 6, 4, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400');

-- 10. SEED PRODUCTS - CPU COOLERS (8 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('NZXT Kraken Elite 360 RGB', '360mm AIO liquid cooler, LCD display, supports all modern sockets, premium performance.', 279.00, 12, 7, 10, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Noctua NH-D15 chromax.black', 'Dual-tower air cooler, supports AM5/LGA1700, silent operation, budget-friendly.', 119.00, 30, 7, 12, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Corsair iCUE H150i Elite Capellix', '360mm AIO liquid cooler, RGB lighting, excellent cooling performance.', 219.00, 18, 7, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Be Quiet! Dark Rock Pro 4', 'High-end air cooler, TDP 250W, silent performance, all socket compatibility.', 89.00, 35, 7, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('ASUS ROG STRIX LC360 RGB', '360mm premium AIO cooler, OLED display, premium design, strong performance.', 299.00, 10, 7, 3, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Arctic Freezer 34 eSports DUO', 'Mid-range air cooler, 120-160W TDP, budget-friendly, silent operation.', 39.00, 50, 7, 12, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Lian Li Galahad 360 UNI Fan', '360mm AIO cooler with unified fan design, excellent thermals and aesthetics.', 189.00, 16, 7, 10, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Noctua NH-U12S chromax', 'Single-tower air cooler, compact, excellent for ITX builds, silent performance.', 69.00, 40, 7, 12, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400');

-- 11. SEED PRODUCTS - CASES (8 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('NZXT H7 Flow RGB White', 'ATX mid-tower case, tempered glass, built-in RGB fans, excellent airflow.', 149.00, 18, 8, 10, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Corsair 4000D Airflow Black', 'Budget-friendly ATX case, two 120mm fans, clean design, great airflow.', 89.00, 40, 8, 6, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Lian Li LANCOOL 216 RGB', 'Budget ATX case, RGB lighting, good cable management, great value.', 79.00, 50, 8, 10, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('ASUS ROG STRIX HELIOS GX601', 'Premium dual-chamber case, tempered glass, supports E-ATX, RGB lighting.', 249.00, 8, 8, 3, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Phanteks Eclipse P500A D-RGB', 'Mid-tower case, mesh front, DRGB fans, excellent thermals, tempered glass.', 119.00, 25, 8, 10, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Corsair Crystal 680X RGB', 'ATX mid-tower, dual tempered glass panels, premium design, excellent visibility.', 189.00, 14, 8, 6, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('NZXT H1 V2 Mini-ITX SFF', 'Compact mini-ITX case, integrated SSD mount, good for small form factor builds.', 199.00, 10, 8, 10, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Corsair 1000D Obsidian Aluminum', 'Full tower, modular design, excellent cable management, premium build quality.', 329.00, 6, 8, 6, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400');

-- 12. SEED PRODUCTS - MONITORS (8 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('LG 27GP950 27" 4K 144Hz', '4K IPS panel, 144Hz, HDR, premium gaming monitor with exceptional color accuracy.', 699.00, 8, 9, 16, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Dell Alienware AW3423DW 34" Ultrawide', '34" OLED ultrawide, 165Hz, 1440p ultrawide gaming monitor, immersive gaming.', 899.00, 6, 9, 17, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('ASUS ROG Swift 27" 1440p 360Hz', 'High refresh rate 1440p gaming monitor, 360Hz, fast response time, esports ready.', 499.00, 12, 9, 3, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('LG 27GP550 27" 1440p 165Hz', 'IPS 1440p gaming monitor, 165Hz, great color accuracy and responsiveness.', 299.00, 25, 9, 16, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Dell S2721DGF 27" 1440p 165Hz', '1440p IPS panel, 165Hz, great productivity and gaming monitor, affordable.', 349.00, 20, 9, 17, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('ASUS PA247CV 24" 1080p 100Hz', 'Professional IPS monitor, 100Hz, color accurate, great for content creators.', 219.00, 30, 9, 3, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('MSI MAG 321UP 32" 4K 120Hz', '32" 4K IPS panel, 120Hz, HDR, professional and gaming use, immersive display.', 749.00, 7, 9, 4, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('LG 24UP550 24" 4K 60Hz', 'Compact 4K IPS monitor, professional grade color accuracy, perfect for editing.', 349.00, 18, 9, 16, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400');

-- 13. SEED PRODUCTS - PERIPHERALS (8 products)
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, image_url) VALUES
('Razer DeathAdder V3 Gaming Mouse', 'Lightweight gaming mouse, 30000 DPI, ambidextrous, premium sensor.', 69.00, 40, 10, 18, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('SteelSeries Apex Pro Keyboard', 'Mechanical gaming keyboard, adjustable actuation, OLED display, fully programmable.', 199.00, 22, 10, 19, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Corsair Dark Core RGB Pro Gaming Mouse', 'Wireless gaming mouse, 18000 DPI, customizable buttons, precision tracking.', 59.00, 45, 10, 6, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Logitech MX Keys Keyboard', 'Premium wireless keyboard, backlit keys, multi-device support, productivity-focused.', 99.00, 35, 10, 20, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Razer Huntsman V3 Pro Keyboard', 'Premium esports keyboard, optical switches, wireless, ultra-responsive.', 179.00, 18, 10, 18, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('SteelSeries Rival 5 Gaming Mouse', 'Ergonomic gaming mouse, precision tracking, 8 programmable buttons, great grip.', 49.00, 60, 10, 19, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Corsair K95 Platinum XT Keyboard', 'High-end mechanical keyboard, Cherry MX switches, macro keys, premium build.', 229.00, 15, 10, 6, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400'),
('Logitech MX Master 3S Mouse', 'Premium wireless mouse, multi-device, precision scrolling, productivity tool.', 89.00, 40, 10, 20, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400');
