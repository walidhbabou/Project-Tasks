package com.JwtSetup.JwtSetup.application;

import com.JwtSetup.JwtSetup.dto.TaskDTO;
import com.JwtSetup.JwtSetup.service.TaskService;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

/**
 * Simple application use case to update only a task due date.
 * This keeps controller logic thin and encapsulates a domain-oriented action.
 */
@Component
public class UpdateTaskDueDateUseCase {

    private final TaskService taskService;

    public UpdateTaskDueDateUseCase(TaskService taskService) {
        this.taskService = taskService;
    }

    public TaskDTO execute(Long projectId, Long taskId, String username, LocalDate dueDate) {
        TaskDTO patch = new TaskDTO();
        patch.setDueDate(dueDate);
        return taskService.updateTask(projectId, taskId, patch, username);
    }
}
