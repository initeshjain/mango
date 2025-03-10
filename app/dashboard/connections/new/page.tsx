import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { ConnectionForm } from "@/components/connection-form";

export const metadata: Metadata = {
  title: "New Connection - MongoDB Explorer",
  description: "Create a new MongoDB connection",
};

export default async function NewConnectionPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* <DashboardHeader /> */}
      <main className="flex-1 container py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-6">New Connection</h1>
          <ConnectionForm />
        </div>
      </main>
    </div>
  );
}