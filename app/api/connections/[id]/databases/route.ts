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

        const uri = buildConnectionUri(connection);
        const client = await connectionManager.getConnection(connection.id, uri);

        const admin = client.db().admin();
        const { databases } = await admin.listDatabases();

        // Filter out system databases
        const userDatabases = databases.filter((db: any) =>
            !db.name.startsWith('system.') &&
            !['admin', 'local', 'config'].includes(db.name)
        );

        return NextResponse.json(userDatabases);
    } catch (error) {
        console.error("[DATABASES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}