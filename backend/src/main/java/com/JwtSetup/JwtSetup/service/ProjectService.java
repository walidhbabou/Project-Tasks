package com.JwtSetup.JwtSetup.service;

import com.JwtSetup.JwtSetup.dto.ProjectDTO;
import com.JwtSetup.JwtSetup.dto.TaskDTO;
import com.JwtSetup.JwtSetup.entity.Project;
import com.JwtSetup.JwtSetup.entity.Task;
import com.JwtSetup.JwtSetup.entity.User;
import com.JwtSetup.JwtSetup.repo.ProjectRepository;
import com.JwtSetup.JwtSetup.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskService taskService;

    public List<ProjectDTO> getUserProjects(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Project> projects = projectRepository.findByUserId(user.getId());
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(Long id, String username) {
        Project project = projectRepository.findByIdAndUserUsername(id, username)
                .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));
        return convertToDTO(project);
    }

    public ProjectDTO createProject(ProjectDTO projectDTO, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Project project = new Project();
        String name = projectDTO.getName() != null ? projectDTO.getName() : projectDTO.getTitle();
        project.setTitle(name);
        project.setDescription(projectDTO.getDescription());
        project.setColor(projectDTO.getColor());
        project.setUser(user);
        
        Project savedProject = projectRepository.save(project);
        return convertToDTO(savedProject);
    }

    public ProjectDTO updateProject(Long id, ProjectDTO projectDTO, String username) {
        Project project = projectRepository.findByIdAndUserUsername(id, username)
                .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));

        String name = projectDTO.getName() != null ? projectDTO.getName() : projectDTO.getTitle();
        if (name != null) {
            project.setTitle(name);
        }
        if (projectDTO.getDescription() != null) {
            project.setDescription(projectDTO.getDescription());
        }
        if (projectDTO.getColor() != null) {
            project.setColor(projectDTO.getColor());
        }
        
        Project updatedProject = projectRepository.save(project);
        return convertToDTO(updatedProject);
    }

    public void deleteProject(Long id, String username) {
        Project project = projectRepository.findByIdAndUserUsername(id, username)
                .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));
        projectRepository.delete(project);
    }

    public ProjectDTO getProjectProgress(Long id, String username) {
        Project project = projectRepository.findByIdAndUserUsername(id, username)
                .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));
        return convertToDTO(project);
    }

    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getTitle());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setColor(project.getColor());
        if (project.getCreatedAt() != null) {
            dto.setCreatedAt(project.getCreatedAt().toString());
        }
        
        List<Task> tasks = project.getTasks();
        dto.setTotalTasks(tasks.size());
        
        // Convert tasks to TaskDTO
        List<TaskDTO> taskDTOs = tasks.stream()
                .map(task -> {
                    TaskDTO taskDTO = new TaskDTO();
                    taskDTO.setId(task.getId());
                    taskDTO.setTitle(task.getTitle());
                    taskDTO.setDescription(task.getDescription());
                    taskDTO.setDueDate(task.getDueDate());
                    taskDTO.setCompleted(task.getCompleted());
                    taskDTO.setStatus(task.getStatus().name());
                    taskDTO.setSection(task.getSection());
                    taskDTO.setProjectId(project.getId());
                    return taskDTO;
                })
                .collect(Collectors.toList());
        dto.setTasks(taskDTOs);
        
        long completedCount = tasks.stream()
                .filter(Task::getCompleted)
                .count();
        dto.setCompletedTasks((int) completedCount);
        
        if (tasks.size() > 0) {
            dto.setProgress((completedCount * 100.0) / tasks.size());
        } else {
            dto.setProgress(0.0);
        }
        
        return dto;
    }
}
