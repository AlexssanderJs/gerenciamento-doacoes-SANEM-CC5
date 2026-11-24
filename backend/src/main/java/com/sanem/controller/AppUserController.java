package com.sanem.controller;

import com.sanem.model.dto.AppUserDTO;
import com.sanem.model.dto.AppUserFormDTO;
import com.sanem.model.dto.AppUserUpdateDTO;
import com.sanem.model.dto.ChangePasswordRequestDTO;
import com.sanem.model.entity.AppUser;
import com.sanem.service.AppUserService;
import com.sanem.service.AuthService;
import com.sanem.util.HttpUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class AppUserController {
    private final AppUserService userService;
    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<AppUserDTO> getCurrentUserProfile() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changeCurrentUserPassword(
            @RequestBody @Valid ChangePasswordRequestDTO request
    ) {
        userService.changeCurrentUserPassword(request);
        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso."));
    }

    @PostMapping("/me/consent")
    public ResponseEntity<Map<String, Object>> acceptPrivacyConsent(HttpServletRequest request) {
        authService.acceptPrivacyConsent(request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok(Map.of(
                "accepted", true,
                "version", authService.getCurrentPrivacyPolicyVersion()
        ));
    }

    @DeleteMapping("/me/consent")
    public ResponseEntity<Map<String, Boolean>> revokePrivacyConsent(HttpServletRequest request) {
        authService.revokePrivacyConsent(request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.ok(Map.of("accepted", false));
    }

    @GetMapping
    public ResponseEntity<Page<AppUserDTO>> listPaged(Pageable pageable) {
        Page<AppUser> userPage = userService.list(pageable);
        return ResponseEntity.ok(userService.generateUserDTOPage(userPage));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AppUserDTO>> list() {
        return ResponseEntity.ok(userService.generateUserDTOList(userService.list()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppUserDTO> get(@PathVariable Long id) {
        AppUser user = userService.getOrNull(id);
        return user == null ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(userService.generateUserDTO(user));
    }

    @PostMapping
    public ResponseEntity<AppUserDTO> create(
            @RequestBody @Valid AppUserFormDTO form,
            UriComponentsBuilder uriBuilder
    ) {
        AppUser user = userService.generateUser(form);
        userService.save(user);
        URI uri = HttpUtils.createURI(uriBuilder, "user", user.getUserId());
        return ResponseEntity.created(uri).body(userService.generateUserDTO(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @PathVariable Long id,
            @RequestBody @Valid AppUserUpdateDTO form
    ) {
        AppUser user = userService.getOrNull(id);
        if (user == null) return ResponseEntity.notFound().build();
        userService.updateUser(user, form);
        userService.save(user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        AppUser user = userService.getOrNull(id);
        if (user == null) return ResponseEntity.notFound().build();
        userService.delete(user);
        return ResponseEntity.noContent().build();
    }
}
