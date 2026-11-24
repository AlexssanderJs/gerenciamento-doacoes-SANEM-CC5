package com.sanem.service;

import com.sanem.exception.EntityNotFoundException;
import com.sanem.model.dto.AppUserFormDTO;
import com.sanem.model.dto.AppUserUpdateDTO;
import com.sanem.model.dto.ChangePasswordRequestDTO;
import com.sanem.model.dto.AppUserDTO;
import com.sanem.model.entity.AppUser;
import com.sanem.mapper.AppUserCreateMapper;
import com.sanem.mapper.AppUserDTOMapper;
import com.sanem.mapper.AppUserUpdateMapper;
import com.sanem.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final AppUserCreateMapper appUserCreateMapper;
    private final AppUserDTOMapper appUserDTOMapper;
    private final AppUserUpdateMapper appUserUpdateMapper;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AppUserDTO getCurrentUserProfile() {
        return generateUserDTO(authService.getCurrentUser());
    }

    @Transactional
    public void changeCurrentUserPassword(ChangePasswordRequestDTO dto) {
        AppUser currentUser = authService.getCurrentUser();

        if (!passwordEncoder.matches(dto.currentPassword(), currentUser.getPasswordHash())) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }

        if (!dto.newPassword().equals(dto.confirmPassword())) {
            throw new IllegalArgumentException("A confirmação da nova senha não confere.");
        }

        if (passwordEncoder.matches(dto.newPassword(), currentUser.getPasswordHash())) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da senha atual.");
        }

        currentUser.setPasswordHash(passwordEncoder.encode(dto.newPassword()));
        appUserRepository.save(currentUser);
    }

    public AppUser generateUser(AppUserFormDTO appUserFormDTO) {
        return appUserCreateMapper.convert(appUserFormDTO);
    }

    public void save (AppUser user) {
        appUserRepository.save(user);
    }

    public AppUserDTO generateUserDTO(AppUser user) {
        return appUserDTOMapper.convert(user);
    }

    public AppUser getOrNull(Long id){
        return appUserRepository.findById(id).orElse(null);
    }

    public void updateUser(AppUser user, AppUserFormDTO appUserFormDTO) {
        appUserUpdateMapper.update(user, appUserFormDTO);
    }

    public void updateUser(AppUser user, AppUserUpdateDTO appUserUpdateDTO) {
        appUserUpdateMapper.update(user, appUserUpdateDTO);
    }

    public void delete(AppUser user) {
        AppUser usuarioLogado = authService.getCurrentUser();

        if (usuarioLogado.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Você não pode deletar sua própria conta");
        }

        try {
            appUserRepository.delete(user);
        } catch (Exception e) {
            throw new RuntimeException(
                "Não é possível excluir usuário vinculado a doações."
            );
        }
    }

    public List<AppUser> list() {
        return appUserRepository.findAll();
    }

    public Page<AppUser> list(Pageable pageable) {
        return appUserRepository.findAll(pageable);
    }

    public Page<AppUserDTO> generateUserDTOPage(Page<AppUser> userPage) {
        return userPage.map(this::generateUserDTO);
    }

    public List<AppUserDTO> generateUserDTOList(List<AppUser> userList) {
        return userList.stream().map(appUserDTOMapper::convert).toList();
    }

    public AppUser getOrThrowException(Long id) {
        return appUserRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("User", id)
        );
    }

}