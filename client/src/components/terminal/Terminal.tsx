import { useState, useRef, useEffect, useCallback } from "react";
import { Terminal as TerminalIcon } from "lucide-react";

interface Command {
  input: string;
  output: string;
}

const commands: Record<string, string> = {
  help: "Available commands: help, about, projects, skills, contact, clear, whoami, train, status",
  about:
    "CyberHex - Next-Gen ML Platform. \nVisual neural network builder with a C++ inference engine.\nTrain models in your browser. Deploy anywhere.",
  whoami: "guest@cyberhex",
  projects:
    "• MNIST Classifier — 98.7% accuracy\n• Sentiment LSTM — 87.2% accuracy\n• Price Predictor — 94.1% accuracy\n• Image GAN — 76.4% FID",
  skills:
    "• Visual Layer Editor\n• C++ Inference Engine (native speed)\n• WebSocket Live Training\n• Experiment Tracking\n• Model Export (C++ / WASM)",
  contact:
    "Email: hello@cyberhex.dev\nGitHub: github.com/dulshansiriwardhana/cyberhex",
  train:
    "Launching training session...\n> Epoch 1/50 — loss: 0.8932 — acc: 42.1%\n> Epoch 2/50 — loss: 0.7214 — acc: 58.3%\n...\nTraining complete. Model saved.",
  status:
    "System: ONLINE\nEngine: C++ (native)\nActive users: 3,200+\nModels trained: 12,847\nUptime: 99.99%",
};

export default function Terminal() {
  const [history, setHistory] = useState<Command[]>([
    { input: "", output: "Welcome to CyberHex Terminal v4.0.0 — Release No. 01" },
    { input: "", output: 'Type "help" to see available commands.' },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const executeCommand = useCallback((input: string) => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;

    if (trimmed === "clear") {
      setHistory([]);
      return;
    }

    let output: string;
    if (commands[trimmed]) {
      output = commands[trimmed];
    } else {
      output = `Command not found: ${trimmed}. Type "help" for available commands.`;
    }

    setHistory((prev) => [...prev, { input: trimmed, output }]);
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentInput);
      setCurrentInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className="terminal-window w-full max-w-2xl mx-auto" onClick={focusInput}>
      {/* Header bar */}
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot amber" />
        <div className="terminal-dot green" />
        <div className="flex items-center gap-2 ml-3 text-xs text-neutral-500 font-mono">
          <TerminalIcon className="h-3.5 w-3.5" />
          cyberhex@terminal
        </div>
      </div>

      {/* Body */}
      <div ref={terminalRef} className="terminal-body">
        {history.map((cmd, i) => (
          <div key={i}>
            {cmd.input && (
              <div className="terminal-line">
                <span className="terminal-prompt">guest@cyberhex:~$</span>
                <span className="text-neutral-0">{cmd.input}</span>
              </div>
            )}
            {cmd.output && (
              <div className="terminal-line mt-0.5 mb-2">
                <span className="terminal-output">{cmd.output}</span>
              </div>
            )}
          </div>
        ))}
        {/* Current input line */}
        <div className="terminal-input-line">
          <span className="terminal-prompt">guest@cyberhex:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            placeholder="type a command..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}