package com.trainingplatform.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.trainingplatform.exception.BadRequestException;
import java.io.IOException;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Thin wrapper around the Cloudinary SDK, shared by assignment attachments (Phase 11) and course
 * materials (Phase 14) — each caller picks its own folder. Unlike {@link EmailService}, which is
 * best-effort everywhere because a failed email never changes what the user asked for, a failed
 * upload here DOES change the outcome the caller asked for (the file wouldn't actually be saved)
 * — so this throws a clear error instead of silently succeeding without the file.
 */
@Slf4j
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final boolean configured;

    public CloudinaryService(
            @Value("${app.cloudinary.cloud-name:}") String cloudName,
            @Value("${app.cloudinary.api-key:}") String apiKey,
            @Value("${app.cloudinary.api-secret:}") String apiSecret) {
        this.configured = !cloudName.isBlank() && !apiKey.isBlank() && !apiSecret.isBlank();
        this.cloudinary = configured
                ? new Cloudinary(ObjectUtils.asMap(
                        "cloud_name", cloudName, "api_key", apiKey, "api_secret", apiSecret, "secure", true))
                : null;
    }

    public boolean isConfigured() {
        return configured;
    }

    public record UploadResult(String url, String publicId) {
    }

    @SuppressWarnings("unchecked")
    public UploadResult upload(MultipartFile file, String folder) {
        if (!configured) {
            throw new BadRequestException(
                    "File attachments aren't available right now — you can still submit without one.");
        }
        try {
            Map<String, Object> result =
                    cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto", "folder", folder));
            return new UploadResult((String) result.get("secure_url"), (String) result.get("public_id"));
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary (folder={})", folder, e);
            throw new BadRequestException("Couldn't upload the file. Please try again.");
        }
    }
}
