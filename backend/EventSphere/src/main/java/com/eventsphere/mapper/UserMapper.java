package com.eventsphere.mapper;

import com.eventsphere.dto.UserDTO;
import com.eventsphere.dto.UserDisplayDTO;
import com.eventsphere.dto.UserProfileDTO;
import com.eventsphere.entity.user.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRoles(user.getRoles());
        dto.setRegisterDate(user.getRegisterDate());
        dto.setPhoto(user.getPhoto());

        
        return dto;
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setId(dto.getId());
        user.setUsername(dto.getUsername());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRoles(dto.getRoles());
        user.setRegisterDate(dto.getRegisterDate());
        user.setPassword(dto.getPassword());
        user.setPhoto(dto.getPhoto());
        
        return user;
    }

    public UserDisplayDTO toDisplayDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDisplayDTO dto = new UserDisplayDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setPhoto(user.getPhoto());
        
        return dto;
    }

    public UserProfileDTO toProfileDTO(User user) {
        if (user == null) {
            return null;
        }

        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoto(user.getPhoto());
        dto.setRegisterDate(user.getRegisterDate());
        dto.setBlocked(user.isBlocked());
        
        return dto;
    }

    public List<UserDTO> toDTOList(List<User> users) {
        if (users == null) {
            return null;
        }

        List<UserDTO> dtos = new ArrayList<>();
        for (User user : users) {
            dtos.add(toDTO(user));
        }
        return dtos;
    }

    public List<UserDisplayDTO> toDisplayDTOList(List<User> users) {
        if (users == null) {
            return null;
        }

        List<UserDisplayDTO> dtos = new ArrayList<>();
        for (User user : users) {
            dtos.add(toDisplayDTO(user));
        }
        return dtos;
    }

    public void updateEntity(User user, UserDTO dto) {
        if (user == null || dto == null) {
            return;
        }

        user.setUsername(dto.getUsername());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(dto.getPassword());
        }
        user.setPhoto(dto.getPhoto());

    }
}