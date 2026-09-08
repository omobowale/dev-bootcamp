package com.trainingplatform.entity;

public enum StudentStatus {
    /** Account created, invite email sent, password not yet set — cannot log in. */
    INVITED,
    /** Password set via the invite link — can log in. */
    ACTIVE
}
