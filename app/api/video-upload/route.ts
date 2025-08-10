import { v2 as cloudinary } from 'cloudinary';
import { NextResponse, NextRequest } from 'next/server';

import {auth} from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma';


const prisma = new PrismaClient();

    // Configuration
    cloudinary.config({ 
        cloud_name:process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME , 
        api_key:process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    interface CloudinaryUploadResult{
        public_id:string,
        bytes:number,
        duration?:number,
        [key:string]:any
    }

      export async function POST(request:NextRequest) {
       
        try{
               const { userId } = await auth();
        
            if(!userId){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
                     }
             if(
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ){
            return NextResponse.json({ error: "Missing Cloudinary credentials" }, { status: 500 });
        }
        

            const formData = await request.formData();
            const file = formData.get('file') as File | null;
            const title=formData.get('title') as string;
            const description=formData.get('description') as string;
            const originalSize=formData.get('originalSize') as string;

            if(!file){
                return NextResponse.json({ error: "No file uploaded" }, { status: 400 });   
            }
             const bytes=await file.arrayBuffer();
             const buffer=Buffer.from(bytes);
             const result=  await new Promise<CloudinaryUploadResult>((resolve,reject)=>{
                const uploadStream=cloudinary.uploader.upload_stream(
                    {
                        resource_type:'video',
                        folder:'video-uploads',
                        transformations: [
                            {
                                quality:"auto",
                                fetch_format:"mp4",
                            }
                        ]
                    },
                    (error,result)=>{
                    if(error){
                        reject(error);
                    }
                    else{
                        resolve(result as CloudinaryUploadResult);
                    }
                });
                // uploadStream.write(buffer);
                uploadStream.end(buffer);
             })
            const video=await prisma.video.create({
                data:{
                    title,
                    description,
                    publicId:result.public_id,
                    originalSize:originalSize,
                    compressedSize:String(result.bytes),
                    duration:result.duration||0,
                    
                    
                }
            })
             return NextResponse.json(
      {
        message: 'Video uploaded successfully',
        video,
      },
      { status: 200 }
    );
  
        }
        catch(e:any){
            console.log("Video upload failed",e);
            return NextResponse.json({ error:"video upload failed" }, { status: 500 });
        }
        finally{
            await prisma.$disconnect();
        }
      }
