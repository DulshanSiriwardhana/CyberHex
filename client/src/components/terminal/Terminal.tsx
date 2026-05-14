import { useState, useRef, useEffect, useCallback } from "react"
import { Terminal as TerminalIcon } from "lucide-react"

interface Command {
  input: string
  output: string
}

const commands: Record<string, string> = {
  help: "Available commands: help, about, projects, skills, contact, clear, whoami",
  about: "CyberHex - Next-Gen AI Platform for model training, deployment, and real-time monitoring.",
  whoami: "guest@cyberhex",
  projects: "• ML Training Dashboard\n• Neural Network Builder\n• Model Deployment Pipeline\n• Real-time Analytics Engine",
  skills: "• Machine Learning / Deep Learning\n• Python / C++ / TypeScript\n• TensorFlow / PyTorch\n• Docker / Kubernetes\n• React / Node.js",
  contact: "Email: hello@cyberhex.dev\nGitHub: github.com/cyberhex",
}

const Terminal = () => {
  const [history, setHistory] = useState<Command[]>([
    { input: "", output: "Welcome to CyberHex Terminal v1.0.0" },
    { input: "", output: 'Type "help" to see available commands.' },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const executeCommand = useCallback((input: string) => {
    const trimmed = input.trim().toLowerCase()
    let output = ""

    if (trimmed === "") {
      return
    }

    if (trimmed === "clear") {
      setHistory([])
      return
    }

    if (commands[trimmed]) {
      output = commands[trimmed]
    } else {
      output = `Command not found: ${trimmed}. Type "help" for available commands.`
    }

    setHistory(prev => [...prev, { input: trimmed, output }])
    setCommandHistory(prev => [...prev, trimmed])
    setHistoryIndex(-1)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentInput)
      setCurrentInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentInput("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setHistory([])
    }
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      className="w-full min-h-[400px] bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
      role="log"
      aria-label="Terminal"
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex items-center gap-2 ml-3">
          <TerminalIcon className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-xs text-neutral-500 font-medium">cyberhex-terminal</span>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="p-4 h-[350px] overflow-y-auto space-y-1"
      >
        {history.map((cmd, i) => (
          <div key={i}>
            {cmd.input && (
              <div className="flex items-center gap-2">
                <span className="text-green-400 shrink-0">guest@cyberhex:~$</span>
                <span className="text-neutral-200">{cmd.input}</span>
              </div>
            )}
            {cmd.output && (
              <pre className="text-neutral-400 whitespace-pre-wrap pl-0 py-0.5">
                {cmd.output}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400 shrink-0">guest@cyberhex:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-neutral-200 placeholder-neutral-600 font-mono text-sm"
            placeholder="Type a command..."
            aria-label="Terminal input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}

export default Terminal