package com.eventsphere.service;

import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantHistory;
import com.eventsphere.entity.event.ParticipantStatus;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.repository.ParticpantHistoryRepository;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class QrCodeService {

    @Autowired
    private ParticipantRepository participantRepository;
    @Autowired
    private ParticpantHistoryRepository historyRepository;
    @Autowired
    private EventService eventService;

    @Autowired
    private UserRepository userRepository;


    public String createQrCode(Long participantId) {
        int token = 100000 + new SecureRandom().nextInt(900000);
        return participantId + ":" + token;
    }

    public boolean processQrCode(String codeOrQr) {
        if (codeOrQr == null || !codeOrQr.contains(":")) {
            return false;
        }
        String[] parts = codeOrQr.split(":", 2);
        if (parts.length != 2) {
            return false;
        }
        Long participantId;
        String token;
        try {
            participantId = Long.valueOf(parts[0]);
            token = parts[1];
        } catch (Exception e) {
            return false;
        }
        Optional<EventParticipant> participantOpt = participantRepository.findById(participantId);
        if (participantOpt.isPresent()) {
            EventParticipant participant = participantOpt.get();
            if (participant.getQrCode() == null || !participant.getQrCode().equals(codeOrQr)) {
                return false;
            }
            String savedToken = null;
            if (participant.getQrCode() != null && participant.getQrCode().contains(":")) {
                String[] savedParts = participant.getQrCode().split(":", 2);
                if (savedParts.length == 2) {
                    savedToken = savedParts[1];
                }
            }
            if (savedToken == null || !savedToken.equals(token)) {
                return false;
            }
            if (participant.getCurrentStatus() == ParticipantStatus.PRESENT) {
                return false;
            }
            participant.setCurrentStatus(ParticipantStatus.PRESENT);
            participantRepository.save(participant);
            logParticipantHistory(participant, ParticipantStatus.PRESENT);
            return true;
        }
        return false;
    }

    private void logParticipantHistory(EventParticipant participant, ParticipantStatus status) {
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(status);
        history.setChangeTimestamp(LocalDateTime.now());
        historyRepository.save(history);
    }

    public String processQrCodeWithPermission(String codeOrQr, String username) {
        try {
            if (codeOrQr == null || !codeOrQr.contains(":")) {
                throw new IllegalArgumentException("QR code inválido");
            }
            String[] parts = codeOrQr.split(":", 2);
            if (parts.length != 2) {
                throw new IllegalArgumentException("QR code inválido");
            }
            Long participantId;
            try {
                participantId = Long.valueOf(parts[0]);
            } catch (Exception e) {
                throw new IllegalArgumentException("QR code inválido");
            }
            Optional<EventParticipant> participantOpt = participantRepository.findById(participantId);
            if (participantOpt.isEmpty()) {
                throw new IllegalArgumentException("Participante não encontrado");
            }
            EventParticipant participant = participantOpt.get();
            Long eventId = participant.getEvent().getId();
            User user = userRepository.findByUsername(username);
            if (user == null) {
                throw new SecurityException("Usuário não autenticado");
            }
            eventService.authorizeEditEvent(eventId, user.getId());
            String result = processQrCodeWithError(codeOrQr);
            if (result != null) {
                throw new IllegalArgumentException(result);
            }
            return null; // sucesso
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    public String processQrCodeWithError(String codeOrQr) {
        if (codeOrQr == null || !codeOrQr.contains(":")) {
            return "QR code inválido: formato ausente de ':'";
        }
        String[] parts = codeOrQr.split(":", 2);
        if (parts.length != 2) {
            return "QR code inválido: não contém duas partes";
        }
        Long participantId;
        String token;
        try {
            participantId = Long.valueOf(parts[0]);
            token = parts[1];
        } catch (Exception e) {
            return "Erro ao converter participantId ou token: " + e.getMessage();
        }
        Optional<EventParticipant> participantOpt = participantRepository.findById(participantId);
        if (!participantOpt.isPresent()) {
            return "Participante não encontrado para o ID: " + participantId;
        }
        if(participantOpt.get().getCurrentStatus() == ParticipantStatus.PRESENT) {
            return "O participante já está presente";
        }
        EventParticipant participant = participantOpt.get();
        if (participant.getQrCode() == null || !participant.getQrCode().equals(codeOrQr)) {
            return "QR code não corresponde ao salvo para o participante";
        }
        String savedToken = null;
        try {
            if (participant.getQrCode() != null && participant.getQrCode().contains(":")) {
                String[] savedParts = participant.getQrCode().split(":", 2);
                if (savedParts.length == 2) {
                    savedToken = savedParts[1];
                }
            }
        } catch (Exception e) {
            return "Erro ao extrair token salvo: " + e.getMessage();
        }
        if (savedToken == null || !savedToken.equals(token)) {
            return "Token do QR code não confere com o salvo";
        }
        if (participant.getCurrentStatus() == ParticipantStatus.PRESENT) {
            return "Participante já estava presente";
        }
        participant.setCurrentStatus(ParticipantStatus.PRESENT);
        participantRepository.save(participant);
        logParticipantHistory(participant, ParticipantStatus.PRESENT);
        return null; // sucesso
    }
}