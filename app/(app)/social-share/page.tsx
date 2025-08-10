"use client"

import React,{useState,useEffect,useRef} from 'react'
import {CldImage} from 'next-cloudinary'

const socialFormats={
    "Instagram square (1:1)":{
        width:1080,
        height:1080,
        aspectRatio:"1:1",
    },
    "Instagram Portrait (4:5)":{
        width:1080,
        height:1350,
        aspectRatio:"4:5",
    },
   "Twitter Post (16:9)":{
        width:1080,
        height:1920,
        aspectRatio:"16:9",
    },
    "Twiiter Header (3:1)":{
        width:1080,
        height:360,
        aspectRatio:"3:1",
    },
    "Facebook Cover(205:78)":{
        width:1080,
        height:360,
        aspectRatio:"3:1",
    }
    
}

type socialFormats=keyof typeof socialFormats


export default function SocialShare() {

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<socialFormats>("Instagram square (1:1)");
    const [isUploading, setIsUploading] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if(uploadedImage){
            setIsTransforming(true);
        }
    },[uploadedImage,selectedFormat]);

    const handleFileUpload=async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file=event.target.files?.[0]
        if(!file){
            return
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try{
            const response = await fetch("/api/image-upload", {
                method: "POST",
                body: formData,
            });
            if(!response.ok){
                throw new Error("Failed to upload image");
            }
            const data = await response.json();
            setUploadedImage(data.public_id);
        }
        catch{
              console.log("Failed to upload image");
              alert("Failed to upload image");
        }
        finally{
            setIsUploading(false);
        }
    }

    const handleDownload=async()=>{
        if(!imageRef.current){
            return;
        }

      fetch(imageRef.current.src)
        .then((response)=>response.blob())
        .then(blob=>{
            const url= window.URL.createObjectURL(blob)
            const link=document.createElement("a")
            link.href=url
            link.download=`${selectedFormat.replace(/\s+/g, "_").toLowerCase()}.png`
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            document.body.removeChild(link)

        })
    }
    return (
       <div className='container mx-auto p-4 max-w-4xl'>
        <h1 className='text-2xl font-bold mb-4'>Social Media Image Generator</h1>
    <div className='card'>
        <div className='card-body'>
            <h2 className='card-title'>Upload Image</h2>
            <div className='form-control w-full max-w-xs'>
                <label className='label'>
                    <span className='label-text'>Select Image</span>
                </label>
                <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileUpload}
                    className='file-input file-input-bordered w-full max-w-xs'
                />
            </div>

            {isUploading && (
                <div className="mt-4">
                    <progress className="progress w-full"></progress>
                </div>
            )}

            {uploadedImage && (
                <div className='mt-4'>
                    <h2 className='card-title'>Select Format</h2>
                    <div className='form-control w-full max-w-xs'>
                        <select
                            className='select select-bordered'
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value as socialFormats)}
                        >
                            {Object.keys(socialFormats).map((format) => (
                                <option key={format} value={format}>
                                    {format}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 relative">
                        <h3 className='text-lg font-semibold mb-2'>
                         Preview
                        </h3>
                       <div className="flex justify-center">
                        {
                            isTransforming && (
                                <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900'></div>
                            )

                        }

                        <CldImage
                            width={socialFormats[selectedFormat].width}
                            height={socialFormats[selectedFormat].height}
                            src={uploadedImage}
                            alt="transformed image"
                            crop="fill"
                            aspectRatio={socialFormats[selectedFormat].aspectRatio}
                            gravity='auto'
                            className="w-full"
                            ref={imageRef}
                            onLoad={() => setIsTransforming(false)}
                    ></CldImage>
                              <button
                            onClick={handleDownload}
                             className="btn btn-primary"
                               disabled={isTransforming}
                                                     >
                                  Download Image
                                         </button>


                       </div>

                    </div>
                </div>
            )}

          

        
            </div>
           </div>
       </div>
  )
}
