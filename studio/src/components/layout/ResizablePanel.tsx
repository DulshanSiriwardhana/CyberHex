import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { motion } from 'framer-motion';
import { X, Maximize2, Minimize2, Pin, PinOff, GripVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

/* ─── Panel Header ──────────────────────── */

interface PanelHeaderProps {
  title: string;
  onClose?: () => void;
  onMaximize?: () => void;
  maximized?: boolean;
  pinned?: boolean;
  onPinToggle?: () => void;
  actions?: React.ReactNode;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title, onClose, onMaximize, maximized, pinned, onPinToggle, actions,
}) => (
  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.02] shrink-0">
    <GripVertical size={12} className="text-white/20 cursor-grab" />
    <span className="text-[11px] font-mono font-medium text-white/60 uppercase tracking-wider truncate">
      {title}
    </span>
    <div className="flex-1" />
    {actions}
    {onPinToggle && (
      <button onClick={onPinToggle} className="p-0.5 text-white/30 hover:text-white/70 transition-colors">
        {pinned ? <Pin size={12} /> : <PinOff size={12} />}
      </button>
    )}
    {onMaximize && (
      <button onClick={onMaximize} className="p-0.5 text-white/30 hover:text-white/70 transition-colors">
        {maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
      </button>
    )}
    {onClose && (
      <button onClick={onClose} className="p-0.5 text-white/30 hover:text-red-400 transition-colors">
        <X size={12} />
      </button>
    )}
  </div>
);

/* ─── ResizablePanel ────────────────────── */

interface ResizablePanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
  onClose?: () => void;
  onMaximize?: () => void;
  maximized?: boolean;
  pinned?: boolean;
  onPinToggle?: () => void;
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ id, title, children, defaultSize = 25, minSize = 15, maxSize = 50, collapsible, collapsedSize, onClose, onMaximize, maximized, pinned, onPinToggle, actions, className, headerClassName }, ref) => {
    const panelRef = useRef<HTMLDivElement>(null);

    return (
      <Panel
        id={id}
        defaultSize={defaultSize}
        minSize={minSize}
        maxSize={maxSize}
        collapsible={collapsible}
        collapsedSize={collapsedSize}
        className={cn('flex flex-col glass-panel overflow-hidden', className)}
      >
        <PanelHeader
          title={title}
          onClose={onClose}
          onMaximize={onMaximize}
          maximized={maximized}
          pinned={pinned}
          onPinToggle={onPinToggle}
          actions={actions}
        />
        <div ref={ref || panelRef} className="flex-1 overflow-auto p-3">
          {children}
        </div>
      </Panel>
    );
  }
);
ResizablePanel.displayName = 'ResizablePanel';

/* ─── Resize Handle ─────────────────────── */

const ResizeHandle: React.FC<{ className?: string; direction?: 'horizontal' | 'vertical' }> = ({ className, direction = 'horizontal' }) => (
  <PanelResizeHandle className={cn(
    'group relative flex items-center justify-center transition-colors hover:bg-neon-cyan/10',
    direction === 'horizontal' ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize',
    className
  )}>
    <div className="absolute rounded-full bg-white/10 group-hover:bg-neon-cyan/40 transition-colors" 
      style={direction === 'horizontal' ? { width: 3, height: 32 } : { width: 32, height: 3 }} />
  </PanelResizeHandle>
);

/* ─── Floating Panel ────────────────────── */

interface FloatingPanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  onClose?: () => void;
  onMove?: (x: number, y: number) => void;
  onResize?: (w: number, h: number) => void;
  className?: string;
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({
  id, title, children, x, y, width, height, onClose, className,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={cn('absolute glass-panel-heavy shadow-panel-lg z-40 flex flex-col overflow-hidden', className)}
    style={{ left: x, top: y, width, height, minWidth: 200, minHeight: 150 }}
  >
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.02] cursor-move">
      <span className="text-[11px] font-mono font-medium text-white/60 uppercase">{title}</span>
      <div className="flex-1" />
      {onClose && (
        <button onClick={onClose} className="p-0.5 text-white/30 hover:text-red-400 transition-colors">
          <X size={12} />
        </button>
      )}
    </div>
    <div className="flex-1 overflow-auto p-3">
      {children}
    </div>
  </motion.div>
);

export { PanelGroup, Panel, PanelResizeHandle, ResizeHandle, ResizablePanel, PanelHeader, FloatingPanel };
export type { ResizablePanelProps, PanelHeaderProps, FloatingPanelProps };