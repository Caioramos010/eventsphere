package com.eventsphere.mapper;

import com.eventsphere.dto.ParticipantHistoryDTO;
import com.eventsphere.entity.event.ParticipantHistory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ParticipantHistoryMapper {

    public ParticipantHistoryDTO toDTO(ParticipantHistory history) {
        if (history == null) {
            return null;
        }

        ParticipantHistoryDTO dto = new ParticipantHistoryDTO();
        dto.setId(history.getId());
        dto.setCurrentStatus(history.getStatus());
        
        if (history.getParticipant() != null) {
            if (history.getParticipant().getEvent() != null) {
                dto.setEventId(history.getParticipant().getEvent().getId());
            }
            if (history.getParticipant().getUser() != null) {
                dto.setUserId(history.getParticipant().getUser().getId());
            }
        }
        return dto;
    }

    public ParticipantHistory toEntity(ParticipantHistoryDTO dto) {
        if (dto == null) {
            return null;
        }
        ParticipantHistory history = new ParticipantHistory();
        history.setId(dto.getId());
        history.setStatus(dto.getCurrentStatus());
        return history;
    }
    public List<ParticipantHistoryDTO> toDTOList(List<ParticipantHistory> histories) {
        if (histories == null) {
            return null;
        }
        return histories.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ParticipantHistory> toEntityList(List<ParticipantHistoryDTO> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    public ParticipantHistoryDTO toBasicDTO(ParticipantHistory history) {
        if (history == null) {
            return null;
        }

        ParticipantHistoryDTO dto = new ParticipantHistoryDTO();
        dto.setId(history.getId());
        dto.setCurrentStatus(history.getStatus());
        return dto;
    }

    public List<ParticipantHistoryDTO> toBasicDTOList(List<ParticipantHistory> histories) {
        if (histories == null) {
            return null;
        }
        return histories.stream()
                .map(this::toBasicDTO)
                .collect(Collectors.toList());
    }
}
