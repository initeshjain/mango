"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { DocumentViewer } from "@/components/document-viewer";
import Link from "next/link";
import { ArrowLeft, Play, Code2, History, Trash2 } from "lucide-react";
import { MongoDBDocument, QueryHistoryItem } from "@/lib/mongodb-types";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@monaco-editor/react";
import JSON5 from 'json5';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const defaultQuery = `{
  // Write your MongoDB query here
  // Example: { "field": "value" }
}`;

export default function CollectionPage({
  params,
}: {
  params: { id: string; database: string; collection: string };
}) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [connection, setConnection] = useState<any>(null);
  const [documents, setDocuments] = useState<MongoDBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryLoading, setQueryLoading] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [selectedTab, setSelectedTab] = useState("documents");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  const validateQuery = (queryStr: string): boolean => {
    try {
      const parsed = JSON5.parse(queryStr);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Query must be a valid object');
      }
      setQueryError(null);
      return true;
    } catch (error) {
      setQueryError(error instanceof Error ? error.message : 'Invalid query syntax');
      return false;
    }
  };

  const executeQuery = async () => {
    if (!validateQuery(query)) return;

    setQueryLoading(true);
    try {
      const queryObj = JSON5.parse(query);
      const queryParams = new URLSearchParams({
        query: JSON.stringify(queryObj),
      });

      const documentsRes = await fetch(
        `/api/connections/${params.id}/${params.database}/${params.collection}/documents?${queryParams}`
      );

      if (!documentsRes.ok) throw new Error("Failed to execute query");

      const documentsData = await documentsRes.json();
      setDocuments(documentsData.documents);

      // Save query to history
      await fetch("/api/query-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          collection: params.collection,
          database: params.database,
          connectionId: params.id,
        }),
      });

      // Refresh query history
      fetchQueryHistory();

      toast({
        title: "Query executed successfully",
        description: `Found ${documentsData.total} documents`,
      });
    } catch (error) {
      toast({
        title: "Query failed",
        description: error instanceof Error ? error.message : "Failed to execute query",
        variant: "destructive",
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const fetchQueryHistory = async () => {
    try {
      const res = await fetch("/api/query-history");
      if (!res.ok) throw new Error("Failed to fetch query history");
      const history = await res.json();
      setQueryHistory(history);
    } catch (error) {
      console.error("Failed to fetch query history:", error);
    }
  };

  const clearQueryHistory = async () => {
    try {
      await fetch("/api/query-history", { method: "DELETE" });
      setQueryHistory([]);
      toast({
        title: "Query history cleared",
        description: "Successfully cleared all query history",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear query history",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch connection details
        const connectionRes = await fetch(`/api/connections/${params.id}`);
        if (!connectionRes.ok) throw new Error("Failed to fetch connection");
        const connectionData = await connectionRes.json();
        setConnection(connectionData);

        // Fetch documents
        const documentsRes = await fetch(
          `/api/connections/${params.id}/${params.database}/${params.collection}/documents`
        );
        if (!documentsRes.ok) throw new Error("Failed to fetch documents");
        const documentsData = await documentsRes.json();
        setDocuments(documentsData.documents);

        // Fetch query history
        await fetchQueryHistory();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [params.id, params.database, params.collection, session, toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-6">
          <div className="flex items-center justify-center h-[450px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild className="mr-4">
            <Link href={`/dashboard/connections/${params.id}/${params.database}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{params.collection}</h1>
            <p className="text-muted-foreground">
              Database: {params.database} | Connection: {connection?.name}
            </p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            {documents.length > 0 ? (
              <DocumentViewer documents={documents} collectionName={params.collection} />
            ) : (
              <EmptyState
                title="No documents found"
                description="No documents were found in this collection, or you don't have permission to view them."
                action={
                  <Button asChild>
                    <Link href={`/dashboard/connections/${params.id}/${params.database}`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Collections
                    </Link>
                  </Button>
                }
              />
            )}
          </TabsContent>

          <TabsContent value="query" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Code2 className="h-5 w-5 mr-2" />
                    Query Editor
                  </div>
                  <Button
                    onClick={executeQuery}
                    disabled={queryLoading}
                    className="ml-auto"
                  >
                    {queryLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Execute Query
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="min-h-[300px] border rounded-md overflow-hidden">
                    <Editor
                      height="300px"
                      defaultLanguage="json"
                      value={query}
                      onChange={(value) => value && setQuery(value)}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                  {queryError && (
                    <div className="text-sm text-destructive">
                      Error: {queryError}
                    </div>
                  )}
                  {documents.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Query Results</h3>
                      <DocumentViewer
                        documents={documents}
                        collectionName={params.collection}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Query History
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearQueryHistory}
                    className="ml-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {queryHistory.length > 0 ? (
                    <div className="space-y-4">
                      {queryHistory.map((item) => (
                        <Card key={item.id} className="cursor-pointer hover:bg-muted/50">
                          <CardHeader className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="font-mono text-sm truncate flex-1 mr-4">
                                {item.query}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {item.database} / {item.collection}
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No query history available
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}