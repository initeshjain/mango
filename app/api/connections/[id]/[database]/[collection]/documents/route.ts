import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectionManager } from "@/lib/mongodb-connection-manager";
import { buildConnectionUri } from "@/lib/mongodb";

export async function GET(
    req: Request,
    { params }: { params: { id: string; database: string; collection: string } }
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
        const collection = db.collection(params.collection);

        console.log("Collection: ", collection);

        // Get URL parameters
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get("limit") || "50", 10);
        const skip = parseInt(url.searchParams.get("skip") || "0", 10);
        const query = url.searchParams.get("query") || "{}";

        // Parse the query string into a MongoDB query object
        let parsedQuery = {};
        try {
            parsedQuery = JSON.parse(query);
        } catch (error) {
            return new NextResponse("Invalid query parameter", { status: 400 });
        }

        console.log("parsedQuery", parsedQuery);
        const documents = await collection
            .find(parsedQuery)
            .skip(skip)
            .limit(limit)
            .toArray();

        console.log(documents);

        const total = documents.length;

        return NextResponse.json({
            documents,
            total,
            limit,
            skip,
        });
    } catch (error) {
        console.error("[DOCUMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}