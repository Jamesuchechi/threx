import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join('/');
  const body = await request.json();

  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${aiServiceUrl}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Check if it's a streaming response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/event-stream')) {
        // Forward the stream
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    }

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
    
    const text = await response.text();
    return new Response(text, { 
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/plain' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join('/');
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${aiServiceUrl}/${path}`);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/event-stream')) {
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    }

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
    
    const text = await response.text();
    if (!text && response.status === 200) {
      return NextResponse.json([]);
    }
    
    return new Response(text, { 
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/plain' }
    });
  } catch (error: any) {
    console.error(`AI Proxy GET error [${path}]:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
