import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectionManager } from "@/lib/mongodb-connection-manager";
import { buildConnectionUri } from "@/lib/mongodb";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const connection = await prisma.connection.findUnique({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!connection) {
            return new NextResponse("Connection not found", { status: 404 });
        }

        // Test the connection
        try {
            const uri = buildConnectionUri(connection);
            const client = await connectionManager.getConnection(connection.id, uri);
            await client.db().admin().ping();
        } catch (error) {
            console.error("[CONNECTION_TEST]", error);
            return new NextResponse("Failed to connect to MongoDB", { status: 502 });
        }

        // Don't send sensitive information to the client
        const safeConnection = {
            id: connection.id,
            name: connection.name,
            hostname: connection.hostname,
            port: connection.port,
            database: connection.database,
            createdAt: connection.createdAt,
            updatedAt: connection.updatedAt,
        };

        return NextResponse.json(safeConnection);
    } catch (error) {
        console.error("[CONNECTION_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Close MongoDB connection if it exists
        await connectionManager.closeConnection(params.id);

        const connection = await prisma.connection.delete({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        return NextResponse.json(connection);
    } catch (error) {
        console.error("[CONNECTION_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();

        // Close existing connection as we're updating the details
        await connectionManager.closeConnection(params.id);

        const connection = await prisma.connection.update({
            where: {
                id: params.id,
                userId: session.user.id,
            },
            data: body,
        });

        return NextResponse.json(connection);
    } catch (error) {
        console.error("[CONNECTION_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}