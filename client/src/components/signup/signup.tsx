import { useState } from "react"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

const SignUp = () => {
  const [step, setStep] = useState(1)
  const [fullname, setFullname] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")

  const steps = ["Profile", "Email", "Password", "Verify"]
  const canProceed = () => {
    switch (step) {
      case 1: return fullname.length > 0 && username.length > 0
      case 2: return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      case 3: return password.length >= 6 && password === confirmPassword
      case 4: return otp.length >= 4
      default: return true
    }
  }

  return (
    <div className="p-2">
      <DialogTitle className="text-2xl font-spectral font-extrabold text-white mb-2">
        Create account
      </DialogTitle>
      <DialogDescription className="text-neutral-400 mb-6">
        Join CyberHex to start building with AI.
      </DialogDescription>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
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
              onChange={(e) => setFullname(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
            />
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
            />
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Verification code
            </label>
            <p className="text-xs text-neutral-500">
              Enter the 6-digit code sent to {email}
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 text-center text-2xl tracking-[0.5em] focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
            />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="text-center py-8 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-green-600/10 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-white font-semibold text-lg">Account created!</p>
          <p className="text-neutral-400 text-sm">Welcome to CyberHex.</p>
        </div>
      )}

      {/* Navigation */}
      {step < 5 && (
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            variant="cyber"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex-1"
            aria-label={step === 4 ? "Create account" : "Next step"}
          >
            {step === 4 ? (
              <>Create Account</>
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
  )
}

export default SignUp