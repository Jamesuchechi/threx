"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060400] text-[#F5E6C0]">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-t-2 border-[#C8920A] rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-2 border-[#D97706] rounded-full animate-spin-slow"></div>
        <div className="absolute inset-4 border-b-2 border-[#7A5800] rounded-full animate-spin-reverse"></div>
      </div>
      <p className="mt-8 font-['Cinzel'] text-xs tracking-[0.3em] uppercase text-[#7A5800] animate-pulse">
        Synthesizing Graph...
      </p>
    </div>
  );
}
