# Build stage
FROM maven:3.9-openjdk-25 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Production stage
FROM openjdk:25-slim

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /app/target/ecommerce-ai-*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD java -cp app.jar -Dloader.main=com.hardware.ecommerce.Application org.springframework.boot.loader.JarLauncher --actuator.endpoints.health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
