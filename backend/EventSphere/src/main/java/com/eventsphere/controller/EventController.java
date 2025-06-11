package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.EventDTO;
import com.eventsphere.entity.event.Event;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.service.EventService;
import com.eventsphere.entity.user.User;
import com.eventsphere.service.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/api/event")
@RestController
public class EventController{

    @Autowired
    UserRepository userRepository;

    @Autowired
    EventRepository eventRepository;

    @Autowired
    private EventService eventService;

    @Autowired
    private ParticipantService participantService;


    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> registerEvent(@RequestBody EventDTO eventDTO) {
        User user = getAuthenticatedUser();
        eventDTO.setOwnerId(user.getId());
        Event event = eventService.registerEvent(eventDTO);
        return ResponseEntity.ok(ApiResponse.success("Evento registrado com sucesso", event));
    }

    @PutMapping("/edit")
    public ResponseEntity<ApiResponse<?>> editEvent(@RequestBody EventDTO eventDTO, @RequestParam Long eventID) {
        User user = getAuthenticatedUser();
        eventService.updateEvent(eventID, eventDTO, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento editado com sucesso", null));
    }

    @GetMapping("/get")
    public ResponseEntity<ApiResponse<?>> getEventControll(@RequestParam Long eventID){
        Event event = eventService.getEvent(eventID);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<?>> deleteEventControll(@RequestParam Long eventID) {
        User user = getAuthenticatedUser();
        eventService.authorizeEditEvent(eventID, user.getId());
        eventService.deleteEvent(eventID);
        return ResponseEntity.ok(ApiResponse.success("Evento deletado com sucesso", null));
    }

    @PutMapping("/start")
    public ResponseEntity<ApiResponse<?>> startEventControll(@RequestParam Long eventID) {
        User user = getAuthenticatedUser();
        eventService.startEvent(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento iniciado com sucesso", null));
    }

    @PutMapping("/finish")
    public ResponseEntity<ApiResponse<?>> finishEventControll(@RequestParam Long eventID) {
        User user = getAuthenticatedUser();
        eventService.finishEvent(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento finalizado com sucesso", null));
    }

    @PutMapping("/cancel")
    public ResponseEntity<ApiResponse<?>> cancelEventControll(@RequestParam Long eventID) {
        User user = getAuthenticatedUser();
        eventService.cancelEvent(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento cancelado com sucesso", null));
    }

    @GetMapping("/get-myevents")
    public ResponseEntity<ApiResponse<?>> getMyEvents() {
        User user = getAuthenticatedUser();
        var events = eventService.getMyEvents(user.getId());
        if (events.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Não há eventos registrados, ou você não está inserido"));
        }
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/get-public")
    public ResponseEntity<ApiResponse<?>> getPublicEvents() {
        var events = eventService.getPublicEvents();
        if (events.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Não há eventos públicos registrados"));
        }
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/invite/validate")
    public ResponseEntity<ApiResponse<?>> validateInvite(@RequestParam String token, @RequestParam String code) {
        boolean valid = eventService.validateInvite(token, code);
        if (valid) {
            return ResponseEntity.ok(ApiResponse.success("Convite válido", null));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Convite inválido"));
        }
    }

    @PostMapping("/add-collaborator")
    public ResponseEntity<ApiResponse<?>> addCollaborator(@RequestParam Long eventID, @RequestParam Long userID) {
        User user = getAuthenticatedUser();
        eventService.addCollaborator(eventID, userID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Colaborador adicionado com sucesso", null));
    }

    @PostMapping("/create-with-invite")
    public ResponseEntity<ApiResponse<?>> createEventWithInvite() {
        User user = getAuthenticatedUser();
        Event event = eventService.createEventWithInvite(user.getId());
        var data = Map.of(
            "inviteToken", event.getInviteToken(),
            "inviteCode", event.getInviteCode()
        );
        return ResponseEntity.ok(ApiResponse.success("Evento criado com convite", data));
    }   
}
