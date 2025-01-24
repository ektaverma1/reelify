import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) throw new Error('Missing WEBHOOK_SECRET')

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing required headers');
    return new Response('Error occurred', { status: 400 });
  }

  const payload = await req.json();
  const webhook = new Webhook(WEBHOOK_SECRET);

  try {
    const evt = webhook.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    console.log('Webhook event type:', evt.type);

    if (evt.type === 'user.created') {
      const userData = {
        id: evt.data.id,
        username: evt.data.username || '',
        email: evt.data.email_addresses[0].email_address,
        avatarUrl: evt.data.image_url
      };
      console.log('Creating user:', userData);

      const user = await prisma.user.create({ data: userData });
      console.log('User created:', user);
    }

    return new Response('', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Error occurred', { status: 400 });
  }
}