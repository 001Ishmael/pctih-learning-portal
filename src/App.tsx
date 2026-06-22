import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import PublicLayout from './components/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Courses from './pages/public/Courses';
import CourseDetails from './pages/public/CourseDetails';
import Workshops from './pages/public/Workshops';
import EventDetails from './pages/public/EventDetails';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import Contact from './pages/public/Contact';
import FAQ from './pages/public/FAQ';
import VerifyCertificate from './pages/public/VerifyCertificate';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentDashboardHome from './pages/student/StudentDashboardHome';
import EnrollFlow from './pages/student/EnrollFlow';
import MyEnrollments from './pages/student/MyEnrollments';
import MySchedule from './pages/student/MySchedule';
import MyCertificates from './pages/student/MyCertificates';
import MyNotifications from './pages/student/MyNotifications';
import MyReferrals from './pages/student/MyReferrals';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import AdminCourses from './pages/admin/AdminCourses';
import AdminWorkshops from './pages/admin/AdminWorkshops';
import AdminPayments from './pages/admin/AdminPayments';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminTrainers from './pages/admin/AdminTrainers';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminLeads from './pages/admin/AdminLeads';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminSettings from './pages/admin/AdminSettings';
import WorkshopCheckIn from './pages/admin/WorkshopCheckIn';
import FinanceReports from './pages/admin/FinanceReports';

import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerCourses from './pages/trainer/TrainerCourses';
import TrainerStudents from './pages/trainer/TrainerStudents';
import TrainerAttendance from './pages/trainer/TrainerAttendance';
import TrainerMaterials from './pages/trainer/TrainerMaterials';
import { useAuth } from './lib/AuthContext';

function AdminOverview() {
  const { profile } = useAuth();
  return profile?.role === 'finance_officer' ? <FinanceReports /> : <AdminHome />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetails />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/workshops/:slug" element={<EventDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/verify-certificate" element={<VerifyCertificate />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute allow={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboardHome />} />
            <Route path="enroll" element={<EnrollFlow />} />
            <Route path="enrollments" element={<MyEnrollments />} />
            <Route path="schedule" element={<MySchedule />} />
            <Route path="certificates" element={<MyCertificates />} />
            <Route path="referrals" element={<MyReferrals />} />
            <Route path="notifications" element={<MyNotifications />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={['super_admin', 'admin', 'finance_officer', 'front_desk']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="workshops" element={<AdminWorkshops />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="trainers" element={<AdminTrainers />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="promo-codes" element={<AdminPromoCodes />} />
            <Route path="referrals" element={<AdminReferrals />} />
            <Route path="check-in" element={<WorkshopCheckIn />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route
            path="/trainer"
            element={
              <ProtectedRoute allow={['trainer']}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<TrainerCourses />} />
            <Route path="students" element={<TrainerStudents />} />
            <Route path="attendance" element={<TrainerAttendance />} />
            <Route path="materials" element={<TrainerMaterials />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
