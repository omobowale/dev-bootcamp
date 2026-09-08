package com.trainingplatform.service;
import static org.assertj.core.api.Assertions.*;
import com.trainingplatform.exception.BadRequestException;
import java.util.*;
import org.junit.jupiter.api.Test;
class ReorderValidationTest {
    @Test void validOrderAndEmptyCollectionAreAllowed() {
        assertThatCode(()->ReorderValidation.requireCompleteOrder(List.of(1L,2L),List.of(2L,1L))).doesNotThrowAnyException();
        assertThatCode(()->ReorderValidation.requireCompleteOrder(List.of(),List.of())).doesNotThrowAnyException();
    }
    @Test void missingDuplicateForeignAndNullIdsAreRejected() {
        for(List<Long> invalid: List.of(List.of(1L),List.of(1L,1L),List.of(1L,3L),Arrays.asList(1L,null))) {
            assertThatThrownBy(()->ReorderValidation.requireCompleteOrder(List.of(1L,2L),invalid)).isInstanceOf(BadRequestException.class);
        }
        assertThatThrownBy(()->ReorderValidation.requireCompleteOrder(List.of(1L),null)).isInstanceOf(BadRequestException.class);
    }
}
