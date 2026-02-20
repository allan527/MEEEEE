import { Hono } from 'hono';

const app = new Hono();
const kv: Record<string, unknown[]> = {
  clients: [],
  transactions: [],
  cashbook: [],
  ownerCapital: [],
};

const atConfig = {
  apiKey: Deno.env.get('AFRICAS_TALKING_API_KEY') ?? 'atsk_eee56107794a362e5f04a427ca658d3c6063ce37b3c7932106e4016e6a7a950c9fc121e0',
  username: Deno.env.get('AFRICAS_TALKING_USERNAME') ?? 'william_main_user',
  senderId: Deno.env.get('AFRICAS_TALKING_SENDER_ID') ?? 'ATTech',
};

const collection = (name: keyof typeof kv) => ({
  list: () => kv[name],
  insert: async (item: unknown) => { kv[name] = [item, ...kv[name]]; return item; },
});

app.get('/make-server-68baa523/:resource', (c) => {
  const resource = c.req.param('resource') as keyof typeof kv;
  return c.json(collection(resource).list());
});

app.post('/make-server-68baa523/:resource', async (c) => {
  const resource = c.req.param('resource') as keyof typeof kv;
  const body = await c.req.json();
  return c.json(await collection(resource).insert(body), 201);
});

app.post('/make-server-68baa523/sms/:event', async (c) => {
  const payload = await c.req.json();
  const message = JSON.stringify(payload);
  console.log('SMS EVENT', c.req.param('event'), { ...atConfig, payload: message });
  try {
    const res = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        apiKey: atConfig.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({ username: atConfig.username, to: payload.phone, message, from: atConfig.senderId }),
    });
    return c.json(await res.json(), res.status as 200);
  } catch (error) {
    console.error('SMS failed', error);
    return c.json({ ok: false }, 500);
  }
});

Deno.serve(app.fetch);
