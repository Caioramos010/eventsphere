package com.eventsphere.config;

import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@Configuration
public class TimeZoneConfig {

    @PostConstruct
    public void init() {
        // Define o timezone padrão da aplicação como São Paulo (UTC-3)
        TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
    }
}
