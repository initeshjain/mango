import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectionManager } from "@/lib/mongodb-connection-manager";
import { buildConnectionUri } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
        // const uri = buildConnectionUri({ ...connection, uri: connection.uri ?? undefined });

        const client = await connectionManager.getConnection(connection.id, uri);

        const db = client.db(params.database);
        const collection = db.collection(params.collection);

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

        const documents = await collection
            .find(parsedQuery)
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await collection.countDocuments(parsedQuery);

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

export async function PATCH(
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

        const { documentId, update } = await req.json();

        if (!documentId || !update) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const uri = buildConnectionUri(connection);
        const client = await connectionManager.getConnection(connection.id, uri);

        const db = client.db(params.database);
        const collection = db.collection(params.collection);

        const result = await collection.updateOne(
            { _id: new ObjectId(documentId) },
            { $set: update }
        );

        if (result.matchedCount === 0) {
            return new NextResponse("Document not found", { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DOCUMENTS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
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

        const { documentId } = await req.json();

        if (!documentId) {
            return new NextResponse("Missing document ID", { status: 400 });
        }

        const uri = buildConnectionUri(connection);
        const client = await connectionManager.getConnection(connection.id, uri);

        const db = client.db(params.database);
        const collection = db.collection(params.collection);

        const result = await collection.deleteOne({ _id: new ObjectId(documentId) });

        if (result.deletedCount === 0) {
            return new NextResponse("Document not found", { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DOCUMENTS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}