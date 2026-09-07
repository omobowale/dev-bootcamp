package com.trainingplatform.exception;

/** For validation that depends on more than one field's value — plain Bean Validation on the
 * request DTO can't express "required only when X" cleanly. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
