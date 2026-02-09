package com.badnetwork.trafficsim;

import com.badnetwork.trafficsim.config.TrafficProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(TrafficProperties.class)
public class TrafficSimulatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrafficSimulatorApplication.class, args);
    }
}
