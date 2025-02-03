import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../../lib/prisma'
import { uploadVideo } from '../../../lib/blob'

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          username: null,
          email: null
        }
      });
    }

    const formData = await req.formData();
    const file = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !title) {
      return NextResponse.json({ error: 'Video and title are required' }, { status: 400 });
    }

    const filename = `${userId}-${Date.now()}-${file.name}`;
    const videoUrl = await uploadVideo(file, filename);

    const video = await prisma.video.create({
      data: { title, description, videoUrl, userId }
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error uploading video' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'latest'
    const skip = (page - 1) * limit

    let videos;

    if (sort === "recommended") {
      videos = await prisma.video.findMany({
        skip,
        take: limit,
        orderBy: [
          {
            totalViews: 'desc'
          },
          {
            totalWatchTime: 'desc'
          },
          {
            createdAt: 'desc'
          }
        ],
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });
    } else {
      videos = await prisma.video.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });
    }

    // logging to verify the order
    console.log("Returning videos in order:", videos.map(v => ({
      title: v.title,
      totalViews: v.totalViews,
      totalWatchTime: v.totalWatchTime
    })));

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Error fetching videos' },
      { status: 500 }
    )
  }
}