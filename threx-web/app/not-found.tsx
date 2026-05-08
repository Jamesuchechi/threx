import React from 'react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060400] text-[#F5E6C0] p-6 text-center">
      <div className="max-w-md w-full">
        <h2 className="font-['Cinzel_Decorative'] text-6xl font-black mb-4 text-[#F0B429] tracking-widest opacity-20">
          404
        </h2>
        <h3 className="font-['Cinzel'] text-2xl font-bold mb-4 text-[#C8920A] tracking-wider uppercase">
          Node Not Found
        </h3>
        <p className="font-['Cormorant_Garamond'] text-xl italic mb-8 text-[#A8885A]">
          This path does not exist in the Threx knowledge graph.
        </p>
        <div className="flex justify-center">
          <a href="/" className="btn-primary px-10 py-4">
            <span>Return to Root</span>
          </a>
        </div>
      </div>
    </div>
  );
}
