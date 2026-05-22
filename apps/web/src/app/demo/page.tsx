'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Sparkles, Download, Zap, AlertCircle } from 'lucide-react';

export default function DemoPage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [steps, setSteps] = useState(35);
  const [guidance, setGuidance] = useState(7.5);
  const [numImages, setNumImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ image_base64: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const styleOptions = [
    { value: 'realistic', label: 'Realistis', icon: '📷' },
    { value: 'anime', label: 'Anime', icon: '🎨' },
    { value: 'cartoon', label: 'Kartun', icon: '🐭' },
    { value: '3d', label: '3D Render', icon: '💎' },
    { value: 'fantasy', label: 'Fantasi', icon: '🧙' },
    { value: 'cyberpunk', label: 'Cyberpunk', icon: '🤖' },
  ];

  const getDimensions = (ratio: string) => {
    switch (ratio) {
      case '1:1': return { width: 1024, height: 1024 };
      case '4:5': return { width: 1024, height: 1280 };
      case '9:16': return { width: 576, height: 1024 };
      case '16:9': return { width: 1024, height: 576 };
      default: return { width: 1024, height: 1024 };
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Prompt tidak boleh kosong');
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);

    const { width, height } = getDimensions(aspectRatio);
    const newResults = [];

    try {
      for (let i = 0; i < numImages; i++) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            style,
            num_images: 1,
            steps,
            guidance,
            width,
            height,
            seed: 1000 + i,
          }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || `Gagal generate gambar ke-${i+1}`);
        }
        const data = await response.json();
        newResults.push({ image_base64: data.image_base64 });
      }
      setResults(newResults);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (base64: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `goodcharacter-${Date.now()}-${index}.png`;
    link.click();
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-card rounded-3xl shadow-2xl p-6 md:p-8 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white">Generate Gambar</h1>
          </div>

          {/* Form fields */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-200 mb-1">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition bg-background text-white"
              placeholder="Contoh: kartun, pria muda dengan rambut orange cerah, hoodie kuning, kacamata..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-1">Gaya</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary text-white bg-background"
              >
                {styleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-1">Rasio Aspek</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary text-white bg-background"
              >
                <option value="1:1">1:1 (Square) - Instagram feed</option>
                <option value="4:5">4:5 (Portrait) - Instagram feed</option>
                <option value="9:16">9:16 (Story) - TikTok/IG Reels</option>
                <option value="16:9">16:9 (Landscape) - YouTube/Website</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-200 mb-1">Kualitas (Steps): {steps}</label>
            <input
              type="range"
              min="10"
              max="50"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10 (Cepat)</span>
              <span>30 (Standar)</span>
              <span>50 (Maksimal)</span>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-200 mb-1">Kepatuhan Prompt (Guidance): {guidance}</label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={guidance}
              onChange={(e) => setGuidance(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Kreatif)</span>
              <span>7.5 (Standar)</span>
              <span>20 (Sangat ketat)</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-200 mb-1">Jumlah Gambar: {numImages}</label>
            <input
              type="range"
              min="1"
              max="4"
              value={numImages}
              onChange={(e) => setNumImages(parseInt(e.target.value))}
              className="w-full accent-primary"
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
            className="w-full bg-primary text-black font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 shadow-md hover:bg-primary/80"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 animate-spin" />
                Memproses...
              </span>
            ) : (
              '🚀 Generate Sekarang'
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-primary text-sm font-semibold">✅ {results.length} gambar berhasil di-generate!</p>
                <button
                  onClick={() => results.forEach((r, i) => downloadImage(r.image_base64, i))}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition flex items-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download Semua
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {results.map((result, idx) => (
                  <div key={idx} className="bg-background rounded-xl p-4 shadow-md border border-border">
                    <img
                      src={`data:image/png;base64,${result.image_base64}`}
                      alt={`Generated ${idx+1}`}
                      className="rounded-lg w-full shadow-md"
                    />
                    <button
                      onClick={() => downloadImage(result.image_base64, idx)}
                      className="w-full mt-3 bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download PNG
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}