# Build stage (Maven + JDK 21)
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/traffic-encoder-*.jar app.jar

# Override with env in Docker: SPRING_KAFKA_BOOTSTRAP_SERVERS, ENCODER_* etc.
ENTRYPOINT ["java", "-jar", "app.jar"]
