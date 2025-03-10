import { MongoClient, Db } from 'mongodb';
import { buildConnectionUri } from './mongodb';

interface ConnectionInfo {
    client: MongoClient;
    lastAccessed: number;
}

class MongoDBConnectionManager {
    private static instance: MongoDBConnectionManager;
    private connections: Map<string, ConnectionInfo>;
    private readonly TIMEOUT = 3600000; // 1 hour in milliseconds

    private constructor() {
        this.connections = new Map();
        this.startCleanupInterval();
    }

    public static getInstance(): MongoDBConnectionManager {
        if (!MongoDBConnectionManager.instance) {
            MongoDBConnectionManager.instance = new MongoDBConnectionManager();
        }
        return MongoDBConnectionManager.instance;
    }

    private startCleanupInterval() {
        setInterval(() => {
            this.cleanupInactiveConnections();
        }, 300000); // Check every 5 minutes
    }

    private async cleanupInactiveConnections() {
        const now = Date.now();
        for (const [connectionId, info] of this.connections.entries()) {
            if (now - info.lastAccessed > this.TIMEOUT) {
                await info.client.close();
                this.connections.delete(connectionId);
            }
        }
    }

    public async getConnection(connectionId: string, uri: string): Promise<MongoClient> {
        const existingConnection = this.connections.get(connectionId);

        if (existingConnection) {
            existingConnection.lastAccessed = Date.now();
            return existingConnection.client;
        }

        const client = new MongoClient(uri, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
        });

        await client.connect();

        this.connections.set(connectionId, {
            client,
            lastAccessed: Date.now(),
        });

        return client;
    }

    public async closeConnection(connectionId: string): Promise<void> {
        const connection = this.connections.get(connectionId);
        if (connection) {
            await connection.client.close();
            this.connections.delete(connectionId);
        }
    }

    public async closeAllConnections(): Promise<void> {
        for (const [connectionId, connection] of this.connections.entries()) {
            await connection.client.close();
            this.connections.delete(connectionId);
        }
    }
}

export const connectionManager = MongoDBConnectionManager.getInstance();