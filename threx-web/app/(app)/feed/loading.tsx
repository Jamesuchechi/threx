import React from 'react'

export default function Loading() {
  return (
    <div className="dashboard-grid">
      <div className="space-y-8">
        <header className="animate-pulse">
          <div className="h-10 w-64 bg-[#1E1500] rounded-sm mb-4" />
          <div className="h-4 w-96 bg-[#0C0900] rounded-sm" />
        </header>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="node-card animate-pulse">
              <div className="h-3 w-32 bg-[#1E1500] rounded-sm mb-6" />
              <div className="h-6 w-full bg-[#1E1500] rounded-sm mb-4" />
              <div className="h-4 w-3/4 bg-[#0C0900] rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      <aside className="dashboard-aside animate-pulse">
        <div className="h-48 w-full bg-[#1E1500] rounded-sm mb-8" />
        <div className="h-48 w-full bg-[#0C0900] rounded-sm" />
      </aside>
    </div>
  )
}
