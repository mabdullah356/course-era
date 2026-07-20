import { NextRequest ,NextResponse } from "next/server";
export async function GET(req: NextRequest, { params }: { params: { id: string } }){
    
    try{
        if(!params.id){
            return new NextResponse(JSON.stringify({message: "Course ID is required"}), {status: 400})
        }

        const course  = await prisma.course.findUnique({
            where: {
                id: params.id
            }
        });

        if(!course){
            return new NextResponse(JSON.stringify({message: "Course not found"}), {status: 404})
        };

        return new NextResponse(JSON.stringify(course), {status: 200})

    }catch(err){
        console.error(err)
        return new NextResponse(JSON.stringify({message: "Internal Server Error"}), {status: 500})
    }
}