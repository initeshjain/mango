"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { SUBSCRIPTION_PLANS, Subscription } from "@/lib/mongodb-types";
import { useToast } from "@/hooks/use-toast";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function SubscriptionPage() {
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/auth/signin");
        }
    }, [status]);

    useEffect(() => {
        const loadRazorpay = () => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
        };
        loadRazorpay();
    }, []);

    const handleSubscribe = async (plan: keyof typeof SUBSCRIPTION_PLANS) => {
        try {
            setSubscribing(true);
            const res = await fetch("/api/razorpay/create-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });

            if (!res.ok) throw new Error("Failed to create subscription");

            const { subscriptionId, keyId } = await res.json();

            const options = {
                key: keyId,
                subscription_id: subscriptionId,
                name: "MongoDB Explorer",
                description: `${SUBSCRIPTION_PLANS[plan].name} Plan Subscription`,
                handler: function () {
                    toast({
                        title: "Subscription successful",
                        description: `You are now subscribed to the ${SUBSCRIPTION_PLANS[plan].name} plan`,
                    });
                    // Refresh the page to update subscription status
                    window.location.reload();
                },
                prefill: {
                    name: session?.user?.name,
                    email: session?.user?.email,
                },
                theme: {
                    color: "#10B981",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create subscription",
                variant: "destructive",
            });
        } finally {
            setSubscribing(false);
        }
    };

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
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl font-bold tracking-tight mb-6">Subscription Plans</h1>
                    <div className="grid gap-6 md:grid-cols-3">
                        {(Object.keys(SUBSCRIPTION_PLANS) as Array<keyof typeof SUBSCRIPTION_PLANS>).map((plan) => {
                            const planDetails = SUBSCRIPTION_PLANS[plan];
                            const isCurrentPlan = subscription?.plan === plan;

                            return (
                                <Card key={plan} className={isCurrentPlan ? "border-primary" : undefined}>
                                    <CardHeader>
                                        <CardTitle>{planDetails.name}</CardTitle>
                                        <CardDescription>
                                            {planDetails.price === 0 ? (
                                                "Free"
                                            ) : (
                                                `$${planDetails.price}/month`
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
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
                                            disabled={isCurrentPlan || subscribing}
                                            onClick={() => handleSubscribe(plan)}
                                        >
                                            {subscribing ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            {isCurrentPlan ? "Current Plan" : "Subscribe"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}