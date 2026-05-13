import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layer from "@/Layer"
import { AuthProvider } from "@/contexts/auth"
import ErrorBoundary from "@/components/ErrorBoundary"
import ProtectedRoute from "@/components/ProtectedRoute"
import { items } from "@/const/data"
import { Skeleton } from "@/components/ui/skeleton"

const LandingPage = lazy(() => import("@/pages/LandingPage"))
const CyberGames = lazy(() => import("@/pages/CyberGames"))
const TestPage = lazy(() => import("@/pages/TestPage"))

const LoadingFallback = () => (
  <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-8 pt-24">
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
                <Route path={items[0].path} element={<LandingPage />} />
                <Route
                  path={items[2].path}
                  element={
                    <ProtectedRoute>
                      <CyberGames />
                    </ProtectedRoute>
                  }
                />
                <Route path={items[1].path} element={<LandingPage />} />
                <Route path={items[3].path} element={<LandingPage />} />
                <Route path="/test" element={<TestPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layer>
      </AuthProvider>
    </Router>
  )
}

export default App