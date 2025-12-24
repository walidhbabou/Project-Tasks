package com.JwtSetup.JwtSetup.service;

import com.JwtSetup.JwtSetup.dto.TaskDTO;
import com.JwtSetup.JwtSetup.entity.Project;
import com.JwtSetup.JwtSetup.entity.Task;
import com.JwtSetup.JwtSetup.entity.TaskStatus;
import com.JwtSetup.JwtSetup.repo.ProjectRepository;
import com.JwtSetup.JwtSetup.repo.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public List<TaskDTO> getProjectTasks(Long projectId, String username) {
        Project project = projectRepository.findByIdAndUserUsername(projectId, username)
            .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));

        List<Task> tasks = taskRepository.findByProjectIdAndProjectUserUsername(projectId, username);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TaskDTO createTask(Long projectId, TaskDTO taskDTO, String username) {
        Project project = projectRepository.findByIdAndUserUsername(projectId, username)
            .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));

        Task task = new Task();
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setDueDate(taskDTO.getDueDate());
        task.setCompleted(false);
        task.setStatus(TaskStatus.NOT_STARTED);
        task.setSection(taskDTO.getSection());
        task.setProject(project);
        
        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    public TaskDTO updateTask(Long projectId, Long taskId, TaskDTO taskDTO, String username) {
        projectRepository.findByIdAndUserUsername(projectId, username)
            .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));

        Task task = taskRepository.findByIdAndProjectIdAndProjectUserUsername(taskId, projectId, username)
            .orElseThrow(() -> new RuntimeException("Task not found or unauthorized"));
        
        if (taskDTO.getTitle() != null) {
            task.setTitle(taskDTO.getTitle());
        }
        if (taskDTO.getDescription() != null) {
            task.setDescription(taskDTO.getDescription());
        }
        if (taskDTO.getDueDate() != null) {
            task.setDueDate(taskDTO.getDueDate());
        }
        if (taskDTO.getSection() != null) {
            task.setSection(taskDTO.getSection());
        }
        if (taskDTO.getCompleted() != null) {
            task.setCompleted(taskDTO.getCompleted());
        }
        if (taskDTO.getStatus() != null) {
            task.setStatus(TaskStatus.valueOf(taskDTO.getStatus()));
        }
        
        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    public void deleteTask(Long projectId, Long taskId, String username) {
        projectRepository.findByIdAndUserUsername(projectId, username)
            .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));

        Task task = taskRepository.findByIdAndProjectIdAndProjectUserUsername(taskId, projectId, username)
            .orElseThrow(() -> new RuntimeException("Task not found or unauthorized"));

        taskRepository.delete(task);
    }

    public TaskDTO toggleTaskComplete(Long projectId, Long taskId, String username) {
        projectRepository.findByIdAndUserUsername(projectId, username)
            .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));

        Task task = taskRepository.findByIdAndProjectIdAndProjectUserUsername(taskId, projectId, username)
            .orElseThrow(() -> new RuntimeException("Task not found or unauthorized"));

        task.setCompleted(!task.getCompleted());
        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    public TaskDTO updateTaskStatus(Long projectId, Long taskId, String username) {
        projectRepository.findByIdAndUserUsername(projectId, username)
            .orElseThrow(() -> new RuntimeException("Project not found or unauthorized"));

        Task task = taskRepository.findByIdAndProjectIdAndProjectUserUsername(taskId, projectId, username)
            .orElseThrow(() -> new RuntimeException("Task not found or unauthorized"));

        // Cycle through statuses: NOT_STARTED -> IN_PROGRESS -> COMPLETED -> NOT_STARTED
        TaskStatus currentStatus = task.getStatus();
        TaskStatus newStatus;
        
        switch (currentStatus) {
            case NOT_STARTED:
                newStatus = TaskStatus.IN_PROGRESS;
                break;
            case IN_PROGRESS:
                newStatus = TaskStatus.COMPLETED;
                break;
            case COMPLETED:
                newStatus = TaskStatus.NOT_STARTED;
                break;
            default:
                newStatus = TaskStatus.NOT_STARTED;
        }
        
        task.setStatus(newStatus);
        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setCompleted(task.getCompleted());
        dto.setStatus(task.getStatus().name());
        dto.setSection(task.getSection());
        dto.setProjectId(task.getProject().getId());
        return dto;
    }
}
