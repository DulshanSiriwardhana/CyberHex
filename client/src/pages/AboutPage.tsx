import { motion } from "framer-motion"
import { Cpu, Code2, Layers, Zap, Github, Globe, Linkedin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      {/* Hero */}
      <section className="py-16 sm:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-boundary px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <Cpu className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="font-spectral text-4xl sm:text-5xl font-extrabold text-white mb-4">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">CyberHex</span>
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed">
              CyberHex is a full-stack machine learning platform built from the ground up — combining a custom C++ neural network engine, a Python ML suite, a Node.js backend, and a modern React dashboard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 relative">
        <div className="mx-auto max-w-boundary px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <Card glow className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                  <Code2 className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Built from Scratch</CardTitle>
                <CardDescription>
                  Every component — from matrix operations to the neural network engine — is written in pure C++17 without external ML libraries.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card glow className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Full-Stack Integration</CardTitle>
                <CardDescription>
                  Seamlessly connects C++ ML engine, Python algorithms, Node.js API, and React dashboard via WebSockets and REST.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card glow className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Real-Time Visualization</CardTitle>
                <CardDescription>
                  Watch your models train in real-time with live loss curves, weight visualizations, and interactive dashboards.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/20 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-boundary px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-spectral text-3xl font-extrabold text-white mb-4">Technology Stack</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              CyberHex leverages a diverse set of technologies across its stack.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "ML Engine", items: ["C++17", "OpenMP", "Custom Linear Algebra"] },
              { title: "Python ML", items: ["Python 3", "NumPy", "Statistical Analysis"] },
              { title: "Backend", items: ["Node.js", "Express 5", "MongoDB", "JWT", "WebSockets"] },
              { title: "Frontend", items: ["React 19", "TypeScript", "Tailwind CSS", "Recharts", "Zustand"] },
            ].map((group) => (
              <Card key={group.title}>
                <CardHeader>
                  <CardTitle className="text-white text-lg">{group.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-neutral-400 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Author */}
      <section className="py-16 relative">
        <div className="mx-auto max-w-boundary px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-spectral text-3xl font-extrabold text-white mb-6">Created By</h2>
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-white text-xl font-semibold mb-1">Dulshan Siriwardhana</p>
                <p className="text-neutral-400 text-sm mb-6">Full-Stack Developer & ML Engineer</p>
                <div className="flex items-center justify-center gap-4">
                  <a href="https://github.com/DulshanSiriwardhana" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-all">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="http://dulshansiriwardhana.live" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-all">
                    <Globe className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/dulshansiriwardhana" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-all">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8">
        <div className="mx-auto max-w-boundary px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} CyberHex. Built with passion for ML engineering.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AboutPage