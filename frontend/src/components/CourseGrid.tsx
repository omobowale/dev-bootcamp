import type { CourseListItem } from "../types/course";
import { CourseCard } from "./CourseCard";
import { EmptyState } from "./EmptyState";
import "./CourseGrid.css";

export function CourseGrid({ courses }: { courses: CourseListItem[] }) {
  if (courses.length === 0) {
    return <EmptyState message="No courses match this filter yet — check back soon or explore all courses." />;
  }

  return (
    <div className="course-grid" data-reveal-stagger>
      {courses.map((course, index) => (
        <CourseCard key={course.id} course={course} index={index} />
      ))}
    </div>
  );
}
