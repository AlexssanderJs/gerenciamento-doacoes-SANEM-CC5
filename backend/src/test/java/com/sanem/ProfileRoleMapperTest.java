package com.sanem;

import com.sanem.security.ProfileRoleMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ProfileRoleMapperTest {
    @Test
    void mapsAdministratorAliases() {
        assertEquals("ROLE_ADMINISTRATOR", ProfileRoleMapper.toAuthority("Administrator").orElseThrow());
        assertEquals("ROLE_ADMINISTRATOR", ProfileRoleMapper.toAuthority("Administrador").orElseThrow());
    }

    @Test
    void mapsAttendantAndCollaboratorAliases() {
        assertEquals("ROLE_ATTENDANT", ProfileRoleMapper.toAuthority("Attendant").orElseThrow());
        assertEquals("ROLE_ATTENDANT", ProfileRoleMapper.toAuthority("Colaborador").orElseThrow());
    }

    @Test
    void mapsEvaluatorAliases() {
        assertEquals("ROLE_EVALUATOR", ProfileRoleMapper.toAuthority("Avaliador").orElseThrow());
    }

    @Test
    void unknownProfilesAreNotGrantedAnyRole() {
        assertTrue(ProfileRoleMapper.toAuthority("Visitante").isEmpty());
        assertTrue(ProfileRoleMapper.toAuthority(null).isEmpty());
    }
}
