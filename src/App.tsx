import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SocketProvider } from '@/context/SocketContext';
import LoginPage from '@/pages/auth/LoginPage';
import { CallProvider } from '@/context/CallContext';
import { CallOverlay } from '@/components/chat/CallOverlay';
import { IncomingCallModal } from '@/components/chat/IncomingCallModal';
import { OutgoingCallModal } from '@/components/chat/OutgoingCallModal';
import ChatPage from '@/pages/dashboard/ChatPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import OverviewPage from '@/pages/dashboard/OverviewPage';
import PatientsPage from '@/pages/dashboard/PatientsPage';
import DoctorsPage from '@/pages/dashboard/DoctorsPage';

import AppointmentsPage from '@/pages/dashboard/AppointmentsPage';
import MedicalRecordsPage from '@/pages/dashboard/MedicalRecordsPage';
import BillingPage from '@/pages/dashboard/BillingPage';
import HealthTipsPage from '@/pages/dashboard/HealthTipsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <CallProvider>
              <CallOverlay />
              <IncomingCallModal />
              <OutgoingCallModal />
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<OverviewPage />} />
                    {/* Add other protected routes here */}
                    <Route path="/patients" element={<PatientsPage />} />
                    <Route path="/doctors" element={<DoctorsPage />} />
                    <Route path="/messages" element={<ChatPage />} />
                    <Route path="/appointments" element={<AppointmentsPage />} />
                    <Route path="/records" element={<MedicalRecordsPage />} />
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/health-tips" element={<HealthTipsPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </CallProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
