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

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.logging.Logger;

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

    public String createQrCode(Long participantId) {
        try {
            int token = 100000 + new SecureRandom().nextInt(900000);
            String qrCodeText = participantId + ":" + token;
            int width = 300;
            int height = 300;
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeText, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] imageBytes = outputStream.toByteArray();
            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (WriterException | IOException e) {
            logger.severe("Erro ao gerar QR Code: " + e.getMessage());
            throw new RuntimeException("Erro ao gerar QR Code", e);
        }
    }

    public boolean processQrCode(String codeOrQr) {
        try {
            processQrCodeInternal(codeOrQr);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void logParticipantHistory(EventParticipant participant, ParticipantStatus status) {
        if (participant == null) {
            throw new IllegalArgumentException("Participante não pode ser nulo ao registrar histórico");
        }
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(status);
        history.setChangeTimestamp(LocalDateTime.now());
        historyRepository.save(history);
    }

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
        // TODO: Adicionar verificação de permissão de edição
        processQrCodeInternal(codeOrQr);
    }
    private void processQrCodeInternal(String codeOrQr) {
        if (codeOrQr == null || !codeOrQr.contains(":")) {
            throw new IllegalArgumentException("QR code inválido: formato ausente de ':'");
        }
        String[] parts = codeOrQr.split(":", 2);
        if (parts.length != 2) {
            throw new IllegalArgumentException("QR code inválido: não contém duas partes");
        }
        Long participantId;
        String token;
        try {
            participantId = Long.valueOf(parts[0]);
            token = parts[1];
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Erro ao converter ID do participante: " + e.getMessage());
        }
        EventParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado para o ID: " + participantId));
        if (participant.getCurrentStatus() == ParticipantStatus.PRESENT) {
            throw new IllegalArgumentException("O participante já está presente");
        }
        if (participant.getQrCode() == null || !participant.getQrCode().equals(codeOrQr)) {
            throw new IllegalArgumentException("QR code não corresponde ao salvo para o participante");
        }
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
        participant.setCurrentStatus(ParticipantStatus.PRESENT);
        participantRepository.save(participant);
        logParticipantHistory(participant, ParticipantStatus.PRESENT);
    }

    public String generateQrCodeText(Long participantId) {
        int token = 100000 + new SecureRandom().nextInt(900000);
        return participantId + ":" + token;
    }

    public java.util.Map<String, String> createQrCodeComplete(Long participantId) {
        try {
            String qrCodeText = generateQrCodeText(participantId);
            int width = 300;
            int height = 300;
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeText, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] imageBytes = outputStream.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado"));
            participant.setQrCode(qrCodeText);
            participantRepository.save(participant);
            java.util.Map<String, String> result = new java.util.HashMap<>();
            result.put("qrCodeText", qrCodeText);
            result.put("qrCodeImage", base64Image);
            return result;
        } catch (WriterException | IOException e) {
            logger.severe("Erro ao gerar QR Code completo: " + e.getMessage());
            throw new RuntimeException("Erro ao gerar QR Code", e);
        }
    }
}