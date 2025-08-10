import react,{useState,useEffect,useCallback} from 'react'
import { getCldImageUrl,getCldVideoUrl } from 'next-cloudinary'

import {Download,Clock,FileDown,FileUp} from 'lucide-react'

import dayjs from 'dayjs'

import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import {Video} from '@prisma/client'

import {filesize} from 'filesize'


interface VideoCardProps {
    video:Video;
    onDownload:(url:string,title:string) => void;
}


const VideoCard:react.FC<VideoCardProps> = ({video,onDownload}) => {
        const [isHovered, setIsHovered] = useState(false);
        const [previewError, setPreviewError] = useState(false);
        
    return (
     <div>

      </div>
    );
}
