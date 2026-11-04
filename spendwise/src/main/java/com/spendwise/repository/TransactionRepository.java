package com.spendwise.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spendwise.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long>{
	
	List<Transaction> findByUser_IdOrderByTransactionDateDesc(Long userId);
            

    List<Transaction> findByUser_IdAndTypeOrderByTransactionDateDesc(Long userId,Transaction.TransactionType type);
           
          
	
	

}
