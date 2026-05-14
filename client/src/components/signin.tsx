import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react"
import { useAuth } from "@/contexts/auth"

interface SignInProps {
  onSuccess?: () => void
  onSignUpClick?: () => void
}

const SignIn = ({ onSuccess, onSignUpClick }: SignInProps) => {
  const { login, loading: authLoading, error: authError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format"
    }
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await login(email, password)
      onSuccess?.()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-2">
      <DialogTitle className="text-2xl font-spectral font-extrabold text-white mb-2">
        Welcome back
      </DialogTitle>
      <DialogDescription className="text-neutral-400 mb-6">
        Sign in to your CyberHex account to continue.
      </DialogDescription>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-neutral-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
              }}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-neutral-900 text-white text-sm placeholder-neutral-600 transition-all
                ${errors.email 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                } outline-none`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              id="email-error"
              className="text-xs text-red-400"
              role="alert"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-neutral-300">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
              aria-label="Forgot password"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
              }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-neutral-900 text-white text-sm placeholder-neutral-600 transition-all
                ${errors.password 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                } outline-none`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              id="password-error"
              className="text-xs text-red-400"
              role="alert"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {authError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 text-center"
            role="alert"
          >
            {authError}
          </motion.p>
        )}

        <Button
          type="submit"
          variant="cyber"
          className="w-full"
          size="lg"
          isLoading={isLoading || authLoading}
          aria-label="Sign in"
        >
          {!isLoading && !authLoading && <LogIn className="w-4 h-4 mr-2" />}
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSignUpClick}
          className="text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          Create one
        </button>
      </p>
    </div>
  )
}

export default SignIn