"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { DocumentViewer } from "@/components/document-viewer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MongoDBDocument } from "@/lib/mongodb-types";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

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
        {/* <DashboardHeader /> */}
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
      {/* <DashboardHeader /> */}
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

        <div className="mt-8">
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
        </div>
      </main>
    </div>
  );
}