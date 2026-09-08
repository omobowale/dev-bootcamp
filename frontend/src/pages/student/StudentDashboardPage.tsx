import { useState, type MouseEvent } from "react";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Link } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { useStudentEnrollments, useStudentMe } from "../../hooks/student/useStudentPortal";
import { useCourseProgress } from "../../hooks/student/useStudentProgress";
import { useIssueCertificate, useMyCertificate } from "../../hooks/student/useStudentCertificate";
import { downloadCertificatePdf } from "../../utils/certificatePdf";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { CourseArtwork } from "../../components/CourseArtwork";
import { Icon } from "../../components/Icon";
import { studentCourseClassesPath } from "../../constants/routes";
import type { StudentEnrollment } from "../../types/student";
import "../../components/CourseCard.css";
import "./StudentDashboardPage.css";

function StudentCourseCard({ enrollment }: { enrollment: StudentEnrollment }) {
  const { data: progress } = useCourseProgress(enrollment.courseId);
  const { data: certificate } = useMyCertificate(enrollment.courseId);
  const issueCertificate = useIssueCertificate(enrollment.courseId);
  const [downloading, setDownloading] = useState(false);

  const handleCertificate = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDownloading(true);
    try {
      const cert = certificate ?? (await issueCertificate.mutateAsync());
      await downloadCertificatePdf(cert);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Link to={studentCourseClassesPath(enrollment.courseId)} className="course-card student-course-card">
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
        {progress && (
          <div className="course-progress-bar" aria-label={`${progress.overallPercentage}% complete`}>
            <div className="course-progress-bar__track">
              <div className="course-progress-bar__fill" style={{ width: `${progress.overallPercentage}%` }} />
            </div>
            <span className="text-muted">
              {progress.overallPercentage}% {progress.courseComplete && "· Complete"}
            </span>
          </div>
        )}
        {progress?.courseComplete && (
          <button type="button" className="btn btn-secondary student-certificate-btn" onClick={handleCertificate} disabled={downloading}>
            <Icon name="shield" size={14} /> {downloading ? "Preparing…" : "Download certificate"}
          </button>
        )}
        <p className="text-muted student-course-card__note">
          Continue learning <Icon name="arrow" size={13} />
        </p>
      </div>
    </Link>
  );
}

export function StudentDashboardPage() {
  const { student, logout } = useStudentAuth();
  const { data: me } = useStudentMe();
  const { data: enrollments, isLoading, isError, refetch } = useStudentEnrollments();

  return (
    <div className="student-shell">
      <header className="student-topbar">
        <div className="container student-topbar__inner">
          <a href="/student" className="student-topbar__brand">DevTraining<span>Learning space</span></a>
          <div className="student-topbar__profile"><ThemeToggle />
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
          <h1>Make room for your next breakthrough.</h1>
          <p className="text-muted">Welcome back. Your classes, practice, and progress are all right here.</p>
        </div>

        <div className="learning-section-heading"><div><span className="eyebrow">YOUR LEARNING JOURNEY</span><h2>My courses</h2></div>{enrollments && <span className="learning-count">{enrollments.length} enrolled</span>}</div>
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
              <StudentCourseCard enrollment={enrollment} key={`${enrollment.courseId}-${enrollment.cohortId}`} />
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
