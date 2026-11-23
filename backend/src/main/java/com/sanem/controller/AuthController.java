package com.sanem.controller;

import com.sanem.model.dto.ForgotPasswordRequestDTO;
import com.sanem.model.dto.LoginRequestDTO;
import com.sanem.model.dto.ResetPasswordRequestDTO;
import com.sanem.model.dto.ValidateResetTokenRequestDTO;
import com.sanem.model.dto.LoginResponseDTO;
import com.sanem.service.AuthService;
import com.sanem.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final PasswordResetService passwordResetService;

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO loginRequest) {
      try {
          LoginResponseDTO response = authService.authenticate(loginRequest);
          return ResponseEntity.ok(response);
      } catch (Exception e) {
          return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
      }
  }

  @PostMapping("/validate")
  public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
      try {
          String rawToken = token.startsWith("Bearer ") ? token.substring(7) : token;
          boolean isValid = authService.validateToken(rawToken);
          return ResponseEntity.ok(isValid);
      } catch (Exception e) {
          return ResponseEntity.ok(false);
      }
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<Map<String, String>> forgotPassword(
          @RequestBody @Valid ForgotPasswordRequestDTO request
  ) {
      passwordResetService.requestPasswordReset(request.email());
      return ResponseEntity.ok(Map.of(
              "message",
              "Se o e-mail estiver cadastrado e ativo, você receberá as instruções para redefinir sua senha."
      ));
  }

  @PostMapping("/reset-password/validate")
  public ResponseEntity<Map<String, Boolean>> validateResetToken(
          @RequestBody @Valid ValidateResetTokenRequestDTO request
  ) {
      boolean valid = passwordResetService.isResetTokenValid(request.token());
      return ResponseEntity.ok(Map.of("valid", valid));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<Map<String, String>> resetPassword(
          @RequestBody @Valid ResetPasswordRequestDTO request
  ) {
      passwordResetService.resetPassword(request);
      return ResponseEntity.ok(Map.of(
              "message",
              "Senha redefinida com sucesso. Você já pode entrar no sistema."
      ));
  }
}
