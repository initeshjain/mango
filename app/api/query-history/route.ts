import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const history = await prisma.queryHistory.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error("[QUERY_HISTORY_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();

        const history = await prisma.queryHistory.create({
            data: {
                ...body,
                userId: session.user.id,
            },
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error("[QUERY_HISTORY_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await prisma.queryHistory.deleteMany({
            where: {
                userId: session.user.id,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[QUERY_HISTORY_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}