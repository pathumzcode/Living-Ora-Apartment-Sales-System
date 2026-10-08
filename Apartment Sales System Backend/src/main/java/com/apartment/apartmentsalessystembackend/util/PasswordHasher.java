package com.apartment.apartmentsalessystembackend.util;

import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Password hashing utility using SHA-256.
 * Produces consistent, deterministic hex digests — suitable for
 * the demo/development environment (no BCrypt dependency required).
 *
 * Methods:
 *   hash(plain)          – returns the 64-char hex digest of plain
 *   matches(plain, hash) – returns true if hash(plain) equals the stored hash
 *   isHashed(value)      – returns true if the value looks like a SHA-256 hex digest
 *   verify(plain, hash)  – alias for matches()
 */
@Component
public class PasswordHasher {

    private static final int SHA256_HEX_LENGTH = 64;

    /**
     * Hashes a plain-text password using SHA-256.
     */
    public String hash(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            throw new IllegalArgumentException("Password must not be null or empty");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(
                    plainText.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Returns true if the given plain-text matches the stored hash.
     * Case-insensitive hex comparison.
     */
    public boolean matches(String plainText, String storedHash) {
        if (plainText == null || storedHash == null) return false;
        return hash(plainText).equalsIgnoreCase(storedHash);
    }

    /**
     * Returns true if the value looks like a SHA-256 hex digest
     * (exactly 64 lowercase hex characters).
     * Used by AuthService to detect whether a legacy plain-text password
     * needs upgrading.
     */
    public boolean isHashed(String value) {
        if (value == null || value.length() != SHA256_HEX_LENGTH) return false;
        return value.matches("[0-9a-fA-F]{64}");
    }

    /**
     * Alias for {@link #matches(String, String)}.
     */
    public boolean verify(String plainText, String storedHash) {
        return matches(plainText, storedHash);
    }
}
