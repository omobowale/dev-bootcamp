import { Link } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { useStudentEnrollments, useStudentMe } from "../../hooks/student/useStudentPortal";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { CourseArtwork } from "../../components/CourseArtwork";
import { Icon } from "../../components/Icon";
import "../../components/CourseCard.css";
import "./StudentDashboardPage.css";

export function StudentDashboardPage() {
  const { student, logout } = useStudentAuth();
  const { data: me } = useStudentMe();
  const { data: enrollments, isLoading, isError, refetch } = useStudentEnrollments();

  return (
    <div className="student-shell">
      <header className="student-topbar">
        <div className="container student-topbar__inner">
          <span className="student-topbar__brand">DevTraining.</span>
          <div className="student-topbar__profile">
            <span className="student-avatar">{(me?.fullName ?? student?.name ?? "S").charAt(0).toUpperCase()}</span>
            <div>
              <strong>{me?.fullName ?? student?.name}</strong>
              <small>{me?.studentId ?? "Student"}</small>
            </div>
            <button type="button" className="icon-btn" title="Sign out" aria-label="Sign out" onClick={logout}>
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="container student-page">
        <div className="student-page__header">
          <span className="eyebrow">YOUR PORTAL</span>
          <h1>My courses</h1>
          <p className="text-muted">Everything you're enrolled in, in one place.</p>
        </div>

        {isLoading && <LoadingState label="Loading your courses…" />}
        {isError && <ErrorState message="Couldn't load your courses." onRetry={() => refetch()} />}

        {!isLoading && !isError && (enrollments?.length ?? 0) === 0 && (
          <div className="notice-panel">
            <Icon name="book" size={24} />
            <h3>No courses yet.</h3>
            <p>Once your registration is confirmed, your course will show up here.</p>
          </div>
        )}

        {enrollments && enrollments.length > 0 && (
          <div className="student-course-grid">
            {enrollments.map((enrollment) => (
              <article className="course-card student-course-card" key={`${enrollment.courseId}-${enrollment.cohortId}`}>
                <div className="course-card__image-link">
                  <CourseArtwork title={enrollment.courseTitle} image={enrollment.courseImage} />
                </div>
                <div className="course-card__body">
                  <div className="course-card__kicker">
                    <span>
                      <span className="live-dot" /> {enrollment.cohortName}
                      {enrollment.privateTutorial ? " · Private tutorial" : ""}
                    </span>
                  </div>
                  <h3>{enrollment.courseTitle}</h3>
                  <p className="text-muted student-course-card__note">
                    Lesson content for this course is on its way — check back soon.
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="notice-panel student-help-panel">
          <span className="eyebrow">NEED A HAND?</span>
          <h2>We're here to help.</h2>
          <p>Reach out if anything looks off, or if you're expecting a course that isn't showing up yet.</p>
          <Link to="/about#contact" className="btn btn-primary">
            Get in touch <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
