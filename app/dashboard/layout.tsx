import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-4 md:px-6 lg:px-8">
            <DashboardHeader />
            <main className="flex-1 container py-4">{children}</main>
        </div>
    );
}
