import { put } from '@vercel/blob';

interface UploadResponse {
  url: string;
}

export async function uploadVideo(file: Blob | File, filename: string): Promise<string> {
  try {
    const { url }: UploadResponse = await put(filename, file, {
      access: 'public',
    });
    return url;
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error('Failed to upload video');
  }
}