package com.trainingplatform.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.util.*;
import java.util.regex.*;
import org.springframework.core.io.ClassPathResource;

/** Every transactional email composes this single layout, with escaped text and a plain-text alternative. */
public final class EmailTemplates {
    private EmailTemplates() {}
    public record Detail(String label, String value) {}
    public record Content(String eyebrow, String title, String preheader, String greeting,
            String intro, List<Detail> details, String note, String actionLabel, String actionUrl, String footer) {}
    public record Rendered(String text, String html) {}
    private static final String LAYOUT = loadLayout();
    private static String loadLayout() {
        try (var input = new ClassPathResource("templates/email/layout.html").getInputStream()) {
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) { throw new IllegalStateException("Email layout is missing", e); }
    }
    private static String escape(String value) {
        return Objects.toString(value, "").replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }
    private static String lines(String value) { return escape(value).replace("\r\n", "\n").replace("\n", "<br>"); }
    private static boolean present(String value) { return value != null && !value.isBlank(); }
    private static boolean safeUrl(String value) {
        if (!present(value)) return false;
        try { var uri = URI.create(value); return ("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                && uri.getHost() != null && uri.getUserInfo() == null; }
        catch (IllegalArgumentException e) { return false; }
    }
    public static Rendered render(Content content) {
        var text = new StringBuilder(content.title()).append("\n\n").append(content.greeting()).append("\n\n").append(content.intro()).append("\n\n");
        var details = new StringBuilder();
        for (var detail : content.details()) {
            if (!present(detail.value())) continue;
            text.append(detail.label()).append(": ").append(detail.value()).append("\n");
            details.append("<tr><td style=\"padding:12px 18px;border-bottom:1px solid #e0e9e3\"><p style=\"margin:0 0 4px;color:#61766b;font-size:11px;font-weight:bold;letter-spacing:1px\">")
                .append(escape(detail.label())).append("</p><p style=\"margin:0;color:#19382d;font-size:15px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word\">")
                .append(lines(detail.value())).append("</p></td></tr>");
        }
        String card = details.isEmpty() ? "" : "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#f6f9f7\" style=\"border:1px solid #e0e9e3;border-radius:12px;margin:0 0 24px\">" + details + "</table>";
        String note = present(content.note()) ? "<p style=\"margin:0 0 24px;color:#526b60;font-size:14px;line-height:1.7\">" + lines(content.note()) + "</p>" : "";
        if (present(content.note())) text.append("\n").append(content.note()).append("\n");
        String action = "";
        if (safeUrl(content.actionUrl()) && present(content.actionLabel())) {
            String url=escape(content.actionUrl());
            action="<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"><tr><td bgcolor=\"#087f68\" style=\"border-radius:9px;mso-padding-alt:14px 24px\"><a href=\""+url+"\" style=\"display:inline-block;padding:14px 24px;color:#ffffff;background-color:#087f68;border:1px solid #087f68;border-radius:9px;font-size:15px;line-height:22px;font-weight:bold;text-decoration:none\">"+escape(content.actionLabel())+"</a></td></tr></table><p style=\"margin:20px 0 0;color:#61766b;font-size:12px;line-height:1.7\">If the button does not work, copy this link into your browser:<br><a href=\""+url+"\" style=\"color:#087f68;word-break:break-all;overflow-wrap:anywhere\">"+url+"</a></p>";
            text.append("\n").append(content.actionLabel()).append(":\n").append(content.actionUrl()).append("\n");
        }
        text.append("\nKeep learning. Keep building.\nThe Bukiva Learn team\n\n").append(content.footer());
        var values=Map.of("eyebrow",escape(content.eyebrow()),"title",escape(content.title()),"preheader",escape(content.preheader()),
            "greeting",escape(content.greeting()),"intro",lines(content.intro()),"details",card,"note",note,"action",action,"footer",lines(content.footer()));
        // One pass: user text containing template-like strings is never evaluated again.
        var matcher=Pattern.compile("\\{\\{([a-z]+)\\}\\}").matcher(LAYOUT);
        String html=matcher.replaceAll(match->Matcher.quoteReplacement(values.getOrDefault(match.group(1),"")));
        return new Rendered(text.toString(),html);
    }
}
