import Link from 'next/link';
import { ArrowRight, Sparkles, LayoutTemplate, Share2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI-Powered Digital Business Cards</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Your Professional Identity, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Reimagined.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Create, customize, and share stunning digital business cards in minutes. Stand out with AI-generated logos and premium templates.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/editor" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2">
            Create Card Now <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/templates" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            Browse Templates
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/10 rounded-full font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
            View Pricing
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24 relative z-10">
        <div className="bg-[#111] border border-white/10 p-6 rounded-3xl text-left">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Premium Templates</h3>
          <p className="text-gray-400">Choose from Corporate, Creative, or Minimalist designs to match your brand.</p>
        </div>
        <div className="bg-[#111] border border-white/10 p-6 rounded-3xl text-left">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">AI Logo Generator</h3>
          <p className="text-gray-400">Don&apos;t have a logo? Let our AI generate a professional vector logo for you instantly.</p>
        </div>
        <div className="bg-[#111] border border-white/10 p-6 rounded-3xl text-left">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-400">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Share & Download</h3>
          <p className="text-gray-400">Download your card as a high-quality image or share it directly via social links.</p>
        </div>
      </div>
    </div>
  );
}
