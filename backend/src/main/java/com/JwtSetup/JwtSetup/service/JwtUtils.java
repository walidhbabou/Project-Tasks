package com.JwtSetup.JwtSetup.service;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.accessTokenExpirationMs}")
    private int jwtAccessExpirationMs;

    @Value("${jwt.refreshTokenExpirationMs}")
    private int jwtRefreshExpirationMs;

    private final PasswordEncoder passwordEncoder;

    public JwtUtils(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public String generateAccessToken(Authentication authentication) {
        if (authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
            return generateToken(userPrincipal.getUsername(), jwtAccessExpirationMs);
        } else {
            throw new IllegalArgumentException("Principal is not an instance of UserDetails");
        }
    }

    public String generateRefreshToken(Authentication authentication) {
        if (authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
            return generateToken(userPrincipal.getUsername(), jwtRefreshExpirationMs);
        } else {
            throw new IllegalArgumentException("Principal is not an instance of UserDetails");
        }
    }

    private String generateToken(String username, int expirationMs) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public boolean validateJwtToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody().getSubject();
    }

    public String hashRefreshToken(String refreshToken) {
        return passwordEncoder.encode(refreshToken);
    }

    public boolean validateRefreshToken(String rawRefreshToken, String hashedRefreshToken) {
        return passwordEncoder.matches(rawRefreshToken, hashedRefreshToken);
    }
    public boolean isRefreshToken(String token) {
        try {
            Claims claims = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody();
            return claims.getExpiration().getTime() > System.currentTimeMillis() + jwtAccessExpirationMs;
        } catch (Exception e) {
            return false;
        }
    }

}
