export default function DemoVideo() {
  return (
    <div className="w-full max-w-3xl mx-auto overflow-hidden rounded-3xl border-4 border-slate-900 shadow-2xl bg-slate-900">
      <div className="relative pb-[56.25%] h-0">
        <iframe 
          src="https://video.pictory.ai/embed/2026021403120537415119217781d4db48fe847018e017503/20260214034840827HXUorqF0cAImnVd"
          title="SiteVerdict AI Demo" 
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
        />
      </div>
      <div className="p-4 bg-slate-900 text-center">
        <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">
          Watch: How SiteVerdict AI Audits Your Job Site
        </p>
      </div>
    </div>
  );
}