'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [numImages, setNumImages] = useState(1);
  const [steps, setSteps] = useState(35);
  const [guidance, setGuidance] = useState(7.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ image_base64?: string; message?: string; params_used?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Prompt tidak boleh kosong');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          num_images: numImages,
          steps,
          guidance,
          width: 1024,
          height: 1024
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Gagal generate');
      }

      const data = await response.json();
      setResult({ image_base64: data.image_base64, message: data.message, params_used: data.params_used });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* Hero Section (sama seperti sebelumnya) */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-transparent"></div>
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm mb-4">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                AI Generator
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
                Buat Karakter AI & <br />
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Video Promosi
                </span>
              </h1>
              <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto md:mx-0">
                Hasilkan karakter berkualitas tinggi dan video promosi dalam hitungan menit. 
                Cocok untuk kreator, UMKM, dan agensi.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition shadow-lg">
                  Mulai Gratis
                </button>
                <button className="border border-orange-500 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-full font-semibold transition">
                  Lihat Demo
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full flex items-center justify-center shadow-2xl">
                <Image src="/path-to-mascot.png" alt="Mascot" width={500} height={500} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Generate Gambar */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Generate Gambar</h2>
          </div>

          {/* Prompt */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
              placeholder="Contoh: seorang wanita muda Indonesia, rambut hitam ikal, hijab pastel, tersenyum, ruang tamu hangat, 4k, fotorealistik"
            />
          </div>

          {/* Style */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gaya
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
            >
              <option value="realistic">Realistis</option>
              <option value="anime">Anime</option>
              <option value="cartoon">Kartun</option>
              <option value="3d">3D Render</option>
            </select>
          </div>

          {/* Steps Slider */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kualitas (Steps): {steps}
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10 (Cepat)</span>
              <span>30 (Standar)</span>
              <span>50 (Maksimal)</span>
            </div>
          </div>

          {/* Guidance Slider */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kepatuhan Prompt (Guidance): {guidance}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={guidance}
              onChange={(e) => setGuidance(parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Kreatif)</span>
              <span>7.5 (Standar)</span>
              <span>20 (Sangat ketat)</span>
            </div>
          </div>

          {/* Jumlah Gambar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Gambar: {numImages}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={numImages}
              onChange={(e) => setNumImages(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              '🚀 Generate Sekarang'
            )}
          </button>

          {/* Error & Result */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              ❌ {error}
            </div>
          )}
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-green-600 text-sm mb-2">✅ {result.message}</p>
              {result.params_used && (
                <p className="text-xs text-gray-500 mb-2">
                  Parameter: Steps {result.params_used.steps}, Guidance {result.params_used.guidance}, Style {result.params_used.style}
                </p>
              )}
              {result.image_base64 && (
                <img 
                  src={`data:image/png;base64,${result.image_base64}`} 
                  alt="Generated"
                  className="rounded-lg w-full max-w-md mx-auto shadow-md"
                />
              )}
            </div>
          )}
        </div>

        {/* Tips Card */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-2">🎨 Tips Membuat Prompt yang Baik</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Deskripsikan karakter secara detail (rambut, pakaian, ekspresi)</li>
            <li>Sebutkan gaya yang diinginkan (realistis, anime, kartun)</li>
            <li>Tambahkan "4k, fotorealistik, high quality" untuk hasil lebih tajam</li>
            <li>Gunakan Steps lebih tinggi (40-50) untuk kualitas maksimal</li>
            <li>Guidance 7-10 untuk keseimbangan, 12+ untuk prompt yang sangat spesifik</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2026 GoodCharacter.ai — Buat konten kreatif dengan AI
        </div>
      </footer>
    </div>
  );
}