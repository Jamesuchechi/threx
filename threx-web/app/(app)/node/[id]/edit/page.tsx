import React from 'react';
import { createClient } from '../../../../../lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import EditNodeForm from './EditNodeForm';

export default async function EditNodePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();

  const { data: node, error } = await supabase
    .from('nodes')
    .select(`*, tags:node_tags(tag:tags(name))`)
    .eq('id', id)
    .single();

  if (error || !node || node.deleted_at) {
    return notFound();
  }

  // Security: only author can edit
  if (user?.id !== node.author_id) {
    return redirect(`/node/${id}`);
  }

  const tags = node.tags?.map((t: any) => t.tag.name) || [];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', fontWeight: '700', color: 'var(--text)' }}>
          Edit Node
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>
          Updates will be versioned automatically
        </p>
      </header>

      <EditNodeForm node={node} tags={tags} />
    </div>
  );
}
