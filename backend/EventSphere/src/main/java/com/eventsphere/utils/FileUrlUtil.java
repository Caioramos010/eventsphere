package com.eventsphere.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Component
public class FileUrlUtil {

    @Value("${file.base-url:}")
    private String fileBaseUrl;
    
    public String getFileUrl(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return null;
        }
        
        if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
            return fileName;
        }
        
        if (fileBaseUrl != null && !fileBaseUrl.isEmpty()) {
            return fileBaseUrl + "/" + fileName;
        }
        
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/")
                .path(fileName)
                .toUriString();
    }
}
