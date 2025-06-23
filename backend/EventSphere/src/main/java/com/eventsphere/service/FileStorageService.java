package com.eventsphere.service;

import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Serviço responsável pelo armazenamento e gerenciamento de arquivos no sistema
 */
@Service
public class FileStorageService {
    private Path fileStorageLocation;
    private UserRepository userRepository;
    private EventRepository eventRepository;
    private EventService eventService;

    /**
     * Inicializa o serviço de armazenamento de arquivos
     * 
     * @param uploadDir Diretório de upload configurado na aplicação
     */
    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir, UserRepository userRepository, EventRepository eventRepository, EventService eventService) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.eventService = eventService;
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Não foi possível criar o diretório de upload", ex);
        }
    }

    /**
     * Armazena um arquivo carregado em uma localização acessível ao aplicativo
     * 
     * @param file O arquivo MultipartFile a ser armazenado
     * @return Nome do arquivo gerado
     * @throws RuntimeException Se ocorrer um erro ao armazenar o arquivo
     */
    public String storeFile(MultipartFile file) {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Erro ao armazenar arquivo", ex);
        }
    }

    /**
     * Verifica se um arquivo existe
     * 
     * @param fileName Nome do arquivo a verificar
     * @return true se o arquivo existir, false caso contrário
     */
    public boolean fileExists(String fileName) {
        return Files.exists(this.fileStorageLocation.resolve(fileName));
    }

    /**
     * Exclui um arquivo do sistema de arquivos
     * 
     * @param fileName Nome do arquivo a ser excluído
     * @throws RuntimeException Se ocorrer um erro ao excluir o arquivo
     */
    public void deleteFile(String fileName) {
        try {
            Files.deleteIfExists(this.fileStorageLocation.resolve(fileName));
        } catch (IOException ex) {
            throw new RuntimeException("Erro ao excluir arquivo", ex);
        }
    }

    /**
     * Armazena uma foto de perfil de usuário, lidando com validações e 
     * remoção da foto antiga, se necessário
     * 
     * @param file Arquivo de imagem
     * @param user Usuário para o qual a foto está sendo armazenada
     * @return Nome do arquivo armazenado
     * @throws RuntimeException Se houver problemas com o arquivo
     */
    public String storeUserPhoto(MultipartFile file, User user) {
        String fileName = storeFile(file);
        user.setPhoto(fileName);
        userRepository.save(user);
        return fileName;
    }

    /**
     * Armazena uma imagem de evento, realizando validações e verificações de permissão
     * 
     * @param file Arquivo de imagem
     * @param eventId ID do evento
     * @param userId ID do usuário que está enviando a imagem
     * @return Nome do arquivo armazenado
     * @throws RuntimeException Se houver problemas com o arquivo
     * @throws SecurityException Se o usuário não tiver permissão para modificar o evento
     */
    public String storeEventImage(MultipartFile file, Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        eventService.checkPermission(eventId, userId);
        String fileName = storeFile(file);
        event.setPhoto(fileName);
        eventRepository.save(event);
        return fileName;
    }

    /**
     * Carrega um arquivo como um recurso, permitindo o download via controller
     * 
     * @param fileName Nome do arquivo a ser carregado
     * @return O recurso do arquivo
     * @throws RuntimeException Se o arquivo não for encontrado
     */
    public org.springframework.core.io.Resource loadFileAsResource(String fileName) {
        try {
            java.nio.file.Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("Arquivo não encontrado: " + fileName);
            }
        } catch (Exception ex) {
            throw new RuntimeException("Arquivo não encontrado: " + fileName, ex);
        }
    }
}
