export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.2)] flex items-center justify-center">
          <svg className="w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <rect x="7" y="7" width="10" height="10" rx="1.5" />
            <line x1="12" y1="7" x2="12" y2="17" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
        </div>
        <h1 className="font-spectral font-extrabold text-2xl text-text-primary mb-3">Models</h1>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          Browse, compare, and manage your trained models. This page will surface model lineage,
          performance metrics, and deployment status.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[#141414] text-text-tertiary text-sm">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          Coming soon
        </div>
      </div>
    </div>
  );
}