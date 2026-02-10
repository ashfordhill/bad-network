package com.badnetwork.trafficencoder;

import com.badnetwork.trafficencoder.config.EncoderProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableConfigurationProperties(EncoderProperties.class)
@EnableKafka
public class TrafficEncoderApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrafficEncoderApplication.class, args);
    }
}
