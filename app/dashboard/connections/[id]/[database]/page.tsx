"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database, ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { MongoDBCollection } from "@/lib/mongodb-types";
import { useToast } from "@/hooks/use-toast";

export default function DatabasePage({
  params,
}: {
  params: { id: string; database: string };
}) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [connection, setConnection] = useState<any>(null);
  const [collections, setCollections] = useState<MongoDBCollection[]>([]);
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

        // Fetch collections
        const collectionsRes = await fetch(`/api/connections/${params.id}/${params.database}/collections`);
        if (!collectionsRes.ok) throw new Error("Failed to fetch collections");
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch collection information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [params.id, params.database, session, toast]);

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
            <Link href={`/dashboard/connections/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{params.database}</h1>
            <p className="text-muted-foreground">
              Connection: {connection?.name}
            </p>
          </div>
        </div>

        <div className="mt-8">
          {collections.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Collections</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                  <Card key={collection.name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">{collection.type || "Collection"}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={`/dashboard/connections/${params.id}/${params.database}/${collection.name}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Documents
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No collections found"
              description="No collections were found in this database, or you don't have permission to view them."
              action={
                <Button asChild>
                  <Link href={`/dashboard/connections/${params.id}`}>
                    <Database className="mr-2 h-4 w-4" />
                    Back to Databases
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