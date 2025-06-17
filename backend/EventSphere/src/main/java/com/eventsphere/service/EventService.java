package com.eventsphere.service;

import com.eventsphere.dto.EventDTO;
import com.eventsphere.dto.ParticipantDTO;
import com.eventsphere.entity.event.Acess;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantHistory;
import com.eventsphere.entity.event.ParticipantStatus;
import com.eventsphere.entity.event.State;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.utils.EventCodeGenerator;        // Verificar se o evento ainda está válido
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.Random;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private ImageService imageService;

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
                
        // Salva o evento primeiro para obter um ID
        event = eventRepository.save(event);
          // Inicializa a lista de participantes se necessário
        if (event.getParticipants() == null) {
            event.setParticipants(new ArrayList<>());
        }
        
        // Adiciona o criador automaticamente como participante confirmado
        EventParticipant ownerParticipant = new EventParticipant();
        ownerParticipant.setEvent(event);
        ownerParticipant.setUser(owner);
        ownerParticipant.setCurrentStatus(ParticipantStatus.CONFIRMED);
        ownerParticipant.setIsCollaborator(false); // Não é necessário ser colaborador, já é dono
        
        // Adiciona histórico inicial
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(ownerParticipant);
        history.setStatus(ParticipantStatus.CONFIRMED);
        history.setChangeTimestamp(LocalDateTime.now());
        
        if (ownerParticipant.getParticipantHistory() == null) {
            ownerParticipant.setParticipantHistory(new ArrayList<>());
        }
        ownerParticipant.getParticipantHistory().add(history);
        
        // Adiciona o participante à lista do evento
        event.getParticipants().add(ownerParticipant);
        
        // Salva o participante no repositório
        participantRepository.save(ownerParticipant);
        
        // Salva o evento com o participante
        return eventRepository.save(event);
    }
    
    private void checkPermission(Long eventID, Long userId) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        
        // Verificar se é o proprietário
        boolean isOwner = event.getOwner().getId().equals(userId);
        if (isOwner) {
            return; // Se for o proprietário, tem permissão
        }
        
        // Verificar se é colaborador
        boolean isCollaborator = false;
        if (event.getCollaborators() != null) {
            isCollaborator = event.getCollaborators().stream().anyMatch(u -> u.getId().equals(userId));
        }
        
        if (!isCollaborator) {
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
    }    public Event cancelEvent(Long eventID, Long userId) {
        checkPermission(eventID, userId);
        Event event = getEvent(eventID);
        if (!(event.getState().equals(State.ACTIVE) || event.getState().equals(State.CREATED))) {
            throw new IllegalStateException("Evento só pode ser cancelado se estiver nos estados CREATED ou ACTIVE");
        }
        event.setState(State.CANCELED);
        return eventRepository.save(event);
    }
      public void authorizeEditEvent(Long eventID, Long userId) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        
        // Verificar se é o proprietário
        boolean isOwner = event.getOwner().getId().equals(userId);
        if (isOwner) {
            return; // Se for o proprietário, tem permissão
        }
        
        // Verificar se é colaborador
        boolean isCollaborator = false;
        if (event.getCollaborators() != null) {
            isCollaborator = event.getCollaborators().stream().anyMatch(u -> u.getId().equals(userId));
        }
        
        if (!isCollaborator) {
            throw new SecurityException("Apenas o dono ou colaborador pode editar o evento ou criar convites.");
        }
    }
    
    private String generateInviteToken() {
        byte[] randomBytes = new byte[24];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Gera ou obtém o link de convite para um evento
     * 
     * @param eventId ID do evento
     * @param userId ID do usuário (deve ser dono ou colaborador)
     * @return Token de convite
     */
    public String generateInviteLink(Long eventId, Long userId) {
        Event event = getEvent(eventId);
        
        // Verificar se o usuário tem permissão para gerar convites
        authorizeEditEvent(eventId, userId);
        
        // Se já existe um token, retornar o existente
        if (event.getInviteToken() != null && !event.getInviteToken().isEmpty()) {
            return event.getInviteToken();
        }
          // Gerar novo token único
        String inviteToken = UUID.randomUUID().toString();
        event.setInviteToken(inviteToken);
        
        // Gerar código de convite seguro (8 caracteres únicos)
        String inviteCode = generateSecureInviteCode();
        event.setInviteCode(inviteCode);
        
        eventRepository.save(event);
        
        return inviteToken;
    }
    
    /**
     * Gera um código de convite seguro de 8 caracteres usando EventCodeGenerator
     * Garante unicidade verificando códigos existentes no banco
     */
    private String generateSecureInviteCode() {
        // Buscar todos os códigos existentes para garantir unicidade
        Set<String> existingCodes = eventRepository.findAll()
                .stream()
                .map(Event::getInviteCode)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        return EventCodeGenerator.generateEventCode(existingCodes);
    }
    
    /**
     * Valida um token de convite e retorna o evento
     * 
     * @param inviteToken Token de convite
     * @return EventDTO do evento
     */
    public EventDTO validateInviteToken(String inviteToken) {
        Event event = eventRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new IllegalArgumentException("Token de convite inválido ou expirado"));
        
        // Verificar se o evento não está cancelado
        if (event.getState() == State.CANCELED) {
            throw new IllegalArgumentException("Este evento foi cancelado");
        }
        
        return convertToDTO(event);
    }

    public Event validateInviteTokenAndGetEvent(String inviteToken) {
        Event event = eventRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new IllegalArgumentException("Token de convite inválido ou expirado"));
        
        // Verificar se o evento não está cancelado
        if (event.getState() == State.CANCELED) {
            throw new IllegalArgumentException("Este evento foi cancelado");
        }
        
        return event;
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
    }    /**
     * Obter eventos do usuário (Método mantido para compatibilidade, usar getMyEventsWithUserInfo em vez disso)
     * @param userId ID do usuário
     * @return Lista de DTOs dos eventos
     * @deprecated Use {@link #getMyEventsWithUserInfo(Long)} em vez disso
     */
    @Deprecated
    public List<EventDTO> getMyEvents(Long userId) {
        List<Event> ownedEvents = eventRepository.findByOwnerId(userId);
        List<Event> participantEvents = eventRepository.findAllMyEvents(userId);
        
        // Combine owned and participated events
        Set<Event> allEvents = new HashSet<>();
        allEvents.addAll(ownedEvents);
        allEvents.addAll(participantEvents);
        
        return allEvents.stream().map(this::convertToDTO).toList();
    }

    /**
     * Obter eventos públicos (Método mantido para compatibilidade, usar getPublicEventsWithUserInfo em vez disso)
     * @return Lista de DTOs dos eventos públicos
     * @deprecated Use {@link #getPublicEventsWithUserInfo(Long)} em vez disso
     */
    @Deprecated
    public List<EventDTO> getPublicEvents() {
        List<Event> events = eventRepository.findAllpublicEvents();
        return events.stream().map(this::convertToDTO).toList();
    }    /**
     * Obter detalhes do evento incluindo a relação do usuário atual com o evento
     * @param eventID ID do evento
     * @param userId ID do usuário atual
     * @return DTO do evento com informações de status do usuário
     */
    public EventDTO getEventWithUserInfo(Long eventID, Long userId) {
        Event event = getEvent(eventID);
        EventDTO eventDTO = convertToDTO(event);
        
        // Determinar o status do usuário em relação ao evento
        boolean isOwner = event.getOwner().getId().equals(userId);
        boolean isCollaborator = false;
        boolean isParticipant = false;
        boolean isConfirmed = false;
        
        // Se for o proprietário, não precisamos verificar outras coisas
        if (isOwner) {
            eventDTO.setUserStatus("owner");
            eventDTO.setUserConfirmed(true); // O proprietário está sempre confirmado
            return eventDTO;
        }
        
        // Verificar se o usuário é colaborador
        if (event.getCollaborators() != null) {
            isCollaborator = event.getCollaborators().stream()
                .anyMatch(u -> u.getId().equals(userId));
        }
        
        // Verificar entre os participantes
        if (event.getParticipants() != null) {
            for (EventParticipant participant : event.getParticipants()) {
                if (participant.getUser().getId().equals(userId)) {
                    isParticipant = true;
                    isCollaborator = participant.isCollaborator() || isCollaborator; // Também poderia ser marcado como colaborador na lista de participantes
                    isConfirmed = participant.getCurrentStatus() == ParticipantStatus.CONFIRMED;
                    break;
                }
            }
        }
        
        // Definir o status do usuário
        if (isCollaborator) {
            eventDTO.setUserStatus("collaborator");
        } else if (isParticipant) {
            eventDTO.setUserStatus("participant");
        } else {
            eventDTO.setUserStatus("visitor");
        }
        
        eventDTO.setUserConfirmed(isConfirmed);
        
        return eventDTO;
    }
    public EventDTO convertToDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setName(event.getName());
        dto.setDateFixedStart(event.getDateFixedStart());
        dto.setDateStart(event.getDateStart());
        dto.setDateFixedEnd(event.getDateFixedEnd());
        dto.setDateEnd(event.getDateEnd());
        dto.setTimeFixedStart(event.getTimeFixedStart());
        dto.setTimeStart(event.getTimeStart());
        dto.setTimeFixedEnd(event.getTimeFixedEnd());
        dto.setTimeEnd(event.getTimeEnd());
        dto.setLocalization(event.getLocalization());
        dto.setDescription(event.getDescription());
        dto.setMaxParticipants(event.getMaxParticipants());
        dto.setClassification(event.getClassification());
        dto.setAcess(event.getAcess());
        dto.setPhoto(event.getPhoto());
        dto.setState(event.getState());
        dto.setOwnerId(event.getOwner().getId());        // Criar listas para IDs
        List<Long> collaboratorIds = new ArrayList<>();
        List<Long> participantIds = new ArrayList<>();
        List<ParticipantDTO> participants = new ArrayList<>();
        
        // Processar participantes
        for (EventParticipant participant : event.getParticipants()) {
            ParticipantDTO participantDTO = new ParticipantDTO();
            participantDTO.setId(participant.getId());
            participantDTO.setUserId(participant.getUser().getId());
            participantDTO.setUserName(participant.getUser().getName());
            participantDTO.setUserUsername(participant.getUser().getUsername());
            participantDTO.setUserEmail(participant.getUser().getEmail());
            participantDTO.setUserPhoto(participant.getUser().getPhoto());
            participantDTO.setIsCollaborator(participant.isCollaborator());
            participantDTO.setStatus(participant.getCurrentStatus().toString());
            participantDTO.setConfirmed(participant.getCurrentStatus() == ParticipantStatus.CONFIRMED);
            
            participants.add(participantDTO);
            participantIds.add(participant.getUser().getId());
            
            if (participant.isCollaborator()) {
                collaboratorIds.add(participant.getUser().getId());
            }
        }
        
        dto.setCollaboratorIds(collaboratorIds);
        dto.setParticipantIds(participantIds);
        dto.setParticipants(participants);
        
        return dto;
    }    /**
     * Obter todos os eventos relacionados ao usuário com informações de status
     * Inclui eventos onde o usuário é dono ou participante, excluindo eventos cancelados
     * 
     * @param userId ID do usuário
     * @return Lista de DTOs dos eventos com informações de status do usuário
     */    public List<EventDTO> getMyEventsWithUserInfo(Long userId) {
        // Estados a serem excluídos (FINISHED e CANCELED)
        List<State> excludedStates = Arrays.asList(State.FINISHED, State.CANCELED);
        
        // Busca eventos onde o usuário é o dono, excluindo eventos finalizados/cancelados
        List<Event> ownedEvents = eventRepository.findByOwnerIdAndStateNotIn(userId, excludedStates);
        
        // Busca eventos onde o usuário é participante, excluindo estados indesejados
        List<Event> participantEvents = eventRepository.findByParticipantsUserIdAndStateNot(userId, State.CANCELED);
        // Filtrar também os FINISHED dos eventos de participante
        participantEvents = participantEvents.stream()
                .filter(event -> event.getState() != State.FINISHED)
                .collect(Collectors.toList());
        
        // Juntar as listas e remover duplicatas usando um Set
        Set<Event> allEvents = new HashSet<>();
        allEvents.addAll(ownedEvents);
        allEvents.addAll(participantEvents);
        
        // Converter para DTOs com informações detalhadas do usuário
        List<EventDTO> result = new ArrayList<>();
        for (Event event : allEvents) {
            result.add(getEventWithUserInfo(event.getId(), userId));
        }
          return result;
    }
    
    /**
     * Obter todos os eventos públicos com informações de status do usuário
     * Inclui informações sobre a relação do usuário com cada evento
     * 
     * @param userId ID do usuário atual
     * @return Lista de DTOs dos eventos com informações de status do usuário
     */    public List<EventDTO> getPublicEventsWithUserInfo(Long userId) {
        // Estados a serem excluídos (FINISHED e CANCELED)
        List<State> excludedStates = Arrays.asList(State.FINISHED, State.CANCELED);
        
        // Busca todos os eventos públicos excluindo os finalizados/cancelados
        List<Event> events = eventRepository.findByAcessAndStateNotIn(Acess.PUBLIC, excludedStates);
        
        if (events.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Converter para DTOs com informações detalhadas do usuário
        List<EventDTO> result = new ArrayList<>();
        for (Event event : events) {
            // Para cada evento, adiciona informação sobre o status do usuário em relação ao evento
            result.add(getEventWithUserInfo(event.getId(), userId));
        }
        
        return result;
    }/**
     * Atualiza a foto de um evento com Base64
     * 
     * @param eventId ID do evento
     * @param base64Image Imagem em formato Base64
     * @return Evento atualizado
     */
    public Event updateEventPhoto(Long eventId, String base64Image) {
        Event event = getEvent(eventId);
        event.setPhoto(base64Image);
        return eventRepository.save(event);
    }
    
    /**
     * Obter eventos onde o usuário é participante
     */
    public List<EventDTO> getParticipatingEventsForUser(Long userId) {
        List<Event> events = eventRepository.findEventsByParticipantUserId(userId);
        
        // Filtrar eventos ativos (não cancelados nem encerrados)
        events = events.stream()
                .filter(event -> event.getState() == State.CREATED || event.getState() == State.ACTIVE)
                .collect(Collectors.toList());
        
        return events.stream()
                .map(event -> {
                    EventDTO dto = convertToDTO(event);
                    
                    // Determinar o status do usuário no evento
                    String userStatus = determineUserStatus(event, userId);
                    dto.setUserStatus(userStatus);
                    
                    // Verificar se o usuário confirmou presença
                    boolean userConfirmed = event.getParticipants() != null && 
                            event.getParticipants().stream()
                                    .anyMatch(p -> p.getUser().getId().equals(userId) && 
                                               p.getCurrentStatus() == ParticipantStatus.CONFIRMED);
                    dto.setUserConfirmed(userConfirmed);
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private String determineUserStatus(Event event, Long userId) {
        // Lógica para determinar o status do usuário no evento
        if (event.getOwner().getId().equals(userId)) {
            return "owner";
        }
        
        if (event.getCollaborators() != null) {
            for (User collaborator : event.getCollaborators()) {
                if (collaborator.getId().equals(userId)) {
                    return "collaborator";
                }
            }
        }
        
        if (event.getParticipants() != null) {
            for (EventParticipant participant : event.getParticipants()) {
                if (participant.getUser().getId().equals(userId)) {
                    return "participant";
                }
            }
        }
        
        return "visitor";
    }

    /**
     * Upload de imagem para evento
     */
    public Map<String, Object> uploadEventImage(Long eventId, org.springframework.web.multipart.MultipartFile file, Long userId) {
        // Verificar se o usuário tem permissão para editar o evento
        authorizeEditEvent(eventId, userId);
        
        // Converter arquivo para Base64
        String base64Image = imageService.convertToBase64(file);
        
        // Atualizar evento com a imagem Base64
        Event updatedEvent = updateEventPhoto(eventId, base64Image);
        
        Map<String, Object> response = new HashMap<>();
        response.put("imageBase64", base64Image);
        response.put("eventId", eventId);
        response.put("success", true);
        
        return response;
    }
    
    /**
     * Valida um código de evento e retorna o evento
     * 
     * @param eventCode Código do evento (8 caracteres)
     * @return EventDTO do evento
     */
    public EventDTO validateEventCode(String eventCode) {
        // Validar formato do código
        if (!EventCodeGenerator.isValidCodeFormat(eventCode)) {
            throw new IllegalArgumentException("Código de evento inválido. Deve conter 8 caracteres (letras e números).");
        }
        
        Event event = eventRepository.findByInviteCode(eventCode);
          if (event == null) {
            throw new EntityNotFoundException("Evento não encontrado com o código fornecido.");
        }
        
        // Verificar se o evento ainda está válido
        if (event.getState() == State.CANCELED) {
            throw new IllegalStateException("Este evento foi cancelado.");
        }
        
        if (event.getState() == State.FINISHED) {
            throw new IllegalStateException("Este evento já foi finalizado.");
        }
        
        return convertToDTO(event);
    }
    
    /**
     * Valida um código de evento e retorna a entidade Event
     * 
     * @param eventCode Código do evento (8 caracteres)
     * @return Event entity
     */
    public Event validateEventCodeAndGetEvent(String eventCode) {
        // Validar formato do código
        if (!EventCodeGenerator.isValidCodeFormat(eventCode)) {
            throw new IllegalArgumentException("Código de evento inválido. Deve conter 8 caracteres (letras e números).");
        }
        
        Event event = eventRepository.findByInviteCode(eventCode);
        
        if (event == null) {
            throw new IllegalArgumentException("Evento não encontrado com o código fornecido.");
        }
        
        // Verificar se o evento ainda está válido
        if (event.getState() == State.CANCELED) {
            throw new IllegalStateException("Este evento foi cancelado.");
        }
        
        if (event.getState() == State.FINISHED) {
            throw new IllegalStateException("Este evento já foi finalizado.");
        }
        
        return event;
    }
}