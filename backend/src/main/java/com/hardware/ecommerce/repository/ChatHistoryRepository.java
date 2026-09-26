package com.hardware.ecommerce.repository;

import com.hardware.ecommerce.model.ChatHistory;
import com.hardware.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserOrderByCreatedAtAsc(User user);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("delete from ChatHistory h where h.user = :user")
    void deleteByUser(@Param("user") User user);
}
