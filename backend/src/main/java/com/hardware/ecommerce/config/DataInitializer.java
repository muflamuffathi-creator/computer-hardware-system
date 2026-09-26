package com.hardware.ecommerce.config;

import com.hardware.ecommerce.model.Brand;
import com.hardware.ecommerce.model.Cart;
import com.hardware.ecommerce.model.Category;
import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.model.ProductSpecification;
import com.hardware.ecommerce.model.User;
import com.hardware.ecommerce.repository.BrandRepository;
import com.hardware.ecommerce.repository.CartRepository;
import com.hardware.ecommerce.repository.CategoryRepository;
import com.hardware.ecommerce.repository.ProductRepository;
import com.hardware.ecommerce.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CartRepository cartRepository,
                           CategoryRepository categoryRepository,
                           BrandRepository brandRepository,
                           ProductRepository productRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedCatalog();
    }

    private void seedUsers() {
        createUserIfMissing("customer@example.com", "John", "Doe", "CUSTOMER", "password123");
        createUserIfMissing("admin@example.com", "Admin", "User", "ADMIN", "password123");
    }

    private void createUserIfMissing(String email, String firstName, String lastName, String role, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            logger.debug("User already exists: {}", email);
            return;
        }

        User user = Objects.requireNonNull(User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build(), "User build returned null");

        User savedUser = Objects.requireNonNull(userRepository.save(user), "Saved user must not be null");
        Cart savedCart = new Cart();
        savedCart.setUser(savedUser);
        savedCart.setCartItems(new ArrayList<>());
        cartRepository.save(savedCart);
        logger.info("Created default user: {} ({})", email, role);
    }

    private void seedCatalog() {
        Category processors = createCategoryIfMissing("Processors (CPU)", "Central Processing Units from Intel and AMD");
        Category motherboards = createCategoryIfMissing("Motherboards", "Core circuit boards linking all hardware components");
        Category ram = createCategoryIfMissing("RAM", "Random Access Memory modules");
        Category gpu = createCategoryIfMissing("Graphics Cards (GPU)", "Dedicated graphic processing cards");
        Category storage = createCategoryIfMissing("Storage (SSD/HDD)", "Solid state drives and hard disks");
        Category psu = createCategoryIfMissing("Power Supplies (PSU)", "Power supply units with different wattage ratings");
        Category coolers = createCategoryIfMissing("CPU Coolers", "AIO liquid coolers and air coolers");
        Category cases = createCategoryIfMissing("PC Cases", "Enclosures and tower chassis");
        Category monitors = createCategoryIfMissing("Monitors", "High-resolution displays for gaming and productivity.");
        Category keyboards = createCategoryIfMissing("Keyboards", "Mechanical and membrane keyboards for desktop PCs.");
        Category chairs = createCategoryIfMissing("Gaming Chairs", "Ergonomic seating designed for long gaming and workstation sessions.");

        Brand intel = createBrandIfMissing("Intel");
        Brand amd = createBrandIfMissing("AMD");
        Brand asus = createBrandIfMissing("ASUS");
        Brand msi = createBrandIfMissing("MSI");
        Brand gigabyte = createBrandIfMissing("Gigabyte");
        Brand corsair = createBrandIfMissing("Corsair");
        Brand nvidia = createBrandIfMissing("NVIDIA");
        Brand gskill = createBrandIfMissing("G.Skill");
        Brand samsung = createBrandIfMissing("Samsung");
        Brand nzxt = createBrandIfMissing("NZXT");
        Brand evga = createBrandIfMissing("EVGA");
        Brand noctua = createBrandIfMissing("Noctua");
        Brand seagate = createBrandIfMissing("Seagate");
        Brand westernDigital = createBrandIfMissing("Western Digital");
        Brand phanteks = createBrandIfMissing("Phanteks");
        Brand teamgroup = createBrandIfMissing("TeamGroup");
        Brand thermaltake = createBrandIfMissing("Thermaltake");
        Brand acer = createBrandIfMissing("Acer");
        Brand logitech = createBrandIfMissing("Logitech");
        Brand razer = createBrandIfMissing("Razer");
        Brand secretlab = createBrandIfMissing("Secretlab");
        Brand akracing = createBrandIfMissing("AKRacing");

        if (productRepository.count() > 0) {
            logger.debug("Product catalog already exists. Skipping product seeding.");
            return;
        }

        List<Product> products = new ArrayList<>();

        products.add(createProduct(processors, amd, "AMD Ryzen 7 7800X3D", "High-end gaming CPU with 3D V-Cache, 8 cores and 16 threads.", BigDecimal.valueOf(3399.00), 25, "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500", List.of(
                createSpec("socket", "AM5"),
                createSpec("tdp", "120W"),
                createSpec("cores", "8"),
                createSpec("threads", "16"),
                createSpec("graphics_integrated", "yes")
        )));

        products.add(createProduct(processors, intel, "Intel Core i9-14900K", "Flagship 24-core processor, up to 6.0 GHz, LGA1700 socket.", BigDecimal.valueOf(3529.00), 15, "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500", List.of(
                createSpec("socket", "LGA1700"),
                createSpec("tdp", "125W"),
                createSpec("cores", "24"),
                createSpec("threads", "32"),
                createSpec("graphics_integrated", "yes")
        )));

        products.add(createProduct(processors, amd, "AMD Ryzen 5 7600X", "Excellent value AM5 6-core processor, speeds up to 5.3GHz.", BigDecimal.valueOf(1199.00), 40, "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500", List.of(
                createSpec("socket", "AM5"),
                createSpec("tdp", "105W"),
                createSpec("cores", "6"),
                createSpec("threads", "12"),
                createSpec("graphics_integrated", "yes")
        )));

        products.add(createProduct(motherboards, asus, "ASUS ROG STRIX B650-A GAMING WIFI", "AM5 socket B650 motherboard, DDR5, ATX, PCIe 5.0, WiFi 6E.", BigDecimal.valueOf(2229.00), 18, "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500", List.of(
                createSpec("socket", "AM5"),
                createSpec("ram_type", "DDR5"),
                createSpec("form_factor", "ATX"),
                createSpec("m2_slots", "3")
        )));

        products.add(createProduct(motherboards, msi, "MSI MPG Z790 CARBON WIFI", "LGA1700 socket Z790 motherboard, DDR5, ATX, PCIe 5.0, WiFi 6E.", BigDecimal.valueOf(3649.00), 12, "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500", List.of(
                createSpec("socket", "LGA1700"),
                createSpec("ram_type", "DDR5"),
                createSpec("form_factor", "ATX"),
                createSpec("m2_slots", "5")
        )));

        products.add(createProduct(motherboards, gigabyte, "Gigabyte Z790 AORUS ELITE AX", "LGA1700 ATX motherboard with DDR5 support, PCIe 5.0, and WiFi 6E.", BigDecimal.valueOf(2559.00), 14, "https://images.unsplash.com/photo-1563074933-6e2af7826562?w=500", List.of(
                createSpec("socket", "LGA1700"),
                createSpec("ram_type", "DDR5"),
                createSpec("form_factor", "ATX"),
                createSpec("m2_slots", "4")
        )));

        products.add(createProduct(gpu, asus, "ASUS ROG Strix RTX 4080 Super", "NVIDIA GeForce RTX 4080 Super 16GB GDDR6X, extreme cooling performance.", BigDecimal.valueOf(10999.00), 10, "https://images.unsplash.com/photo-1591489376419-408f4b01f57e?w=500", List.of(
                createSpec("tdp", "320W"),
                createSpec("length", "357mm"),
                createSpec("vram", "16GB"),
                createSpec("power_connectors", "16-pin")
        )));

        products.add(createProduct(gpu, nvidia, "NVIDIA GeForce RTX 4070 Ti", "Efficient high-end GPU with 12GB GDDR6X memory for 1440p gaming.", BigDecimal.valueOf(7999.00), 12, "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500", List.of(
                createSpec("tdp", "285W"),
                createSpec("vram", "12GB"),
                createSpec("length", "304mm"),
                createSpec("power_connectors", "16-pin")
        )));

        products.add(createProduct(storage, samsung, "Samsung 990 Pro 2TB NVMe SSD", "PCIe Gen4 M.2 SSD, speeds up to 7450 MB/s.", BigDecimal.valueOf(1699.00), 45, "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500", List.of(
                createSpec("interface", "PCIe Gen4 NVMe"),
                createSpec("read_speed", "7450 MB/s")
        )));

        products.add(createProduct(cases, nzxt, "NZXT H9 Flow White", "Dual-chamber ATX mid-tower chassis, high airflow layout.", BigDecimal.valueOf(1599.00), 15, "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500", List.of(
                createSpec("supported_form_factors", "ATX,Micro-ATX,Mini-ITX"),
                createSpec("max_gpu_length", "435mm"),
                createSpec("max_cooler_height", "165mm")
        )));

        products.add(createProduct(ram, gskill, "G.Skill Trident Z5 RGB 32GB DDR5-6000", "High-performance DDR5 memory kit with RGB lighting for premium gaming rigs.", BigDecimal.valueOf(1799.00), 30, "https://images.unsplash.com/photo-1611562584833-32f2477e13ef?w=500", List.of(
                createSpec("capacity", "32GB"),
                createSpec("type", "DDR5"),
                createSpec("speed", "6000MT/s"),
                createSpec("modules", "2x16GB"),
                createSpec("rgb", "yes")
        )));

        products.add(createProduct(psu, corsair, "Corsair RM850x 850W 80+ Gold", "Reliable fully modular power supply with low-noise operation and premium capacitors.", BigDecimal.valueOf(1399.00), 20, "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500", List.of(
                createSpec("wattage", "850W"),
                createSpec("efficiency", "80+ Gold"),
                createSpec("modular", "fully modular"),
                createSpec("fan", "135mm")
        )));

        products.add(createProduct(psu, evga, "EVGA SuperNOVA 850 G6", "Fully modular 850W 80+ Gold power supply engineered for quiet cooling and stable performance.", BigDecimal.valueOf(1499.00), 18, "https://images.unsplash.com/photo-1541807084-5c52e6c013a5?w=500", List.of(
                createSpec("wattage", "850W"),
                createSpec("efficiency", "80+ Gold"),
                createSpec("modular", "fully modular"),
                createSpec("fan", "135mm")
        )));

        products.add(createProduct(coolers, nzxt, "NZXT Kraken X63 280mm AIO", "High-performance liquid cooler with RGB pump and two Aer P fans.", BigDecimal.valueOf(1499.00), 22, "https://images.unsplash.com/photo-1573164574392-3e6b1f517b18?w=500", List.of(
                createSpec("radiator_size", "280mm"),
                createSpec("fan_count", "2"),
                createSpec("pump_type", "AIO"),
                createSpec("rgb", "yes"),
                createSpec("supported_sockets", "AM5,LGA1700,AM4,LGA1200")
        )));

        products.add(createProduct(coolers, noctua, "Noctua NH-D15 chromax.black", "Premium dual-tower air cooler with excellent noise-to-performance ratio.", BigDecimal.valueOf(1099.00), 28, "https://images.unsplash.com/photo-1586880244408-202d367c8ed1?w=500", List.of(
                createSpec("type", "Air Cooler"),
                createSpec("fan_count", "2"),
                createSpec("max_tdp", "220W"),
                createSpec("noise_level", "19.2 dBA"),
                createSpec("supported_sockets", "AM5,LGA1700,AM4,LGA1200")
        )));

        products.add(createProduct(storage, seagate, "Seagate FireCuda 530 2TB", "High-performance NVMe SSD optimized for gaming with 7300 MB/s read speeds.", BigDecimal.valueOf(1499.00), 30, "https://images.unsplash.com/photo-1555617117-08a7193fb0a9?w=500", List.of(
                createSpec("interface", "PCIe Gen4 NVMe"),
                createSpec("capacity", "2TB"),
                createSpec("write_speed", "6900 MB/s")
        )));

        products.add(createProduct(storage, westernDigital, "WD Black SN770 1TB", "Value-driven PCIe Gen4 NVMe SSD with fast sequential performance for gaming and content creation.", BigDecimal.valueOf(9999.00), 60, "https://images.unsplash.com/photo-1527430253228-e93688616381?w=500", List.of(
                createSpec("interface", "PCIe Gen4 NVMe"),
                createSpec("capacity", "1TB"),
                createSpec("read_speed", "5150 MB/s")
        )));

        products.add(createProduct(cases, phanteks, "Phanteks Eclipse P500A", "High-airflow ATX mid-tower with three D-RGB fans and tempered glass panel.", BigDecimal.valueOf(1599.00), 20, "https://images.unsplash.com/photo-1611078488565-df15c1f20e87?w=500", List.of(
                createSpec("supported_form_factors", "ATX,Micro-ATX,Mini-ITX"),
                createSpec("front_panel", "Mesh"),
                createSpec("preinstalled_fans", "3"),
                createSpec("psu_shroud", "yes")
        )));

        products.add(createProduct(cases, thermaltake, "Thermaltake S500 TG ARGB", "Mid-tower chassis with ARGB lighting and three front fans for great airflow.", BigDecimal.valueOf(1399.00), 18, "https://images.unsplash.com/photo-1510456357480-bcc8abc9f9c2?w=500", List.of(
                createSpec("supported_form_factors", "ATX,Micro-ATX,Mini-ITX"),
                createSpec("rgb", "yes"),
                createSpec("glass_panel", "tempered glass")
        )));

        products.add(createProduct(ram, teamgroup, "TeamGroup T-Force Delta RGB 32GB DDR5-6400", "Fast DDR5 memory with stylish RGB lighting and excellent compatibility.", BigDecimal.valueOf(1899.00), 26, "https://images.unsplash.com/photo-1581291519195-ef11498d1cf9?w=500", List.of(
                createSpec("capacity", "32GB"),
                createSpec("speed", "6400MT/s"),
                createSpec("type", "DDR5"),
                createSpec("rgb", "yes")
        )));

        products.add(createProduct(gpu, nvidia, "NVIDIA GeForce RTX 4060 Ti", "Solid 1080p/1440p GPU with 8GB GDDR6 memory and excellent power efficiency.", BigDecimal.valueOf(3999.00), 22, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500", List.of(
                createSpec("tdp", "160W"),
                createSpec("vram", "8GB"),
                createSpec("length", "240mm"),
                createSpec("power_connectors", "8-pin")
        )));

        products.add(createProduct(monitors, acer, "Acer Predator XB273K", "27-inch 4K UHD gaming monitor with 144Hz refresh rate and NVIDIA G-SYNC.", BigDecimal.valueOf(7999.00), 14, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", List.of(
                createSpec("size", "27-inch"),
                createSpec("resolution", "3840x2160"),
                createSpec("refresh_rate", "144Hz"),
                createSpec("panel_type", "IPS")
        )));

        products.add(createProduct(monitors, samsung, "Samsung Odyssey G7 32-inch", "QHD curved gaming display with 240Hz refresh rate and 1000R curvature.", BigDecimal.valueOf(6499.00), 16, "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500", List.of(
                createSpec("size", "32-inch"),
                createSpec("resolution", "2560x1440"),
                createSpec("refresh_rate", "240Hz"),
                createSpec("curvature", "1000R")
        )));

        products.add(createProduct(keyboards, logitech, "Logitech G915 TKL", "Low-profile wireless mechanical keyboard with LIGHTSYNC RGB and GL tactile switches.", BigDecimal.valueOf(2299.00), 20, "https://images.unsplash.com/photo-1517351955793-638f1cc8ba1c?w=500", List.of(
                createSpec("switch_type", "GL Tactile"),
                createSpec("layout", "Tenkeyless"),
                createSpec("connectivity", "Wireless/Bluetooth/USB"),
                createSpec("rgb", "yes")
        )));

        products.add(createProduct(keyboards, razer, "Razer Huntsman V2 Analog", "Optical analog mechanical keyboard with customizable actuation and Chroma RGB.", BigDecimal.valueOf(2499.00), 18, "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=500", List.of(
                createSpec("switch_type", "Optical"),
                createSpec("layout", "Full-size"),
                createSpec("key_rollover", "N-key"),
                createSpec("rgb", "yes")
        )));

        products.add(createProduct(chairs, secretlab, "Secretlab TITAN Evo 2022", "Premium ergonomic gaming chair with integrated lumbar support and adjustable memory foam head pillow.", BigDecimal.valueOf(4499.00), 12, "https://images.unsplash.com/photo-1562131366-f26f0db2dbad?w=500", List.of(
                createSpec("material", "SoftWeave fabric"),
                createSpec("adjustability", "4D armrests, recline, tilt"),
                createSpec("max_weight", "130kg"),
                createSpec("seat_height", "48-58cm")
        )));

        products.add(createProduct(chairs, akracing, "AKRacing Master Series Pro", "Leather gaming chair built for extended comfort and customizable support.", BigDecimal.valueOf(3999.00), 10, "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500", List.of(
                createSpec("material", "PU leather"),
                createSpec("adjustability", "4D armrests, recline, footrest"),
                createSpec("max_weight", "150kg"),
                createSpec("seat_width", "54cm")
        )));

        productRepository.saveAll(products);
        logger.info("Seeded default product catalog with {} items.", products.size());
    }

    private Category createCategoryIfMissing(String name, String description) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> categoryRepository.save(
                        Objects.requireNonNull(Category.builder()
                                .name(name)
                                .description(description)
                                .build(), "Category builder returned null")
                ));
    }

    private Brand createBrandIfMissing(String brandName) {
        return brandRepository.findByBrandName(brandName)
                .orElseGet(() -> brandRepository.save(
                        Objects.requireNonNull(Brand.builder()
                                .brandName(brandName)
                                .build(), "Brand builder returned null")
                ));
    }

    private Product createProduct(Category category,
                                  Brand brand,
                                  String name,
                                  String description,
                                  BigDecimal price,
                                  int stockQuantity,
                                  String imageUrl,
                                  List<ProductSpecification> specifications) {
        Product product = Product.builder()
                .category(category)
                .brand(brand)
                .name(name)
                .description(description)
                .price(price)
                .stockQuantity(stockQuantity)
                .imageUrl(imageUrl)
                .build();

        specifications.forEach(spec -> spec.setProduct(product));
        product.setSpecifications(specifications);
        return product;
    }

    private ProductSpecification createSpec(String name, String value) {
        return ProductSpecification.builder()
                .specificationName(name)
                .specificationValue(value)
                .build();
    }
}
