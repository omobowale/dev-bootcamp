package com.trainingplatform.service;
import java.util.*;
import com.trainingplatform.exception.BadRequestException;
public final class RubricData {
    private RubricData() {}
    public record Criterion(String id,String label,int maxPoints,String description) {}
    public record Input(String id,Integer points,String feedback) {}
    public record Mark(String id,String label,int maxPoints,int points,String feedback) {}
    public static List<Criterion> criteria(String json) {return json==null||json.isBlank()?List.of():Arrays.asList(QuizSnapshot.JSON.readValue(json,Criterion[].class));}
    public static List<Mark> marks(String json) {return json==null||json.isBlank()?List.of():Arrays.asList(QuizSnapshot.JSON.readValue(json,Mark[].class));}
    public static String json(Object value){return QuizSnapshot.JSON.writeValueAsString(value);}
    public static void validate(List<Criterion> criteria,int maxScore) {
        if(criteria==null||criteria.size()>20)throw new BadRequestException("Use up to 20 rubric criteria.");
        Set<String> ids=new HashSet<>();long total=0;
        for(var c:criteria) {
            if(c==null||c.id()==null||!c.id().matches("[a-zA-Z0-9_-]{1,60}")||!ids.add(c.id())||c.label()==null||c.label().isBlank()||c.label().length()>160||c.maxPoints()<1||c.maxPoints()>1000||c.description()!=null&&c.description().length()>2000)
                throw new BadRequestException("Each criterion needs a unique ID, label and positive maximum points.");
            total+=c.maxPoints();
        }
        if(!criteria.isEmpty()&&total!=maxScore)throw new BadRequestException("Rubric points must equal the assignment maximum score.");
    }
    public static List<Mark> grade(List<Criterion> criteria,List<Input> inputs) {
        if(inputs==null||inputs.size()!=criteria.size())throw new BadRequestException("Score every rubric criterion.");
        Map<String,Input> byId=new HashMap<>();
        for(var input:inputs)if(input==null||input.id()==null||byId.put(input.id(),input)!=null)throw new BadRequestException("Duplicate or invalid rubric score.");
        List<Mark> marks=new ArrayList<>();
        for(var criterion:criteria) {
            var input=byId.get(criterion.id());
            if(input==null||input.points()==null||input.points()<0||input.points()>criterion.maxPoints()||input.feedback()!=null&&input.feedback().length()>2000)throw new BadRequestException("Each score must be within its criterion's points range.");
            marks.add(new Mark(criterion.id(),criterion.label(),criterion.maxPoints(),input.points(),input.feedback()));
        }
        return marks;
    }
}
