'use client';
import Link from 'next/link';
import { Crown, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './FirebaseProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-[#111] border-b border-white/10 py-4 px-6 md:px-12 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">P</div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">Pehchan Digital</h1>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="/" className={`hover:text-white transition-colors ${pathname === '/' ? 'text-white' : ''}`}>Home</Link>
          <Link href="/templates" className={`hover:text-white transition-colors ${pathname === '/templates' ? 'text-white' : ''}`}>Templates</Link>
          <Link href="/editor" onClick={() => { if (pathname === '/editor') window.dispatchEvent(new Event('reset-editor')); }} className={`hover:text-white transition-colors ${pathname === '/editor' ? 'text-white' : ''}`}>Create Card</Link>
          <Link href="/pricing" className={`hover:text-white transition-colors ${pathname === '/pricing' ? 'text-white' : ''}`}>Pricing</Link>
        </nav>
        
        <div className="hidden md:flex items-center gap-4">
          <Link href="/pricing" className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all">
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </Link>
          
          {!loading && (
            user ? (
              <div className="flex items-center gap-4 ml-4 border-l border-white/10 pl-4">
                <div className="flex items-center gap-2">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-300">{profile?.displayName || user.email?.split('@')[0]}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors" title="Sign Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-all ml-2">
                Sign In
              </Link>
            )
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-2 border-t border-white/10 mt-4 flex flex-col gap-4">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${pathname === '/' ? 'text-white' : 'text-gray-400'}`}>Home</Link>
          <Link href="/templates" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${pathname === '/templates' ? 'text-white' : 'text-gray-400'}`}>Templates</Link>
          <Link href="/editor" onClick={() => { setIsMenuOpen(false); if (pathname === '/editor') window.dispatchEvent(new Event('reset-editor')); }} className={`text-sm font-medium ${pathname === '/editor' ? 'text-white' : 'text-gray-400'}`}>Create Card</Link>
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${pathname === '/pricing' ? 'text-white' : 'text-gray-400'}`}>Pricing</Link>
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full w-fit mt-2">
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </Link>
          
          {!loading && (
            user ? (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-300">{profile?.displayName || user.email?.split('@')[0]}</span>
                </div>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium bg-white/10 text-white px-4 py-2 rounded-full w-fit mt-2 text-center">
                Sign In
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
