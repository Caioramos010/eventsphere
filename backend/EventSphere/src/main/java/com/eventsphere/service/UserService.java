package com.eventsphere.service;

import com.eventsphere.entity.Role;
import com.eventsphere.entity.User;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    public UserService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }


    public User registerUser(String username, String name, String email, String password, String photo) {
        User user = new User();
        user.setUsername(username);
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(Set.of(Role.ROLE_USER.name()));
        user.setRegisterDate(LocalDateTime.now());
        user.setPhoto(photo);
        return userRepository.save(user);
    }

    public User registerUser(String username, String name, String email, String password) {
        User user = new User();
        user.setUsername(username);
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(Set.of(Role.ROLE_USER.name()));
        user.setRegisterDate(LocalDateTime.now());
        return userRepository.save(user);
    }
    public User getUser(Long userID){
        return userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
    }
    public User getUserDisplay(Long userID) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        user.setPassword("*******");
        return user;
    }
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            user.setPassword("*******");
        }
        return users;
    }

    public User updateName(Long userID, String newName) {
        getUser(userID).setName(newName);
        return userRepository.save(getUser(userID));
    }

    public User updateEmail(Long userID, String newEmail) {
        getUser(userID).setEmail(newEmail);
        return userRepository.save(getUser(userID));
    }

    public User updatePassword(Long userID, String newPassword) {
        getUser(userID).setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(getUser(userID));
    }

    public User updatePhoto(Long userID, String newPhoto) {
        getUser(userID).setPhoto(newPhoto);
        return userRepository.save(getUser(userID));
    }
    public User updateUsername(Long userID, String newUsername) {
        getUser(userID).setUsername(newUsername);
        return userRepository.save(getUser(userID));
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
        return getUser(userID).getName().equals(newName);
    }
    public boolean validateNewUsername(Long userID, String newUsername) {
        return getUser(userID).getName().equals(newUsername) && userRepository.findByUsername(newUsername) == null;
    }

    public boolean validateNewEmail(Long userID, String newEmail) {
        return getUser(userID).getEmail().equals(newEmail) && userRepository.findByUsername(newEmail) == null;
    }
    public boolean validateNewPhoto(Long userID, String newPhoto) {
        return getUser(userID).getPhoto().equals(newPhoto);
    }
}





