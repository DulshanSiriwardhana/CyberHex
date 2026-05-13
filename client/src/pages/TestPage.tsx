import { PageLayout } from "@/components/ui/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { TestTube, Code, Bug, CheckCircle2 } from "lucide-react"

const testItems = [
  {
    icon: Code,
    title: "Component Tests",
    description: "Verify UI components render correctly",
    status: "passing",
  },
  {
    icon: Bug,
    title: "Integration Tests",
    description: "Test user flows and interactions",
    status: "pending",
  },
  {
    icon: TestTube,
    title: "E2E Tests",
    description: "End-to-end scenario validation",
    status: "pending",
  },
]

const TestPage = () => {
  return (
    <PageLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center">
              <TestTube className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h1 className="font-spectral text-3xl font-extrabold text-white">
                Test Environment
              </h1>
              <p className="text-neutral-400 text-sm">
                Development testing and validation suite
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card glow className="hover:border-neutral-700 transition-all duration-300">
                <CardHeader>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-2">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${
                      item.status === "passing" ? "text-green-500" : "text-neutral-600"
                    }`} />
                    <span className={`text-sm font-medium capitalize ${
                      item.status === "passing" ? "text-green-500" : "text-neutral-500"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Run tests and verify the application</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="cyber" aria-label="Run all tests">
                Run All Tests
              </Button>
              <Button variant="outline" aria-label="Run unit tests">
                Unit Tests
              </Button>
              <Button variant="ghost" aria-label="Clear test results">
                Clear Results
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  )
}

export default TestPage