import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const data = await req.json();

        const connection = await prisma.connection.create({
            data: {
                ...data,
                userId: session.user.id,
            },
        });

        return NextResponse.json(connection);
    } catch (error) {
        console.error("[CONNECTIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const connections = await prisma.connection.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Remove sensitive information
        const safeConnections = connections.map(conn => ({
            id: conn.id,
            name: conn.name,
            hostname: conn.hostname,
            port: conn.port,
            database: conn.database,
            createdAt: conn.createdAt,
            updatedAt: conn.updatedAt,
        }));

        return NextResponse.json(safeConnections);
    } catch (error) {
        console.error("[CONNECTIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}