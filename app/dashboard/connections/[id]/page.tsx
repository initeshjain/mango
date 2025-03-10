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
import { MongoDBDatabase } from "@/lib/mongodb-types";
import { useToast } from "@/hooks/use-toast";

export default function ConnectionPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [connection, setConnection] = useState<any>(null);
  const [databases, setDatabases] = useState<MongoDBDatabase[]>([]);
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
        console.log(connectionRes)
        if (!connectionRes.ok) throw new Error("Failed to fetch connection");
        const connectionData = await connectionRes.json();
        setConnection(connectionData);

        // Fetch databases
        const databasesRes = await fetch(`/api/connections/${params.id}/databases`);
        if (!databasesRes.ok) throw new Error("Failed to fetch databases");
        const databasesData = await databasesRes.json();
        setDatabases(databasesData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch database information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [params.id, session, toast]);

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
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{connection?.name}</h1>
        </div>

        <div className="mt-8">
          {databases.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Databases</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {databases.map((database) => (
                  <Card key={database.name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{database.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Size on Disk</p>
                        <p className="font-medium">{(database.sizeOnDisk / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={`/dashboard/connections/${params.id}/${database.name}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Explore
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No databases found"
              description="No databases were found in this MongoDB instance, or you don't have permission to view them."
              action={
                <Button asChild>
                  <Link href="/dashboard">
                    <Database className="mr-2 h-4 w-4" />
                    Back to Connections
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