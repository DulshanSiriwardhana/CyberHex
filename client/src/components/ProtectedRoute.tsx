import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate()
  const isAuthenticated = false // Replace with actual auth check

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="font-spectral text-2xl font-extrabold text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-neutral-400 text-sm">
              Please sign in to access this page.
            </p>
          </div>
          <Button
            variant="cyber"
            onClick={() => navigate("/")}
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute