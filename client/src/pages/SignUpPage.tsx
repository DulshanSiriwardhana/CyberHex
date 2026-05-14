import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check, Cpu } from "lucide-react"
import { useAuth } from "@/contexts/auth"

const steps = ["Profile", "Email", "Password", "Verify"]

const SignUpPage = () => {
  const navigate = useNavigate()
  const { register, loading, error: authError } = useAuth()
  const [step, setStep] = useState(1)
  const [fullname, setFullname] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    switch (step) {
      case 1:
        if (!fullname.trim()) newErrors.fullname = "Full name is required"
        if (!username.trim()) newErrors.username = "Username is required"
        else if (username.length < 3) newErrors.username = "Username must be at least 3 characters"
        break
      case 2:
        if (!email) newErrors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format"
        break
      case 3:
        if (!password) newErrors.password = "Password is required"
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
        if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match"
        break
      case 4:
        if (!otp || otp.length < 4) newErrors.otp = "Verification code is required"
        break
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setErrors({})
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    try {
      await register(username, email, password)
      setStep(5)
    } catch {
      // Auth context handles error display
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <Cpu className="w-8 h-8 text-red-500 transition-transform duration-300 group-hover:rotate-90" />
          <span className="font-spectral text-2xl font-extrabold text-white tracking-tight">
            Cyber<span className="text-red-500">Hex</span>
          </span>
        </Link>

        <div className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8">
          <h1 className="text-2xl font-spectral font-extrabold text-white mb-2">
            Create account
          </h1>
          <p className="text-neutral-400 text-sm mb-6">
            Join CyberHex to start building with AI.
          </p>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                  step > i + 1
                    ? "bg-green-600 text-white"
                    : step === i + 1
                    ? "bg-red-600 text-white ring-2 ring-red-500/30"
                    : "bg-neutral-800 text-neutral-500"
                }`}>
                  {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs text-neutral-500 hidden sm:block">{s}</span>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-neutral-800" />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Full name</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => { setFullname(e.target.value); setErrors(prev => ({ ...prev, fullname: "" })) }}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-neutral-900 text-white text-sm placeholder-neutral-600 outline-none transition-all ${
                    errors.fullname ? "border-red-500 focus:ring-red-500" : "border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.fullname && <p className="text-xs text-red-400">{errors.fullname}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrors(prev => ({ ...prev, username: "" })) }}
                  placeholder="johndoe"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-neutral-900 text-white text-sm placeholder-neutral-600 outline-none transition-all ${
                    errors.username ? "border-red-500 focus:ring-red-500" : "border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.username && <p className="text-xs text-red-400">{errors.username}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })) }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-neutral-900 text-white text-sm placeholder-neutral-600 outline-none transition-all ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })) }}
                  placeholder="Min. 6 characters"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-neutral-900 text-white text-sm placeholder-neutral-600 outline-none transition-all ${
                    errors.password ? "border-red-500 focus:ring-red-500" : "border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: "" })) }}
                  placeholder="Repeat password"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-neutral-900 text-white text-sm placeholder-neutral-600 outline-none transition-all ${
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Verification code</label>
                <p className="text-xs text-neutral-500">Enter the 6-digit code sent to {email}</p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setErrors(prev => ({ ...prev, otp: "" })) }}
                  placeholder="000000"
                  maxLength={6}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-neutral-900 text-white text-sm placeholder-neutral-600 text-center text-2xl tracking-[0.5em] outline-none transition-all ${
                    errors.otp ? "border-red-500 focus:ring-red-500" : "border-neutral-800 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  }`}
                />
                {errors.otp && <p className="text-xs text-red-400">{errors.otp}</p>}
              </div>
            </div>
          )}

          {/* Success */}
          {step === 5 && (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-green-600/10 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-white font-semibold text-lg">Account created!</p>
              <p className="text-neutral-400 text-sm">Welcome to CyberHex. Redirecting to dashboard...</p>
              <Button variant="cyber" className="mt-4" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          )}

          {authError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 text-center mt-4"
            >
              {authError}
            </motion.p>
          )}

          {/* Navigation */}
          {step < 5 && (
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                variant="cyber"
                onClick={step === 4 ? handleSubmit : handleNext}
                isLoading={step === 4 && loading}
                className="flex-1"
              >
                {step === 4 ? (
                  "Create Account"
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link to="/" className="text-red-400 hover:text-red-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default SignUpPage