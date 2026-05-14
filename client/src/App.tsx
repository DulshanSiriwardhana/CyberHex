import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layer from "@/Layer"
import { AuthProvider } from "@/contexts/auth"
import ErrorBoundary from "@/components/ErrorBoundary"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Skeleton } from "@/components/ui/skeleton"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const CyberGames = lazy(() => import("@/pages/CyberGames"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const ModelsPage = lazy(() => import("@/pages/ModelsPage"))
const SettingsPage = lazy(() => import("@/pages/SettingsPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-8 pt-24">
    <div className="w-full max-w-4xl space-y-6">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layer>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<LandingPage />} />
                <Route path="/contact" element={<LandingPage />} />
                <Route path="/machine-learning" element={<LandingPage />} />
                <Route path="/cyber-games" element={<ProtectedRoute><CyberGames /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/experiments" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/models" element={<ProtectedRoute><ModelsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layer>
      </AuthProvider>
    </Router>
  )
}

export default App
