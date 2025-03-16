import { ObjectId } from "mongodb";

export interface MongoDBConnection {
  id: string;
  userId: string;
  name: string;
  uri?: string;
  hostname?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  canDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoDBDatabase {
  name: string;
  sizeOnDisk?: number;
  empty?: boolean;
}

export interface MongoDBCollection {
  name: string;
  type?: string;
  options?: Record<string, any>;
  info?: {
    readOnly?: boolean;
    uuid?: ObjectId;
  };
}

export interface MongoDBDocument {
  _id: string | ObjectId;
  [key: string]: any;
}

export interface ConnectionFormData {
  name: string;
  connectionType: "uri" | "credentials";
  uri?: string;
  hostname?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  collection: string;
  database: string;
  connectionId: string;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: Date;
  endDate?: Date;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
}

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    maxConnections: 1,
    features: [
      'One MongoDB connection',
      'Basic query interface',
      'View and explore collections',
      'Cannot delete connection',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 2.99,
    maxConnections: 5,
    features: [
      'Up to 5 MongoDB connections',
      'Advanced query interface',
      'Document editing',
      'Query history',
      'Delete connections',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 6.99,
    maxConnections: Infinity,
    features: [
      'Unlimited MongoDB connections',
      'All Pro features',
      'Priority support',
      'No restrictions',
    ],
  },
} as const;