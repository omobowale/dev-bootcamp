import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";
import { TermsPage } from "./pages/TermsPage";
import { PrivateTutorialsPage } from "./pages/PrivateTutorialsPage";
import { AdminTermsPage } from "./pages/admin/AdminTermsPage";
import { AdminStudentsPage } from "./pages/admin/AdminStudentsPage";
import { StudentLoginPage } from "./pages/student/StudentLoginPage";
import { StudentInvitePage } from "./pages/student/StudentInvitePage";
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage";
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Outlet, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StudentAuthProvider } from "./context/StudentAuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { StudentProtectedRoute } from "./routes/StudentProtectedRoute";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RegistrationSuccessPage } from "./pages/RegistrationSuccessPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminCoursesPage } from "./pages/admin/AdminCoursesPage";
import { AdminCourseFormPage } from "./pages/admin/AdminCourseFormPage";
import { AdminCourseOutlinePage } from "./pages/admin/AdminCourseOutlinePage";
import { AdminCohortsPage } from "./pages/admin/AdminCohortsPage";
import { AdminRegistrationsPage } from "./pages/admin/AdminRegistrationsPage";
import { AdminRegistrationDetailPage } from "./pages/admin/AdminRegistrationDetailPage";
import { AdminGlobalFaqsPage } from "./pages/admin/AdminGlobalFaqsPage";

import { Toasts } from './components/Toasts';
import { RouteExperience } from './components/RouteExperience';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminSiteContentPage } from './pages/admin/AdminSiteContentPage';
import './modern.css';
const router = createBrowserRouter(createRoutesFromElements(<Route element={<><RouteExperience /><Toasts /><Outlet /></>}>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:slug" element={<CourseDetailPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/registration/success" element={<RegistrationSuccessPage />} />
              <Route path="/terms" element={<TermsPage />} /><Route path="/private-tutorials" element={<PrivateTutorialsPage />} />
<Route path="/about" element={<AboutPage />} />
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
              <Route path="/admin/cohorts" element={<AdminCohortsPage />} />
              <Route path="/admin/registrations" element={<AdminRegistrationsPage />} />
              <Route path="/admin/registrations/:id" element={<AdminRegistrationDetailPage />} />
              <Route path="/admin/settings/terms" element={<AdminTermsPage />} />
<Route path="/admin/students" element={<AdminStudentsPage />} />
<Route path="/admin/faqs" element={<AdminGlobalFaqsPage />} />
<Route path="/admin/site-content" element={<AdminSiteContentPage />} />
            </Route>
          </Route>));
function App() { return <ThemeProvider><AuthProvider><StudentAuthProvider><ConfirmDialogProvider><RouterProvider router={router} /></ConfirmDialogProvider></StudentAuthProvider></AuthProvider></ThemeProvider>; }
export default App;
