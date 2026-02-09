# Traffic Simulator

Spring Boot app that simulates moving entities (circle or diamond paths) and publishes their coordinates to Kafka as JSON.

## Run with Docker Compose

Starts Kafka (Bitnami, KRaft) and the traffic-sim app. The app waits for Kafka to be healthy before starting.

```bash
docker compose up --build
```

- **Kafka**: `localhost:9092`
- **Topic**: `traffic-events` (auto-created on first produce)
- **Payload**: `{"id":"<instanceId>-<index>","lat":...,"long":...,"timestamp":...}`

Override via env (e.g. in `docker-compose.yml`): `TRAFFIC_ENTITY_COUNT`, `TRAFFIC_PUBLISH_INTERVAL_MS`, `TRAFFIC_PATH_SHAPE` (circle/diamond), `SPRING_KAFKA_BOOTSTRAP_SERVERS`.

## Consume events (optional)

```bash
docker compose exec kafka kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic traffic-events --from-beginning
```

## Build and run locally

Requires Java 25 and Kafka on `localhost:9092`.

```bash
mvn spring-boot:run
```

Or build the JAR and run:

```bash
mvn package -DskipTests
java -jar target/traffic-sim-0.0.1-SNAPSHOT.jar
```
