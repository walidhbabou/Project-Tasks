package com.JwtSetup.JwtSetup.repo;

import com.JwtSetup.JwtSetup.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    List<Task> findByProjectIdAndProjectUserUsername(Long projectId, String username);

    Optional<Task> findByIdAndProjectIdAndProjectUserUsername(Long id, Long projectId, String username);
}
