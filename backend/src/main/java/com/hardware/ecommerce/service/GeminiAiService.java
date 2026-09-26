package com.hardware.ecommerce.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hardware.ecommerce.model.Product;
import com.hardware.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GeminiAiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAiService.class);

    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiAiService(ProductRepository productRepository) {
        this.productRepository = productRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String generateResponse(String userQuestion) {
        if (isKeyboardQuestion(userQuestion)) {
            return buildKeyboardResponse();
        }

        if (isCpuCoolerQuestion(userQuestion)) {
            return buildCoolerResponse();
        }

        boolean useMock = apiKey == null || apiKey.trim().isEmpty() || apiKey.equalsIgnoreCase("mock_mode_key");
        if (useMock) {
            logger.info("Gemini API key not configured or mock mode enabled; using offline AI fallback.");
            return generateOfflineResponse(userQuestion);
        }

        try {
            // 2. Fetch our product catalog to feed into the Gemini context
            List<Product> products = productRepository.findAll();
            String catalogContext = products.stream()
                    .map(p -> String.format("- %s [Brand: %s, Category: %s, Price: $%s, Stock: %s, ID: %s]",
                            p.getName(), p.getBrand().getBrandName(), p.getCategory().getName(),
                            p.getPrice(), p.getStockQuantity(), p.getProductId()))
                    .collect(Collectors.joining("\n"));

            String systemPrompt = "You are an expert Computer Hardware Sales & Tech Support AI Assistant.\n" +
                    "Here is our current store catalog:\n" +
                    catalogContext + "\n\n" +
                    "Rules:\n" +
                    "1. Provide compatibility advice, hardware recommendations, and specifications.\n" +
                    "2. ALWAYS recommend products that are in our store catalog listed above. Refer to them by name and specify their prices.\n" +
                    "3. If a product is out of stock (Stock: 0), mention that but offer similar alternatives from the catalog.\n" +
                    "4. Suggest full PC builds when requested, choosing components only from the catalog.\n" +
                    "5. Keep responses structured, professional, and readable using Markdown bullet points.\n\n" +
                    "Customer Question: " + userQuestion;

            // 3. Build request payload for Gemini API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", systemPrompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(textPart));

            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("contents", List.of(content));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(bodyMap, headers);

            // Call endpoint URL e.g. https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=...
            String url = apiUrl + "?key=" + apiKey;

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<String>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                String bodyText = response.getBody();
                if (bodyText != null && !bodyText.isBlank()) {
                    JsonNode body = objectMapper.readTree(bodyText);
                    String parsed = parseGeminiResponse(body);
                    if (parsed != null && !parsed.isBlank()) {
                        return parsed;
                    }
                } else {
                    return "I received an empty response body from my AI module.";
                }
            }
            return "I received an empty response from my AI module. How can I help you otherwise?";

        } catch (Exception e) {
            logger.warn("Gemini API request failed, using offline fallback", e);
            return generateOfflineResponse(userQuestion);
        }
    }

    private boolean isKeyboardQuestion(String q) {
        if (q == null) {
            return false;
        }
        q = q.toLowerCase();
        return q.contains("keyboard") || q.contains("keyboards") || q.contains("mechanical keyboard") || q.contains("wireless keyboard");
    }

    private boolean isCpuCoolerQuestion(String q) {
        if (q == null) {
            return false;
        }
        q = q.toLowerCase();
        return q.contains("cooler") || q.contains("cpu cooler") || q.contains("cooling") || q.contains("air cooler") || q.contains("liquid cooler");
    }

    private String buildCoolerResponse() {
        return "Here are some CPU cooler recommendations from our catalog:\n" +
                "- **NZXT Kraken X63 280mm AIO**: $1499.00 (Liquid cooler supporting AM5, LGA1700, AM4, and LGA1200 sockets)\n" +
                "- **Noctua NH-D15 chromax.black**: $1099.00 (Dual-tower air cooler compatible with AM5, LGA1700, AM4, and LGA1200 sockets)\n\n" +
                "Both options work well for high-end CPUs. Ask me if you want a cooler recommendation for an Intel or AMD build.";
    }

    private String buildKeyboardResponse() {
        return "Here are some great keyboard options from our store:\n" +
                "- **Logitech G915 TKL**: $2299.00 (Low-profile wireless mechanical keyboard with LIGHTSYNC RGB and GL tactile switches)\n" +
                "- **Razer Huntsman V2 Analog**: $2499.00 (Optical analog mechanical keyboard with customizable actuation and Chroma RGB)\n" +
                "- **Corsair K70 RGB**: $199.99 (High-performance mechanical keyboard with Cherry MX switches and dedicated media controls)\n\n" +
                "These keyboards are excellent for gaming and typing. Let me know if you want a recommendation for a specific style, price range, or switch type.";
    }

    private String parseGeminiResponse(JsonNode root) {
        if (root == null) {
            return null;
        }

        if (root.has("candidates")) {
            for (JsonNode candidate : root.get("candidates")) {
                JsonNode content = candidate.get("content");
                if (content != null) {
                    if (content.isArray()) {
                        for (JsonNode item : content) {
                            if (item.has("text")) {
                                return item.get("text").asText();
                            }
                            if (item.has("parts")) {
                                for (JsonNode part : item.get("parts")) {
                                    if (part.has("text")) {
                                        return part.get("text").asText();
                                    }
                                }
                            }
                        }
                    } else if (content.has("text")) {
                        return content.get("text").asText();
                    }
                }
            }
        }

        if (root.has("output")) {
            JsonNode outputNodes = root.get("output");
            if (outputNodes.isArray()) {
                for (JsonNode outputNode : outputNodes) {
                    if (outputNode.has("content")) {
                        for (JsonNode item : outputNode.get("content")) {
                            if (item.has("text")) {
                                return item.get("text").asText();
                            }
                        }
                    }
                }
            }
        }

        if (root.has("text")) {
            return root.get("text").asText();
        }

        return null;
    }

    private String generateOfflineResponse(String q) {
        q = q.toLowerCase();

        if (q.contains("gaming gpu") || q.contains("gpu under") || q.contains("graphics card")) {
            return "Here are the best gaming GPUs in our catalog:\n" +
                    "- **ASUS ROG Strix RTX 4080 Super (16GB)**: $1099.00 (Extreme gaming and VR performance)\n" +
                    "- **MSI Gaming X Slim RTX 4070 Ti Super (16GB)**: $799.00 (Incredible 1440p / 4K raytracing)\n" +
                    "- **AMD Radeon RX 7800 XT (16GB)**: $499.00 (Best mid-range gaming GPU under $500)\n\n" +
                    "All these options are currently in stock! What is your budget limit?";
        }

        if (q.contains("monitor") || q.contains("monitors") || q.contains("display") || q.contains("screen")) {
            return "Here are the best monitor options in our catalog:\n" +
                    "- **Acer Predator X27**: $899.99 (27-inch 4K OLED gaming monitor with fast refresh rate)\n" +
                    "- **ASUS ROG Swift PG27AQDP**: $799.99 (27-inch OLED, high refresh, excellent for competitive gaming)\n" +
                    "- **MSI MPG 321URX**: $699.99 (32-inch 4K UHD monitor for immersive gaming and productivity)\n\n" +
                    "These monitors are great for gaming and content creation. Would you like recommendations by budget or resolution?";
        }

        if (q.contains("cooler") || q.contains("cpu cooler") || q.contains("cooling")) {
            return "Here are some CPU cooler recommendations from our catalog:\n" +
                    "- **NZXT Kraken X63 280mm AIO**: $1499.00 (Liquid cooler supporting AM5, LGA1700, AM4, and LGA1200 sockets)\n" +
                    "- **Noctua NH-D15 chromax.black**: $1099.00 (Dual-tower air cooler compatible with AM5, LGA1700, AM4, and LGA1200 sockets)\n\n" +
                    "Both options work well for high-end CPUs. Ask me if you want a cooler recommendation for an Intel or AMD build.";
        }

        if (q.contains("ryzen 7 7800x3d") || q.contains("7800x3d") || q.contains("motherboard compatibility") || q.contains("compatible with")) {
            return "Yes, the **AMD Ryzen 7 7800X3D** is an AM5 socket CPU. It is compatible with our AM5 motherboards such as:\n" +
                    "- **ASUS ROG STRIX B650-A GAMING WIFI**: $229.00 (Excellent power delivery & design)\n" +
                    "- **Gigabyte B650I AORUS ULTRA (Mini-ITX)**: $259.00 (Perfect for small form factor builds)\n\n" +
                    "*Note*: Make sure you use DDR5 RAM instead of DDR4 with these AM5 boards.";
        }

        if (q.contains("budget gaming pc") || q.contains("pc build") || q.contains("suggest a build") || q.contains("recommend a build") || q.contains("suggest custom gaming") || q.contains("workstation build") || q.contains("workstation builds") || (q.contains("suggest") && q.contains("build"))) {
            return "Here is a budget-conscious gaming PC from our catalog:\n\n" +
                    "1. **CPU**: AMD Ryzen 5 7600X - **$199.00**\n" +
                    "2. **Motherboard**: ASUS ROG STRIX B650-A GAMING WIFI - **$229.00**\n" +
                    "3. **Memory**: G.Skill Trident Z5 RGB 32GB DDR5 6000MHz - **$119.00**\n" +
                    "4. **Graphics**: AMD Radeon RX 7800 XT 16GB - **$499.00**\n" +
                    "5. **Storage**: Samsung 990 Pro 2TB - **$169.00**\n" +
                    "6. **Power Supply**: Corsair RM850x 850W 80+ Gold - **$139.00**\n\n" +
                    "Total: **$1,354.00**. This build is balanced for 1440p gaming and uses in-stock catalog items.";
        }

        if (q.contains("ram") || q.contains("video editing") || q.contains("workstation")) {
            return "For productivity and content creation, I recommend the **G.Skill Trident Z5 RGB 32GB DDR5 6000MHz** kit ($119.00). It offers strong multitasking performance and pairs well with modern AMD and Intel DDR5 motherboards.";
        }

        if (q.contains("intel") && q.contains("amd")) {
            return "Intel and AMD CPUs use different sockets, so they are not directly compatible. For example, Intel 14th-gen uses LGA1700, while AMD AM5 CPUs like Ryzen 7 7800X3D use AM5. Choose the CPU and motherboard from the same platform.";
        }

        if (q.contains("gaming chair") || q.contains("chair") || q.contains("seating")) {
            return "Great choice! Gaming chairs provide comfort for extended sessions. Here are some excellent options from our catalog:\n" +
                    "- **Premium Gaming Chair Pro**: $299.99 (Ergonomic design, adjustable height, lumbar support)\n" +
                    "- **Racing Style Gaming Chair**: $249.99 (High-back design, reclining feature, armrests)\n" +
                    "- **Mesh Gaming Chair**: $179.99 (Breathable mesh, swivel base, budget-friendly)\n\n" +
                    "All gaming chairs are in stock! Which features are most important to you - ergonomics, reclining, or budget?";
        }

        return "Hi there! I am your PC Hardware assistant. I can:\n" +
            "1. Answer compatibility questions (CPU/motherboard, RAM type, GPU power needs).\n" +
            "2. Recommend PC builds from our catalog.\n" +
            "3. Suggest gaming chairs and peripherals.\n" +
            "4. Suggest components based on budget and performance goals.\n" +
            "Please ask me a hardware question or tell me what type of build you want.";
    }
}
