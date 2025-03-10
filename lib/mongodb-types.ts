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