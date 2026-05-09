"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function NotificationCenter({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles(username, avatar_url),
        node:nodes(title)
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getNotificationText = (n: any) => {
    switch (n.type) {
      case 'reaction':
        return `reacted to "${n.node?.title}"`;
      case 'connection_request':
        return `sent you a connection request`;
      case 'node_cited':
        return `cited your node "${n.node?.title}"`;
      case 'new_match':
        return `is a new intelligence match for you`;
      default:
        return `sent a notification`;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAsRead();
        }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative', padding: '8px', display: 'flex', alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '18px' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            background: 'var(--orange)', color: 'white', fontSize: '9px',
            fontWeight: 'bold', minWidth: '14px', height: '14px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg2)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px',
          width: '320px', background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 1000, overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px', borderBottom: '1px solid var(--border2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '12px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px' }}>Notifications</h3>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  background: n.is_read ? 'transparent' : 'rgba(201,150,10,0.05)',
                  display: 'flex', gap: '12px', transition: 'background 0.2s'
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold-dim), var(--orange))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 'bold', color: 'var(--bg)', flexShrink: 0
                  }}>
                    {n.actor?.username?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>
                      <span style={{ fontWeight: 'bold' }}>@{n.actor?.username}</span> {getNotificationText(n)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div style={{ padding: '12px', textAlign: 'center', background: 'var(--bg3)' }}>
            <a href="/notifications" style={{ fontSize: '11px', color: 'var(--gold)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
              View all activity
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
