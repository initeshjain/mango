"use client";

import { useState } from "react";
import { MongoDBDocument } from "@/lib/mongodb-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { JsonViewer } from "@/components/ui/json-viewer";

interface DocumentViewerProps {
  documents: MongoDBDocument[];
  collectionName: string;
}

export function DocumentViewer({ documents, collectionName }: DocumentViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<MongoDBDocument | null>(null);
  
  const filteredDocuments = documents.filter(doc => {
    if (!searchTerm) return true;
    return JSON.stringify(doc).toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted p-2 border-b">
            <h3 className="font-medium">Documents ({filteredDocuments.length})</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div
                  key={doc._id.toString()}
                  className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedDocument?._id === doc._id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="font-mono text-sm truncate">
                    {doc._id.toString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {Object.keys(doc)
                      .filter(key => key !== "_id")
                      .slice(0, 3)
                      .map(key => `${key}: ${JSON.stringify(doc[key]).substring(0, 15)}...`)
                      .join(", ")}
                    {Object.keys(doc).length > 4 ? " ..." : ""}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No documents found
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Document Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDocument ? (
              <JsonViewer data={selectedDocument} rootName="document" expandLevel={2} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No document selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a document from the list to view its contents in detail
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}