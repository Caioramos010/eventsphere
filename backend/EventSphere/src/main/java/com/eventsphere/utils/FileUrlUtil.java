package com.eventsphere.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Classe utilitária para manipulação de URLs de arquivos
 */
@Component
public class FileUrlUtil {

    @Value("${file.base-url:}")
    private String fileBaseUrl;
    
    /**
     * Gera uma URL para um arquivo armazenado
     *
     * @param fileName Nome do arquivo
     * @return URL completa para o arquivo
     */
    public String getFileUrl(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return null;
        }
        
        // Se já for uma URL completa, retorna como está
        if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
            return fileName;
        }
        
        // Se fileBaseUrl estiver configurado, usa-o como base
        if (fileBaseUrl != null && !fileBaseUrl.isEmpty()) {
            return fileBaseUrl + "/" + fileName;
        }
        
        // Caso contrário, constrói a URL a partir do contexto atual
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/")
                .path(fileName)
                .toUriString();
    }
}
