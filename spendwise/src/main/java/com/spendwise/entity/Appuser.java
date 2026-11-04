package com.spendwise.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class Appuser {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	
	private Long id;
	
	@Column(name="full_name",nullable=false,length=100)
	private String fullname;
	
	@Column(nullable=false,unique=true,length=150)
	private String email;
	
	@Column(nullable =false,length=225)
	private String password;
	
	@Column(nullable = false,length=20)
	private String role="USER";
	
	@Column(name="created_at",nullable = false,updatable = false,insertable = false)
	private LocalDateTime createdAt;
	
	

}
