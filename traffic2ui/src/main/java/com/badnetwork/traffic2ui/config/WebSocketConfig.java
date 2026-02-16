package com.badnetwork.traffic2ui.config;

import com.badnetwork.traffic2ui.handler.TrafficWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final TrafficWebSocketHandler trafficWebSocketHandler;
    private final Traffic2UIProperties properties;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(trafficWebSocketHandler, properties.getWebsocket().getEndpoint())
                .setAllowedOrigins("*");
    }
}
