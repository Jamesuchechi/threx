"use client";
import { useEffect } from 'react';

export default function RevealObserver() {
  useEffect(() => {
    // Reveal on scroll logic
    const reveals = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    
    reveals.forEach(el => io.observe(el));

    return () => {
      io.disconnect();
    };
  }, []);

  return null;
}
