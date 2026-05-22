'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sparkles, Image, Video, Zap, Code, DollarSign, HelpCircle } from 'lucide-react';

const navItems = [
  { name: 'Generator', href: '/demo', icon: Sparkles },
  { name: 'Studio', href: '#', icon: Image },
  { name: 'Image to Video', href: '#', icon: Video },
  { name: 'API', href: '#', icon: Code },
  { name: 'Pricing', href: '#', icon: DollarSign },
  { name: 'Gallery', href: '#', icon: Image },
  { name: 'Support', href: '#', icon: HelpCircle },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-[#2A2A2A]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#00FF66] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl text-white group-hover:text-[#00FF66] transition-colors">
              GoodCharacter.ai
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-300 hover:text-[#00FF66] hover:bg-white/5 transition">
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button className="text-gray-300 hover:text-[#00FF66] transition">Login</button>
            <button className="bg-[#00FF66] text-black px-5 py-2 rounded-full font-semibold hover:bg-[#00FF66]/80 transition shadow-glow">Daftar</button>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-300 hover:text-[#00FF66]">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-[#00FF66] hover:bg-white/5 rounded-lg transition" onClick={() => setIsOpen(false)}>
                <item.icon className="w-5 h-5" /><span>{item.name}</span>
              </Link>
            ))}
            <div className="flex gap-3 mt-3 pt-3 border-t border-[#2A2A2A]">
              <button className="flex-1 text-gray-300 hover:text-[#00FF66] transition">Login</button>
              <button className="flex-1 bg-[#00FF66] text-black px-4 py-2 rounded-full font-semibold">Daftar</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
