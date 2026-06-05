import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyUpdate from './pages/MyUpdate';
import Notes from './pages/Notes';
import SprintSetup from './pages/SprintSetup';
import Sprints from './pages/Sprints';
import Teams from './pages/Teams';
import TeamSetup from './pages/TeamSetup';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function PrivateRoute({ children, managerOnly, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'SUPERADMIN') return <Navigate to="/dashboard" replace />;
  if (managerOnly && user.role !== 'MANAGER' && user.role !== 'SUPERADMIN') return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* All authenticated users */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/notes"     element={<PrivateRoute><Notes /></PrivateRoute>} />
          <Route path="/sprints"   element={<PrivateRoute><Sprints /></PrivateRoute>} />
          <Route path="/teams"     element={<PrivateRoute><Teams /></PrivateRoute>} />
          <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* User + Manager */}
          <Route path="/my-update" element={<PrivateRoute><MyUpdate /></PrivateRoute>} />

          {/* Manager only */}
          <Route path="/team-setup"   element={<PrivateRoute managerOnly><TeamSetup /></PrivateRoute>} />
          <Route path="/sprint-setup" element={<PrivateRoute managerOnly><SprintSetup /></PrivateRoute>} />

          {/* SuperAdmin only */}
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
