package com.spendwise.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.Generated;
//import jakarta.annotation.Generated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
public class Transaction {
	
	
	public enum TransactionType {
        INCOME, EXPENSE
    }

	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)

	private Long Id;
	
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)//@ManyToOne represents this relationship in Java, 
    @JoinColumn(name = "user_id", nullable = false)//	and @JoinColumn maps it to the MySQL foreign key.
    private Appuser user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "payment_method",
            nullable = false,
            length = 30)
    private String paymentMethod;

    @Column(length = 500)
    private String notes;

    @Generated
    @Column(name = "created_at", nullable = false,
            updatable = false, insertable = false)
    private LocalDateTime createdAt;

}
