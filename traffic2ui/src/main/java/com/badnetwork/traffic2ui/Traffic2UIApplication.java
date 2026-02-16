package com.badnetwork.traffic2ui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class Traffic2UIApplication {

    public static void main(String[] args) {
        SpringApplication.run(Traffic2UIApplication.class, args);
    }
}
