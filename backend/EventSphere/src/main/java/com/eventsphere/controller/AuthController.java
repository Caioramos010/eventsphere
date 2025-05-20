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
    private  static final String PASSWORD_PATTERN =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    @PostMapping("/register/accept")
    public ResponseEntity<?> register(
            @RequestParam String name,
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String email,
            @RequestParam String photo

            ) {
        if (userService.findByUsername(username) != null) {
            return ResponseEntity.badRequest().body("Usuário já existente");
        }
        if (userService.findByEmail(email) != null) {
            return ResponseEntity.badRequest().body("E-mail já existente");
        }
        if (password.length() < 8 || !password.matches(PASSWORD_PATTERN)) {
            return ResponseEntity.badRequest().body("Senha não contem 8 caracteres, letra maiuscula, minuscula ou caracter especial");
        }
        userService.registerUser(name, username, password, email, photo);
        return ResponseEntity.ok().build();

    }

    @PostMapping("/login/accept")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {
        User user = userService.findByUsername(username);
        if (user == null || userService.validatePassword(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok().build();
    }
}
