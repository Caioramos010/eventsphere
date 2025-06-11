package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.service.QrCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qrcode")
public class QrCodeController {

    @Autowired
    private QrCodeService qrCodeService;

    @PostMapping("/scan")
    public ApiResponse<?> scanQrCode(@RequestParam String codeOrQr) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            String result = qrCodeService.processQrCodeWithPermission(codeOrQr, username);
            if (result == null) {
                return ApiResponse.success("Presença confirmada com sucesso", null);
            } else {
                return ApiResponse.error(result);
            }
        } catch (Exception e) {
            return ApiResponse.error("Erro ao processar QR code: " + e.getMessage());
        }
    }
}