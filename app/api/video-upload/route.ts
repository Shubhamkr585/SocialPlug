// app/api/video-upload/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';

// Fix global typing for Prisma in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) {
  globalThis.__prisma = prisma;
}

// Cloudinary config (server-side)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  secure_url?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Missing Cloudinary credentials' }, { status: 500 });
    }

    const formData = await request.formData();

    const fileEntry = formData.get('file');
    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const title = typeof formData.get('title') === 'string' ? (formData.get('title') as string) : '';
    const description = typeof formData.get('description') === 'string' ? (formData.get('description') as string) : '';
    const originalSize = typeof formData.get('originalSize') === 'string' ? (formData.get('originalSize') as string) : '';

    const bytes = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'video-uploads',
          transformation: [{ quality: 'auto' }, { fetch_format: 'mp4' }],
        },
        (error, res) => {
          if (error) {
            reject(error);
          } else {
            resolve(res as CloudinaryUploadResult);
          }
        }
      );
      uploadStream.end(buffer);
    });

    const publicId = result.public_id;
    const bytesNum = result.bytes ?? 0;
    const durationNum = result.duration ?? 0;

    if (!publicId) {
      return NextResponse.json({ error: 'Upload succeeded but response missing public_id' }, { status: 500 });
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId,
        originalSize,
        compressedSize: String(bytesNum),
        duration: durationNum,
      },
    });

    return NextResponse.json({ message: 'Video uploaded successfully', video }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Video upload failed', message);
    return NextResponse.json({ error: message || 'video upload failed' }, { status: 500 });
  }
}
