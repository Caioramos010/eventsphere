package com.eventsphere.service;

import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantHistory;
import com.eventsphere.entity.event.ParticipantStatus;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.ParticipantHistoryRepository;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.logging.Logger;

/**
 * Serviço responsável pela geração, validação e processamento de QR Codes para confirmação 
 * de presença em eventos.
 */
@Service
public class QrCodeService {
    private static final Logger logger = Logger.getLogger(QrCodeService.class.getName());

    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private ParticipantHistoryRepository historyRepository;
    
    @Autowired
    private EventService eventService;

    @Autowired
    private UserRepository userRepository;
    /**
     * Cria um código QR para um participante
     * O formato do código é "participantId:token", onde token é um número aleatório de 6 dígitos
     * 
     * @param participantId ID do participante
     * @return String contendo o código QR
     */
    public String createQrCode(Long participantId) {
        // Gera um token aleatório de 6 dígitos (entre 100000 e 999999)
        int token = 100000 + new SecureRandom().nextInt(900000);
        return participantId + ":" + token;
    }    /**
     * Processa um código QR e marca o participante como presente se válido
     * 
     * @param codeOrQr Código QR a ser processado
     * @return true se o código foi processado com sucesso, false caso contrário
     */
    public boolean processQrCode(String codeOrQr) {
        try {
            processQrCodeInternal(codeOrQr);
            return true;
        } catch (Exception e) {
            return false;
        }
    }/**
     * Registra uma mudança de status no histórico do participante
     * 
     * @param participant O participante do evento
     * @param status O novo status do participante
     */
    private void logParticipantHistory(EventParticipant participant, ParticipantStatus status) {
        if (participant == null) {
            throw new IllegalArgumentException("Participante não pode ser nulo ao registrar histórico");
        }
        
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(status);
        history.setChangeTimestamp(LocalDateTime.now());
        historyRepository.save(history);
    }    /**
     * Processa um código QR com verificação de permissão
     * 
     * @param codeOrQr Código QR a ser processado
     * @param username Nome do usuário que está tentando processar
     * @throws IllegalArgumentException se o QR code for inválido
     * @throws SecurityException se o usuário não tiver permissão
     */
    public void processQrCodeWithPermission(String codeOrQr, String username) {
        if (codeOrQr == null || !codeOrQr.contains(":")) {
            throw new IllegalArgumentException("QR code inválido: formato incorreto");
        }
        
        String[] parts = codeOrQr.split(":", 2);
        if (parts.length != 2) {
            throw new IllegalArgumentException("QR code inválido: formato incorreto");
        }
        
        Long participantId;
        try {
            participantId = Long.valueOf(parts[0]);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("QR code inválido: ID não numérico");
        }
        
        EventParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado"));
            
        Long eventId = participant.getEvent().getId();
        User user = userRepository.findByUsername(username);
        
        if (user == null) {
            throw new SecurityException("Usuário não autenticado");
        }
          eventService.authorizeEditEvent(eventId, user.getId());
        
        processQrCodeInternal(codeOrQr);
    }

    /**
     * Processa um código QR e marca o participante como presente
     * 
     * @param codeOrQr Código QR a ser processado
     * @throws IllegalArgumentException se o QR code for inválido ou participante já presente
     */
    private void processQrCodeInternal(String codeOrQr) {
        // Validação do formato do código QR
        if (codeOrQr == null || !codeOrQr.contains(":")) {
            throw new IllegalArgumentException("QR code inválido: formato ausente de ':'");
        }
        
        String[] parts = codeOrQr.split(":", 2);
        if (parts.length != 2) {
            throw new IllegalArgumentException("QR code inválido: não contém duas partes");
        }
        
        // Extração e validação do ID e token
        Long participantId;
        String token;
        try {
            participantId = Long.valueOf(parts[0]);
            token = parts[1];
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Erro ao converter ID do participante: " + e.getMessage());
        }
        
        // Busca e validação do participante
        EventParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado para o ID: " + participantId));
        
        if (participant.getCurrentStatus() == ParticipantStatus.PRESENT) {
            throw new IllegalArgumentException("O participante já está presente");
        }
        
        // Validação do QR code
        if (participant.getQrCode() == null || !participant.getQrCode().equals(codeOrQr)) {
            throw new IllegalArgumentException("QR code não corresponde ao salvo para o participante");
        }
        
        // Validação adicional do token
        String savedToken = null;
        if (participant.getQrCode() != null && participant.getQrCode().contains(":")) {
            String[] savedParts = participant.getQrCode().split(":", 2);
            if (savedParts.length == 2) {
                savedToken = savedParts[1];
            }
        }
        
        if (savedToken == null || !savedToken.equals(token)) {
            throw new IllegalArgumentException("Token do QR code não confere com o salvo");
        }
        
        // Marcar participante como presente
        participant.setCurrentStatus(ParticipantStatus.PRESENT);
        participantRepository.save(participant);
        logParticipantHistory(participant, ParticipantStatus.PRESENT);
    }
}