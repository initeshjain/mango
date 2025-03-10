import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/login-button';
import { Database, Github } from 'lucide-react';
import { getServerSession } from 'next-auth/next';

export const metadata: Metadata = {
  title: 'MongoDB Explorer - Home',
  description: 'Explore and manage your MongoDB databases',
};

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-primary" />
              <span className="font-bold">MongoDB On The Go</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session && (
              <Button variant="outline" asChild className="mr-2">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
            <LoginButton />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Explore your MongoDB databases with ease
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Connect to your MongoDB instances, explore collections, and view documents in a beautiful, intuitive interface.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              {session ? (
                <Button size="lg" asChild className="gap-1">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <LoginButton asChild>
                  <Button size="lg" className="gap-1">
                    Get Started
                  </Button>
                </LoginButton>
              )}
              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <Link href="https://github.com" target="_blank" rel="noreferrer" className="gap-1">
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="container space-y-6 py-8 md:py-12 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[58rem] gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Multiple Connections</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect to multiple MongoDB instances and switch between them easily.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M20 7h-3a2 2 0 0 0-2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.69.9H18a2 2 0 0 1 2 2v1Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Collection Explorer</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse and search through your collections with an intuitive interface.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">JSON Viewer</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                View and explore your documents with a beautiful JSON viewer.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js, Tailwind CSS, and shadcn/ui.
          </p>
        </div>
      </footer>
    </div>
  );
}