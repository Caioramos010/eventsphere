package com.eventsphere.controller;

import ch.qos.logback.core.joran.conditional.IfAction;
import com.eventsphere.entity.User;
import com.eventsphere.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register/accept")
    public ResponseEntity<?> register(
            @RequestParam String name,
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String email,
            @RequestParam String photo) {
        if (userService.findByUsername(username) != null) {
            return ResponseEntity.badRequest().body("Usuário já existente");
        }
        if (userService.findByEmail(email) != null) {
            return ResponseEntity.badRequest().body("E-mail já existente");
        }
        if (!userService.validatePassword(password)) {
            return ResponseEntity.badRequest().body("Senha não contem 8 caracteres, letra maiuscula, minuscula ou caracter especial");
        }
        if (photo.isEmpty()) {
            userService.registerUser(name, username, password, email);
        }else{
            userService.registerUser(name, username, password, email, photo);
        }
        return ResponseEntity.ok().body("Registro realizado com sucesso");

    }

    @PostMapping("/login/accept")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {
        User user = userService.findByUsername(username);
            if (user == null || userService.validatePassword(password, user.getPassword())) {
            return ResponseEntity.badRequest().body("Usuário ou senha inválidos");
        }
        return ResponseEntity.ok().body("Login realizado com sucesso");
    }
}
