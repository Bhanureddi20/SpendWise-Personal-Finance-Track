
package com.spendwise.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.spendwise.dto.TransactionRequest;
import com.spendwise.dto.TransactionResponse;
import com.spendwise.entity.Appuser;
import com.spendwise.entity.Transaction;
import com.spendwise.entity.Transaction.TransactionType;
import com.spendwise.repository.TransactionRepository;
import com.spendwise.repository.UserRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    private Appuser getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    private TransactionType parseType(String type) {
        try {
            return TransactionType.valueOf(type.trim().toUpperCase());
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Type must be INCOME or EXPENSE");
        }
    }

    private Transaction getOwnedTransaction(Long transactionId, Long userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Transaction not found"));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new AccessDeniedException(
                    "You cannot access another user's transaction");
        }

        return transaction;
    }

    private void copyRequestToTransaction(
            TransactionRequest request, Transaction transaction) {

        transaction.setTitle(request.getTitle().trim());
        transaction.setAmount(request.getAmount());
        transaction.setType(parseType(request.getType()));
        transaction.setCategory(request.getCategory().trim());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setPaymentMethod(request.getPaymentMethod().trim());
        transaction.setNotes(request.getNotes());
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getTitle(),
                transaction.getAmount(),
                transaction.getType().name(),
                transaction.getCategory(),
                transaction.getTransactionDate(),
                transaction.getPaymentMethod(),
                transaction.getNotes(),
                transaction.getCreatedAt());
    }

    @Transactional
    public TransactionResponse create(
            Long userId, TransactionRequest request) {

        Appuser user = getUser(userId);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        copyRequestToTransaction(request, transaction);

        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAll(Long userId) {
        getUser(userId);

        return transactionRepository
                .findByUser_IdOrderByTransactionDateDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TransactionResponse update(
            Long userId, Long transactionId, TransactionRequest request) {

        Transaction transaction =
                getOwnedTransaction(transactionId, userId);

        copyRequestToTransaction(request, transaction);

        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(Long userId, Long transactionId) {
        Transaction transaction =
                getOwnedTransaction(transactionId, userId);

        transactionRepository.delete(transaction);
    }
}
