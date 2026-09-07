package com.trainingplatform.service;

import com.trainingplatform.dto.FaqRequest;
import com.trainingplatform.dto.FaqResponse;
import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.Faq;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.repository.FaqRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;
    private final CourseRepository courseRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public List<FaqResponse> findGlobal() {
        return faqRepository.findByCourseIsNullOrderByPositionAsc().stream().map(FaqResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<FaqResponse> findByCourse(Long courseId) {
        return faqRepository.findByCourseIdOrderByPositionAsc(courseId).stream().map(FaqResponse::from).toList();
    }

    @Transactional
    public FaqResponse create(FaqRequest request) {
        Faq faq = new Faq();
        applyRequest(faq, request);
        faq = faqRepository.save(faq);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "CREATE", "Faq", faq.getId());
        return FaqResponse.from(faq);
    }

    @Transactional
    public FaqResponse update(Long id, FaqRequest request) {
        Faq faq = getOrThrow(id);
        applyRequest(faq, request);
        faq = faqRepository.save(faq);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "Faq", faq.getId());
        return FaqResponse.from(faq);
    }

    @Transactional
    public void delete(Long id) {
        Faq faq = getOrThrow(id);
        faqRepository.delete(faq);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "DELETE", "Faq", id);
    }

    private void applyRequest(Faq faq, FaqRequest request) {
        if (request.courseId() != null) {
            Course course = courseRepository
                    .findById(request.courseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + request.courseId()));
            faq.setCourse(course);
        } else {
            faq.setCourse(null);
        }
        faq.setQuestion(request.question());
        faq.setAnswer(request.answer());
        faq.setPosition(request.position());
    }

    private Faq getOrThrow(Long id) {
        return faqRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("FAQ not found: " + id));
    }
}
