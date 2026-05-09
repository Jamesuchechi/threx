import React from 'react'
import { createClient } from '../../../lib/supabase/server'
import NodeComposer from '../../../components/nodes/NodeComposer'
import DraftReviewInbox from '../../../components/nodes/DraftReviewInbox';
import FeedContainer from '../../../components/feed/FeedContainer'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="animate-in fade-in duration-700">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="auth-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Intellectual Feed</h1>
        <p className="auth-subtitle">Real-time synthesis of the network's collective logic</p>
      </header>

      <DraftReviewInbox />

      {/* Compose Box */}
      <NodeComposer profile={profile} />

      {/* Dynamic Feed */}
      <FeedContainer />
    </div>
  )
}
