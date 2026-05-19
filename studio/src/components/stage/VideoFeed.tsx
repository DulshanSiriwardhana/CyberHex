/**
 * CyberHex Studio — Neural Video Feed Component
 * Renders live media through the neural filter pipeline on canvas.
 */
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Wand2 } from 'lucide-react';
import { useNeuralPipeline } from '@/hooks/useNeuralPipeline';
import { useStudioStore } from '@/stores/studioStore';
import type { MediaFeed } from '@/types';
import { cn } from '@/utils/cn';

interface VideoFeedProps {
  feed: MediaFeed;
  className?: string;
  showLabel?: boolean;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ feed, className, showLabel = true }) => {
  const activeFeedId = useStudioStore((s) => s.activeFeedId);
  const setActiveFeed = useStudioStore((s) => s.setActiveFeed);
  const activeFilters = useStudioStore((s) => s.activeFilterPipeline);
  const { canvasRef } = useNeuralPipeline(feed.id);
  const rawVideoRef = useRef<HTMLVideoElement>(null);

  const filters = activeFilters[feed.id] ?? [];
  const hasFilters = filters.length > 0;

  useEffect(() => {
    const el = rawVideoRef.current;
    if (el && feed.stream && el.srcObject !== feed.stream) {
      el.srcObject = feed.stream;
      el.play().catch(() => {});
    }
  }, [feed.stream]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => setActiveFeed(feed.id)}
      className={cn(
        'relative rounded-xl overflow-hidden border cursor-pointer group',
        feed.id === activeFeedId ? 'border-neon-cyan shadow-glow' : 'border-white/10',
        'glass-panel',
        className
      )}
      style={{
        gridColumn: `span ${Math.ceil(feed.position.width / 320)}`,
        gridRow: `span ${Math.ceil(feed.position.height / 180)}`,
      }}
    >
      {hasFilters ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover min-h-[180px]"
          style={{
            transform: feed.layout.mirrored ? 'scaleX(-1)' : undefined,
            opacity: feed.layout.opacity,
            borderRadius: feed.layout.borderRadius,
          }}
        />
      ) : (
        <video
          ref={rawVideoRef}
          autoPlay
          playsInline
          muted={feed.muted}
          className="w-full h-full object-cover min-h-[180px]"
          style={{
            transform: feed.layout.mirrored ? 'scaleX(-1)' : undefined,
            opacity: feed.layout.opacity,
            borderRadius: feed.layout.borderRadius,
            objectFit: feed.layout.fit,
          }}
        />
      )}

      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none"
        >
          <span className="text-xs font-mono text-white/80 bg-black/50 backdrop-blur px-2 py-0.5 rounded flex items-center gap-1.5">
            <Video size={10} />
            {feed.label}
          </span>
          {hasFilters && (
            <span className="text-[10px] font-mono text-neon-cyan bg-black/50 backdrop-blur px-2 py-0.5 rounded flex items-center gap-1">
              <Wand2 size={10} />
              {filters.length} NEURAL
            </span>
          )}
        </motion.div>
      )}

      {feed.muted && (
        <div className="absolute top-2 right-2 bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
          MUTED
        </div>
      )}

      <motion.div
        className="absolute inset-0 border-2 border-neon-cyan/0 group-hover:border-neon-cyan/20 rounded-xl pointer-events-none transition-colors"
      />
    </motion.div>
  );
};
