package com.trainingplatform.service;
import org.junit.jupiter.api.Test;
import java.util.List;
import com.trainingplatform.exception.BadRequestException;
import static org.assertj.core.api.Assertions.*;
class RubricDataTest {
 final List<RubricData.Criterion> criteria=List.of(new RubricData.Criterion("a","Working solution",60,"Evidence"),new RubricData.Criterion("b","Reasoning",40,"Explanation"));
 @Test void totalsMustMatchAndIdsMustBeUnique(){RubricData.validate(criteria,100);assertThatThrownBy(()->RubricData.validate(criteria,90)).isInstanceOf(BadRequestException.class);assertThatThrownBy(()->RubricData.validate(List.of(criteria.get(0),criteria.get(0)),120)).isInstanceOf(BadRequestException.class);}
 @Test void gradeRejectsMissingDuplicateAndOutOfRangeMarks(){assertThatThrownBy(()->RubricData.grade(criteria,List.of(new RubricData.Input("a",20,"")))).isInstanceOf(BadRequestException.class);assertThatThrownBy(()->RubricData.grade(criteria,List.of(new RubricData.Input("a",20,""),new RubricData.Input("a",20,"")))).isInstanceOf(BadRequestException.class);assertThatThrownBy(()->RubricData.grade(criteria,List.of(new RubricData.Input("a",61,""),new RubricData.Input("b",20,"")))).isInstanceOf(BadRequestException.class);}
 @Test void snapshotKeepsCriterionLabelsAndFeedback(){var marks=RubricData.grade(criteria,List.of(new RubricData.Input("a",50,"Working"),new RubricData.Input("b",30,"Needs detail")));assertThat(marks.stream().mapToInt(RubricData.Mark::points).sum()).isEqualTo(80);assertThat(RubricData.marks(RubricData.json(marks))).isEqualTo(marks);}
}
