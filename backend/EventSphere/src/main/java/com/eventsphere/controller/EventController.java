package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.EventDTO;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.user.User;
import com.eventsphere.service.EventService;
import com.eventsphere.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador para gerenciamento de eventos
 */
@RequestMapping("/api/event")
@RestController
public class EventController {

    @Autowired
    private EventService eventService;
    
    @Autowired
    private SecurityUtils securityUtils;
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> registerEvent(@RequestBody EventDTO eventDTO) {
        User user = securityUtils.getAuthenticatedUser();
        eventDTO.setOwnerId(user.getId());
        Event event = eventService.registerEvent(eventDTO);
        EventDTO resultDTO = eventService.convertToDTO(event);
        return ResponseEntity.ok(ApiResponse.success("Evento registrado com sucesso", resultDTO));
    }

    /**
     * Edita um evento existente
     * 
     * @param eventDTO Dados atualizados do evento
     * @param eventID ID do evento a ser editado
     * @return Resposta de sucesso
     */
    @PutMapping("/edit")
    public ResponseEntity<ApiResponse<?>> editEvent(@RequestBody EventDTO eventDTO, @RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.updateEvent(eventID, eventDTO, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento editado com sucesso", null));
    }    /**
     * Obtém detalhes de um evento específico com informações do status do usuário
     * 
     * @param eventID ID do evento
     * @return Dados do evento com informações do usuário
     */
    @GetMapping("/get")
    public ResponseEntity<ApiResponse<?>> getEventControll(@RequestParam Long eventID){
        User user = securityUtils.getAuthenticatedUser();
        EventDTO eventDTO = eventService.getEventWithUserInfo(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success(eventDTO));
    }

    /**
     * Remove um evento
     * 
     * @param eventID ID do evento a ser removido
     * @return Resposta de sucesso
     */
    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<?>> deleteEventControll(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.authorizeEditEvent(eventID, user.getId());
        eventService.deleteEvent(eventID);
        return ResponseEntity.ok(ApiResponse.success("Evento deletado com sucesso", null));
    }

    /**
     * Inicia um evento
     * 
     * @param eventID ID do evento a ser iniciado
     * @return Resposta de sucesso
     */
    @PutMapping("/start")
    public ResponseEntity<ApiResponse<?>> startEventControll(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.startEvent(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento iniciado com sucesso", null));
    }

    /**
     * Finaliza um evento
     * 
     * @param eventID ID do evento a ser finalizado
     * @return Resposta de sucesso
     */
    @PutMapping("/finish")
    public ResponseEntity<ApiResponse<?>> finishEventControll(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.finishEvent(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento finalizado com sucesso", null));
    }

    /**
     * Cancela um evento
     * 
     * @param eventID ID do evento a ser cancelado
     * @return Resposta de sucesso
     */
    @PutMapping("/cancel")
    public ResponseEntity<ApiResponse<?>> cancelEventControll(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.cancelEvent(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento cancelado com sucesso", null));
    }    /**
     * Obtém todos os eventos relacionados ao usuário atual
     * 
     * @return Lista de eventos do usuário
     */
    @GetMapping("/get-myevents")
    public ResponseEntity<ApiResponse<?>> getMyEvents() {
        User user = securityUtils.getAuthenticatedUser();
        List<EventDTO> events = eventService.getMyEventsWithUserInfo(user.getId());
        return ResponseEntity.ok(ApiResponse.success(events));
    }
      /**
     * Obtém todos os eventos públicos
     * 
     * @return Lista de eventos públicos
     */
    @GetMapping("/get-public")
    public ResponseEntity<ApiResponse<?>> getPublicEvents() {
        User user = securityUtils.getAuthenticatedUser();
        List<EventDTO> events = eventService.getPublicEventsWithUserInfo(user.getId());
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    /**
     * Adiciona um colaborador a um evento
     * 
     * @param eventID ID do evento
     * @param userID ID do usuário a ser adicionado como colaborador
     * @return Resposta de sucesso
     */
    @PostMapping("/add-collaborator")
    public ResponseEntity<ApiResponse<?>> addCollaborator(@RequestParam Long eventID, @RequestParam Long userID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.addCollaborator(eventID, userID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Colaborador adicionado com sucesso", null));
    }

    /**
     * Cria um convite para um evento existente
     * 
     * @param eventID ID do evento para o qual criar o convite
     * @return Resposta com os dados do convite
     */    @PostMapping("/create-with-invite")
    public ResponseEntity<ApiResponse<?>> createEventWithInvite(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        String inviteToken = eventService.generateInviteLink(eventID, user.getId());
        Event event = eventService.getEvent(eventID);
        
        var data = Map.of(
            "inviteToken", inviteToken,
            "inviteCode", event.getInviteCode()
        );
        return ResponseEntity.ok(ApiResponse.success("Convite criado com sucesso", data));
    }
    
    /**
     * Gera link de convite para um evento
     * 
     * @param eventID ID do evento
     * @return Token de convite
     */
    @GetMapping("/invite/generate")
    public ResponseEntity<ApiResponse<?>> generateInviteLink(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        String inviteToken = eventService.generateInviteLink(eventID, user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("inviteToken", inviteToken);
        response.put("inviteUrl", "http://localhost:3000/invite/" + inviteToken);
        
        return ResponseEntity.ok(ApiResponse.success("Link de convite gerado com sucesso", response));
    }
    
    /**
     * Valida um token de convite
     * 
     * @param token Token de convite
     * @return Dados do evento
     */
    @GetMapping("/invite/validate")
    public ResponseEntity<ApiResponse<?>> validateInviteToken(@RequestParam String token) {
        EventDTO eventDTO = eventService.validateInviteToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token válido", eventDTO));
    }

    /**
     * Valida um código de evento
     * 
     * @param eventCode Código do evento
     * @return Dados do evento
     */    @GetMapping("/validate-code")
    public ResponseEntity<ApiResponse<?>> validateEventCode(@RequestParam String eventCode) {
        try {
            EventDTO eventDTO = eventService.validateEventCodeSimple(eventCode);
            return ResponseEntity.ok(ApiResponse.success("Código válido", eventDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    /**
     * Obter eventos onde o usuário é participante
     */
    @GetMapping("/participating")
    public ResponseEntity<ApiResponse<?>> getParticipatingEvents() {
        User user = securityUtils.getAuthenticatedUser();
        List<EventDTO> participatingEvents = eventService.getParticipatingEventsForUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Eventos carregados com sucesso", participatingEvents));
    }

    /**
     * Obtém detalhes de um evento específico por ID (path variable)
     * 
     * @param eventId ID do evento na URL
     * @return Dados do evento com informações do usuário
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<?>> getEventById(@PathVariable Long eventId) {
        try {
            User user = securityUtils.getAuthenticatedUser();
            EventDTO eventDTO = eventService.getEventWithUserInfo(eventId, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Evento encontrado", eventDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    /**
     * Obtém os próximos eventos (não finalizados nem cancelados)
     * @return Lista de eventos futuros
     */
    @GetMapping("/next-events")
    public ResponseEntity<ApiResponse<?>> getNextEvents() {
        User user = securityUtils.getAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(eventService.getNextEventsWithUserInfo(user.getId())));
    }

    /**
     * Obtém os próximos eventos públicos (não finalizados nem cancelados)
     * @return Lista de eventos públicos futuros
     */
    @GetMapping("/next-public-events")
    public ResponseEntity<ApiResponse<?>> getNextPublicEvents() {
        User user = securityUtils.getAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(eventService.getNextPublicEventsWithUserInfo(user.getId())));
    }


    @PostMapping("/{eventId}/ensure-code")
    public ResponseEntity<ApiResponse<?>> ensureEventCode(@PathVariable Long eventId) {
        try {
            String inviteCode = eventService.ensureEventHasInviteCode(eventId);
            var data = Map.of("inviteCode", inviteCode);
            return ResponseEntity.ok(ApiResponse.success("Código de convite disponível", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

}
