package com.eventsphere.utils;

import java.security.SecureRandom;
import java.util.Set;

/**
 * Gerador de códigos seguros para eventos
 * Gera códigos únicos de 8 caracteres com alta entropia
 */
public class EventCodeGenerator {
    
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;
    private static final SecureRandom random = new SecureRandom();
    
    /**
     * Gera um código de evento seguro e único
     * @param existingCodes Set de códigos já existentes para evitar duplicatas
     * @return Código único de 8 caracteres
     */
    public static String generateEventCode(Set<String> existingCodes) {
        String code;
        int attempts = 0;
        int maxAttempts = 100; // Limite de tentativas para evitar loop infinito
        
        do {
            code = generateRandomCode();
            attempts++;
            
            if (attempts > maxAttempts) {
                throw new RuntimeException("Não foi possível gerar um código único após " + maxAttempts + " tentativas");
            }
        } while (existingCodes.contains(code));
        
        return code;
    }
    
    /**
     * Gera um código de evento seguro (sem verificação de unicidade)
     * @return Código de 8 caracteres
     */
    public static String generateRandomCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(index));
        }
        
        return code.toString();
    }
    
    /**
     * Valida se um código tem o formato correto
     * @param code Código a ser validado
     * @return true se o código é válido
     */
    public static boolean isValidCodeFormat(String code) {
        if (code == null || code.length() != CODE_LENGTH) {
            return false;
        }
        
        return code.matches("[A-Z0-9]{" + CODE_LENGTH + "}");
    }
    
    /**
     * Calcula a entropia do sistema de códigos
     * @return Número total de combinações possíveis
     */
    public static long getTotalCombinations() {
        return (long) Math.pow(CHARACTERS.length(), CODE_LENGTH);
    }
}
