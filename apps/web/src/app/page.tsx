'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MascotRobot from '@/components/Mascot'; 
import FeatureCard from '@/components/FeatureCard';
import TestimonialSlider from '@/components/TestimonialSlider';
import FAQ from '@/components/FAQ';
import { Sparkles, Image, Video, Zap, Code, DollarSign, Share2 } from 'lucide-react';

export default function Home() {
  const features = [
    { icon: <Sparkles className="w-6 h-6" />, title: 'Generate Gambar AI', description: 'Hasilkan gambar berkualitas tinggi dari prompt teks.' },
    { icon: <Video className="w-6 h-6" />, title: 'Video Promosi', description: 'Buat video pendek untuk produk Anda.' },
    { icon: <Zap className="w-6 h-6" />, title: 'Cepat & Efisien', description: 'Proses cepat dengan teknologi AI terkini.' },
    { icon: <Code className="w-6 h-6" />, title: 'API Publik', description: 'Integrasikan ke aplikasi Anda.' },
    { icon: <DollarSign className="w-6 h-6" />, title: 'Harga Terjangkau', description: 'Paket gratis dan berbayar.' },
    { icon: <Share2 className="w-6 h-6" />, title: 'Konsistensi Karakter', description: 'Pertahankan identitas karakter.' },
  ];

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center md:text-left animate-slide-right">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm mb-6 animate-pulse">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                AI Generator Terbaru
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Buat Karakter AI & <br />
                <span className="text-primary text-glow">Konten Kreatif</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto md:mx-0">
                Hasilkan gambar, video, dan animasi berkualitas tinggi dalam hitungan menit. Cocok untuk kreator, UMKM, agensi, dan siapa saja.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Link href="/demo" className="bg-primary text-black px-6 py-3 rounded-full font-semibold shadow-glow hover:bg-primary/80 transition transform hover:scale-105">
                  Mulai Gratis
                </Link>
                <Link href="/demo" className="border border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-full font-semibold transition">
                  Lihat Demo
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <MascotRobot />
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-gradient-to-b from-background to-accent">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Apa Itu GoodCharacter.ai?</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Platform AI yang memungkinkan Anda membuat karakter digital, gambar, dan video promosi dengan mudah.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Kata Mereka</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">Tentang karya-karya yang telah dibuat</p>
          <div className="max-w-3xl mx-auto">
            <TestimonialSlider />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-accent">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Pertanyaan Umum</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">Ada yang ingin ditanyakan? Cek FAQ berikut.</p>
          <div className="max-w-3xl mx-auto">
            <FAQ />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Membuat Konten Kreatif?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">Mulai sekarang gratis, tidak perlu kartu kredit.</p>
          <Link href="/demo" className="bg-primary text-black px-8 py-3 rounded-full font-semibold shadow-glow hover:bg-primary/80 transition inline-block">
            Coba Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2026 GoodCharacter.ai — Buat konten kreatif dengan AI
        </div>
      </footer>
    </div>
  );
}