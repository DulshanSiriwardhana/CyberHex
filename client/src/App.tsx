import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { ToastProvider } from "@/components/ui/toaster";
import { ToastContainer } from "@/components/ui/toast";
import { AmbientBackground } from "@/components/ui/ambient-background";
import CommandPalette from "@/components/command-palette/CommandPalette";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import NavBar from "@/components/navbar/navbar";
import { SkeletonPage } from "@/components/ui/skeleton";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AuthModals from "@/components/auth-modals";

import LandingPage from "@/pages/LandingPage";

const SignInPage = lazy(() => import("@/pages/SignInPage"));
const SignUpPage = lazy(() => import("@/pages/SignUpPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ExperimentBuilderPage = lazy(() => import("@/pages/ExperimentBuilderPage"));
const ExperimentDetailPage = lazy(() => import("@/pages/ExperimentDetailPage"));
const ExperimentsListPage = lazy(() => import("@/pages/ExperimentsListPage"));
const ModelsPage = lazy(() => import("@/pages/ModelsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ArchitectureDesigner = lazy(() => import("@/pages/ArchitectureDesigner"));


function PageFallback() {
  return (
    <div className="pt-24">
      <SkeletonPage rows={5} />
    </div>
  );
}

function AppLayout() {

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-neutral-950 font-spectral antialiased selection:bg-green-500/30 selection:text-green-200">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(34, 197, 94, 0.08), transparent 80%)`,
        }}
      />
      <AmbientBackground />
      <div className="global-scanline" />
      <div className="global-noise" />

      <div className="relative" style={{ zIndex: 1 }}>
        <NavBar />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/models"
              element={
                <ProtectedRoute>
                  <ModelsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/designer"
              element={
                <ProtectedRoute>
                  <ArchitectureDesigner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/experiments"
              element={
                <ProtectedRoute>
                  <ExperimentsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/experiments/new"
              element={
                <ProtectedRoute>
                  <ExperimentBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/experiments/:id"
              element={
                <ProtectedRoute>
                  <ExperimentDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            { }
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
        <AuthModals />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppLayout />
            <CommandPalette />
            <ToastContainer />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
