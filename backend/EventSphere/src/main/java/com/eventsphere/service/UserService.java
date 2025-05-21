package com.eventsphere.service;

import com.eventsphere.entity.User;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(String username, String name, String email, String password, String photo) {
        User user = new User();
        user.setUsername(username);
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRegisterDate(LocalDateTime.now());
        if (!photo.isEmpty()) {
            user.setPhoto(photo);
        }
        return userRepository.save(user);
    }

    public User registerUser(String username, String name, String email, String password) {
        User user = new User();
        user.setUsername(username);
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRegisterDate(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User updateName(Long userID, String newName) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        user.setName(newName);
        return userRepository.save(user);
    }

    public User updateEmail(Long userID, String newEmail) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        user.setEmail(newEmail);
        return userRepository.save(user);
    }

    public User updatePassword(Long userID, String newPassword) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    public User updatePhoto(Long userID, String newPhoto) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        user.setPhoto(newPhoto);
        return userRepository.save(user);
    }
    public User updateUsername(Long userID, String newUsername) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        user.setUsername(newUsername);
        return userRepository.save(user);
    }
    public void deleteUser(Long userID) {
        userRepository.deleteById(userID);
    }


    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public boolean validatePassword(String password) {
        return password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
    }

    public boolean validateNewPassword(String password, String newPassword) {
        return !password.equals(newPassword) && validatePassword(newPassword);
    }

    public boolean validateNewName(Long userID, String newName) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        return user.getName().equals(newName);
    }
    public boolean validateNewUsername(Long userID, String newUsername) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        return user.getName().equals(newUsername) && userRepository.findByUsername(newUsername) == null;
    }

    public boolean validateNewEmail(Long userID, String newEmail) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        return user.getEmail().equals(newEmail) && userRepository.findByUsername(newEmail) == null;
    }
    public boolean validateNewPhoto(Long userID, String newPhoto) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        return user.getPhoto().equals(newPhoto);
    }
}





