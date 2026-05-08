"use client";

import React, { useEffect } from 'react';
import { Button } from '../components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060400] text-[#F5E6C0] p-6 text-center">
      <div className="max-w-md w-full">
        <h2 className="font-['Cinzel_Decorative'] text-4xl font-bold mb-4 text-[#F0B429] tracking-widest">
          SYSTEM ERROR
        </h2>
        <p className="font-['Cormorant_Garamond'] text-xl italic mb-8 text-[#A8885A]">
          The knowledge graph encountered an unexpected contradiction.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => reset()}
            className="btn-primary"
          >
            <span>Try Again</span>
          </Button>
          <a 
            href="/" 
            className="btn-secondary px-6 py-3 border border-[#3D2C00] rounded-sm hover:border-[#7A5800] hover:text-[#F0B429] transition-all uppercase tracking-wider text-sm"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
