import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";


const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try{
        const videos = await prisma.video.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(videos);
    }
    catch (e: any) {
        console.log(e);
        return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
    }
    finally{
        await prisma.$disconnect();
    }
}