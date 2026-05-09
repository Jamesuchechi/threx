import React from 'react'

export default function GraphLoading() {
  return (
    <div className="app-layout">
      {/* Skeleton Sidebar Left */}
      <aside className="sidebar-left animate-pulse">
        <div className="space-y-4 px-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 w-full bg-[#1E1500] rounded-sm" />
          ))}
        </div>
      </aside>

      {/* Skeleton Graph Canvas */}
      <main className="feed-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="relative w-full h-[600px] bg-[#1C1600] border border-[#2E2200] rounded-xl overflow-hidden animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-[#C9960A] border-dashed rounded-full opacity-20 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
        </div>
      </main>

      {/* Skeleton Sidebar Right */}
      <aside className="sidebar-right animate-pulse">
        <div className="h-32 w-full bg-[#1E1500] rounded-sm mb-6" />
        <div className="h-48 w-full bg-[#1A1400] rounded-sm" />
      </aside>
    </div>
  )
}
