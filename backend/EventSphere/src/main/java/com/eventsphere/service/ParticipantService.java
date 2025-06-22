package com.eventsphere.service;

import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantHistory;
import com.eventsphere.entity.event.ParticipantStatus;
import com.eventsphere.entity.event.State;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.ParticipantHistoryRepository;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ParticipantService {
    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventService eventService;

    @Autowired
    private QrCodeService qrCodeService; // Adicionado QrCodeService

    @Autowired
    private ParticipantHistoryRepository participantHistoryRepository;

    public void updateParticipantStatus(Long eventId, Long userId, ParticipantStatus newStatus) {
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventId, userId);
        if (participant == null) {
            throw new IllegalStateException("Participante não encontrado!");
        }
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(participant.getCurrentStatus());
        history.setChangeTimestamp(LocalDateTime.now());
        participant.getParticipantHistory().add(history);

        participant.setCurrentStatus(newStatus);

        participantRepository.save(participant);
    }

    public Event removeParticipant(Long eventID, Long userID) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));

        // Verificar se o evento permite modificações
        validateEventForModification(event);

        User user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));

        boolean alreadyParticipating = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().equals(user));

        if (alreadyParticipating) {
            event.getParticipants().removeIf(p -> p.getUser().equals(user));
            return eventRepository.save(event);
        }

        throw new IllegalArgumentException("Usuário não está participando do evento para ser removido.");
    }

    public void authorizeRemoveParticipant(Long eventID, Long userID, Long ownerID) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        boolean isOwner = event.getOwner().getId().equals(ownerID);
        boolean isCollaborator = event.getCollaborators() != null && event.getCollaborators().stream().anyMatch(u -> u.getId().equals(ownerID));
        boolean isSelf = user.getId().equals(ownerID);
        if (!(isOwner || isCollaborator || isSelf)) {
            throw new SecurityException("Apenas o dono, colaborador ou o próprio usuário pode remover o participante do evento.");
        }
    }

    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Event joinPublicEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        if (event.getAcess() != com.eventsphere.entity.event.Acess.PUBLIC) {
            throw new IllegalArgumentException("Este evento não é público e requer convite para participar.");
        }

        // Verificar se o evento aceita novos participantes
        validateEventAcceptsParticipants(event);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));

        // Inicializar lista de participantes se necessário
        if (event.getParticipants() == null) {
            event.setParticipants(new java.util.ArrayList<>());
        }

        // Verificar se o usuário já é participante
        boolean alreadyParticipating = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId));

        if (alreadyParticipating) {
            throw new IllegalArgumentException("Usuário já é participante deste evento");
        }

        // Criar participante e adicionar ao evento
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setCurrentStatus(ParticipantStatus.INVITED);
        participant.setIsCollaborator(false);

        // Adicionar histórico inicial
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(ParticipantStatus.INVITED);
        history.setChangeTimestamp(LocalDateTime.now());

        if (participant.getParticipantHistory() == null) {
            participant.setParticipantHistory(new ArrayList<>());
        }
        participant.getParticipantHistory().add(history);
        event.getParticipants().add(participant);
        return eventRepository.save(event);
    }


    public Event joinPublicEventFromRequest(Object eventIdObj, Long userId) {
        if (eventIdObj == null) {
            throw new IllegalArgumentException("ID do evento é obrigatório");
        }

        Long eventId;
        try {
            if (eventIdObj instanceof Number) {
                eventId = ((Number) eventIdObj).longValue();
            } else {
                eventId = Long.parseLong(eventIdObj.toString());
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("ID do evento inválido");
        }

        return joinPublicEvent(eventId, userId);
    }

    /**
     * Confirma a participação de um participante
     */
    public void confirmParticipant(Long eventId, Long userId, Long authUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));

        // Verificar se o evento permite modificações
        validateEventForModification(event);

        // Verificar se o usuário autenticado tem permissão (owner ou colaborador)
        authorizeEventManagement(event, authUserId);

        EventParticipant participant = event.getParticipants().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado no evento"));

        // Atualizar status para confirmado
        participant.setCurrentStatus(ParticipantStatus.CONFIRMED);
        participantRepository.save(participant);
    }

    /**
     * Promove um participante a colaborador
     */
    public void promoteToCollaborator(Long eventId, Long userId, Long authUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));

        // Verificar se o evento permite modificações
        validateEventForModification(event);

        // Verificar se o usuário autenticado é o owner do evento
        if (!event.getOwner().getId().equals(authUserId)) {
            throw new SecurityException("Apenas o organizador pode promover colaboradores");
        }

        EventParticipant participant = event.getParticipants().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado no evento"));

        participant.setIsCollaborator(true);
        participantRepository.save(participant);
    }

    /**
     * Remove colaborador (rebaixa para participante comum)
     */
    public void demoteCollaborator(Long eventId, Long userId, Long authUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));

        // Verificar se o evento permite modificações
        validateEventForModification(event);

        // Verificar se o usuário autenticado é o owner do evento
        if (!event.getOwner().getId().equals(authUserId)) {
            throw new SecurityException("Apenas o organizador pode remover colaboradores");
        }

        EventParticipant participant = event.getParticipants().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado no evento"));

        participant.setIsCollaborator(false);
        participantRepository.save(participant);
    }

    /**
     * Verifica se o usuário tem permissão para gerenciar o evento
     */
    private void authorizeEventManagement(Event event, Long authUserId) {
        boolean isOwner = event.getOwner().getId().equals(authUserId);
        boolean isCollaborator = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(authUserId) && p.isCollaborator());

        if (!isOwner && !isCollaborator) {
            throw new SecurityException("Usuário não tem permissão para gerenciar este evento");
        }
    }

    // Método auxiliar para verificar se o evento aceita novos participantes
    private void validateEventAcceptsParticipants(Event event) {
        // Verificar se o evento está ativo (se estiver ativo, não permite mais participações)
        if (event.getState() == com.eventsphere.entity.event.State.ACTIVE) {
            throw new IllegalArgumentException("Este evento já foi iniciado e não aceita mais participantes.");
        }

        // Verificar se o evento foi encerrado (se estiver encerrado, não permite mais participações)
        if (event.getState() == com.eventsphere.entity.event.State.FINISHED) {
            throw new IllegalArgumentException("Este evento já foi encerrado e não aceita mais participantes.");
        }

        // Verificar se o evento foi cancelado (se estiver cancelado, não permite mais participações)
        if (event.getState() == com.eventsphere.entity.event.State.CANCELED) {
            throw new IllegalArgumentException("Este evento foi cancelado e não aceita mais participantes.");
        }
    }

    /**
     * Valida se o evento permite modificações baseado no seu estado
     */
    private void validateEventForModification(Event event) {
        com.eventsphere.entity.event.State state = event.getState();

        if (state == com.eventsphere.entity.event.State.CANCELED) {
            throw new IllegalStateException("Não é possível realizar operações em eventos cancelados.");
        }

        if (state == com.eventsphere.entity.event.State.ACTIVE) {
            throw new IllegalStateException("Não é possível modificar participantes após o evento ser iniciado.");
        }

        if (state == com.eventsphere.entity.event.State.FINISHED) {
            throw new IllegalStateException("Não é possível modificar participantes após o evento ser encerrado.");
        }
    }

    /**
     * Gera QR Code para um participante
     */
    public Map<String, Object> generateQrCodeForParticipant(Long eventId, Long userId) {
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventId, userId);

        if (participant == null) {
            throw new IllegalArgumentException("Você não é participante deste evento");
        }

        if (participant.getEvent().getState() != com.eventsphere.entity.event.State.ACTIVE) {
            throw new IllegalArgumentException("QR Code só está disponível durante eventos ativos");
        }

        Map<String, String> qrCodeData = qrCodeService.createQrCodeComplete(participant.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("qrCode", qrCodeData.get("qrCodeImage")); // Imagem Base64
        response.put("qrCodeText", qrCodeData.get("qrCodeText")); // Texto do QR Code
        response.put("participantId", participant.getId());
        response.put("eventName", participant.getEvent().getName());

        return response;
    }

    /**
     * Gera relatório de presença para um evento
     */
    public Map<String, Object> generateAttendanceReport(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));

        // Verificar se o usuário tem permissão (owner ou colaborador)
        boolean isOwner = event.getOwner().getId().equals(userId);
        boolean isCollaborator = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId) && p.isCollaborator());

        if (!isOwner && !isCollaborator) {
            throw new IllegalArgumentException("Apenas organizadores podem ver o relatório de presença");
        }

        // Separar participantes por presença
        List<EventParticipant> allParticipants = event.getParticipants();

        List<Map<String, Object>> presentParticipants = new ArrayList<>();
        List<Map<String, Object>> absentParticipants = new ArrayList<>();

        for (EventParticipant participant : allParticipants) {
            Map<String, Object> participantData = new HashMap<>();
            participantData.put("id", participant.getId());
            participantData.put("userId", participant.getUser().getId());
            participantData.put("userName", participant.getUser().getName());
            participantData.put("userEmail", participant.getUser().getEmail());
            participantData.put("userPhoto", participant.getUser().getPhoto());
            participantData.put("isCollaborator", participant.isCollaborator());
            participantData.put("currentStatus", participant.getCurrentStatus().toString());

            // Verificar se está presente baseado no status
            if (participant.getCurrentStatus() == ParticipantStatus.PRESENT) {
                presentParticipants.add(participantData);
            } else {
                absentParticipants.add(participantData);
            }
        }

        Map<String, Object> report = new HashMap<>();
        report.put("eventName", event.getName());
        report.put("eventState", event.getState().toString());
        report.put("totalParticipants", allParticipants.size());
        report.put("presentCount", presentParticipants.size());
        report.put("absentCount", absentParticipants.size());
        report.put("presentParticipants", presentParticipants);
        report.put("absentParticipants", absentParticipants);

        return report;
    }

    /**
     * Remove um participante com verificação de autorização
     *
     * @param eventID    ID do evento
     * @param userID     ID do usuário a ser removido
     * @param authUserID ID do usuário que está fazendo a remoção
     */
    public void removeParticipantWithAuth(Long eventID, Long userID, Long authUserID) {
        authorizeRemoveParticipant(eventID, userID, authUserID);
        removeParticipant(eventID, userID);
    }

    /**
     * Permite que um usuário entre em um evento privado usando um convite
     * @param eventIdObj ID do evento (Object para flexibilidade de tipos)
     * @param inviteToken Token de convite
     * @param userId ID do usuário autenticado
     */
    public void joinEventWithInvite(Object eventIdObj, String inviteToken, Long userId) {
        if (eventIdObj == null || inviteToken == null || userId == null) {
            throw new IllegalArgumentException("Dados obrigatórios ausentes para participar via convite.");
        }
        Long eventId;
        try {
            if (eventIdObj instanceof Number) {
                eventId = ((Number) eventIdObj).longValue();
            } else {
                eventId = Long.parseLong(eventIdObj.toString());
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("ID do evento inválido");
        }
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        // Validação do token de convite
        if (event.getInviteCode() == null || !event.getInviteCode().equals(inviteToken)) {
            throw new IllegalArgumentException("Token de convite inválido para este evento.");
        }
        // Verifica se o usuário já é participante
        boolean alreadyParticipating = event.getParticipants() != null &&
            event.getParticipants().stream().anyMatch(p -> p.getUser().getId().equals(userId));
        if (alreadyParticipating) {
            throw new IllegalArgumentException("Usuário já é participante deste evento");
        }
        // Adiciona o usuário como participante
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setCurrentStatus(ParticipantStatus.INVITED);
        participant.setIsCollaborator(false);
        // Histórico inicial
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(ParticipantStatus.INVITED);
        history.setChangeTimestamp(LocalDateTime.now());
        participant.setParticipantHistory(new ArrayList<>(List.of(history)));
        if (event.getParticipants() == null) {
            event.setParticipants(new ArrayList<>());
        }
        event.getParticipants().add(participant);
        eventRepository.save(event);
    }

    /**
     * Permite que um usuário entre em um evento usando o código do evento
     * @param eventCode Código do evento
     * @param userId ID do usuário autenticado
     */
    public void joinEventWithCode(String eventCode, Long userId) {
        if (eventCode == null || eventCode.trim().isEmpty() || userId == null) {
            throw new IllegalArgumentException("Código do evento e usuário são obrigatórios.");
        }
        // Buscar evento pelo código
        Event event = eventRepository.findAll().stream()
                .filter(e -> eventCode.equals(e.getInviteCode()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado para o código informado."));
        // Verifica se o usuário já é participante
        boolean alreadyParticipating = event.getParticipants() != null &&
            event.getParticipants().stream().anyMatch(p -> p.getUser().getId().equals(userId));
        if (alreadyParticipating) {
            throw new IllegalArgumentException("Usuário já é participante deste evento");
        }
        // Adiciona o usuário como participante
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setCurrentStatus(ParticipantStatus.INVITED);
        participant.setIsCollaborator(false);
        // Histórico inicial
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(ParticipantStatus.INVITED);
        history.setChangeTimestamp(LocalDateTime.now());
        participant.setParticipantHistory(new ArrayList<>(List.of(history)));
        if (event.getParticipants() == null) {
            event.setParticipants(new ArrayList<>());
        }
        event.getParticipants().add(participant);
        eventRepository.save(event);
    }
}