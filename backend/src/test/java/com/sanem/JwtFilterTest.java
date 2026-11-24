package com.sanem;

import com.sanem.model.entity.AppUser;
import com.sanem.model.entity.Profile;
import com.sanem.model.enums.Status;
import com.sanem.repository.AppUserRepository;
import com.sanem.security.JwtFilter;
import com.sanem.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtFilterTest {
    private JwtService jwtService;
    private AppUserRepository appUserRepository;
    private JwtFilter filter;

    @BeforeEach
    void setUp() {
        jwtService = mock(JwtService.class);
        appUserRepository = mock(AppUserRepository.class);
        filter = new JwtFilter(jwtService, appUserRepository);
        ReflectionTestUtils.setField(filter, "currentPrivacyPolicyVersion", "SANEM-PRIVACY-1.1");
        when(jwtService.extractLogin("test-token")).thenReturn("test-user");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void grantsAdministratorRoleOnlyWhenConsentIsCurrent() throws Exception {
        when(appUserRepository.findByLoginAndDeletedAtIsNull("test-user"))
                .thenReturn(Optional.of(user("Administrator", true, "SANEM-PRIVACY-1.1")));

        filterRequest();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertTrue(authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRATOR")));
        assertTrue(authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PRIVACY_ACCEPTED")));
    }

    @Test
    void mapsAttendantAndEvaluatorIndividually() throws Exception {
        when(appUserRepository.findByLoginAndDeletedAtIsNull("test-user"))
                .thenReturn(Optional.of(user("Attendant", true, "SANEM-PRIVACY-1.1")));
        filterRequest();
        assertHasAuthority("ROLE_ATTENDANT");
        assertMissingAuthority("ROLE_ADMINISTRATOR");

        SecurityContextHolder.clearContext();
        when(appUserRepository.findByLoginAndDeletedAtIsNull("test-user"))
                .thenReturn(Optional.of(user("Evaluator", true, "SANEM-PRIVACY-1.1")));
        filterRequest();
        assertHasAuthority("ROLE_EVALUATOR");
        assertMissingAuthority("ROLE_ATTENDANT");
    }

    @Test
    void doesNotGrantBusinessRoleForMissingOrOutdatedConsent() throws Exception {
        when(appUserRepository.findByLoginAndDeletedAtIsNull("test-user"))
                .thenReturn(Optional.of(user("Administrator", true, "SANEM-PRIVACY-1.0")));

        filterRequest();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertTrue(authentication.getAuthorities().isEmpty());
    }

    @Test
    void unknownProfileDoesNotReceiveBusinessRole() throws Exception {
        when(appUserRepository.findByLoginAndDeletedAtIsNull("test-user"))
                .thenReturn(Optional.of(user("Unknown profile", true, "SANEM-PRIVACY-1.1")));

        filterRequest();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertTrue(authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PRIVACY_ACCEPTED")));
        assertMissingAuthority("ROLE_ADMINISTRATOR");
        assertMissingAuthority("ROLE_ATTENDANT");
        assertMissingAuthority("ROLE_EVALUATOR");
    }

    private AppUser user(String profileName, boolean consent, String version) {
        Profile profile = new Profile();
        profile.setName(profileName);
        AppUser user = new AppUser();
        user.setLogin("test-user");
        user.setStatus(Status.ACTIVE);
        user.setProfile(profile);
        user.setPrivacyConsent(consent);
        user.setPrivacyConsentVersion(version);
        return user;
    }

    private void filterRequest() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer test-token");
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());
    }

    private void assertHasAuthority(String authority) {
        assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(value -> value.getAuthority().equals(authority)));
    }

    private void assertMissingAuthority(String authority) {
        assertFalse(SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(value -> value.getAuthority().equals(authority)));
    }
}
