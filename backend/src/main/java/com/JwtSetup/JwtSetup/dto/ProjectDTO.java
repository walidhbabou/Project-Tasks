package com.JwtSetup.JwtSetup.dto;

public class ProjectDTO {
    private Long id;
    private String name;
    private String title;
    private String description;
    private String color;
    private String createdAt;
    private Integer totalTasks;
    private Integer completedTasks;
    private Double progress;
    private java.util.List<TaskDTO> tasks;

    // Constructors
    public ProjectDTO() {
    }

    public ProjectDTO(Long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.title = name; // For backward compatibility
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.title = name; // Keep title in sync
    }

    public String getTitle() {
        return title != null ? title : name;
    }

    public void setTitle(String title) {
        this.title = title;
        if (this.name == null) {
            this.name = title;
        }
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public java.util.List<TaskDTO> getTasks() {
        return tasks;
    }

    public void setTasks(java.util.List<TaskDTO> tasks) {
        this.tasks = tasks;
    }

    public Integer getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Integer totalTasks) {
        this.totalTasks = totalTasks;
    }

    public Integer getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(Integer completedTasks) {
        this.completedTasks = completedTasks;
    }

    public Double getProgress() {
        return progress;
    }

    public void setProgress(Double progress) {
        this.progress = progress;
    }
}
