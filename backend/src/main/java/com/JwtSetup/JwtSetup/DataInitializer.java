package com.JwtSetup.JwtSetup;


import com.JwtSetup.JwtSetup.entity.Role;
import com.JwtSetup.JwtSetup.entity.User;

import com.JwtSetup.JwtSetup.repo.RoleRepository;
import com.JwtSetup.JwtSetup.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Créer un rôle USER si non existant
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            roleRepository.save(userRole);
        }

        // Créer un utilisateur standard si non existant (rôle unique USER)
        if (userRepository.findByUsername("user@gmail.com").isEmpty()) {
            User user = new User();
            user.setUsername("user@gmail.com");
            user.setPassword(passwordEncoder.encode("1234"));
            user.setEnabled(true);
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName("ROLE_USER").get());
            user.setRoles(roles);
            userRepository.save(user);
            System.out.println("Utilisateur user créé !");
        }
    }
}
