'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Apakah GoodCharacter.ai gratis?', a: 'Ya, kami menyediakan paket gratis dengan batasan tertentu. Untuk fitur lebih lengkap, Anda bisa upgrade ke paket Pro atau Business.' },
  { q: 'Berapa lama waktu generate gambar?', a: 'Rata-rata 10-30 detik tergantung kompleksitas prompt dan parameter yang dipilih.' },
  { q: 'Apakah saya bisa menggunakan gambar hasil generate untuk komersial?', a: 'Ya, Anda memiliki hak penuh atas gambar yang dihasilkan.' },
  { q: 'Bagaimana cara mendapatkan hasil yang konsisten?', a: 'Gunakan seed yang sama dan prompt yang detail. Fitur registrasi karakter akan membantu konsistensi lebih baik.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div key={idx} className="border border-[#2A2A2A] rounded-xl overflow-hidden">
          <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="w-full flex justify-between items-center p-4 text-left bg-[#111111] hover:bg-white/5 transition">
            <span className="font-medium text-white">{faq.q}</span>
            <ChevronDown className={`w-5 h-5 text-[#00FF66] transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
          </button>
          {openIndex === idx && <div className="p-4 bg-[#0A0A0A] text-gray-400 border-t border-[#2A2A2A]">{faq.a}</div>}
        </div>
      ))}
    </div>
  );
}
