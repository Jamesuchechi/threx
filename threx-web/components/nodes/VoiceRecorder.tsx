"use client";

import React, { useState, useRef } from 'react';

export default function VoiceRecorder({ onDraftReady }: { onDraftReady: (draft: any, lang: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState('en');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      await processAudio(audioBlob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', blob, 'voice.wav');
    if (language !== 'en') formData.append('language', language);

    try {
      const response = await fetch('/api/ai/voice/process', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onDraftReady(data.draft, language);
    } catch (err) {
      console.error("Voice processing failed:", err);
      alert("Voice processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <select 
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          background: 'transparent', border: 'none', color: 'var(--text3)',
          fontSize: '10px', outline: 'none', cursor: 'pointer', padding: '4px'
        }}
      >
        <option value="en">English</option>
        <option value="yo">Yoruba</option>
        <option value="ig">Igbo</option>
        <option value="ha">Hausa</option>
      </select>

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={isRecording ? stopRecording : undefined}
        style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: isRecording ? 'var(--orange)' : 'var(--bg3)',
          border: '1px solid var(--border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: isRecording ? '0 0 15px var(--orange)' : 'none'
        }}
        title="Hold to Record Voice Observation"
      >
        {isProcessing ? '⌛' : '🎙️'}
      </button>
      {isRecording && (
        <span style={{ fontSize: '10px', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
          Recording...
        </span>
      )}
      {isProcessing && (
        <span style={{ fontSize: '10px', color: 'var(--gold-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Structuring Intellectual Draft...
        </span>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
