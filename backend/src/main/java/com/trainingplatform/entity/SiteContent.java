package com.trainingplatform.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
@Entity @Table(name = "site_content") @Getter @Setter
public class SiteContent {
    @Id private Long id;
    @Version private Long version;
    @Column(nullable = false, columnDefinition = "TEXT") private String content;
}
