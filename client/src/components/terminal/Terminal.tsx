import { useState, useRef, useEffect, useCallback } from "react";
import { Terminal as TerminalIcon } from "lucide-react";

interface Command {
  input: string;
  output: string;
}

const commands: Record<string, string> = {
  help: "Available: help, about, projects, datasets, skills, train, status, clear",
  about: "CyberHex — High-performance ML with a C++17 core. Neural networking without complexity.",
  whoami: "engineer@cyberhex",
  projects: "• Intrusion Packets (Class.) • DDoS Flow (Class.) • Sensor Telemetry (Reg.)",
  datasets: "• Standard: MNIST, CIFAR, Iris\n• Custom: Uploaded CSV/Binary (Supports 1GB+ files)\n• Modalities: Text, Image, Audio, Video",
  skills: "• C++17 Inference (Native)\n• Streaming Large Datasets (1GB+)\n• Multi-Modal Ingestion\n• WebSocket Live Monitoring",
  contact: "github.com/dulshansiriwardhana/cyberhex",
  train: "Allocating buffers for multi-modal stream...\n> Chunk 1/256 — [################----] 12% — Loss: 0.421\n> Stream synced. Epoch 1 complete.",
  status: "Core: C++17 (Native)\nWorker: Active\nStorage: 1GB Capable\nUptime: 100%",
};

export default function Terminal() {
  const [history, setHistory] = useState<Command[]>([
    { input: "", output: "Welcome to CyberHex Terminal 7.0Local.mini — Release No. 01" },
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
      { }
      <div className="terminal-header">
        <div className="terminal-dot red" />
        <div className="terminal-dot amber" />
        <div className="terminal-dot green" />
        <div className="flex items-center gap-2 ml-3 text-xs text-neutral-500 font-mono">
          <TerminalIcon className="h-3.5 w-3.5" />
          cyberhex@terminal
        </div>
      </div>

      { }
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
        { }
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
