package com.eventsphere.controller;

import ch.qos.logback.core.joran.conditional.IfAction;
import com.eventsphere.entity.User;
import com.eventsphere.service.UserService;
import com.eventsphere.utils.JwtUtil;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;


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
            userService.registerUser(username, name, email, password);
        }
        else{
            userService.registerUser(username, name, email, password, photo);
        }
        return ResponseEntity.ok().body("Registro realizado com sucesso");

    }

    @PostMapping("/login/accept")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {
        try {
            User user = userService.findByUsername(username);
            if (user == null || !userService.validatePassword(password, user.getPassword())) {
                return ResponseEntity.badRequest().body("Usuário ou senha inválidos");
            }
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username,password));
            String token = jwtUtil.generateToken(username);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok().body(response);

        }catch (Exception e){
            return  ResponseEntity.status(401).body("Erro ao realizar login");
        }


    }
}
