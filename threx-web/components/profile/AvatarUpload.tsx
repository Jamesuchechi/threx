"use client";

import React, { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function AvatarUpload({ 
  uid, 
  url, 
  onUpload 
}: { 
  uid: string; 
  url: string | null; 
  onUpload: (url: string) => void 
}) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${uid}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      onUpload(data.publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="w-20 h-20 bg-[#0C0900] border border-[#C8920A] rounded-sm overflow-hidden flex-shrink-0">
        {url ? (
          <img src={url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#524020] text-2xl font-['Cinzel']">
            ?
          </div>
        )}
      </div>
      
      <label className="cursor-pointer">
        <span className="py-2 px-4 border border-[#1E1500] text-[10px] uppercase tracking-[2px] text-[#A8885A] hover:border-[#C8920A] hover:text-[#F5E6C0] transition-all">
          {uploading ? 'Uploading...' : 'Change Avatar'}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}
