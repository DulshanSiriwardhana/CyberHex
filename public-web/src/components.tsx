import React, { useState, useEffect, useRef } from 'react'

// ─── Nav ──────────────────────────────────────────────────────────────────────
export function Nav() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <div className="nav-inner">
                    <a href="#" className="nav-logo">
                        <span className="nav-logo-icon">⬡</span>
                        CyberHex
                    </a>
                    <ul className="nav-links">
                        {['Features', 'Architecture', 'Stack', 'API', 'ML Engine'].map(item => (
                            <li key={item}>
                                <a href={`#${item.toLowerCase().replace(/ /g, '-')}`}>{item}</a>
                            </li>
                        ))}
                    </ul>
                    <a
                        href="https://github.com/DulshanSiriwardhana/CyberHex"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ fontSize: 13, padding: '8px 16px' }}
                    >
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        GitHub
                    </a>
                </div>
            </div>
        </nav>
    )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function Hero() {
    return (
        <section className="hero" id="home">
            <div className="hero-bg" />
            <div className="hero-grid" />
            <div className="container">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot" />
                        Actively Under Development
                    </div>

                    <h1 className="hero-title">
                        Full-Stack{' '}
                        <span className="gradient-text">Machine Learning</span>
                        {' '}Platform
                    </h1>

                    <p className="hero-subtitle">
                        CyberHex combines a custom{' '}
                        <strong style={{ color: 'var(--green-400)' }}>C++ neural network engine</strong>,
                        a Python ML suite, a Node.js/Express backend, and a modern
                        React dashboard — all containerized with Docker.
                    </p>

                    <div className="hero-cta">
                        <a
                            href="https://github.com/DulshanSiriwardhana/CyberHex"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            View on GitHub
                        </a>
                        <a href="#features" className="btn btn-outline">
                            Explore Features
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                        </a>
                    </div>

                    <div className="hero-stats">
                        {[
                            { value: 'C++17', label: 'Core Engine' },
                            { value: '6', label: 'UI Themes' },
                            { value: '4', label: 'Optimizers' },
                            { value: 'WS', label: 'Real-Time' },
                        ].map(stat => (
                            <div key={stat.label} className="stat-item">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: '⚙️',
        color: 'green',
        badge: 'badge-green',
        title: 'C++ ML Engine',
        desc: 'Custom Matrix implementation using std::vector with OpenMP parallelism. Dense layers with forward/backward propagation, ReLU, Sigmoid, Softmax activations — all built from scratch.',
        tags: ['C++17', 'OpenMP', 'Neural Net', 'Backprop'],
    },
    {
        icon: '🐍',
        color: 'blue',
        badge: 'badge-blue',
        title: 'Python ML Suite',
        desc: 'Linear regression and extended ML algorithm implementations backed by a modular commons library for shared statistical utilities like mean, variance, and standard deviation.',
        tags: ['Python 3', 'NumPy', 'Linear Regression'],
    },
    {
        icon: '🖥️',
        color: 'purple',
        badge: 'badge-purple',
        title: 'Node.js Backend',
        desc: 'RESTful API with JWT authentication (access + refresh tokens), email verification, MongoDB persistence, real-time WebSockets, rate limiting, Helmet security, and structured Winston logging.',
        tags: ['Express 5', 'MongoDB', 'JWT', 'WebSocket'],
    },
    {
        icon: '⚛️',
        color: 'orange',
        badge: 'badge-orange',
        title: 'React Dashboard',
        desc: 'Landing page, experiment builder, model overview, training charts, and CyberGames. 6 UI themes: Cyber, Nebula, Midnight, Plasma, Aurora, Emerald — with dark/light toggle.',
        tags: ['React 19', 'TypeScript', 'Zustand', 'Framer Motion'],
    },
    {
        icon: '📊',
        color: 'green',
        badge: 'badge-green',
        title: 'Real-Time Visualization',
        desc: 'Standalone ML visualization dashboard with WebSocket data streaming and interactive training loss/accuracy charts — updated live as the C++ engine trains your model.',
        tags: ['Recharts', 'WebSocket', 'Live Charts'],
    },
    {
        icon: '🐳',
        color: 'blue',
        badge: 'badge-blue',
        title: 'Docker Infrastructure',
        desc: 'Full Docker Compose orchestration across MongoDB, backend, and frontend via nginx. Health checks, restart policies, bridged networking, and environment-based configuration.',
        tags: ['Docker', 'Compose', 'Nginx', 'MongoDB 7'],
    },
]

export function Features() {
    return (
        <section id="features">
            <div className="container">
                <div className="animate-on-scroll">
                    <span className="section-label">Platform Capabilities</span>
                    <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', marginBottom: 16 }}>
                        What <span className="gradient-text">CyberHex</span> Does
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 600, marginBottom: 48, fontSize: 16 }}>
                        A cohesive ecosystem where every layer speaks to the next — from matrix arithmetic
                        in native C++ to pixel-perfect charts in the browser.
                    </p>
                </div>
                <div className="features-grid">
                    {FEATURES.map((f, i) => (
                        <AnimateCard key={f.title} delay={i * 60}>
                            <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                            <h3 className="feature-title">{f.title}</h3>
                            <p className="feature-desc">{f.desc}</p>
                            <div className="feature-tags">
                                {f.tags.map(tag => (
                                    <span key={tag} className={`badge ${f.badge}`}>{tag}</span>
                                ))}
                            </div>
                        </AnimateCard>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Architecture ─────────────────────────────────────────────────────────────

function ArchNode({
    x, y, w, h, label, sublabel, color, icon,
}: {
    x: number; y: number; w: number; h: number
    label: string; sublabel?: string; color: string; icon: string
}) {
    return (
        <g>
            <rect
                x={x} y={y} width={w} height={h} rx={10}
                fill={`${color}18`}
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.6}
            />
            <text x={x + 18} y={y + h / 2 - (sublabel ? 8 : 0)} fontSize={13} fontWeight={700} fill={color} dominantBaseline="middle">
                {icon}
            </text>
            <text x={x + 38} y={y + h / 2 - (sublabel ? 8 : 0)} fontSize={13} fontWeight={700} fill="#f0fdf4" dominantBaseline="middle">
                {label}
            </text>
            {sublabel && (
                <text x={x + 38} y={y + h / 2 + 10} fontSize={10.5} fill="#4b7a5c" dominantBaseline="middle">
                    {sublabel}
                </text>
            )}
        </g>
    )
}

function Lane({
    x, y, w, h, label, color,
}: {
    x: number; y: number; w: number; h: number; label: string; color: string
}) {
    return (
        <g>
            <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}06`} stroke={color} strokeWidth={1} strokeOpacity={0.18} />
            <text x={x + 16} y={y + 20} fontSize={10} fontWeight={700} letterSpacing={2}
                textTransform="uppercase" fill={color} opacity={0.55} fontFamily="JetBrains Mono, monospace">
                {label}
            </text>
        </g>
    )
}

function Arrow({ x1, y1, x2, y2, label, color = '#22c55e' }: {
    x1: number; y1: number; x2: number; y2: number; label?: string; color?: string
}) {
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    return (
        <g>
            <defs>
                <marker id={`arrow-${x1}-${y1}`} markerWidth={7} markerHeight={7} refX={6} refY={3} orient="auto">
                    <path d="M0,0 L0,6 L7,3 z" fill={color} opacity={0.7} />
                </marker>
            </defs>
            <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color} strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="5 3"
                markerEnd={`url(#arrow-${x1}-${y1})`}
            />
            {label && (
                <text x={mx + 5} y={my} fontSize={9.5} fill={color} opacity={0.7}
                    fontFamily="JetBrains Mono, monospace" dominantBaseline="middle">
                    {label}
                </text>
            )}
        </g>
    )
}

export function Architecture() {
    const W = 860
    const H = 520

    return (
        <section id="architecture" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <div className="container">
                <div className="animate-on-scroll">
                    <span className="section-label">System Design</span>
                    <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', marginBottom: 16 }}>
                        Platform <span className="gradient-text">Architecture</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 600, marginBottom: 40, fontSize: 16 }}>
                        Four distinct layers — client, backend, database, and ML engine — communicating
                        via HTTP, WebSocket, and the MongoDB driver.
                    </p>
                </div>

                <div className="animate-on-scroll" style={{
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    borderRadius: 16,
                    padding: '8px',
                    overflowX: 'auto',
                }}>
                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        width="100%"
                        style={{ display: 'block', maxWidth: W, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}
                    >
                        {/* ── Layer 1: Client ── */}
                        <Lane x={20} y={16} w={W - 40} h={118} label="CLIENT LAYER" color="#22c55e" />
                        <ArchNode x={40} y={40} w={220} h={76} icon="⚛" label="React Dashboard" sublabel="Port 80 / 443 · Nginx" color="#22c55e" />
                        <ArchNode x={290} y={40} w={240} h={76} icon="📊" label="ML Visualization UI" sublabel="Vite Dev · WebSocket" color="#34d399" />
                        {/* public web badge */}
                        <ArchNode x={560} y={40} w={200} h={76} icon="🌐" label="Public Web Showcase" sublabel="Static · Vite + React" color="#86efac" />

                        {/* ── Arrows: Client → Backend ── */}
                        <Arrow x1={150} y1={134} x2={150} y2={196} label="HTTP/WS" color="#22c55e" />
                        <Arrow x1={410} y1={134} x2={410} y2={196} label="WebSocket" color="#34d399" />

                        {/* ── Layer 2: Backend ── */}
                        <Lane x={20} y={160} w={W - 40} h={116} label="BACKEND LAYER" color="#3b82f6" />
                        <ArchNode x={40} y={184} w={160} h={72} icon="🔑" label="Auth (JWT)" sublabel="Register · Login · Refresh" color="#60a5fa" />
                        <ArchNode x={216} y={184} w={160} h={72} icon="🚦" label="REST API" sublabel="Express 5 · OpenAPI 3.0" color="#3b82f6" />
                        <ArchNode x={392} y={184} w={180} h={72} icon="⚡" label="WebSocket Gateway" sublabel="Real-time training feed" color="#818cf8" />
                        <ArchNode x={588} y={184} w={172} h={72} icon="🛡" label="Middleware" sublabel="Rate limit · Helmet · Zod" color="#a78bfa" />

                        {/* ── Arrows: Backend → Data Layer ── */}
                        <Arrow x1={220} y1={276} x2={160} y2={342} label="MongoDB driver" color="#f59e0b" />
                        <Arrow x1={480} y1={276} x2={540} y2={342} label="WS / CLI" color="#a78bfa" />

                        {/* ── Layer 3: Data / ML ── */}
                        <Lane x={20} y={308} w={W - 40} h={194} label="DATA / ML LAYER" color="#f59e0b" />

                        {/* MongoDB */}
                        <ArchNode x={40} y={336} w={220} h={76} icon="🍃" label="MongoDB 7" sublabel="Users · Experiments · Logs" color="#f59e0b" />

                        {/* C++ Engine */}
                        <ArchNode x={300} y={336} w={240} h={76} icon="⚙" label="C++ ML Engine" sublabel="Matrix · Dense · Optimizers" color="#fb923c" />

                        {/* WS Server inside C++ */}
                        <ArchNode x={300} y={428} w={240} h={52} icon="📡" label="C++ WS Server" sublabel="Streams training metrics" color="#fdba74" />

                        {/* Python modules */}
                        <ArchNode x={574} y={336} w={206} h={76} icon="🐍" label="Python ML Modules" sublabel="Linear Regression · Commons" color="#4ade80" />

                        {/* Arrow C++ → WS Server */}
                        <Arrow x1={420} y1={412} x2={420} y2={428} color="#fb923c" />
                        {/* Arrow C++ → Python */}
                        <Arrow x1={540} y1={374} x2={574} y2={374} label="invokes" color="#4ade80" />

                        {/* ── Legend ── */}
                        <g transform={`translate(${W - 220}, ${H - 52})`}>
                            {[
                                { color: '#22c55e', label: 'Client' },
                                { color: '#3b82f6', label: 'Backend' },
                                { color: '#f59e0b', label: 'Data / ML' },
                            ].map((l, i) => (
                                <g key={l.label} transform={`translate(${i * 72}, 0)`}>
                                    <rect x={0} y={0} width={12} height={12} rx={3} fill={l.color} opacity={0.7} />
                                    <text x={16} y={10} fontSize={10} fill={l.color} opacity={0.7}>{l.label}</text>
                                </g>
                            ))}
                        </g>
                    </svg>
                </div>
            </div>
        </section>
    )
}

// ─── Tech Stack ──────────────────────────────────────────────────────────────
const STACK = [
    { icon: '⚡', name: 'C++17', desc: 'ML Engine core' },
    { icon: '🧵', name: 'OpenMP', desc: 'Parallel matrix ops' },
    { icon: '🐍', name: 'Python 3', desc: 'ML algorithms' },
    { icon: '📦', name: 'Node.js', desc: 'API backend' },
    { icon: '🚂', name: 'Express 5', desc: 'REST framework' },
    { icon: '🍃', name: 'MongoDB 7', desc: 'Database layer' },
    { icon: '⚛️', name: 'React 19', desc: 'Frontend UI' },
    { icon: '🔷', name: 'TypeScript', desc: 'Type-safe code' },
    { icon: '⚡', name: 'Vite', desc: 'Build tooling' },
    { icon: '🎨', name: 'Tailwind CSS', desc: 'Utility styling' },
    { icon: '📊', name: 'Recharts', desc: 'Data visualization' },
    { icon: '🐳', name: 'Docker', desc: 'Containerization' },
]

const STACK_TABLE = [
    { layer: 'ML Engine', tech: 'C++17, OpenMP, custom linear algebra' },
    { layer: 'Python ML', tech: 'Python 3, NumPy' },
    { layer: 'Backend', tech: 'Node.js, Express 5, MongoDB/Mongoose, WebSockets (ws), JWT' },
    { layer: 'Frontend', tech: 'React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, Zustand' },
    { layer: 'ML Viz UI', tech: 'React, TypeScript, Vite, Recharts' },
    { layer: 'Testing', tech: 'Jest (backend), Vitest (frontend), Catch2 (C++)' },
    { layer: 'Infra', tech: 'Docker, Docker Compose, Nginx, MongoDB 7' },
]

export function Stack() {
    return (
        <section id="stack">
            <div className="container">
                <div className="animate-on-scroll">
                    <span className="section-label">Technologies</span>
                    <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', marginBottom: 16 }}>
                        Tech <span className="gradient-text">Stack</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 600, marginBottom: 48, fontSize: 16 }}>
                        Carefully chosen tools that complement each other — from bare-metal performance
                        in C++ to developer-ergonomic TypeScript at the edge.
                    </p>
                </div>

                <div className="animate-on-scroll stack-grid" style={{ marginBottom: 48 }}>
                    {STACK.map(s => (
                        <div key={s.name} className="stack-card">
                            <div className="stack-icon">{s.icon}</div>
                            <div className="stack-name">{s.name}</div>
                            <div className="stack-desc">{s.desc}</div>
                        </div>
                    ))}
                </div>

                <div className="animate-on-scroll card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Layer Breakdown</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tech-table">
                            <thead>
                                <tr>
                                    <th>Layer</th>
                                    <th>Technology</th>
                                </tr>
                            </thead>
                            <tbody>
                                {STACK_TABLE.map(row => (
                                    <tr key={row.layer}>
                                        <td>{row.layer}</td>
                                        <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{row.tech}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─── ML Engine ───────────────────────────────────────────────────────────────
const CPP_COMPONENTS = [
    { name: 'Matrix', desc: 'Generic 2D matrix with vectorized operations and OpenMP support' },
    { name: 'Layer (base)', desc: 'Abstract base class for all neural network layers' },
    { name: 'Dense', desc: 'Fully connected layer with configurable input/output dimensions' },
    { name: 'Activations', desc: 'ReLU, Sigmoid, and Softmax with full forward/backward passes' },
    { name: 'Model', desc: 'Layer container with training loop, loss tracking, and model saving' },
    { name: 'Optimizers', desc: 'SGD, Momentum, RMSProp, ADAM implementations from scratch' },
    { name: 'Loss', desc: 'Mean Squared Error (MSE) loss function' },
    { name: 'Metrics', desc: 'Accuracy, precision, and other evaluation metrics' },
    { name: 'WS Server', desc: 'Native WebSocket server for streaming training data in real-time' },
]

export function MLEngine() {
    return (
        <section id="ml-engine" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <div className="container">
                <div className="animate-on-scroll">
                    <span className="section-label">Core Engine</span>
                    <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', marginBottom: 16 }}>
                        Custom <span className="gradient-text">ML Engine</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 600, marginBottom: 48, fontSize: 16 }}>
                        The heart of CyberHex — a C++17 framework built entirely from scratch,
                        with no third-party ML libraries. Every matrix operation, layer, and optimizer
                        is hand-crafted for performance and educational clarity.
                    </p>
                </div>

                <div className="two-col animate-on-scroll">
                    <div>
                        <div className="card" style={{ marginBottom: 20 }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="tech-table">
                                    <thead>
                                        <tr>
                                            <th>Component</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {CPP_COMPONENTS.map(c => (
                                            <tr key={c.name}>
                                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green-400)' }}>{c.name}</td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="card">
                            <h3 style={{ fontSize: 14, marginBottom: 12, color: 'var(--text-secondary)' }}>Build & Run</h3>
                            <div className="code-block" data-lang="bash">{`cd ML/models/cpp-modules
mkdir -p build && cd build
cmake .. && make -j$(nproc)
./cyberhex_ml`}</div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: 14, marginBottom: 12, color: 'var(--text-secondary)' }}>Run Tests</h3>
                            <div className="code-block" data-lang="bash">{`cd ML/models/cpp-modules/build
ctest --output-on-failure`}</div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: 14, marginBottom: 12, color: 'var(--text-secondary)' }}>ML Visualization UI</h3>
                            <div className="code-block" data-lang="bash">{`cd ML/ui/visualizations
yarn install
yarn dev`}</div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: 14, marginBottom: 12, color: 'var(--text-secondary)' }}>Python ML Modules</h3>
                            <div className="code-block" data-lang="bash">{`cd ML/models/python-modules
python main.py`}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─── API Reference ────────────────────────────────────────────────────────────
const API_ROUTES = [
    { method: 'POST', methodClass: 'method-post', path: '/api/v1/auth/register', desc: 'Register a new user', auth: false },
    { method: 'POST', methodClass: 'method-post', path: '/api/v1/auth/login', desc: 'Login user', auth: false },
    { method: 'POST', methodClass: 'method-post', path: '/api/v1/auth/refresh', desc: 'Refresh access token', auth: false },
    { method: 'POST', methodClass: 'method-post', path: '/api/v1/auth/logout', desc: 'Logout user', auth: true },
    { method: 'GET', methodClass: 'method-get', path: '/api/v1/users/me', desc: 'Get current user profile', auth: true },
    { method: 'PUT', methodClass: 'method-put', path: '/api/v1/users/me', desc: 'Update profile', auth: true },
    { method: 'GET', methodClass: 'method-get', path: '/api/v1/experiments', desc: 'List experiments', auth: true },
    { method: 'POST', methodClass: 'method-post', path: '/api/v1/experiments', desc: 'Create experiment', auth: true },
    { method: 'GET', methodClass: 'method-get', path: '/api/v1/experiments/:id', desc: 'Get experiment by ID', auth: true },
    { method: 'DELETE', methodClass: 'method-delete', path: '/api/v1/experiments/:id', desc: 'Delete experiment', auth: true },
    { method: 'GET', methodClass: 'method-get', path: '/api/v1/health', desc: 'Health check', auth: false },
    { method: 'WS', methodClass: 'method-ws', path: '/api/v1/ws', desc: 'WebSocket training feed', auth: true },
]

export function APIReference() {
    return (
        <section id="api">
            <div className="container">
                <div className="animate-on-scroll">
                    <span className="section-label">REST + WebSocket</span>
                    <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', marginBottom: 16 }}>
                        API <span className="gradient-text">Reference</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 600, marginBottom: 12, fontSize: 16 }}>
                        Full OpenAPI 3.0 specification available in{' '}
                        <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--green-400)', fontSize: 13 }}>openapi.yaml</code>.
                    </p>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 48, fontSize: 14 }}>
                        Base URL: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--green-400)', fontSize: 13 }}>http://localhost:5000</code>
                    </p>
                </div>

                <div className="animate-on-scroll card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Endpoints</h3>
                        <span className="badge badge-green">{API_ROUTES.length} routes</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tech-table">
                            <thead>
                                <tr>
                                    <th>Method</th>
                                    <th>Endpoint</th>
                                    <th>Description</th>
                                    <th>Auth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {API_ROUTES.map(r => (
                                    <tr key={r.path + r.method}>
                                        <td><span className={`api-method ${r.methodClass}`}>{r.method}</span></td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{r.path}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.desc}</td>
                                        <td>
                                            {r.auth
                                                ? <span className="badge badge-orange">JWT</span>
                                                : <span className="badge badge-green">Public</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─── Getting Started ──────────────────────────────────────────────────────────
export function GettingStarted() {
    return (
        <section id="getting-started" style={{ background: 'rgba(0,0,0,0.15)' }}>
            <div className="container">
                <div className="animate-on-scroll">
                    <span className="section-label">Quick Start</span>
                    <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', marginBottom: 16 }}>
                        Getting <span className="gradient-text">Started</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 600, marginBottom: 48, fontSize: 16 }}>
                        Docker Compose is the fastest path to a fully running CyberHex instance.
                    </p>
                </div>

                <div className="two-col animate-on-scroll">
                    <div>
                        <h3 style={{ fontSize: 18, marginBottom: 24, color: 'var(--green-400)' }}>
                            Docker Setup (Recommended)
                        </h3>
                        <div className="timeline">
                            {[
                                { title: '1. Clone the repository', code: 'git clone https://github.com/DulshanSiriwardhana/CyberHex.git\ncd CyberHex' },
                                { title: '2. Configure environment', code: 'cp .env.example .env\n# Edit .env with your config' },
                                { title: '3. Build & start all services', code: 'docker compose up --build -d' },
                                { title: '4. Access the application', code: '# Frontend  → http://localhost:80\n# Backend   → http://localhost:5000\n# MongoDB   → localhost:27017' },
                            ].map(step => (
                                <div key={step.title} className="timeline-item">
                                    <div className="timeline-title">{step.title}</div>
                                    <div className="code-block" style={{ marginTop: 8, padding: '12px 16px', fontSize: 12 }}>
                                        {step.code}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: 18, marginBottom: 24, color: 'var(--green-400)' }}>
                            Prerequisites
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                            {[
                                { icon: '🐳', name: 'Docker & Docker Compose', note: 'Recommended' },
                                { icon: '🟢', name: 'Node.js 18+', note: 'For local dev' },
                                { icon: '🍃', name: 'MongoDB 7', note: 'Without Docker' },
                                { icon: '⚙️', name: 'CMake 3.14+ & C++17', note: 'ML engine' },
                                { icon: '🐍', name: 'Python 3.8+', note: 'ML modules' },
                            ].map(p => (
                                <div key={p.name} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--green-400)' }}>
                            Service Ports
                        </h3>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table className="tech-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>URL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { s: 'Frontend', url: 'http://localhost:80' },
                                        { s: 'Backend', url: 'http://localhost:5000' },
                                        { s: 'MongoDB', url: 'localhost:27017' },
                                    ].map(r => (
                                        <tr key={r.s}>
                                            <td>{r.s}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green-400)' }}>{r.url}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─── Testing ──────────────────────────────────────────────────────────────────
export function Testing() {
    return (
        <section id="testing">
            <div className="container">
                <div className="animate-on-scroll">
                    <span className="section-label">Quality Assurance</span>
                    <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', marginBottom: 16 }}>
                        <span className="gradient-text">Testing</span> Strategy
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 600, marginBottom: 48, fontSize: 16 }}>
                        Every layer of the stack is covered by a dedicated test suite.
                    </p>
                </div>
                <div className="features-grid animate-on-scroll" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
                    {[
                        { icon: '🧪', layer: 'Backend', framework: 'Jest', cmd: 'npm test', cwd: 'backend/', color: 'blue', badge: 'badge-blue' },
                        { icon: '⚡', layer: 'Frontend', framework: 'Vitest', cmd: 'npm test', cwd: 'client/', color: 'purple', badge: 'badge-purple' },
                        { icon: '⚙️', layer: 'C++ Engine', framework: 'Catch2', cmd: 'ctest --output-on-failure', cwd: 'ML/.../build/', color: 'green', badge: 'badge-green' },
                    ].map(t => (
                        <div key={t.layer} className="card">
                            <div className={`feature-icon ${t.color}`}>{t.icon}</div>
                            <h3 className="feature-title">{t.layer}</h3>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <span className={`badge ${t.badge}`}>{t.framework}</span>
                            </div>
                            <div className="code-block" data-lang="bash" style={{ fontSize: 12 }}>
                                {`# in ${t.cwd}\n${t.cmd}`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Author ───────────────────────────────────────────────────────────────────
export function Author() {
    return (
        <section id="author" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <div className="container">
                <div className="animate-on-scroll">
                    <span className="section-label">About</span>
                    <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', marginBottom: 48 }}>
                        Author <span className="gradient-text">&amp; Ownership</span>
                    </h2>
                </div>

                <div className="animate-on-scroll author-card">
                    <div className="author-avatar">DS</div>
                    <div>
                        <div className="author-name">Dulshan Siriwardhana</div>
                        <div className="author-role">Sole Designer, Developer &amp; Maintainer of CyberHex</div>
                        <div className="author-links">
                            <a href="https://github.com/DulshanSiriwardhana" target="_blank" rel="noopener noreferrer" className="author-link">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                                GitHub
                            </a>
                            <a href="http://dulshansiriwardhana.live" target="_blank" rel="noopener noreferrer" className="author-link">
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>
                                Portfolio
                            </a>
                            <a href="https://www.linkedin.com/in/dulshansiriwardhana" target="_blank" rel="noopener noreferrer" className="author-link">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>

                <div className="animate-on-scroll" style={{ marginTop: 24 }}>
                    <div className="card">
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.8, fontSize: 15 }}>
                            "I am the sole owner and author of CyberHex. All core systems — including the matrix engine,
                            neural network architecture, training pipeline, backend services, frontend dashboard,
                            and real-time visualization — are built entirely from scratch as part of this project."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>⬡</span>
                    <span style={{ fontWeight: 800, fontSize: 18 }}>CyberHex</span>
                </div>
                <p className="footer-text">
                    Licensed under the{' '}
                    <a href="https://github.com/DulshanSiriwardhana/CyberHex/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
                        Apache License 2.0
                    </a>
                    {' '}· Built by{' '}
                    <a href="https://github.com/DulshanSiriwardhana" target="_blank" rel="noopener noreferrer">
                        Dulshan Siriwardhana
                    </a>
                </p>
            </div>
        </footer>
    )
}

// ─── Animate Card ─────────────────────────────────────────────────────────────
export function AnimateCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setVisible(true), delay)
                    obs.unobserve(el)
                }
            },
            { threshold: 0.1 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [delay])

    return (
        <div
            ref={ref}
            className="card"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease, transform 0.5s ease`,
            }}
        >
            {children}
        </div>
    )
}
