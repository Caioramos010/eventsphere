package com.eventsphere.repository;

import com.eventsphere.entity.event.Acess;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    Event findByName(String name);    Event findByDescription(String description);

    Optional<Event> findByInviteToken(String inviteToken);    /**
     * Encontra evento por código de convite
     * @param inviteCode Código de convite do evento
     * @return Evento encontrado ou null
     */
    Event findByInviteCode(String inviteCode);

    /**
     * Encontra eventos em que o usuário é um participante
     * @param userID ID do usuário
     * @return Lista de eventos
     */
    @Query("SELECT e FROM Event e " +
            "JOIN e.participants p " +
            "WHERE p.user.id = :userID AND e.state IN ('CREATED', 'ACTIVE') " +
            "ORDER BY COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findAllMyEvents(@Param("userID") Long userID);

    /**
     * Encontra eventos públicos ativos (não finalizados nem cancelados)
     * @return Lista de eventos públicos
     */
    @Query("SELECT e FROM Event e WHERE e.acess = 'PUBLIC' AND e.state IN ('CREATED', 'ACTIVE') ORDER BY " +
            "COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findAllpublicEvents();
    
    /**
     * Encontra eventos onde o usuário é o dono
     * @param ownerId ID do dono
     * @return Lista de eventos
     */
    List<Event> findByOwnerId(Long ownerId);
    
    /**
     * Encontra eventos onde o usuário é participante e que não estão no estado especificado
     * @param userId ID do usuário
     * @param state Estado a ser excluído
     * @return Lista de eventos
     */
    @Query("SELECT DISTINCT e FROM Event e JOIN e.participants p WHERE p.user.id = :userId AND e.state != :state")
    List<Event> findByParticipantsUserIdAndStateNot(@Param("userId") Long userId, @Param("state") State state);
    
    /**
     * Encontra eventos por tipo de acesso
     * @param acess Tipo de acesso
     * @return Lista de eventos
     */
    List<Event> findByAcess(Acess acess);
    
    /**
     * Encontra eventos por tipo de acesso excluindo estados específicos
     * @param acess Tipo de acesso
     * @param excludedStates Estados a serem excluídos
     * @return Lista de eventos
     */
    @Query("SELECT e FROM Event e WHERE e.acess = :acess AND e.state NOT IN :excludedStates ORDER BY COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findByAcessAndStateNotIn(@Param("acess") Acess acess, @Param("excludedStates") List<State> excludedStates);
    
    /**
     * Encontra eventos onde o usuário é o dono excluindo estados específicos
     * @param ownerId ID do dono
     * @param excludedStates Estados a serem excluídos
     * @return Lista de eventos
     */
    @Query("SELECT e FROM Event e WHERE e.owner.id = :ownerId AND e.state NOT IN :excludedStates ORDER BY COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findByOwnerIdAndStateNotIn(@Param("ownerId") Long ownerId, @Param("excludedStates") List<State> excludedStates);
    
    /**
     * Encontra eventos onde o usuário é participante
     * @param userId ID do usuário
     * @return Lista de eventos
     */
    @Query("SELECT e FROM Event e JOIN e.participants p WHERE p.user.id = :userId")
    List<Event> findEventsByParticipantUserId(@Param("userId") Long userId);
}
