import Link from 'next/link';
import { Crown } from 'lucide-react';

const templates = [
  { id: 'corporate', name: 'Corporate', description: 'Dark theme, professional fonts, left-aligned logo.', color: 'from-slate-800 to-slate-900', isPro: false },
  { id: 'creative', name: 'Creative', description: 'Gradient background, centered layout, rounded elements.', color: 'from-violet-600 to-orange-500', isPro: false },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean white background, thin borders, focus on typography.', color: 'from-gray-100 to-white text-black', isPro: false },
  { id: 'modern', name: 'Modern', description: 'Sleek dark mode with neon accents and sharp edges.', color: 'from-gray-900 to-black border border-cyan-500/30', isPro: true },
  { id: 'elegant', name: 'Elegant', description: 'Classy serif typography with champagne gold accents.', color: 'from-stone-100 to-stone-200 text-stone-800', isPro: true },
];

export default function TemplatesPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Template</h1>
        <p className="text-gray-400 text-lg">Select a starting point for your digital business card.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {templates.map((t) => (
          <div key={t.id} className="group relative bg-[#111] border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 transition-all">
            {t.isPro && (
              <div className="absolute top-4 right-4 z-20 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20">
                <Crown className="w-3 h-3" /> PRO
              </div>
            )}
            <div className={`w-full aspect-[9/16] bg-gradient-to-br ${t.color} p-8 flex flex-col items-center justify-center relative overflow-hidden`}>
              {/* Mock content for preview */}
              <div className="w-20 h-20 bg-black/20 rounded-full mb-6 backdrop-blur-sm"></div>
              <div className="w-3/4 h-6 bg-black/20 rounded-full mb-3 backdrop-blur-sm"></div>
              <div className="w-1/2 h-4 bg-black/20 rounded-full mb-8 backdrop-blur-sm"></div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-black/20 rounded-full backdrop-blur-sm"></div>
                <div className="w-10 h-10 bg-black/20 rounded-full backdrop-blur-sm"></div>
                <div className="w-10 h-10 bg-black/20 rounded-full backdrop-blur-sm"></div>
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10">
                <Link href={`/editor?template=${t.id}`} className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
                  Use Template
                </Link>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                {t.name}
              </h3>
              <p className="text-gray-400 text-sm">{t.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
