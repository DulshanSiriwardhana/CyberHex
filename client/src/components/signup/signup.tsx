import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { otpApi } from "@/lib/api";

const steps = [
  { id: 1, label: "Profile", fields: ["fullname", "username"] },
  { id: 2, label: "Email", fields: ["email"] },
  { id: 3, label: "Password", fields: ["password", "confirmPassword"] },
  { id: 4, label: "Verify", fields: ["otp"] },
];

export default function SignUp() {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const clearError = () => setError("");

  const canProceed = () => {
    switch (step) {
      case 1:
        return fullname.length > 0 && username.length > 0;
      case 2:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      case 3:
        return password.length >= 6 && password === confirmPassword;
      case 4:
        return otp.length === 6;
      default:
        return false;
    }
  };

  const sendOtpCode = async () => {
    setError("");
    setLoading(true);
    try {
      await otpApi.sendOtp(email);
      setOtpSent(true);
      setOtp("");
      setOtpCooldown(30);
      const interval = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code.");
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };

  const verifyOtpCode = async () => {
    try {
      await otpApi.verifyOtp(email, otp);
      return true;
    } catch (err: any) {
      setError(err?.message || "Invalid verification code.");
      return false;
    }
  };

  const handleNext = async () => {
    clearError();
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const sent = await sendOtpCode();
      if (!sent) return;
      setStep(4);
    }
  };

  const handleBack = () => {
    clearError();
    if (step === 4) setOtpSent(false);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const verified = await verifyOtpCode();
      if (!verified) {
        setLoading(false);
        return;
      }
    } catch {
      setLoading(false);
      return;
    }
    try {
      await register(username, email, password);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <div className="p-1">
      <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
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

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-sm text-rose-400 mb-4"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

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
                <label className="text-xs font-medium text-neutral-400">Full Name</label>
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
                <label className="text-xs font-medium text-neutral-400">Username</label>
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
              <label className="text-xs font-medium text-neutral-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSent(false);
                  clearError();
                }}
                placeholder="ada@cyberhex.dev"
                className="input-cyber"
                autoFocus
              />
              <p className="text-[11px] text-neutral-600 mt-2">
                We'll send a 6-digit verification code to this address.
              </p>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">Password</label>
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

          {/* Step 4: Verify OTP */}
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
                A 6-digit code was sent to{" "}
                <span className="text-neutral-400">{email}</span>
              </p>
              <button
                type="button"
                disabled={otpCooldown > 0}
                onClick={sendOtpCode}
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 disabled:text-neutral-600 disabled:cursor-not-allowed mt-1 transition-colors"
              >
                <RefreshCw
                  className={`h-3 w-3 ${otpCooldown > 0 ? "animate-spin" : ""}`}
                />
                {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend code"}
              </button>
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
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                {step === 3 ? "Send Code" : "Next"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            )}
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
                Creating account...
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