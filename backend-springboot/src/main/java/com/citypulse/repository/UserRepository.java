package com.citypulse.repository;

import com.citypulse.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Optional<User> findByStaffId(String staffId);

    Optional<User> findByBadgeId(String badgeId);

    Optional<User> findByEmailOrPhoneOrStaffIdOrBadgeId(String email, String phone, String staffId, String badgeId);
}
