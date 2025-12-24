package com.JwtSetup.JwtSetup.controller;

import com.JwtSetup.JwtSetup.dto.ProjectDTO;
import com.JwtSetup.JwtSetup.dto.TaskDTO;
import com.JwtSetup.JwtSetup.service.ProjectService;
import com.JwtSetup.JwtSetup.service.TaskService;
import com.JwtSetup.JwtSetup.application.UpdateTaskDueDateUseCase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private UpdateTaskDueDateUseCase updateTaskDueDateUseCase;

    // Project endpoints
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getUserProjects(@AuthenticationPrincipal UserDetails userDetails) {
        List<ProjectDTO> projects = projectService.getUserProjects(userDetails.getUsername());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProject(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        ProjectDTO project = projectService.getProjectById(id, userDetails.getUsername());
        return ResponseEntity.ok(project);
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody ProjectDTO projectDTO, @AuthenticationPrincipal UserDetails userDetails) {
        ProjectDTO createdProject = projectService.createProject(projectDTO, userDetails.getUsername());
        return ResponseEntity.ok(createdProject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id, @RequestBody ProjectDTO projectDTO, @AuthenticationPrincipal UserDetails userDetails) {
        ProjectDTO updatedProject = projectService.updateProject(id, projectDTO, userDetails.getUsername());
        return ResponseEntity.ok(updatedProject);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        projectService.deleteProject(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<ProjectDTO> getProjectProgress(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        ProjectDTO progress = projectService.getProjectProgress(id, userDetails.getUsername());
        return ResponseEntity.ok(progress);
    }

    // Task endpoints
    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<TaskDTO>> getProjectTasks(@PathVariable Long projectId, @AuthenticationPrincipal UserDetails userDetails) {
        List<TaskDTO> tasks = taskService.getProjectTasks(projectId, userDetails.getUsername());
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<TaskDTO> createTask(@PathVariable Long projectId, @RequestBody TaskDTO taskDTO, @AuthenticationPrincipal UserDetails userDetails) {
        TaskDTO createdTask = taskService.createTask(projectId, taskDTO, userDetails.getUsername());
        return ResponseEntity.ok(createdTask);
    }

    @PutMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long projectId, @PathVariable Long taskId, @RequestBody TaskDTO taskDTO, @AuthenticationPrincipal UserDetails userDetails) {
        // If only dueDate is provided, route through a dedicated use case
        boolean hasOnlyDueDate = taskDTO.getDueDate() != null
            && taskDTO.getTitle() == null
            && taskDTO.getDescription() == null
            && taskDTO.getSection() == null
            && taskDTO.getCompleted() == null
            && taskDTO.getStatus() == null;

        TaskDTO updatedTask = hasOnlyDueDate
            ? updateTaskDueDateUseCase.execute(projectId, taskId, userDetails.getUsername(), taskDTO.getDueDate())
            : taskService.updateTask(projectId, taskId, taskDTO, userDetails.getUsername());
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long projectId, @PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(projectId, taskId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{projectId}/tasks/{taskId}/toggle")
    public ResponseEntity<TaskDTO> toggleTaskComplete(@PathVariable Long projectId, @PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        TaskDTO task = taskService.toggleTaskComplete(projectId, taskId, userDetails.getUsername());
        return ResponseEntity.ok(task);
    }

    @PatchMapping("/{projectId}/tasks/{taskId}/status")
    public ResponseEntity<TaskDTO> updateTaskStatus(@PathVariable Long projectId, @PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        TaskDTO task = taskService.updateTaskStatus(projectId, taskId, userDetails.getUsername());
        return ResponseEntity.ok(task);
    }

    // Allowed extensions
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("png", "jpg", "jpeg", "pdf", "docx", "txt");

    private Path getTaskUploadDir(Long projectId, Long taskId) {
        return Paths.get("uploads").resolve(String.valueOf(projectId)).resolve(String.valueOf(taskId));
    }

    private String getExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return (idx == -1) ? "" : filename.substring(idx + 1).toLowerCase();
    }

    // Upload an attachment for a task
    @PostMapping("/{projectId}/tasks/{taskId}/attachments")
    public ResponseEntity<String> uploadAttachment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Fichier manquant ou vide.");
        }

        String filename = Paths.get(file.getOriginalFilename()).getFileName().toString();
        String ext = getExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            return ResponseEntity.badRequest().body("Extension non autorisée: " + ext);
        }

        try {
            Path uploadDir = getTaskUploadDir(projectId, taskId);
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok("Fichier téléversé: " + filename);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'enregistrement du fichier.");
        }
    }

    // List attachments for a task
    @GetMapping("/{projectId}/tasks/{taskId}/attachments")
    public ResponseEntity<List<String>> listAttachments(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Path dir = getTaskUploadDir(projectId, taskId);
            if (!Files.exists(dir)) {
                return ResponseEntity.ok(List.of());
            }
            List<String> files = Files.list(dir)
                    .filter(Files::isRegularFile)
                    .map(p -> p.getFileName().toString())
                    .collect(Collectors.toList());
            return ResponseEntity.ok(files);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Download an attachment
    @GetMapping("/{projectId}/tasks/{taskId}/attachments/{filename:.+}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable String filename,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Path file = getTaskUploadDir(projectId, taskId).resolve(filename).normalize();
            if (!Files.exists(file) || !Files.isRegularFile(file)) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new UrlResource(file.toUri());
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Delete an attachment (remplacée)
    @DeleteMapping("/{projectId}/tasks/{taskId}/attachments/{filename:.+}")
    public ResponseEntity<String> deleteAttachment(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @PathVariable String filename,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Path uploadDir = getTaskUploadDir(projectId, taskId).toAbsolutePath().normalize();
            Path file = uploadDir.resolve(filename).normalize();

            // Prevent path traversal: ensure the file is inside the upload directory
            if (!file.startsWith(uploadDir)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Chemin de fichier non autorisé.");
            }

            if (!Files.exists(file) || !Files.isRegularFile(file)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier introuvable.");
            }

            boolean deleted = Files.deleteIfExists(file);
            if (deleted) {
                // cleanup empty parent dirs (silencieux)
                try {
                    Path parent = file.getParent();
                    if (parent != null && Files.isDirectory(parent) && Files.list(parent).findAny().isEmpty()) {
                        Files.delete(parent);
                        Path grand = parent.getParent();
                        if (grand != null && Files.isDirectory(grand) && Files.list(grand).findAny().isEmpty()) {
                            Files.delete(grand);
                        }
                    }
                } catch (IOException ignored) { /* ignore cleanup errors */ }

                return ResponseEntity.ok("Fichier supprimé: " + file.getFileName().toString());
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Impossible de supprimer le fichier.");
            }
        } catch (NoSuchFileException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier introuvable.");
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission refusée pour supprimer le fichier.");
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la suppression du fichier.");
        }
    }
}
