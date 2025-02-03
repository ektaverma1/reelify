import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await context.params;
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { watchTime } = await req.json();
    if (typeof watchTime !== "number" || watchTime < 0) {
      return NextResponse.json(
        { error: "Invalid watch time provided" },
        { status: 400 }
      );
    }

    // Upsert watch history record
    const watchHistory = await prisma.watchHistory.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId
        },
      },
      update: {
        watchTime: watchTime,
        lastWatched: new Date(),
        viewCount: { increment: 1 },
      },
      create: {
        userId,
        videoId,
        watchTime: watchTime,
        lastWatched: new Date(),
        viewCount: 1,
      },
    });

    // Update video statistics
    await prisma.video.update({
      where: { id: videoId },
      data: {
        totalViews: { increment: 1 },
        totalWatchTime: { increment: watchTime },
      },
    });

    return NextResponse.json(watchHistory);
  } catch (error) {
    console.error("Error updating watch history:", error);
    return NextResponse.json(
      { error: "Failed to update watch history" },
      { status: 500 }
    );
  }
}