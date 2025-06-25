package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.entity.user.User;
import com.eventsphere.service.UserService;
import com.eventsphere.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private SecurityUtils securityUtils;    @GetMapping("/get")
    public ResponseEntity<ApiResponse<?>> getUser() {
        User user = securityUtils.getAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(userService.getUserDisplay(user.getId())));
    }

    @PutMapping("/update-name")
    public ResponseEntity<ApiResponse<?>> updateUserName(@RequestParam String newName) {
        User user = securityUtils.getAuthenticatedUser();
        userService.updateName(user.getId(), newName);
        return ResponseEntity.ok(ApiResponse.success("Nome atualizado com sucesso", null));
    }

    @PutMapping("/update-email")
    public ResponseEntity<ApiResponse<?>> updateUserEmail(@RequestParam String newEmail){
        User user = securityUtils.getAuthenticatedUser();
        userService.updateEmail(user.getId(), newEmail);
        return ResponseEntity.ok(ApiResponse.success("Email atualizado com sucesso", null));
    }

    @PutMapping("/update-username")
    public ResponseEntity<ApiResponse<?>> updateUserUsername(@RequestParam String newUsername){
        User user = securityUtils.getAuthenticatedUser();
        userService.updateUsername(user.getId(), newUsername);
        return ResponseEntity.ok(ApiResponse.success("Login atualizado com sucesso", null));
    }

    @PutMapping("/update-passowrd")
    public ResponseEntity<ApiResponse<?>> updateUserPassword(@RequestParam String currentPassword, @RequestParam String newPassword){
        User user = securityUtils.getAuthenticatedUser();
        userService.updatePassword(user.getId(), currentPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Senha atualizada com sucesso", null));
    }

    @PutMapping("/update-photo")
    public ResponseEntity<ApiResponse<?>> updateUserPhoto(@RequestParam String newPhoto ){
        User user = securityUtils.getAuthenticatedUser();
        userService.updatePhoto(user.getId(), newPhoto);
        return ResponseEntity.ok(ApiResponse.success("Foto atualizada com sucesso", null));
    }    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<?>> deleteUser(@RequestParam String password) {
        try {
            User user = securityUtils.getAuthenticatedUser();
            userService.deleteUserWithPasswordCheck(user.getId(), password);
            return ResponseEntity.ok(ApiResponse.success("Conta bloqueada com sucesso. Todas as participações foram removidas.", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Erro interno do servidor: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Erro inesperado ao bloquear usuário"));
        }
    }
}
