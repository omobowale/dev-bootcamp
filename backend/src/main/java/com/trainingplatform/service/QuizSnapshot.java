package com.trainingplatform.service;

import com.trainingplatform.entity.*;
import java.util.List;
import tools.jackson.databind.ObjectMapper;

/** Server-only question snapshot: never sent directly to a student. */
final class QuizSnapshot {
    static final ObjectMapper JSON = new ObjectMapper();
    record Option(String text, boolean correct, Integer position) {}
    record Question(Long id, String text, Integer points, String explanation, List<Option> options) {}
    record Document(List<Question> questions) {}
    static String encode(List<QuizQuestion> questions) {
        return JSON.writeValueAsString(new Document(questions.stream().map(q -> new Question(q.getId(),q.getText(),q.getPoints(),q.getExplanation(),
            q.getOptions().stream().map(o -> new Option(o.getText(),o.isCorrect(),o.getPosition())).toList())).toList()));
    }
    static List<QuizQuestion> decode(String snapshot) {
        return JSON.readValue(snapshot,Document.class).questions().stream().map(q -> {
            QuizQuestion entity = new QuizQuestion();entity.setId(q.id());entity.setText(q.text());entity.setPoints(q.points());entity.setExplanation(q.explanation());
            entity.setOptions(q.options().stream().map(o -> new QuizOption(o.text(),o.correct(),o.position())).toList());return entity;
        }).toList();
    }
}
