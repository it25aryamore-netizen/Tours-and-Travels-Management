package com.toursandtravels.dto;

public record AuthResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        Long userId,
        String name,
        String email,
        String role) {
}
