package com.logs.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.logs.model.ApiResponse;

public class ErrorUtils {

    // Generic helper: works for any <T>
    public static <T> ResponseEntity<ApiResponse<T>> buildError(String message, HttpStatus status) {
        ApiResponse<T> response = ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
        return new ResponseEntity<>(response, status);
    }

    // Validation error
    public static <T> ResponseEntity<ApiResponse<T>> buildValidationError(String field, String errorMsg) {
        String fullMessage = String.format("Invalid value for '%s': %s", field, errorMsg);
        ApiResponse<T> response = ApiResponse.<T>builder()
                .success(false)
                .message(fullMessage)
                .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Exception handler
    public static <T> ResponseEntity<ApiResponse<T>> handleException(Exception ex) {
        ApiResponse<T> response = ApiResponse.<T>builder()
                .success(false)
                .message("Internal Server Error: " + ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
