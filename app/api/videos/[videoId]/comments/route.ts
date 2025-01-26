import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { videoId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        videoId: params.videoId,
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error creating comment' }, { status: 500 });
  }
}