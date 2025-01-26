import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existingLike = await prisma.like.findFirst({
      where: { userId, videoId }
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Already liked' }, { status: 400 });
    }

    const newLike = await prisma.like.create({
      data: { userId, videoId }
    });

    return NextResponse.json(newLike);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating like' }, { status: 500 });
  }
}