import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, MessageSquare, MapPin, Send, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const ContactPage = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] py-20">
      <div className="mx-auto max-w-boundary px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-spectral text-4xl font-extrabold text-white mb-4">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">Touch</span>
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Have questions about CyberHex, want to collaborate, or just want to say hi? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Email</p>
                    <a href="mailto:hello@cyberhex.dev" className="text-white text-sm hover:text-red-400 transition-colors">
                      hello@cyberhex.dev
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Location</p>
                    <p className="text-white text-sm">Colombo, Sri Lanka</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  Send a Message
                </CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you.</CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-green-600/10 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-white font-semibold text-lg">Message sent!</p>
                    <p className="text-neutral-400 text-sm">We'll get back to you as soon as possible.</p>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-300 mb-1.5 block">Message</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what's on your mind..."
                        rows={5}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm placeholder-neutral-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all resize-none"
                      />
                    </div>
                    <Button type="submit" variant="cyber" size="lg" className="w-full" isLoading={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage