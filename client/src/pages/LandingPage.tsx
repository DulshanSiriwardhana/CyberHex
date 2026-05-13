import Hero from "@/components/landingpage/hero"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Layers, BarChart3, Workflow, GitBranch } from "lucide-react"

const highlights = [
  {
    icon: Layers,
    title: "Model Architecture",
    description: "Build and customize neural network architectures with an intuitive visual builder.",
    gradient: "from-blue-500/20 to-purple-500/20",
  },
  {
    icon: BarChart3,
    title: "Live Metrics",
    description: "Track training progress with real-time loss curves, accuracy, and custom metrics.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Workflow,
    title: "Pipeline Automation",
    description: "Automate your ML pipelines from data preprocessing to model deployment.",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Track experiments, compare results, and version your models effortlessly.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
]

const LandingPage = () => {
  return (
    <div>
      <Hero />

      {/* Highlights Section */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/30 to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-boundary px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-spectral text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Everything you need for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
                AI Development
              </span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              From experimentation to production, CyberHex provides the tools to accelerate your ML workflow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {highlights.map((item, index) => (
              <Card key={index} glow className="group hover:border-neutral-700 transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl group-hover:text-red-400 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-neutral-400 text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="group/btn text-neutral-500 hover:text-white">
                    Learn more
                    <ArrowUpRight className="ml-1.5 w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-boundary px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-spectral text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to transform your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
                ML workflow
              </span>
              ?
            </h2>
            <p className="text-neutral-400 text-lg mb-8">
              Join the future of AI development. Start building, training, and deploying models in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cyber" size="xl" aria-label="Start Free Trial">
                Start Free Trial
              </Button>
              <Button variant="outline" size="xl" aria-label="View Documentation">
                View Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8">
        <div className="mx-auto max-w-boundary px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} CyberHex. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">Privacy</a>
            <a href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">Terms</a>
            <a href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage