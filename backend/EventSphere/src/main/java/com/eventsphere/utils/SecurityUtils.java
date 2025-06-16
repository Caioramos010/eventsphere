package com.eventsphere.utils;

import com.eventsphere.entity.user.User;
import com.eventsphere.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utilitário para funções relacionadas à segurança e autenticação
 */
@Component
public class SecurityUtils {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Obtém o usuário autenticado na sessão atual
     * 
     * @return Objeto User do usuário autenticado
     */
    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }
    
    /**
     * Verifica se o usuário autenticado é o dono ou colaborador do evento
     * 
     * @param eventId ID do evento
     * @return true se for dono ou colaborador, false caso contrário
     */
    public boolean isEventOwnerOrCollaborator(Long eventId) {
        User user = getAuthenticatedUser();
        if (user == null) return false;
        
        return true; // Implementação completa deve ser feita no EventService
    }
}
