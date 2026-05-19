import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sliders, Check, X, Plus, Layers, Trash2, Save } from 'lucide-react';
import { useStudioStore } from '@stores/studioStore';
import { Button } from '@ui/button';
import { Slider } from '@ui/slider';
import { Switch } from '@ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/tabs';
import { Card } from '@ui/card';
import { cn } from '@/utils/cn';
import {
  NeuralFilterType,
  FilterCategory,
  type FilterAssignment,
  type FilterPreset,
} from '@/types';

const FILTER_CATEGORY_MAP: Record<NeuralFilterType, { name: string; category: FilterCategory; icon: string }> = {
  [NeuralFilterType.CARTOON]: { name: 'Cartoon', category: FilterCategory.ARTISTIC, icon: '🎨' },
  [NeuralFilterType.ANIME]: { name: 'Anime', category: FilterCategory.ARTISTIC, icon: '✨' },
  [NeuralFilterType.PENCIL_SKETCH]: { name: 'Pencil Sketch', category: FilterCategory.ARTISTIC, icon: '✏️' },
  [NeuralFilterType.OIL_PAINTING]: { name: 'Oil Painting', category: FilterCategory.ARTISTIC, icon: '🖼️' },
  [NeuralFilterType.CYBERPUNK]: { name: 'Cyberpunk', category: FilterCategory.STYLE_TRANSFER, icon: '🌃' },
  [NeuralFilterType.CUSTOM_STYLE_TRANSFER]: { name: 'Custom Style', category: FilterCategory.CUSTOM, icon: '🧠' },
  [NeuralFilterType.BACKGROUND_BLUR]: { name: 'Background Blur', category: FilterCategory.SEGMENTATION, icon: '🔍' },
  [NeuralFilterType.BACKGROUND_REPLACEMENT]: { name: 'BG Replace', category: FilterCategory.SEGMENTATION, icon: '🖼️' },
  [NeuralFilterType.DEPTH_ESTIMATION]: { name: 'Depth Map', category: FilterCategory.SEGMENTATION, icon: '📐' },
  [NeuralFilterType.EDGE_ENHANCEMENT]: { name: 'Edge Enhance', category: FilterCategory.ENHANCEMENT, icon: '📏' },
  [NeuralFilterType.SUPER_RESOLUTION]: { name: 'Super Resolution', category: FilterCategory.ENHANCEMENT, icon: '🔬' },
  [NeuralFilterType.FACE_RELIGHTING]: { name: 'Face Relighting', category: FilterCategory.ENHANCEMENT, icon: '💡' },
  [NeuralFilterType.LOW_LIGHT]: { name: 'Low Light', category: FilterCategory.ENHANCEMENT, icon: '🌙' },
  [NeuralFilterType.MOTION_SMOOTHING]: { name: 'Motion Smooth', category: FilterCategory.ENHANCEMENT, icon: '🎯' },
  [NeuralFilterType.AI_AVATAR]: { name: 'AI Avatar', category: FilterCategory.AVATAR, icon: '🤖' },
};

const filterTypes = Object.values(NeuralFilterType);

export const FilterPanel: React.FC = () => {
  const activeFeedId = useStudioStore((s) => s.activeFeedId);
  const feeds = useStudioStore((s) => s.feeds);
  const activeFilters = useStudioStore((s) => s.activeFilterPipeline);
  const setFilter = useStudioStore((s) => s.setFilter);
  const removeFilter = useStudioStore((s) => s.removeFilter);
  const updateFilterIntensity = useStudioStore((s) => s.updateFilterIntensity);
  const filterPresets = useStudioStore((s) => s.filterPresets);
  const saveFilterPreset = useStudioStore((s) => s.saveFilterPreset);
  const applyFilterPreset = useStudioStore((s) => s.applyFilterPreset);

  const feed = feeds.find((f) => f.id === activeFeedId);
  const currentFilters = activeFeedId ? (activeFilters[activeFeedId] ?? []) : [];
  const [selectedTab, setSelectedTab] = useState('active');

  if (!activeFeedId || !feed) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
        <Wand2 size={24} />
        <p className="text-xs font-mono">SELECT A FEED TO APPLY FILTERS</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex flex-col flex-1">
        <TabsList className="w-full">
          <TabsTrigger value="active">Active ({currentFilters.length})</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 overflow-auto space-y-3">
          <AnimatePresence>
            {currentFilters.length === 0 ? (
              <div className="text-center text-white/30 text-xs py-8">No filters applied</div>
            ) : (
              currentFilters.map((assignment) => (
                <motion.div
                  key={assignment.filterType}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Card>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-white/70 flex items-center gap-2">
                        <span>{FILTER_CATEGORY_MAP[assignment.filterType]?.icon}</span>
                        {FILTER_CATEGORY_MAP[assignment.filterType]?.name ?? assignment.filterType}
                      </span>
                      <Button size="xs" variant="ghost" onClick={() => removeFilter(activeFeedId, assignment.filterType)}>
                        <X size={12} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 w-8">INT</span>
                      <Slider
                        size="sm"
                        value={[assignment.intensity * 100]}
                        onValueChange={([v]) => updateFilterIntensity(activeFeedId, assignment.filterType, v / 100)}
                        max={100}
                        step={1}
                        variant="neon"
                      />
                      <span className="text-[10px] text-neon-cyan/60 w-8 text-right font-mono">
                        {Math.round(assignment.intensity * 100)}%
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="browse" className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-2">
            {filterTypes.map((type) => {
              const applied = currentFilters.some((f) => f.filterType === type);
              const info = FILTER_CATEGORY_MAP[type];
              return (
                <button
                  key={type}
                  onClick={() => {
                    if (applied) {
                      removeFilter(activeFeedId, type);
                    } else {
                      setFilter(activeFeedId, {
                        filterType: type,
                        intensity: 0.8,
                        config: { type, intensity: 0.8, enabled: true, params: {} },
                        order: currentFilters.length,
                      });
                    }
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] transition-all',
                    applied
                      ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
                      : 'border-white/5 bg-white/[0.02] text-white/50 hover:border-white/10 hover:text-white/70'
                  )}
                >
                  <span className="text-base">{info.icon}</span>
                  <span className="font-mono truncate w-full text-center">{info.name}</span>
                </button>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="presets" className="flex-1 overflow-auto space-y-2">
          <Button size="xs" variant="outline" leftIcon={<Save size={12} />} className="w-full mb-2" onClick={() => {
            saveFilterPreset({
              id: `preset_${Date.now()}`,
              name: `Preset ${filterPresets.length + 1}`,
              description: 'Custom filter preset',
              category: FilterCategory.CUSTOM,
              filters: [...currentFilters],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }}>
            Save Current
          </Button>
          {filterPresets.map((preset) => (
            <Card key={preset.id} className="flex items-center justify-between gap-2 cursor-pointer hover:bg-white/[0.03]" onClick={() => applyFilterPreset(activeFeedId, preset.id)}>
              <div>
                <p className="text-xs font-mono text-white/70">{preset.name}</p>
                <p className="text-[10px] text-white/30">{preset.filters.length} filters</p>
              </div>
              <Layers size={12} className="text-neon-cyan/50" />
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};