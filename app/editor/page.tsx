'use client';

import React, { useState, ChangeEvent, useEffect, useCallback, useRef, Suspense } from 'react';
import { Linkedin, MessageCircle, Instagram, Facebook, Upload, Image as ImageIcon, Sparkles, Crop as CropIcon, X, Check, Lock, Crown, Download, Share2, Mail, Phone, Globe, Twitter, Youtube, Github, Twitch, Dribbble, Music2, MessageSquare, Ghost, Pin, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { GoogleGenAI } from '@google/genai';
import { useSearchParams, useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import { useAuth } from '@/components/FirebaseProvider';

type Template = 'corporate' | 'creative' | 'minimalist' | 'modern' | 'elegant';

interface CardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  logo: string | null;
  linkedin: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  github: string;
  tiktok: string;
  twitch: string;
  discord: string;
  snapchat: string;
  pinterest: string;
  dribbble: string;
  template: Template;
}

interface UsageData {
  date: string;
  logoCount: number;
  downloadCount: number;
}

const MAX_LOGOS_PER_DAY = 3;
const MAX_DOWNLOADS_PER_DAY = 3;

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const initialTemplate = (searchParams.get('template') as Template) || 'corporate';

  const [data, setData] = useState<CardData>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    logo: null,
    linkedin: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    github: '',
    tiktok: '',
    twitch: '',
    discord: '',
    snapchat: '',
    pinterest: '',
    dribbble: '',
    template: initialTemplate,
  });

  const [usage, setUsage] = useState<UsageData>({ date: '', logoCount: 0, downloadCount: 0 });
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'logo' | 'download'>('logo');

  // Cropper State
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('pehchan_usage');
    if (stored) {
      const parsed: UsageData = JSON.parse(stored);
      if (parsed.date === today) {
        setUsage(parsed);
      } else {
        setUsage({ date: today, logoCount: 0, downloadCount: 0 });
      }
    } else {
      setUsage({ date: today, logoCount: 0, downloadCount: 0 });
    }
  }, []);

  useEffect(() => {
    const handleReset = () => {
      if (window.confirm('Are you sure you want to clear all fields and start a new card?')) {
        setData({
          name: '',
          title: '',
          company: '',
          email: '',
          phone: '',
          website: '',
          logo: null,
          linkedin: '',
          whatsapp: '',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
          github: '',
          tiktok: '',
          twitch: '',
          discord: '',
          snapchat: '',
          pinterest: '',
          dribbble: '',
          template: initialTemplate,
        });
        setImageToCrop(null);
      }
    };

    window.addEventListener('reset-editor', handleReset);
    return () => window.removeEventListener('reset-editor', handleReset);
  }, [initialTemplate]);

  const updateUsage = (type: 'logo' | 'download') => {
    const newUsage = { ...usage, [type === 'logo' ? 'logoCount' : 'downloadCount']: usage[type === 'logo' ? 'logoCount' : 'downloadCount'] + 1 };
    setUsage(newUsage);
    localStorage.setItem('pehchan_usage', JSON.stringify(newUsage));
  };

  const checkQuota = (type: 'logo' | 'download') => {
    const count = type === 'logo' ? usage.logoCount : usage.downloadCount;
    const max = type === 'logo' ? MAX_LOGOS_PER_DAY : MAX_DOWNLOADS_PER_DAY;
    if (count >= max) {
      setPaywallReason(type);
      setShowPaywall(true);
      return false;
    }
    return true;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setData((prev) => ({ ...prev, logo: croppedImage }));
        setImageToCrop(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleGenerateLogo = async () => {
    if (!checkQuota('logo')) return;
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A professional, clean, minimalist business logo for: ${aiPrompt}. White background, high quality, vector style.` }],
        },
      });

      let base64Image = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (base64Image) {
        setImageToCrop(base64Image);
        setShowAiModal(false);
        updateUsage('logo');
      }
    } catch (error) {
      console.error("Error generating logo:", error);
      alert("Failed to generate logo. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!checkQuota('download')) return;
    
    if (cardRef.current) {
      try {
        // Gather all CSS rules from the current page to preserve styling offline
        let cssText = '';
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            for (const rule of Array.from(sheet.cssRules)) {
              cssText += rule.cssText + '\n';
            }
          } catch (e) {
            console.warn('Could not read cssRules from stylesheet', sheet?.href);
          }
        }

        // Get the HTML content of the card
        const cardHtml = cardRef.current.outerHTML;
        
        // Create a complete HTML document
        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name}'s Digital Business Card</title>
  <style>
    ${cssText}
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background-color: #0f172a;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .card-container {
      width: 100%;
      max-width: 400px;
      position: relative;
    }
    /* Ensure links are clickable and have no default underline unless hovered */
    a { cursor: pointer; text-decoration: none; }
    a:hover { opacity: 0.8; }
  </style>
</head>
<body>
  <div class="card-container">
    ${cardHtml}
  </div>
</body>
</html>`;
        
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.name.replace(/\s+/g, '_') || 'Digital'}_card.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        updateUsage('download');
      } catch (err) {
        console.error("Failed to download HTML", err);
        alert("Failed to download card.");
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.name}'s Digital Business Card`,
          text: `Check out my digital business card!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      alert('Sharing is not supported on this browser. You can download the card instead.');
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <main className="max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Input Form (Pro Style) */}
        <div className="w-full lg:w-[45%] bg-[#111] rounded-3xl border border-white/10 p-6 md:p-8 h-fit shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              Card Configuration
            </h2>
            <div className="text-xs text-gray-400 flex items-center gap-4 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span>Logos: {usage.logoCount}/{MAX_LOGOS_PER_DAY}</span>
              <div className="w-px h-3 bg-white/20"></div>
              <span>Downloads: {usage.downloadCount}/{MAX_DOWNLOADS_PER_DAY}</span>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Theme Template</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['corporate', 'creative', 'minimalist', 'modern', 'elegant'] as Template[]).map((t) => {
                  const isPro = t === 'modern' || t === 'elegant';
                  return (
                  <button
                    key={t}
                    onClick={() => setData({ ...data, template: t })}
                    className={`relative py-3 px-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                      data.template === t
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {t}
                    {isPro && <Crown className="w-3 h-3 absolute top-2 right-2 text-amber-500" />}
                  </button>
                )})}
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <label className="block text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Brand Identity</label>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-black/50 overflow-hidden relative group">
                    {data.logo ? (
                      <>
                        <Image src={data.logo} alt="Logo preview" fill className="object-contain p-2" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => setData({...data, logo: null})} className="text-red-400 hover:text-red-300">
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <label className="cursor-pointer w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    <button 
                      onClick={() => setShowAiModal(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-lg shadow-purple-500/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="group">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Full Name</label>
                  <input
                    type="text" id="name" name="name" value={data.name} onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                    placeholder="e.g. Jane Smith"
                  />
                </div>
                <div className="group">
                  <label htmlFor="title" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Professional Title</label>
                  <input
                    type="text" id="title" name="title" value={data.title} onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                    placeholder="e.g. Product Designer"
                  />
                </div>
                <div className="group">
                  <label htmlFor="company" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Company Name</label>
                  <input
                    type="text" id="company" name="company" value={data.company} onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="group">
                  <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Email Address</label>
                  <input
                    type="email" id="email" name="email" value={data.email} onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                    placeholder="e.g. john@example.com"
                  />
                </div>
                <div className="group">
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Phone Number</label>
                  <input
                    type="tel" id="phone" name="phone" value={data.phone} onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                </div>
                <div className="group">
                  <label htmlFor="website" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Website</label>
                  <input
                    type="url" id="website" name="website" value={data.website} onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                    placeholder="e.g. https://example.com"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <label className="block text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Social Connections</label>
              <div className="space-y-4">
                {[
                  { id: 'linkedin', icon: Linkedin, color: '#0077b5', placeholder: 'LinkedIn URL' },
                  { id: 'whatsapp', icon: MessageCircle, color: '#25D366', placeholder: 'WhatsApp URL' },
                  { id: 'instagram', icon: Instagram, color: '#E1306C', placeholder: 'Instagram URL' },
                  { id: 'facebook', icon: Facebook, color: '#1877F2', placeholder: 'Facebook URL' },
                  { id: 'twitter', icon: Twitter, color: '#1DA1F2', placeholder: 'Twitter/X URL' },
                  { id: 'youtube', icon: Youtube, color: '#FF0000', placeholder: 'YouTube URL' },
                  { id: 'github', icon: Github, color: '#ffffff', placeholder: 'GitHub URL' },
                  { id: 'tiktok', icon: Music2, color: '#00f2fe', placeholder: 'TikTok URL' },
                  { id: 'twitch', icon: Twitch, color: '#9146FF', placeholder: 'Twitch URL' },
                  { id: 'discord', icon: MessageSquare, color: '#5865F2', placeholder: 'Discord URL' },
                  { id: 'snapchat', icon: Ghost, color: '#FFFC00', placeholder: 'Snapchat URL' },
                  { id: 'pinterest', icon: Pin, color: '#E60023', placeholder: 'Pinterest URL' },
                  { id: 'dribbble', icon: Dribbble, color: '#EA4C89', placeholder: 'Dribbble URL' },
                ].map((social) => (
                  <div key={social.id} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-focus-within:border-white/30 transition-colors">
                      <social.icon className="w-5 h-5" style={{ color: social.color }} />
                    </div>
                    <input
                      type="url"
                      name={social.id}
                      value={data[social.id as keyof CardData] as string}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-600"
                      placeholder={social.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="w-full lg:w-[55%] flex flex-col items-center justify-start sticky top-28 h-fit">
          <div className="w-full max-w-md flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-6">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Live Preview</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.dispatchEvent(new Event('reset-editor'))}
                  className="text-sm bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-full font-semibold hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button 
                  onClick={handleShare}
                  className="text-sm bg-white/10 text-white border border-white/20 px-4 py-2 rounded-full font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button 
                  onClick={handleDownload}
                  className="text-sm bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
            
            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div ref={cardRef}>
                <CardPreview data={data} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Logo Generation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">AI Logo Generator</h3>
            <p className="text-gray-400 text-sm mb-6">Describe your brand and let AI create a professional logo for you.</p>
            
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. A minimalist geometric fox logo for a tech startup..."
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-white placeholder-gray-600 min-h-[120px] resize-none mb-6"
            />
            
            <button
              onClick={handleGenerateLogo}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Logo
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">Uses 1 logo generation quota.</p>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[80vh]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1a1a1a]">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CropIcon className="w-5 h-5" /> Crop Logo
              </h3>
              <button onClick={() => setImageToCrop(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative flex-1 bg-black/50">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>
            
            <div className="p-6 bg-[#1a1a1a] border-t border-white/10 flex items-center justify-between gap-4">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-1/2 accent-blue-500"
              />
              <button
                onClick={handleCropSave}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <Check className="w-5 h-5" /> Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <button onClick={() => setShowPaywall(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white z-10">
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {paywallReason === 'logo' ? 'Logo Limit Reached' : 'Download Limit Reached'}
              </h3>
              <p className="text-gray-400 mb-8">
                You&apos;ve used your {paywallReason === 'logo' ? MAX_LOGOS_PER_DAY : MAX_DOWNLOADS_PER_DAY} free {paywallReason}s for today. Upgrade to Pro for unlimited access.
              </p>
              
              <div className="w-full bg-white/5 border border-amber-500/30 rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">Popular</div>
                <div className="text-4xl font-bold text-white mb-1">$9.99<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                <p className="text-sm text-amber-400 mb-6 font-medium">Pehchan Pro Subscription</p>
                
                <ul className="space-y-3 text-left">
                  {['Unlimited AI Logo Generations', 'Unlimited Card Downloads', 'Premium Templates', 'Custom Domain Support'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => { alert("Redirecting to Stripe checkout..."); setShowPaywall(false); }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-4 py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-lg"
              >
                <Lock className="w-5 h-5" />
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SocialLinks({ data, iconClass = "", containerClass = "" }: { data: CardData, iconClass?: string, containerClass?: string }) {
  const { linkedin, whatsapp, instagram, facebook, twitter, youtube, github, tiktok, twitch, discord, snapchat, pinterest, dribbble } = data;
  return (
    <div className={`flex flex-wrap gap-4 ${containerClass}`}>
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Linkedin className="w-6 h-6" />
        </a>
      )}
      {whatsapp && (
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <MessageCircle className="w-6 h-6" />
        </a>
      )}
      {instagram && (
        <a href={instagram} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Instagram className="w-6 h-6" />
        </a>
      )}
      {facebook && (
        <a href={facebook} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Facebook className="w-6 h-6" />
        </a>
      )}
      {twitter && (
        <a href={twitter} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Twitter className="w-6 h-6" />
        </a>
      )}
      {youtube && (
        <a href={youtube} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Youtube className="w-6 h-6" />
        </a>
      )}
      {github && (
        <a href={github} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Github className="w-6 h-6" />
        </a>
      )}
      {tiktok && (
        <a href={tiktok} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Music2 className="w-6 h-6" />
        </a>
      )}
      {twitch && (
        <a href={twitch} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Twitch className="w-6 h-6" />
        </a>
      )}
      {discord && (
        <a href={discord} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <MessageSquare className="w-6 h-6" />
        </a>
      )}
      {snapchat && (
        <a href={snapchat} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Ghost className="w-6 h-6" />
        </a>
      )}
      {pinterest && (
        <a href={pinterest} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Pin className="w-6 h-6" />
        </a>
      )}
      {dribbble && (
        <a href={dribbble} target="_blank" rel="noopener noreferrer" className={`transition-transform hover:scale-110 ${iconClass}`}>
          <Dribbble className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}

function CardPreview({ data }: { data: CardData }) {
  const { name, title, company, logo, template } = data;

  if (template === 'corporate') {
    return (
      <div className="w-full aspect-[9/16] bg-[#0f172a] text-white rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col border border-slate-800/50 ring-1 ring-white/10">
        <div className="p-8 flex-1 flex flex-col z-10">
          <div className="h-20 mb-8 flex items-start justify-start">
            {logo ? (
              <div className="relative w-20 h-20 bg-white/5 rounded-2xl p-2 backdrop-blur-md border border-white/10 shadow-xl">
                <Image src={logo} alt="Company Logo" fill className="object-contain p-1 rounded-xl" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700/50 shadow-inner">
                <ImageIcon className="w-8 h-8 text-slate-500" />
              </div>
            )}
          </div>

          <div className="mt-auto mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">{name || 'Your Name'}</h2>
            <p className="text-blue-400 font-medium text-lg mb-2">{title || 'Your Title'}</p>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-6">{company || 'Your Company'}</p>
            
            <div className="flex flex-row justify-start gap-6 mt-4">
              {data.email && (
                <a href={`mailto:${data.email}`} className="hover:text-white transition-transform hover:scale-110" title={data.email}>
                  <Mail className="w-8 h-8 text-blue-400" />
                </a>
              )}
              {data.phone && (
                <a href={`tel:${data.phone}`} className="hover:text-white transition-transform hover:scale-110" title={data.phone}>
                  <Phone className="w-8 h-8 text-blue-400" />
                </a>
              )}
              {data.website && (
                <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-transform hover:scale-110" title={data.website}>
                  <Globe className="w-8 h-8 text-blue-400" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800/80">
            <SocialLinks data={data} iconClass="text-slate-400 hover:text-white" />
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      </div>
    );
  }

  if (template === 'creative') {
    return (
      <div className="w-full aspect-[9/16] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 text-white rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-8 text-center ring-1 ring-white/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="mb-10">
            {logo ? (
              <div className="relative w-28 h-28 bg-white/10 rounded-full p-1.5 shadow-2xl overflow-hidden backdrop-blur-md border border-white/30">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                  <Image src={logo} alt="Company Logo" fill className="object-contain p-2" />
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl border border-white/30">
                <ImageIcon className="w-10 h-10 text-white/60" />
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full shadow-2xl border border-white/20 mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white">{name || 'Your Name'}</h2>
            <p className="text-white/90 font-medium mb-4 text-lg">{title || 'Your Title'}</p>
            <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold tracking-wide border border-white/10 mb-6">
              {company || 'Your Company'}
            </div>
            
            <div className="flex flex-row justify-center gap-6 mt-2">
              {data.email && (
                <a href={`mailto:${data.email}`} className="hover:text-white transition-transform hover:scale-110" title={data.email}>
                  <Mail className="w-8 h-8 opacity-90" />
                </a>
              )}
              {data.phone && (
                <a href={`tel:${data.phone}`} className="hover:text-white transition-transform hover:scale-110" title={data.phone}>
                  <Phone className="w-8 h-8 opacity-90" />
                </a>
              )}
              {data.website && (
                <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-transform hover:scale-110" title={data.website}>
                  <Globe className="w-8 h-8 opacity-90" />
                </a>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-full px-8 py-5 border border-white/20 shadow-2xl">
            <SocialLinks data={data} iconClass="text-white hover:text-white/80 drop-shadow-md" containerClass="justify-center gap-6" />
          </div>
        </div>
      </div>
    );
  }

  // Minimalist
  if (template === 'minimalist') {
    return (
      <div className="w-full aspect-[9/16] bg-[#fafafa] text-gray-900 rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col border border-gray-200/80 ring-1 ring-black/5">
        <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-12">
            {logo ? (
              <div className="relative w-24 h-24">
                <Image src={logo} alt="Company Logo" fill className="object-contain drop-shadow-sm" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200/50 shadow-inner">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>

          <div className="mb-12 w-full">
            <h2 className="text-4xl font-light tracking-tight text-gray-900 mb-4">{name || 'Your Name'}</h2>
            <div className="w-12 h-0.5 bg-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium tracking-widest text-xs uppercase mb-3">{title || 'Your Title'}</p>
            <p className="text-gray-400 text-sm mb-8">{company || 'Your Company'}</p>
            
            <div className="flex flex-row justify-center gap-6 mt-4">
              {data.email && (
                <a href={`mailto:${data.email}`} className="hover:text-gray-900 transition-transform hover:scale-110" title={data.email}>
                  <Mail className="w-8 h-8 text-gray-500" />
                </a>
              )}
              {data.phone && (
                <a href={`tel:${data.phone}`} className="hover:text-gray-900 transition-transform hover:scale-110" title={data.phone}>
                  <Phone className="w-8 h-8 text-gray-500" />
                </a>
              )}
              {data.website && (
                <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-transform hover:scale-110" title={data.website}>
                  <Globe className="w-8 h-8 text-gray-500" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-auto w-full">
            <SocialLinks data={data} iconClass="text-gray-400 hover:text-gray-900 transition-colors" containerClass="justify-center gap-8" />
          </div>
        </div>
      </div>
    );
  }

  if (template === 'modern') {
    return (
      <div className="w-full aspect-[9/16] bg-black text-white rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col border border-cyan-500/30 ring-1 ring-cyan-500/10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-emerald-400"></div>
        <div className="p-8 flex-1 flex flex-col z-10">
          <div className="mb-10 flex justify-between items-start">
            {logo ? (
              <div className="relative w-16 h-16 bg-gray-900 rounded-xl p-2 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Image src={logo} alt="Company Logo" fill className="object-contain p-1" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <ImageIcon className="w-6 h-6 text-cyan-400" />
              </div>
            )}
            <div className="text-right">
              <h2 className="text-2xl font-bold tracking-tight text-white">{name || 'Your Name'}</h2>
              <p className="text-cyan-400 font-medium text-sm">{title || 'Your Title'}</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">{company || 'Your Company'}</p>
            <div className="flex flex-row justify-start gap-6 mt-4">
              {data.email && (
                <a href={`mailto:${data.email}`} className="bg-gray-900/50 p-3 rounded-full border border-white/5 hover:border-cyan-500/50 transition-all hover:scale-110" title={data.email}>
                  <Mail className="w-8 h-8 text-cyan-400" />
                </a>
              )}
              {data.phone && (
                <a href={`tel:${data.phone}`} className="bg-gray-900/50 p-3 rounded-full border border-white/5 hover:border-cyan-500/50 transition-all hover:scale-110" title={data.phone}>
                  <Phone className="w-8 h-8 text-cyan-400" />
                </a>
              )}
              {data.website && (
                <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer" className="bg-gray-900/50 p-3 rounded-full border border-white/5 hover:border-cyan-500/50 transition-all hover:scale-110" title={data.website}>
                  <Globe className="w-8 h-8 text-cyan-400" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6">
            <SocialLinks data={data} iconClass="text-gray-400 hover:text-cyan-400" containerClass="justify-start gap-4" />
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-[60px] translate-y-1/3 translate-x-1/3 pointer-events-none" />
      </div>
    );
  }

  // Elegant
  return (
    <div className="w-full aspect-[9/16] bg-[#fdfbf7] text-stone-800 rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col border border-stone-200 ring-1 ring-stone-900/5">
      <div className="p-10 flex-1 flex flex-col items-center text-center z-10">
        <div className="mb-8">
          {logo ? (
            <div className="relative w-20 h-20">
              <Image src={logo} alt="Company Logo" fill className="object-contain" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
              <ImageIcon className="w-8 h-8 text-stone-400" />
            </div>
          )}
        </div>

        <div className="mb-10 w-full">
          <h2 className="text-3xl font-serif text-stone-900 mb-2">{name || 'Your Name'}</h2>
          <p className="text-amber-700 font-medium text-sm tracking-wide mb-6">{title || 'Your Title'}</p>
          <div className="w-8 h-px bg-amber-700/30 mx-auto mb-6"></div>
          <p className="text-stone-500 text-xs uppercase tracking-widest">{company || 'Your Company'}</p>
        </div>

        <div className="flex flex-row justify-center gap-6 mt-4 mb-8">
          {data.email && (
            <a href={`mailto:${data.email}`} className="hover:text-stone-900 transition-transform hover:scale-110" title={data.email}>
              <Mail className="w-8 h-8 text-amber-700" />
            </a>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="hover:text-stone-900 transition-transform hover:scale-110" title={data.phone}>
              <Phone className="w-8 h-8 text-amber-700" />
            </a>
          )}
          {data.website && (
            <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 transition-transform hover:scale-110" title={data.website}>
              <Globe className="w-8 h-8 text-amber-700" />
            </a>
          )}
        </div>

        <div className="mt-auto w-full pt-8 border-t border-stone-200">
          <SocialLinks data={data} iconClass="text-stone-400 hover:text-amber-700 transition-colors" containerClass="justify-center gap-6" />
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
