import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const clients: Map<string, MongoClient> = new Map();

export async function connectToMongoDB(uri: string): Promise<MongoClient> {
    if (!clients.has(uri)) {
        const options: MongoClientOptions = {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
        };

        const client = new MongoClient(uri, options);
        await client.connect();
        clients.set(uri, client);
    }

    return clients.get(uri)!;
}

export async function getDatabases(uri: string) {
    try {
        const client = await connectToMongoDB(uri);
        const admin = client.db().admin();
        const { databases } = await admin.listDatabases();

        // Filter out system databases if needed
        return databases.filter((db: any) => !db.name.startsWith('system.'));
    } catch (error) {
        console.error('Error listing databases:', error);
        throw error;
    }
}

export async function getCollections(uri: string, dbName: string) {
    try {
        const client = await connectToMongoDB(uri);
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();

        // Add additional collection stats
        const collectionsWithStats = await Promise.all(
            collections.map(async (collection) => {
                const stats = await db.collection(collection.name).stats();
                return {
                    ...collection,
                    count: stats.count,
                    size: stats.size,
                    avgObjSize: stats.avgObjSize,
                };
            })
        );

        return collectionsWithStats;
    } catch (error) {
        console.error('Error listing collections:', error);
        throw error;
    }
}

export async function getDocuments(uri: string, dbName: string, collectionName: string, limit = 20) {
    try {
        const client = await connectToMongoDB(uri);
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const documents = await collection
            .find()
            .limit(limit)
            .toArray();

        return documents;
    } catch (error) {
        console.error('Error fetching documents:', error);
        throw error;
    }
}

// Cleanup function to close all connections
export async function closeAllConnections() {
    for (const client of clients.values()) {
        await client.close();
    }
    clients.clear();
}

// Helper function to build connection URI
export function buildConnectionUri(connection: {
    uri?: string;
    hostname?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
}): string {
    if (connection.uri) {
        return connection.uri;
    }

    const auth = connection.username && connection.password
        ? `${encodeURIComponent(connection.username)}:${encodeURIComponent(connection.password)}@`
        : '';

    const host = `${connection.hostname}:${connection.port}`;
    const database = connection.database ? `/${connection.database}` : '';

    return `mongodb://${auth}${host}${database}`;
}