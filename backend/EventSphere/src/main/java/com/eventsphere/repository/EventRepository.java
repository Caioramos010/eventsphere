package com.eventsphere.repository;

import com.eventsphere.entity.event.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface        EventRepository extends JpaRepository<Event, Long> {
    Event findByName(String name);

    Event findByDescription(String description);

    Event findByInviteToken(String inviteToken);

    @Query("SELECT e FROM Event e " +
            "JOIN e.participants p " +
            "WHERE p.id = :userID AND e.state IN ('CREATED', 'ACTIVE') " +
            "ORDER BY COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findAllMyEvents(@Param("userID") Long userID);

    @Query("SELECT e FROM Event e WHERE e.acess = 'PUBLIC' AND e.state IN ('CREATED', 'ACTIVE') ORDER BY " +
            "COALESCE(e.dateStart, e.dateFixedStart) ASC")
    List<Event> findAllpublicEvents();
}
