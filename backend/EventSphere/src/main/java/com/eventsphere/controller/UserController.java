package com.eventsphere.controller;

import com.eventsphere.entity.User;
import com.eventsphere.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/get")
    public ResponseEntity<?> getUser(@RequestParam Long userID){
        return ResponseEntity.ok().body(userService.getUserDisplay(userID));
    }


    @PutMapping("/update-name")
    public ResponseEntity<?> updateUserName(@RequestParam Long userID, @RequestParam String newName){
        if(userService.validateNewName(userID, newName)){
            return ResponseEntity.badRequest().body("Nome igual ao anterior, ou inválido");
        }else{
            userService.updateName(userID, newName);
            return ResponseEntity.ok().body("Nome atualizado com sucesso");
        }
    }

    @PutMapping("/update-email")
    public ResponseEntity<?> updateUserEmail(@RequestParam Long userID, @RequestParam String newEmail){
        if(userService.validateNewEmail(userID, newEmail)){
            return ResponseEntity.badRequest().body("Email igual ao anterior, ou já registrado");
        }else{
            userService.updateEmail(userID, newEmail);
            return ResponseEntity.ok().body("Email atualizado com sucesso");
        }
    }
    @PutMapping("/update-username")
    public ResponseEntity<?> updateUserUsername(@RequestParam Long userID, @RequestParam String newUsername){
        if(userService.validateNewUsername(userID, newUsername)){
            return ResponseEntity.badRequest().body("Login igual ao anterior, ou inválido");
        }else{
            userService.updateUsername(userID, newUsername);
            return ResponseEntity.ok().body("Login atualizado com sucesso");
        }
    }

    @PutMapping("/update-passowrd")
    public ResponseEntity<?> updateUserPassword(@RequestParam Long userID, @RequestParam String password, @RequestParam String newPassword){
        if(userService.validateNewPassword(password, newPassword)){
            return ResponseEntity.badRequest().body("Senha igual a anterior, ou Senha não contem 8 caracteres, letra maiuscula, minuscula ou caracter especial");
        }else{
            userService.updatePassword(userID, newPassword);
            return ResponseEntity.ok().body("Senha atualizada com sucesso");
        }
    }
    @PutMapping("/update-photo")
    public ResponseEntity<?> updateUserPhoto(@RequestParam Long userID, @RequestParam String newPhoto ){
        if(userService.validateNewPhoto(userID, newPhoto)){
            return ResponseEntity.badRequest().body("Foto igual a anterior, ou inválida");
        }else{
            userService.updatePhoto(userID, newPhoto);
            return ResponseEntity.ok().body("Foto atualizada com sucesso");
        }
    }
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser(@RequestParam Long userID, @RequestParam String username, @RequestParam String password ){
        User user = userService.findByUsername(username);
        if (user == null || userService.validatePassword(password, user.getPassword()) || userService.findByUsername(username) == null){
            return ResponseEntity.badRequest().body("Senha ou login inválidos");
        }else {
            userService.deleteUser(userID);
            return ResponseEntity.ok().body("Usuário deletado com sucesso");
        }

    }

}
