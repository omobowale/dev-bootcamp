package com.trainingplatform.dto;

public record LoginResponse(String token, String email, String name, String role) {
}
