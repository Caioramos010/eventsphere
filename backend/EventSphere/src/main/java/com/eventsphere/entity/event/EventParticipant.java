package com.eventsphere.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Entity
public class EventParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipantStatus currentStatus;

    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ParticipantHistory> participantHistory = new ArrayList<>();

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public ParticipantStatus getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(ParticipantStatus currentStatus) {
        this.currentStatus = currentStatus;
    }

    public List<ParticipantHistory> getParticipantHistory() {
        return participantHistory;
    }

    public void setParticipantHistory(List<ParticipantHistory> participantHistory) {
        this.participantHistory = participantHistory;
    }
}

