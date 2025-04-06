"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Home, LogOut, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HelpPage({ params }: any) {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [displayedResponse, setDisplayedResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const [username, setUsername] = useState("")
  useEffect(() => {
    const getUsername = async () => {
      const param = await params
      const paramUsername = param.username
      setUsername(paramUsername)
    }
    getUsername()
  }, [params])

  const scanRef = useRef<HTMLDivElement>(null)
  const scrollToScan = () => {
    scanRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResponse("")
    setDisplayedResponse("")

    try {
      const res = await axios.post("/api/helpChatbot", {
        prompt: [{ role: "user", parts: [{ text: prompt }] }],
      })

      if (res.data.success) {
        setResponse(res.data.helpAnswer)
      } else {
        setResponse("Something went wrong.")
      }
    } catch (error) {
      setResponse("Failed to fetch help. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Typing animation effect
  useEffect(() => {
    if (!response) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayedResponse((prev) => prev + response[i])
      i++
      if (i >= response.length) clearInterval(interval)
    }, 20)
    return () => clearInterval(interval)
  }, [response])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-12 relative">
        {/* Navigation Bar */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 rounded-full shadow-sm hover:shadow-md transition-all"
            onClick={() => router.push(`/home/${username}`)}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 rounded-full shadow-sm hover:shadow-md transition-all"
            onClick={() => router.push(`/home`)}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-purple-600 dark:text-purple-300" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-slate-800 dark:text-slate-100">How can I help you today?</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Ask me anything about the Detectify app features, functionality, or troubleshooting
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Textarea
                className="w-full min-h-[120px] p-4 resize-none border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ask me anything about the Detectify app..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleSend}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>Send</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Area */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8"
            >
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 rounded-full bg-purple-600 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-purple-600 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-purple-600 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Thinking...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {displayedResponse && (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
                <CardHeader className="pb-2 pt-6 px-6">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-medium"
                    >
                      Detectify Assistant
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {displayedResponse}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ Section */}
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 mt-12">
          <CardHeader className="pb-2 pt-6 px-6">
            <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-4">
              {[
                "How does the Scan feature work?",
                "What is the Security section monitoring?",
                "How can I optimize the storage layout?",
                "What does Inventory Management show?",
                "Can I get alerts for object movements?",
              ].map((question, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">{index + 1}</span>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {question}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Detectify App Help Center • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}

