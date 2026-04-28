package com.buymore.exception;

import org.springframework.http.HttpStatus;

public class InsufficientInventoryException extends RuntimeException {

    private final HttpStatus httpStatus;

    public InsufficientInventoryException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
