type Subscriber = {
  send: (event: string) => void;
};

type ChannelsMap = Map<string, Set<Subscriber>>;

const globalAny = global as unknown as { __sseChannels?: ChannelsMap };

const channels: ChannelsMap = globalAny.__sseChannels || new Map();
if (!globalAny.__sseChannels) {
  globalAny.__sseChannels = channels;
}

export function subscribe(channel: string, send: (event: string) => void) {
  if (!channels.has(channel)) channels.set(channel, new Set());
  const sub: Subscriber = { send };
  channels.get(channel)!.add(sub);
  return () => {
    channels.get(channel)?.delete(sub);
  };
}

export function publish(channel: string, data: any) {
  const subs = channels.get(channel);
  if (!subs || subs.size === 0) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  const toDelete: Subscriber[] = [];
  for (const s of subs) {
    try { s.send(payload); } catch { toDelete.push(s); }
  }
  if (toDelete.length) {
    const set = channels.get(channel);
    toDelete.forEach(s => set?.delete(s));
  }
}

export function channelForUsers(user1: number | string, user2: number | string) {
  const a = Number(user1);
  const b = Number(user2);
  const [minId, maxId] = a < b ? [a, b] : [b, a];
  return `chat:${minId}-${maxId}`;
}




