import { auth } from '@clerk/nextjs/server';
import VideoUpload from '../components/VideoUpload';
import VideoFeed from '../components/VideoFeed';

export default async function VideosPage() {
  const { userId } = await auth();

  return (
    <div className="container mx-auto px-4">
      <div className="py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Videos</h1>

        {userId && (
          <div className="mb-8">
            <VideoUpload />
          </div>
        )}
        
        <VideoFeed />
      </div>
    </div>
  );
}