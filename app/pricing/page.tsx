'use client';

import { useState, useEffect } from 'react';
import { Check, Crown, X, CreditCard, Wallet, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PricingPage() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'online' | 'direct' | null>(null);
  const [pkrPrice, setPkrPrice] = useState<string | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const WHATSAPP_NUMBER = '923112868787'; // Removed + for wa.me link

  useEffect(() => {
    if (isPaymentModalOpen && !pkrPrice) {
      setIsLoadingRate(true);
      fetch('https://open.er-api.com/v6/latest/USD')
        .then(res => res.json())
        .then(data => {
          if (data && data.rates && data.rates.PKR) {
            const rate = data.rates.PKR;
            const total = 9.99 * rate;
            setPkrPrice(Math.round(total).toLocaleString('en-PK'));
          }
        })
        .catch(err => console.error('Failed to fetch exchange rate:', err))
        .finally(() => setIsLoadingRate(false));
    }
  }, [isPaymentModalOpen, pkrPrice]);

  const handleWhatsAppRedirect = () => {
    const amountText = pkrPrice ? ` ($9.99 / Rs. ${pkrPrice})` : ` ($9.99)`;
    const message = encodeURIComponent(`Hi, I have made a direct payment for the Pehchan Digital Pro Plan${amountText}. Here is my payment screenshot:`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 text-center">
      <div className="mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-400 text-lg">Choose the plan that best fits your professional needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 text-left">
          <h3 className="text-2xl font-semibold text-white mb-2">Basic</h3>
          <p className="text-gray-400 mb-6">Perfect for getting started.</p>
          <div className="text-5xl font-bold text-white mb-8">$0<span className="text-lg text-gray-500 font-normal">/forever</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-blue-500" /> 3 Free Downloads / Day</li>
            <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-blue-500" /> 3 AI Logo Generations / Day</li>
            <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-blue-500" /> Standard Templates</li>
            <li className="flex items-center gap-3 text-gray-500"><Check className="w-5 h-5 text-gray-700" /> No Custom Domain</li>
          </ul>
          
          <button className="w-full py-4 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/5 transition-colors">
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-b from-amber-500/10 to-[#111] border border-amber-500/30 rounded-3xl p-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-bl-xl">Most Popular</div>
          
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <h3 className="text-2xl font-semibold text-white">Pro</h3>
          </div>
          <p className="text-amber-200/60 mb-6">For professionals and businesses.</p>
          <div className="text-5xl font-bold text-white mb-8">$9.99<span className="text-lg text-gray-500 font-normal">/mo</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-amber-500" /> Unlimited Downloads</li>
            <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-amber-500" /> Unlimited AI Logo Generations</li>
            <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-amber-500" /> Premium Templates</li>
            <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-amber-500" /> Custom Domain Support</li>
          </ul>
          
          <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            Subscribe Now
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative text-left"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Choose Payment Method</h2>
                <button 
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedMethod(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {!selectedMethod ? (
                  <div className="space-y-4">
                    <button 
                      onClick={() => setSelectedMethod('online')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white">Online Payment</div>
                          <div className="text-sm text-gray-400">Credit/Debit Card via Stripe</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-amber-500 transition-colors" />
                    </button>

                    <button 
                      onClick={() => setSelectedMethod('direct')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white">Direct Payment</div>
                          <div className="text-sm text-gray-400">Bank Transfer / JazzCash / EasyPaisa</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-amber-500 transition-colors" />
                    </button>
                  </div>
                ) : selectedMethod === 'direct' ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Bank Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Bank:</span> <span className="text-white font-medium">Meezan Bank</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Account Title:</span> <span className="text-white font-medium">Pehchan Digital</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Account No:</span> <span className="text-white font-medium font-mono">01234567891011</span></div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Mobile Money</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">JazzCash / EasyPaisa:</span> <span className="text-white font-medium font-mono">0311 2868787</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Account Title:</span> <span className="text-white font-medium">Pehchan Digital</span></div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 text-center">
                      Please transfer <strong className="text-white">$9.99 {isLoadingRate ? <Loader2 className="w-3 h-3 inline animate-spin" /> : pkrPrice ? `(approx. Rs. ${pkrPrice})` : '(or equivalent in PKR)'}</strong> and send the payment screenshot on WhatsApp to activate your Pro plan.
                    </div>

                    <button 
                      onClick={handleWhatsAppRedirect}
                      className="w-full py-3 rounded-xl font-bold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Send Screenshot on WhatsApp
                    </button>
                    
                    <button 
                      onClick={() => setSelectedMethod(null)}
                      className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Back to payment methods
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-8">
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Online Payment</h3>
                    <p className="text-gray-400 text-sm">
                      Stripe integration is currently being set up. Please use the Direct Payment method for now, or contact support.
                    </p>
                    <button 
                      onClick={() => setSelectedMethod(null)}
                      className="w-full py-3 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
