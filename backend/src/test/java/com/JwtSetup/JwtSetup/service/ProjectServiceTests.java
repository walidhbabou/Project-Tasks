package com.JwtSetup.JwtSetup.service;

import com.JwtSetup.JwtSetup.dto.ProjectDTO;
import com.JwtSetup.JwtSetup.entity.Project;
import com.JwtSetup.JwtSetup.entity.Task;
import com.JwtSetup.JwtSetup.entity.User;
import com.JwtSetup.JwtSetup.repo.ProjectRepository;
import com.JwtSetup.JwtSetup.repo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTests {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProjectService projectService;

    private User user;

    @BeforeEach
    void setup() {
        user = new User();
        user.setId(1L);
        user.setUsername("user");
    }

    @Test
    void getProjectByIdOnlyOwnerCanAccess() {
        Project p = new Project();
        p.setId(10L);
        p.setUser(user);
        when(projectRepository.findByIdAndUserUsername(10L, "user")).thenReturn(Optional.of(p));

        ProjectDTO dto = projectService.getProjectById(10L, "user");
        assertEquals(10L, dto.getId());
    }

    @Test
    void createProjectAssignsOwnerAndDefaults() {
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));

        Project toSave = new Project();
        toSave.setId(20L);
        toSave.setUser(user);
        when(projectRepository.save(any())).thenAnswer(inv -> {
            Project saved = inv.getArgument(0);
            saved.setId(20L);
            return saved;
        });

        ProjectDTO created = projectService.createProject(new ProjectDTO(null, "My Project", "desc"), "user");
        assertNotNull(created.getId());
        assertEquals("My Project", created.getName());
    }

    @Test
    void getProjectProgressCountsTasks() {
        Task t1 = new Task(); t1.setCompleted(false);
        Task t2 = new Task(); t2.setCompleted(true);
        Project p = new Project();
        p.setId(30L);
        p.setUser(user);
        p.setTasks(java.util.List.of(t1, t2));
        when(projectRepository.findByIdAndUserUsername(30L, "user")).thenReturn(Optional.of(p));

        ProjectDTO dto = projectService.getProjectProgress(30L, "user");
        assertEquals(2, dto.getTotalTasks());
        assertEquals(1, dto.getCompletedTasks());
        assertTrue(dto.getProgress() >= 0.0);
    }
}
