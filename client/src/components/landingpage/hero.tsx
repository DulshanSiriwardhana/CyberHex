import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Shield, Cpu, Network } from "lucide-react"
import banner from "@/assets/images/banner.png"

const features = [
  {
    icon: Cpu,
    title: "Advanced ML Models",
    description: "Train and deploy cutting-edge machine learning models with our powerful engine.",
  },
  {
    icon: Shield,
    title: "Secure & Scalable",
    description: "Enterprise-grade security with scalable infrastructure for your AI workloads.",
  },
  {
    icon: Network,
    title: "Real-time Training",
    description: "Monitor model training in real-time with live loss curves and metrics.",
  },
]

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-boundary px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen AI Platform
              </div>
              <h1 className="font-spectral text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
                  CyberHex
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-lg">
                Empowering AI innovation with a powerful platform for model training, deployment, 
                and real-time monitoring. Built for researchers and engineers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                variant="cyber"
                size="lg"
                className="group"
                aria-label="Get Started"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                aria-label="Learn More"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              className="grid sm:grid-cols-3 gap-4 pt-6"
            >
              {features.map((feature, index) => (
                <div key={index} className="group p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 transition-all duration-300 hover:border-red-900/50 cursor-default">
                  <feature.icon className="w-5 h-5 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Image/Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent rounded-2xl" />
              <img
                src={banner}
                alt="CyberHex Platform Visualization"
                className="w-full h-auto rounded-2xl border border-neutral-800 shadow-2xl shadow-red-900/10"
                loading="lazy"
              />
              {/* Glow effect */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-red-600/10 rounded-full blur-[60px] pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Hero