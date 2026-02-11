package com.badnetwork.trafficscrambler;

import com.badnetwork.trafficscrambler.config.ScramblerProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableConfigurationProperties(ScramblerProperties.class)
@EnableKafka
public class TrafficScramblerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrafficScramblerApplication.class, args);
    }
}
