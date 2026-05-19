/**
 * CyberHex Studio — Scene & Layout Panel
 */
import React from 'react';
import { Layers, Plus, Monitor } from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { LAYOUT_TEMPLATES } from '@/media/LayoutTemplates';
import { LayoutTemplateType } from '@/types';
import { Button } from '@/components/ui/button';

export const ScenePanel: React.FC = () => {
  const scenes = useStudioStore((s) => s.scenes);
  const currentSceneId = useStudioStore((s) => s.currentSceneId);
  const switchScene = useStudioStore((s) => s.switchScene);
  const addScene = useStudioStore((s) => s.addScene);
  const saveWorkspacePreset = useStudioStore((s) => s.saveWorkspacePreset);
  const workspacePresets = useStudioStore((s) => s.workspacePresets);

  const createScene = (template: LayoutTemplateType) => {
    const tpl = LAYOUT_TEMPLATES.find((t) => t.type === template);
    addScene({
      name: tpl?.name ?? 'New Scene',
      layout: {
        width: 1920,
        height: 1080,
        gridCols: tpl?.gridCols ?? 2,
        gridRows: tpl?.gridRows ?? 2,
        gap: 8,
        padding: 16,
        background: '#0a0a1a',
        overlays: [],
      },
      template,
      feeds: [],
      order: scenes.length,
    });
  };

  return (
    <div className="flex flex-col gap-3 h-full text-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-white/50 uppercase tracking-wider flex items-center gap-1">
          <Monitor size={12} /> Scenes
        </span>
        <Button size="xs" variant="outline" leftIcon={<Plus size={12} />} onClick={() => createScene(LayoutTemplateType.CUSTOM)}>
          New
        </Button>
      </div>

      <div className="space-y-1">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => switchScene(scene.id)}
            className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
              scene.id === currentSceneId
                ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
                : 'border-white/5 bg-white/[0.02] text-white/60 hover:border-white/10'
            }`}
          >
            <p className="font-mono">{scene.name}</p>
            <p className="text-[10px] text-white/30">{scene.template.replace('_', ' ')}</p>
          </button>
        ))}
      </div>

      <div className="border-t border-white/5 pt-3">
        <p className="text-[10px] text-white/40 font-mono uppercase mb-2 flex items-center gap-1">
          <Layers size={10} /> Layout Templates
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {LAYOUT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => createScene(tpl.type)}
              className="p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:border-neon-cyan/30 hover:bg-neon-cyan/5 text-left transition-all"
            >
              <p className="text-[10px] font-mono text-white/70 truncate">{tpl.name}</p>
              <p className="text-[9px] text-white/30">{tpl.gridCols}×{tpl.gridRows}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 pt-3 mt-auto">
        <Button size="xs" variant="ghost" className="w-full" onClick={() => saveWorkspacePreset(`Preset ${workspacePresets.length + 1}`)}>
          Save Workspace Preset
        </Button>
        {workspacePresets.length > 0 && (
          <p className="text-[10px] text-white/30 text-center mt-1">{workspacePresets.length} saved</p>
        )}
      </div>
    </div>
  );
};
