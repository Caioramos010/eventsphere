package com.eventsphere.service;

import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.user.User;
import com.eventsphere.exception.FileException;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.utils.FileUrlUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Serviço responsável pelo armazenamento e gerenciamento de arquivos no sistema
 */
@Service
public class FileStorageService {
    private static final Logger logger = Logger.getLogger(FileStorageService.class.getName());
      private final Path fileStorageLocation;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private EventService eventService;/**
     * Inicializa o serviço de armazenamento de arquivos
     * 
     * @param uploadDir Diretório de upload configurado na aplicação
     */
    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();

        try {
            logger.info("Inicializando diretório de armazenamento: " + this.fileStorageLocation);
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileException("Não foi possível criar o diretório para armazenar os arquivos: " + uploadDir, ex);
        }
    }    /**
     * Armazena um arquivo carregado em uma localização acessível ao aplicativo
     * 
     * @param file O arquivo MultipartFile a ser armazenado
     * @return Nome do arquivo gerado
     * @throws FileException Se ocorrer um erro ao armazenar o arquivo
     */
    public String storeFile(MultipartFile file) {
        try {
            if (file == null) {
                throw new FileException("O arquivo não pode ser nulo");
            }
            
            // Normaliza o nome do arquivo
            String originalFileName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown");
                
            // Verifica se o nome do arquivo contém caracteres inválidos
            if (originalFileName.contains("..")) {
                throw new FileException("Nome do arquivo contém sequência de caminho inválida: " + originalFileName);
            }
            
            // Verifica se o arquivo está vazio
            if (file.isEmpty()) {
                throw new FileException("Não foi possível armazenar um arquivo vazio: " + originalFileName);
            }
    
            // Gera um nome de arquivo único para evitar conflitos
            String fileExtension = originalFileName.lastIndexOf(".") > 0 ? 
                    originalFileName.substring(originalFileName.lastIndexOf(".")) : ".bin";
            String fileName = UUID.randomUUID().toString() + fileExtension;
            
            // Copia o arquivo para o local de destino
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            logger.info("Arquivo armazenado com sucesso: " + fileName);
            return fileName;
        } catch (IOException ex) {
            throw new FileException("Falha ao armazenar o arquivo: " + (file != null ? file.getOriginalFilename() : "null"), ex);
        }
    }    /**
     * Carrega um arquivo como recurso para ser enviado ao cliente
     * 
     * @param fileName Nome do arquivo a ser carregado
     * @return Resource representando o arquivo
     * @throws FileException Se o arquivo não for encontrado ou não puder ser lido
     */
    public Resource loadFileAsResource(String fileName) {
        try {
            if (fileName == null || fileName.isEmpty()) {
                throw new FileException("Nome do arquivo não pode ser vazio");
            }
            
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if(resource.exists() && resource.isReadable()) {
                logger.info("Arquivo carregado com sucesso: " + fileName);
                return resource;
            } else {
                logger.warning("Arquivo não encontrado ou não pode ser lido: " + fileName);
                throw new FileException("Arquivo não encontrado ou não pode ser lido: " + fileName);
            }
        } catch (MalformedURLException ex) {
            logger.log(Level.SEVERE, "Erro ao carregar arquivo: " + fileName, ex);
            throw new FileException("Erro ao carregar arquivo: " + fileName, ex);
        }
    }
      /**
     * Exclui um arquivo do sistema de arquivos
     * 
     * @param fileName Nome do arquivo a ser excluído
     * @throws FileException Se ocorrer um erro ao excluir o arquivo
     */
    public void deleteFile(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            logger.info("Tentativa de excluir arquivo com nome vazio ou nulo");
            return;
        }
        
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            
            // Verifica se o arquivo existe antes de tentar excluir
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("Arquivo excluído com sucesso: " + fileName);
            } else {
                logger.warning("Arquivo não encontrado para exclusão: " + fileName);
            }
        } catch (IOException ex) {
            logger.log(Level.SEVERE, "Erro ao excluir arquivo: " + fileName, ex);
            throw new FileException("Não foi possível excluir o arquivo: " + fileName, ex);
        }
    }
    
    /**
     * Verifica se um arquivo existe
     * 
     * @param fileName Nome do arquivo a verificar
     * @return true se o arquivo existir, false caso contrário
     */
    public boolean fileExists(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return false;
        }
        
        Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
        return Files.exists(filePath);
    }
      /**
     * Armazena uma foto de perfil de usuário, lidando com validações e 
     * remoção da foto antiga, se necessário
     * 
     * @param file Arquivo de imagem
     * @param user Usuário para o qual a foto está sendo armazenada
     * @return Nome do arquivo armazenado
     * @throws FileException Se houver problemas com o arquivo
     */
    public String storeUserPhoto(MultipartFile file, User user) {
        if (file.isEmpty()) {
            throw new FileException("Arquivo vazio. Por favor, selecione uma foto.");
        }
        
        // Validar tipo de arquivo (apenas imagens)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new FileException("Somente arquivos de imagem são permitidos.");
        }
        
        // Remover foto antiga se existir
        if (user.getPhoto() != null && !user.getPhoto().startsWith("http")) {
            try {
                deleteFile(user.getPhoto());
            } catch (Exception e) {
                // Log error but continue
                logger.warning("Erro ao excluir foto antiga: " + e.getMessage());
            }
        }
        
        // Salvar o arquivo
        String fileName = storeFile(file);
        
        // Atualizar a foto do usuário
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
     * @throws FileException Se houver problemas com o arquivo
     * @throws SecurityException Se o usuário não tiver permissão para modificar o evento
     */
    public String storeEventImage(MultipartFile file, Long eventId, Long userId) {
        if (file.isEmpty()) {
            throw new FileException("Arquivo vazio. Por favor, selecione uma imagem.");
        }
        
        // Validar tipo de arquivo (apenas imagens)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new FileException("Somente arquivos de imagem são permitidos.");
        }
        
        // Verificar permissão do usuário para editar o evento
        eventService.authorizeEditEvent(eventId, userId);
        
        // Buscar o evento para verificar e remover foto antiga
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));
        
        // Remover foto antiga se existir
        if (event.getPhoto() != null && !event.getPhoto().startsWith("http")) {
            try {
                deleteFile(event.getPhoto());
            } catch (Exception e) {
                // Log error but continue
                logger.warning("Erro ao excluir foto antiga do evento: " + e.getMessage());
            }
        }
        
        // Salvar o arquivo
        String fileName = storeFile(file);
        
        // Atualizar a foto do evento
        event.setPhoto(fileName);
        eventRepository.save(event);
        
        return fileName;
    }
}
