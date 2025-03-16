import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/mongodb-types";

export const metadata: Metadata = {
    title: "Pricing - MongoDB Explorer",
    description: "Choose the right plan for your MongoDB exploration needs",
};

export default async function PricingPage() {
    const session = await getServerSession();

    return (
        <div className="flex min-h-screen flex-col">
            <DashboardHeader />
            <main className="flex-1">
                <section className="container py-12 md:py-24 lg:py-32">
                    <div className="mx-auto max-w-[58rem] text-center">
                        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
                            Simple, transparent pricing
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                            Choose the plan that best fits your needs. All plans include core features.
                        </p>
                    </div>

                    <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
                        {(Object.keys(SUBSCRIPTION_PLANS) as Array<keyof typeof SUBSCRIPTION_PLANS>).map((plan) => {
                            const planDetails = SUBSCRIPTION_PLANS[plan];

                            return (
                                <Card key={plan} className="relative flex flex-col">
                                    {plan === 'PRO' && (
                                        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                                            Popular
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle>{planDetails.name}</CardTitle>
                                        <CardDescription>
                                            {planDetails.price === 0 ? (
                                                "Free forever"
                                            ) : (
                                                <div className="flex items-baseline">
                                                    <span className="text-3xl font-bold">${planDetails.price}</span>
                                                    <span className="text-muted-foreground">/month</span>
                                                </div>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-2">
                                            {planDetails.features.map((feature, i) => (
                                                <li key={i} className="flex items-center">
                                                    <Check className="h-4 w-4 text-primary mr-2" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            variant={plan === 'PRO' ? 'default' : 'outline'}
                                            asChild
                                        >
                                            <Link href={session ? "/dashboard/subscription" : "/auth/signin"}>
                                                {session ? "Subscribe" : "Get Started"}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mx-auto mt-12 max-w-[58rem] text-center">
                        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                        <dl className="mt-8 grid gap-8 text-left [&>div]:space-y-2">
                            <div>
                                <dt className="text-lg font-semibold">Can I switch plans later?</dt>
                                <dd className="text-muted-foreground">
                                    Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                                </dd>
                            </div>
                            <div>
                                <dt className="text-lg font-semibold">What payment methods do you accept?</dt>
                                <dd className="text-muted-foreground">
                                    We accept all major credit cards through our secure payment processor, Razorpay.
                                </dd>
                            </div>
                            <div>
                                <dt className="text-lg font-semibold">Is there a free trial?</dt>
                                <dd className="text-muted-foreground">
                                    Our Free plan is available indefinitely with basic features. You can upgrade to Pro or Premium anytime.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>
            </main>
        </div>
    );
}