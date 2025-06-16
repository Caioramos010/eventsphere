package com.eventsphere.config;

import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import jakarta.servlet.MultipartConfigElement;

/**
 * Configuração para suporte a upload de arquivos multipart
 */
@Configuration
public class MultipartConfig {

    /**
     * Configura o MultipartResolver para lidar com requisições de upload de arquivos
     *
     * @return MultipartResolver configurado
     */
    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }
    
    /**
     * Configura os limites e propriedades para uploads multipart
     *
     * @return MultipartConfigElement configurado
     */
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        
        // Configura o tamanho máximo do arquivo (10MB)
        factory.setMaxFileSize(DataSize.ofMegabytes(10));
        
        // Configura o tamanho máximo da requisição (10MB)
        factory.setMaxRequestSize(DataSize.ofMegabytes(10));
        
        return factory.createMultipartConfig();
    }
}
