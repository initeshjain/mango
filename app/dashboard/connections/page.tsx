import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { ConnectionsList } from "@/components/connections-list";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Connections - MongoDB Explorer",
  description: "Manage your MongoDB connections",
};

export default async function ConnectionsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  // In a real app, we would fetch connections from the database
  const connections: any[] = [];

  return (
    <div className="flex min-h-screen flex-col">
      {/* <DashboardHeader /> */}
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
          <Button asChild>
            <Link href="/dashboard/connections/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Connection
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          {connections.length > 0 ? (
            <ConnectionsList connections={connections} />
          ) : (
            <EmptyState
              title="No connections"
              description="You don't have any MongoDB connections yet. Create one to get started."
              action={
                <Button asChild>
                  <Link href="/dashboard/connections/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Connection
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