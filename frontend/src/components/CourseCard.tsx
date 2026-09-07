import { formatDate } from "../utils/formatDate";
import { Link } from "react-router-dom";
import type { CourseListItem } from "../types/course";
import { courseDetailPath } from "../constants/routes";
import { PriceTag } from "./PriceTag";
import { CourseArtwork } from "./CourseArtwork";
import { Icon } from "./Icon";
import "./CourseCard.css";
export function CourseCard({ course, index = 0 }: { course: CourseListItem; index?: number }) {
  return <article className="course-card">
    <Link className="course-card__image-link" to={courseDetailPath(course.slug)} aria-label={"Explore " + course.title}>
      <CourseArtwork title={course.title} image={course.image} index={index} />
      {course.level && <span className="course-card__level">{course.level}</span>}
      {course.aiSkillsDescription && <span className="course-card__ai-badge" title={course.aiSkillsDescription || undefined}>🤖 AI skills</span>}
    </Link>
    <div className="course-card__body">
      <div className="course-card__kicker"><span><span className="live-dot" /> 100% Online</span>{course.certificateAvailable && <Icon name="shield" size={16} />}</div>
      <h3><Link to={courseDetailPath(course.slug)}>{course.title}</Link></h3>
      {course.shortDescription && <p>{course.shortDescription}</p>}
      <div className="course-card__meta">{course.duration && <span><Icon name="clock" size={14} />{course.duration}</span>}<span><Icon name="code" size={14} /> Hands-on projects</span></div>
      {course.openCohortCount !== undefined && <div className="course-card__availability"><Icon name="calendar" size={15} /><span>{course.nextStartDate ? `Next start · ${formatDate(course.nextStartDate)}` : course.privateTutorialAvailable ? 'Private tutorials available' : course.openCohortCount > 0 ? 'Open for registration' : 'New dates coming soon'}</span></div>}
      <div className="course-card__bottom"><PriceTag price={course.price} discountPrice={course.discountPrice} size="md" /><Link to={courseDetailPath(course.slug)} className="course-card__link">View course <Icon name="arrow" size={16} /></Link></div>
    </div>
  </article>;
}
