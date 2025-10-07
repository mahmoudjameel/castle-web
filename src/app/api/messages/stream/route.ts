import { NextRequest } from 'next/server';
import { subscribe, channelForUsers } from '@/lib/sse';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user1 = searchParams.get('user1');
  const user2 = searchParams.get('user2');
  if (!user1 || !user2) {
    return new Response('Missing user1 or user2', { status: 400 });
  }

  const channel = channelForUsers(user1, user2);

  let unsubscribeFn: (() => void) | undefined;
  let pingId: any;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const safeEnqueue = (str: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(str));
        } catch (error) {
          // If enqueue fails, mark closed and cleanup
          closed = true;
          try { if (pingId) clearInterval(pingId); } catch {}
          try { if (unsubscribeFn) unsubscribeFn(); } catch {}
        }
      };

      // Initial comment to open SSE
      safeEnqueue(': connected\n\n');

      const send = (chunk: string) => {
        safeEnqueue(chunk);
      };

      unsubscribeFn = subscribe(channel, send);
      pingId = setInterval(() => safeEnqueue(': ping\n\n'), 15000);
    },
    cancel() {
      if (closed) return;
      closed = true;
      try { if (pingId) clearInterval(pingId); } catch {}
      try { if (unsubscribeFn) unsubscribeFn(); } catch {}
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}




