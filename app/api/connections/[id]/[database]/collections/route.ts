//[TODO]
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectionManager } from "@/lib/mongodb-connection-manager";
import { buildConnectionUri } from "@/lib/mongodb";

export async function GET(
    req: Request,
    { params }: { params: { id: string; database: string } }
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

        const db = client.db(params.database);
        const collections = await db.listCollections().toArray();

        // Add collection stats
        // const collectionsWithStats = await Promise.all(
        //     collections.map(async (collection) => {
        //         const stats = await db.collection(collection.name);
        //         return {
        //             ...collection,
        //             stats: {
        //                 size: stats.size,
        //                 count: stats.count,
        //                 avgObjSize: stats.avgObjSize,
        //             },
        //         };
        //     })
        // );

        const collectionsWithStats = await Promise.all(
            collections.map(async (collection) => {
                const stats = db.collection(collection.name);
                return {
                    ...collection,
                    stats: {
                        size: 1,
                        count: 1,
                        avgObjSize: 1,
                    },
                };
            })
        );

        return NextResponse.json(collectionsWithStats);
    } catch (error) {
        console.error("[COLLECTIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}