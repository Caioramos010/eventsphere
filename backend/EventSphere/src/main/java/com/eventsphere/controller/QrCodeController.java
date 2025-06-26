package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.service.QrCodeService;
import com.eventsphere.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador para operações relacionadas ao QR Code
 */
@RestController
@RequestMapping("/api/qrcode")
public class QrCodeController {

    @Autowired
    private QrCodeService qrCodeService;
    
    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Endpoint para escanear e processar um QR Code
     *
     * @param codeOrQr Código QR ou código de texto
     * @return Resposta da API indicando sucesso ou falha
     */
    @PostMapping("/scan")
    public ApiResponse<?> scanQrCode(@RequestParam String codeOrQr) {
        String username = securityUtils.getAuthenticatedUser().getUsername();
        qrCodeService.processQrCodeWithPermission(codeOrQr, username);
        return ApiResponse.success("Presença confirmada com sucesso", null);
    }
}