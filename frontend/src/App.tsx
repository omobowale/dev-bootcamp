import { lazy, Suspense } from "react";
import { LoadingState } from "./components/LoadingState";
const StudentQuizResultPage = lazy(() => import("./pages/student/StudentQuizResultPage").then(module => ({ default: module.StudentQuizResultPage })));
const AdminGradingPage = lazy(() => import("./pages/admin/AdminGradingPage").then(module => ({ default: module.AdminGradingPage })));
const AdminStudentDetailPage = lazy(() => import("./pages/admin/AdminStudentDetailPage").then(module => ({ default: module.AdminStudentDetailPage })));
const StudentRecoveryPage = lazy(() => import("./pages/student/StudentRecoveryPage").then(module => ({ default: module.StudentRecoveryPage })));
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
const TermsPage = lazy(() => import("./pages/TermsPage").then(module => ({ default: module.TermsPage })));
const PrivateTutorialsPage = lazy(() => import("./pages/PrivateTutorialsPage").then(module => ({ default: module.PrivateTutorialsPage })));
const AdminTermsPage = lazy(() => import("./pages/admin/AdminTermsPage").then(module => ({ default: module.AdminTermsPage })));
const AdminStudentsPage = lazy(() => import("./pages/admin/AdminStudentsPage").then(module => ({ default: module.AdminStudentsPage })));
const StudentLoginPage = lazy(() => import("./pages/student/StudentLoginPage").then(module => ({ default: module.StudentLoginPage })));
const StudentInvitePage = lazy(() => import("./pages/student/StudentInvitePage").then(module => ({ default: module.StudentInvitePage })));
const StudentDashboardPage = lazy(() => import("./pages/student/StudentDashboardPage").then(module => ({ default: module.StudentDashboardPage })));
const StudentCourseClassesPage = lazy(() => import("./pages/student/StudentCourseClassesPage").then(module => ({ default: module.StudentCourseClassesPage })));
const StudentClassSessionPage = lazy(() => import("./pages/student/StudentClassSessionPage").then(module => ({ default: module.StudentClassSessionPage })));
const StudentQuizAttemptPage = lazy(() => import("./pages/student/StudentQuizAttemptPage").then(module => ({ default: module.StudentQuizAttemptPage })));
const AdminClassSessionFormPage = lazy(() => import("./pages/admin/AdminClassSessionFormPage").then(module => ({ default: module.AdminClassSessionFormPage })));
const AdminQuizAttemptsPage = lazy(() => import("./pages/admin/AdminQuizAttemptsPage").then(module => ({ default: module.AdminQuizAttemptsPage })));
const AdminAssignmentSubmissionsPage = lazy(() => import("./pages/admin/AdminAssignmentSubmissionsPage").then(module => ({ default: module.AdminAssignmentSubmissionsPage })));
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Outlet, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StudentAuthProvider } from "./context/StudentAuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { StudentProtectedRoute } from "./routes/StudentProtectedRoute";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { HomePage } from "./pages/HomePage";
const CoursesPage = lazy(() => import("./pages/CoursesPage").then(module => ({ default: module.CoursesPage })));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage").then(module => ({ default: module.CourseDetailPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then(module => ({ default: module.AboutPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(module => ({ default: module.RegisterPage })));
const RegistrationSuccessPage = lazy(() => import("./pages/RegistrationSuccessPage").then(module => ({ default: module.RegistrationSuccessPage })));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage").then(module => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then(module => ({ default: module.AdminDashboardPage })));
const AdminCoursesPage = lazy(() => import("./pages/admin/AdminCoursesPage").then(module => ({ default: module.AdminCoursesPage })));
const AdminCourseFormPage = lazy(() => import("./pages/admin/AdminCourseFormPage").then(module => ({ default: module.AdminCourseFormPage })));
const AdminCourseOutlinePage = lazy(() => import("./pages/admin/AdminCourseOutlinePage").then(module => ({ default: module.AdminCourseOutlinePage })));
const AdminCohortsPage = lazy(() => import("./pages/admin/AdminCohortsPage").then(module => ({ default: module.AdminCohortsPage })));
const AdminRegistrationsPage = lazy(() => import("./pages/admin/AdminRegistrationsPage").then(module => ({ default: module.AdminRegistrationsPage })));
const AdminRegistrationDetailPage = lazy(() => import("./pages/admin/AdminRegistrationDetailPage").then(module => ({ default: module.AdminRegistrationDetailPage })));
const AdminGlobalFaqsPage = lazy(() => import("./pages/admin/AdminGlobalFaqsPage").then(module => ({ default: module.AdminGlobalFaqsPage })));

import { Toasts } from './components/Toasts';
import { RouteExperience } from './components/RouteExperience';
import { NotFoundPage } from './pages/NotFoundPage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { AdminSiteContentPage } from './pages/admin/AdminSiteContentPage';
import './modern.css';
import './academic.css';
const router = createBrowserRouter(createRoutesFromElements(<Route element={<><RouteExperience /><Toasts /><Suspense fallback={<LoadingState label="Loading page…" />}><Outlet /></Suspense></>}>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:slug" element={<CourseDetailPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/registration/success" element={<RegistrationSuccessPage />} />
              <Route path="/terms" element={<TermsPage />} /><Route path="/private-tutorials" element={<PrivateTutorialsPage />} />
<Route path="/about" element={<AboutPage />} />
<Route path="/student/quiz-results/:attemptId" element={<StudentProtectedRoute><StudentQuizResultPage /></StudentProtectedRoute>} /><Route path="/student/recover" element={<StudentRecoveryPage />} /><Route path="/student/reset-password/:token" element={<StudentRecoveryPage />} />
<Route path="/verify" element={<VerifyCertificatePage />} />
<Route path="/verify/:verificationId" element={<VerifyCertificatePage />} />
<Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/student/login" element={<StudentLoginPage />} />
            <Route path="/student/invite/:token" element={<StudentInvitePage />} />
            <Route
              path="/student"
              element={
                <StudentProtectedRoute>
                  <StudentDashboardPage />
                </StudentProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId/classes"
              element={
                <StudentProtectedRoute>
                  <StudentCourseClassesPage />
                </StudentProtectedRoute>
              }
            />
            <Route
              path="/student/classes/:classSessionId"
              element={
                <StudentProtectedRoute>
                  <StudentClassSessionPage />
                </StudentProtectedRoute>
              }
            />
            <Route
              path="/student/quizzes/:quizId/attempt"
              element={
                <StudentProtectedRoute>
                  <StudentQuizAttemptPage />
                </StudentProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/courses/new" element={<AdminCourseFormPage />} />
              <Route path="/admin/courses/:id/edit" element={<AdminCourseFormPage />} />
              <Route path="/admin/courses/:id/outline" element={<AdminCourseOutlinePage />} />
              <Route path="/admin/courses/:courseId/modules/:moduleId/classes/new" element={<AdminClassSessionFormPage />} />
              <Route
                path="/admin/courses/:courseId/modules/:moduleId/classes/:classSessionId"
                element={<AdminClassSessionFormPage />}
              />
              <Route path="/admin/courses/quizzes/:quizId/attempts" element={<AdminQuizAttemptsPage />} />
              <Route
                path="/admin/courses/assignments/:assignmentId/submissions"
                element={<AdminAssignmentSubmissionsPage />}
              />
              <Route path="/admin/cohorts" element={<AdminCohortsPage />} />
              <Route path="/admin/registrations" element={<AdminRegistrationsPage />} />
              <Route path="/admin/registrations/:id" element={<AdminRegistrationDetailPage />} />
              <Route path="/admin/settings/terms" element={<AdminTermsPage />} />
<Route path="/admin/students/:studentId" element={<AdminStudentDetailPage />} /><Route path="/admin/grading" element={<AdminGradingPage />} /><Route path="/admin/students" element={<AdminStudentsPage />} />
<Route path="/admin/faqs" element={<AdminGlobalFaqsPage />} />
<Route path="/admin/site-content" element={<AdminSiteContentPage />} />
            </Route>
          </Route>));
function App() { return <ThemeProvider><AuthProvider><StudentAuthProvider><ConfirmDialogProvider><RouterProvider router={router} /></ConfirmDialogProvider></StudentAuthProvider></AuthProvider></ThemeProvider>; }
export default App;
