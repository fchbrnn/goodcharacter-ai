'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  { name: 'Andi Wijaya', role: 'Kreator Konten', text: 'Platform ini luar biasa! Gambar yang dihasilkan sangat realistis dan konsisten.', rating: 5 },
  { name: 'Budi Santoso', role: 'UMKM', text: 'Membantu saya membuat konten promosi tanpa perlu desainer. Hasilnya profesional!', rating: 5 },
  { name: 'Citra Dewi', role: 'Agen Kreatif', text: 'Fitur konsistensi karakter sangat berguna untuk kampanye brand.', rating: 4 },
  { name: 'Dian Purnama', role: 'Freelancer', text: 'Cepat, mudah, dan hasilnya memuaskan. Recommended!', rating: 5 },
];

export default function TestimonialSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[index];

  return (
    <div className="relative bg-[#111111] p-6 md:p-8 rounded-2xl border border-[#2A2A2A] shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < t.rating ? 'text-[#00FF66] fill-[#00FF66]' : 'text-gray-600'}`} />)}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)} className="p-1 rounded-full hover:bg-white/10 transition"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setIndex((prev) => (prev + 1) % testimonials.length)} className="p-1 rounded-full hover:bg-white/10 transition"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <p className="text-gray-300 text-lg italic">"{t.text}"</p>
      <div className="mt-6">
        <p className="font-semibold text-white">{t.name}</p>
        <p className="text-gray-400 text-sm">{t.role}</p>
      </div>
    </div>
  );
}
