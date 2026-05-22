import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className="group bg-[#111111] p-6 rounded-2xl border border-[#2A2A2A] hover:border-[#00FF66] transition-all duration-500 hover:shadow-glow"
      style={{ animation: `slideUp 0.5s ease-out ${delay}s both` }}
    >
      <div className="text-[#00FF66] mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-[#00FF66] transition-colors">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
