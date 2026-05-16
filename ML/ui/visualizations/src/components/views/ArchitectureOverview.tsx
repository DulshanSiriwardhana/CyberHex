import type { NetworkArchitecture } from '../../types/model';

interface ArchitectureOverviewProps {
  architecture: NetworkArchitecture;
}

export default function ArchitectureOverview({ architecture }: ArchitectureOverviewProps) {
  const { layers, totalParams, inputSize, outputSize } = architecture;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Layers</div>
          <div className="text-lg font-mono text-white">{layers.length}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Params</div>
          <div className="text-lg font-mono text-cyan-400">{totalParams.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Input Size</div>
          <div className="text-lg font-mono text-white">{inputSize}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Output Size</div>
          <div className="text-lg font-mono text-purple-400">{outputSize}</div>
        </div>
      </div>

      {/* Layer table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400">
              <th className="text-left py-2.5 px-4 font-medium w-12">#</th>
              <th className="text-left py-2.5 px-4 font-medium">Type</th>
              <th className="text-right py-2.5 px-4 font-medium">Input</th>
              <th className="text-center py-2.5 px-4 font-medium text-slate-500">→</th>
              <th className="text-right py-2.5 px-4 font-medium">Output</th>
              <th className="text-right py-2.5 px-4 font-medium">Weights Shape</th>
              <th className="text-right py-2.5 px-4 font-medium">Params</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {layers.map((layer, i) => {
              const wRows = layer.weights.length;
              const wCols = layer.weights[0]?.length ?? 0;
              const paramCount = wRows * wCols + layer.bias.length;
              const pctTotal = totalParams > 0 ? ((paramCount / totalParams) * 100).toFixed(1) : '0';
              return (
                <tr
                  key={i}
                  className="hover:bg-slate-900/30 transition-colors"
                >
                  <td className="py-2.5 px-4 text-slate-500 font-mono">{i}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 font-mono text-[10px]">
                      {layer.layerType}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-300">{layer.inputShape}</td>
                  <td className="py-2.5 px-4 text-center text-slate-600">→</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-300">{layer.outputShape}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {wRows}×{wCols}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {paramCount.toLocaleString()}
                    <span className="text-slate-600 ml-1">({pctTotal}%)</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total row */}
      <div className="flex justify-end text-xs text-slate-500">
        Total parameters: <span className="text-slate-300 font-mono ml-2">{totalParams.toLocaleString()}</span>
      </div>
    </div>
  );
}