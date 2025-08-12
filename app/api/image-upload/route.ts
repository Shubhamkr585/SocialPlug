// app/api/image-upload/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url?: string;
  // avoid `any` — allow unknown extra fields
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'nextjs-cloudinary-uploads' },
        (error: unknown, res: unknown) => {
          if (error) {
            reject(error);
          } else {
            // narrow the response to our typed shape
            resolve(res as CloudinaryUploadResult);
          }
        }
      );

      // send buffer
      uploadStream.end(buffer);
    });

    return NextResponse.json(
      {
        publicId: result.public_id,
        url: typeof result.secure_url === 'string' ? result.secure_url : undefined,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    // safe extraction of message from unknown
    const message = err instanceof Error ? err.message : String(err);
    console.error('image-upload error:', message);
    return NextResponse.json({ error: message || 'Unknown error' }, { status: 500 });
  }
}
