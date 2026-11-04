package com.spendwise.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spendwise.entity.Appuser;

public interface UserRepository extends JpaRepository<Appuser, Long> {
	
	Optional<Appuser> findByemail (String email);
	
    boolean existsByEmail(String email);
	
	

}
