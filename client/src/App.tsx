import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { ToastProvider } from "@/components/ui/toaster";
import { ToastContainer } from "@/components/ui/toast";
import { ParticleBackground } from "@/components/ui/particle-background";
import CommandPalette from "@/components/command-palette/CommandPalette";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import NavBar from "@/components/navbar/navbar";
import { SkeletonPage } from "@/components/ui/skeleton";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Eager: landing is the first thing everyone sees
import LandingPage from "@/pages/LandingPage";

// Lazy: everything else
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const SignInPage = lazy(() => import("@/pages/SignInPage"));
const SignUpPage = lazy(() => import("@/pages/SignUpPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ExperimentBuilderPage = lazy(() => import("@/pages/ExperimentBuilderPage"));
const ExperimentDetailPage = lazy(() => import("@/pages/ExperimentDetailPage"));
const ExperimentsListPage = lazy(() => import("@/pages/ExperimentsListPage"));
const ModelsPage = lazy(() => import("@/pages/ModelsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CyberGames = lazy(() => import("@/pages/CyberGames"));

function PageFallback() {
  return (
    <div className="pt-24">
      <SkeletonPage rows={5} />
    </div>
  );
}

function AppLayout() {
  // Register global keyboard shortcuts (Ctrl+K, Ctrl+Shift+T, etc.)
  useKeyboardShortcuts();

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] font-sans antialiased">
      {/* Ambient particle background layer */}
      <ParticleBackground />

      {/* Content layer */}
      <div className="relative" style={{ zIndex: 1 }}>
        <NavBar />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected */}
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
              path="/cybergames"
              element={
                <ProtectedRoute>
                  <CyberGames />
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

            {/* Catch-all */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
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
