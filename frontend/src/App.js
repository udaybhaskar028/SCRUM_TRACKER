import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyUpdate from './pages/MyUpdate';
import MyNotes from './pages/MyNotes';
import SprintSetup from './pages/SprintSetup';
import Sprints from './pages/Sprints';

function PrivateRoute({ children, managerOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (managerOnly && user.role !== 'MANAGER') return <Navigate to="/dashboard" replace />;
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
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/my-update" element={<PrivateRoute><MyUpdate /></PrivateRoute>} />
          <Route path="/my-notes" element={<PrivateRoute><MyNotes /></PrivateRoute>} />
          <Route path="/sprints" element={<PrivateRoute><Sprints /></PrivateRoute>} />
          <Route path="/setup" element={<PrivateRoute managerOnly><SprintSetup /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
