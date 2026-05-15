import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { id: 1, label: "Profile", fields: ["fullname", "username"] },
  { id: 2, label: "Email", fields: ["email"] },
  { id: 3, label: "Password", fields: ["password", "confirmPassword"] },
  { id: 4, label: "Verify", fields: ["otp"] },
];

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const canProceed = () => {
    switch (step) {
      case 1:
        return fullname.length > 0 && username.length > 0;
      case 2:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      case 3:
        return password.length >= 6 && password === confirmPassword;
      case 4:
        return otp.length >= 4;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <div className="p-1">
      <h2 className="text-2xl font-bold text-white mb-1">
        Create account
      </h2>
      <p className="text-sm text-neutral-400 mb-6">
        Step {step} of {steps.length} — {steps[step - 1].label}
      </p>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              s.id < step
                ? "bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.4)]"
                : s.id === step
                  ? "bg-cyan-500/60"
                  : "bg-neutral-800"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4 min-h-[180px]"
        >
          {/* Step 1: Profile */}
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="input-cyber"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ada_hacks"
                  className="input-cyber"
                />
              </div>
            </>
          )}

          {/* Step 2: Email */}
          {step === 2 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@cyberhex.dev"
                className="input-cyber"
                autoFocus
              />
              <p className="text-[11px] text-neutral-600 mt-2">
                We'll send a verification code to this address.
              </p>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-cyber"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={
                    confirmPassword && password !== confirmPassword
                      ? "input-cyber-error"
                      : "input-cyber"
                  }
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1">
                    Passwords don't match
                  </p>
                )}
              </div>
            </>
          )}

          {/* Step 4: OTP */}
          {step === 4 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="input-cyber text-center text-lg tracking-[0.3em] font-mono"
                autoFocus
              />
              <p className="text-[11px] text-neutral-600 mt-2">
                We sent a 6-digit code to {email || "your email"}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={step === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>

        {step < 4 ? (
          <Button onClick={handleNext} disabled={!canProceed()} size="lg">
            Next
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Complete Setup
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}