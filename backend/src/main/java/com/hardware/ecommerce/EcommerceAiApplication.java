package com.hardware.ecommerce;

import com.hardware.ecommerce.config.GeminiProperties;
import com.hardware.ecommerce.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, GeminiProperties.class})
public class EcommerceAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(EcommerceAiApplication.class, args);
    }
}
