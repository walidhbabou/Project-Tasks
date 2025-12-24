package com.JwtSetup.JwtSetup.service;

import com.JwtSetup.JwtSetup.entity.Role;
import com.JwtSetup.JwtSetup.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class JwtUtilsTests {

    @Autowired
    private JwtUtils jwtUtils;

    private Authentication buildAuth(String username) {
        User u = new User();
        u.setId(1L);
        u.setUsername(username);
        u.setPassword("pass");
        Role r = new Role();
        r.setName("ROLE_USER");
        u.setRoles(new java.util.HashSet<>(java.util.List.of(r)));
        UserDetailsImpl details = UserDetailsImpl.build(u);
        return new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
    }

    @Test
    void generatesAndValidatesAccessToken() {
        Authentication auth = buildAuth("user");
        String access = jwtUtils.generateAccessToken(auth);
        assertNotNull(access);
        assertTrue(jwtUtils.validateJwtToken(access));
        assertEquals("user", jwtUtils.getUsernameFromToken(access));
    }

    @Test
    void generatesRefreshTokenDifferentFromAccess() {
        Authentication auth = buildAuth("user");
        String access = jwtUtils.generateAccessToken(auth);
        String refresh = jwtUtils.generateRefreshToken(auth);
        assertNotNull(refresh);
        assertNotEquals(access, refresh);
        assertTrue(jwtUtils.validateJwtToken(refresh));
    }
}
