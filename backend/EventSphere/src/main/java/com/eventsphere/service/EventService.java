package com.eventsphere.service;

import com.eventsphere.dto.EventDTO;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.State;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    public Event registerEvent(EventDTO eventDTO) {
        eventDTO.setState(State.CREATED);
        User owner = null;
        if (eventDTO.getOwnerId() != null) {
            owner = userRepository.findById(eventDTO.getOwnerId())
                    .orElseThrow(() -> new IllegalArgumentException("Dono do evento não encontrado!"));
        } else {
            throw new IllegalArgumentException("OwnerId é obrigatório no DTO");
        }
        Event event = new Event(
                eventDTO.getName(),
                eventDTO.getDateFixedStart(),
                eventDTO.getDateFixedEnd(),
                eventDTO.getTimeFixedStart(),
                eventDTO.getTimeFixedEnd(),
                eventDTO.getLocalization(),
                eventDTO.getDescription(),
                eventDTO.getMaxParticipants(),
                eventDTO.getClassification(),
                eventDTO.getAcess(),
                eventDTO.getPhoto(),
                eventDTO.getState(),
                owner);
        eventRepository.save(event);
        return event;
    }

    private void checkPermission(Long eventID, Long userId) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        boolean isOwner = event.getOwner().getId().equals(userId);
        boolean isCollaborator = event.getCollaborators() != null && event.getCollaborators().stream().anyMatch(u -> u.getId().equals(userId));
        if (!(isOwner || isCollaborator)) {
            throw new SecurityException("Apenas o dono ou colaborador pode realizar esta operação.");
        }
    }

    public Event updateEvent(Long eventID, EventDTO eventDTO, Long userId) {
        checkPermission(eventID, userId);
        Optional<Event> optionalEvent = eventRepository.findById(eventID);
        if (optionalEvent.isEmpty()){
            throw new IllegalArgumentException("Evento não encontrado!");
        }
        Event event = optionalEvent.get();
        event.setName(eventDTO.getName());
        event.setDateFixedStart(eventDTO.getDateFixedStart());
        event.setDateFixedEnd(eventDTO.getDateFixedEnd());
        event.setLocalization(eventDTO.getLocalization());
        event.setDescription(eventDTO.getDescription());
        event.setMaxParticipants(eventDTO.getMaxParticipants());
        event.setClassification(eventDTO.getClassification());
        event.setAcess(eventDTO.getAcess());
        if (eventDTO.getOwnerId() != null && !event.getOwner().getId().equals(eventDTO.getOwnerId())) {
            User newOwner = userRepository.findById(eventDTO.getOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("Novo dono do evento não encontrado!"));
            event.setOwner(newOwner);
        }
        if (eventDTO.getPhoto() != null && !eventDTO.getPhoto().isEmpty()) {
            event.setPhoto(eventDTO.getPhoto());
        }
        return eventRepository.save(event);
    }

    public Event getEvent(Long eventID) {
        return eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
    }

    public Event deleteEvent(Long eventID) {
        Event event = getEvent(eventID);
        eventRepository.delete(event);
        return event;
    }

    @Scheduled(fixedRate = 60000) 
    public void autoStartEvents() {
        List<Event> events = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        for (Event event : events) {
            if (event.getState() == State.CREATED) {
                LocalDateTime fixedStart = LocalDateTime.of(event.getDateFixedStart(), event.getTimeFixedStart());
                if (now.isAfter(fixedStart) || now.isEqual(fixedStart)) {
                    event.setState(State.ACTIVE);
                    if (event.getDateStart() == null) {
                        event.setDateStart(now.toLocalDate());
                        event.setTimeStart(now.toLocalTime());
                    }
                    eventRepository.save(event);
                }
            }
        }
    }

    @Scheduled(fixedRate = 60000) 
    public void autoFinishEvents() {
        List<Event> events = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        for (Event event : events) {
            if (event.getState() == State.ACTIVE) {
                LocalDateTime fixedEnd = LocalDateTime.of(event.getDateFixedEnd(), event.getTimeFixedEnd());
                if (now.isAfter(fixedEnd) || now.isEqual(fixedEnd)) {
                    event.setState(State.FINISHED);
                    if (event.getDateEnd() == null) {
                        event.setDateEnd(now.toLocalDate());
                        event.setTimeEnd(now.toLocalTime());
                    }
                    eventRepository.save(event);
                }
            }
        }
    }



    public Event startEvent(Long eventID, Long userId) {
        checkPermission(eventID, userId);
        Event event = getEvent(eventID);
        if (!event.getState().equals(State.CREATED)) {
            throw new IllegalStateException("Evento não está no estado criado");
        }
        event.setState(State.ACTIVE);
        event.setDateStart(LocalDate.now());
        event.setTimeStart(LocalTime.now());
        return eventRepository.save(event);
    }

    public Event finishEvent(Long eventID, Long userId) {
        checkPermission(eventID, userId);
        Event event = getEvent(eventID);
        if (!event.getState().equals(State.ACTIVE)) {
            throw new IllegalStateException("Evento não está no estado ativo");
        }
        event.setState(State.FINISHED);
        event.setDateEnd(LocalDate.now());
        event.setTimeEnd(LocalTime.now());
        return eventRepository.save(event);
    }

    public Event cancelEvent(Long eventID, Long userId) {
        checkPermission(eventID, userId);
        Event event = getEvent(eventID);
        if (!(event.getState().equals(State.ACTIVE) || event.getState().equals(State.CREATED))) {
            throw new IllegalStateException("Evento só pode ser cancelado se estiver nos estados CREATED ou ACTIVE");
        }
        event.setState(State.CANCELED);
        return eventRepository.save(event);
    }


    private String generateInviteToken() {
        byte[] randomBytes = new byte[24];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String generateInviteCode() {
        int code = 100000 + new SecureRandom().nextInt(900000);
        return String.valueOf(code);
    }

    public Event createEventWithInvite(Long eventID){
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com o ID fornecido"));

        if (event.getInviteToken() != null) {
            event.setInviteCode(generateInviteCode());
        } else {
            event.setInviteToken(generateInviteToken());
            event.setInviteCode(generateInviteCode());
        }

        return eventRepository.save(event);

    }

    public boolean validateInvite(String token, String code) {
        Event event = eventRepository.findByInviteToken(token);
        return event != null && event.getInviteCode().equals(code);
    }

    public void authorizeEditEvent(Long eventID, Long userId) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        boolean isOwner = event.getOwner().getId().equals(userId);
        boolean isCollaborator = event.getCollaborators() != null && event.getCollaborators().stream().anyMatch(u -> u.getId().equals(userId));
        if (!(isOwner || isCollaborator)) {
            throw new SecurityException("Apenas o dono ou colaborador pode editar o evento ou criar convites.");
        }
    }

    // Exemplo de uso: adicionar colaborador
    public Event addCollaborator(Long eventID, Long userID, Long requesterId) {
        checkPermission(eventID, requesterId);
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        if (event.getCollaborators() == null) {
            event.setCollaborators(new java.util.ArrayList<>());
        }
        boolean alreadyCollaborator = event.getCollaborators().stream().anyMatch(u -> u.getId().equals(userID));
        if (alreadyCollaborator) {
            throw new IllegalArgumentException("Usuário já é colaborador deste evento");
        }
        event.getCollaborators().add(user);
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventID, userID);
        if (participant == null) {
            participant = new EventParticipant();
            participant.setEvent(event);
            participant.setUser(user);
            participant.setCurrentStatus(com.eventsphere.entity.event.ParticipantStatus.INVITED);
        }
        participant.setIsCollaborator(true);
        participantRepository.save(participant);
        return eventRepository.save(event);
    }


    public User getAuthenticatedUser(String username) {
        return userRepository.findByUsername(username);
    }

    public List<EventDTO> getMyEvents(Long userId) {
        List<Event> events = eventRepository.findAllMyEvents(userId);
        return events.stream().map(this::toDTO).toList();
    }

    public List<EventDTO> getPublicEvents() {
        List<Event> events = eventRepository.findAllpublicEvents();
        return events.stream().map(this::toDTO).toList();
    }    private EventDTO toDTO(Event event) {
        EventDTO dto = new EventDTO(
            event.getName(),
            event.getDateFixedStart(),
            event.getDateStart(),
            event.getDateFixedEnd(),
            event.getDateEnd(),
            event.getTimeFixedStart(),
            event.getTimeStart(),
            event.getTimeFixedEnd(),
            event.getTimeEnd(),
            event.getLocalization(),
            event.getDescription(),
            event.getMaxParticipants(),
            event.getClassification(),
            event.getAcess(),
            event.getPhoto(),
            event.getState());
            
        // Configurar o ID do evento no DTO
        dto.setId(event.getId());
        
        if (event.getCollaborators() != null)
            dto.setCollaboratorIds(event.getCollaborators().stream().map(u -> u.getId()).toList());
        if (event.getParticipants() != null)
            dto.setParticipantIds(event.getParticipants().stream().map(p -> p.getUser().getId()).toList());
        return dto;
    }


}