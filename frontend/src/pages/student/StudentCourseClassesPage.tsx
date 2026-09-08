import { LearningOverview } from "../../components/LearningOverview";
import { StudentTools } from "../../components/StudentTools";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { useStudentClassesForCourse, useStudentMe } from "../../hooks/student/useStudentPortal";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Icon } from "../../components/Icon";
import { ROUTES, studentClassSessionDetailPath } from "../../constants/routes";
import { formatDateTime } from "../../utils/formatDate";
import "./StudentDashboardPage.css";

export function StudentCourseClassesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [params]=useSearchParams();const cohortId=params.get("cohortId")?Number(params.get("cohortId")):undefined;
  const courseIdNum = Number(courseId);
  const { student, logout } = useStudentAuth();
  const { data: me } = useStudentMe();
  const { data: classes, isLoading, isError, refetch } = useStudentClassesForCourse(courseIdNum,cohortId);

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
      <StudentTools/>

      <div className="container student-page">
        <div className="student-page__header">
          <Link to={ROUTES.student} className="text-link">
            <Icon name="arrow" size={13} style={{ transform: "rotate(180deg)" }} /> My courses
          </Link>
          <span className="eyebrow">CLASSES</span>
          <h1>Course classes</h1>
          <p className="text-muted">Everything scheduled for this course, in order.</p>
        </div>

        <LearningOverview courseId={courseIdNum} cohortId={cohortId}/>
        {isLoading && <LoadingState label="Loading classes…" />}
        {isError && <ErrorState message="Couldn't load classes for this course." onRetry={() => refetch()} />}

        {!isLoading && !isError && (classes?.length ?? 0) === 0 && (
          <div className="notice-panel">
            <Icon name="book" size={24} />
            <h3>No classes yet.</h3>
            <p>Your instructor hasn't published any lesson content for this course yet — check back soon.</p>
          </div>
        )}

        {classes && classes.length > 0 && (
          <ul className="student-class-list">
            {classes.map((session, index) => (
              <li key={session.id} className="student-class-list__item">
                <Link to={studentClassSessionDetailPath(session.id)} className="student-class-list__link">
                  <span className="lesson-number">{String(index + 1).padStart(2, "0")}</span><div className="lesson-list-copy">
                    <span className="text-muted student-class-list__module">{session.moduleTitle}</span>
                    <strong>{session.title}</strong>
                    {session.scheduledAt && (
                      <span className="text-muted student-class-list__time">{formatDateTime(session.scheduledAt)}</span>
                    )}
                  </div>
                  <Icon name="arrow" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
