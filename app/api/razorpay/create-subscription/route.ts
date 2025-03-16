import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import { SUBSCRIPTION_PLANS } from "@/lib/mongodb-types";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { plan } = await req.json();

        if (!SUBSCRIPTION_PLANS[plan]) {
            return new NextResponse("Invalid plan", { status: 400 });
        }

        const price = SUBSCRIPTION_PLANS[plan].price;

        if (price === 0) {
            return new NextResponse("Cannot subscribe to free plan", { status: 400 });
        }

        // Create or get Razorpay customer
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { subscription: true },
        });

        let customerId = user?.subscription?.razorpayCustomerId;

        if (!customerId) {
            const customer = await razorpay.customers.create({
                name: user?.name || undefined,
                email: user?.email || undefined,
                fail_existing: 0,
            });
            customerId = customer.id;
        }

        // Create subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env[`RAZORPAY_${plan}_PLAN_ID`]!,
            customer_notify: 1,
            quantity: 1,
            customer_id: customerId,
        });

        // Save subscription details
        await prisma.subscription.upsert({
            where: { userId: session.user.id },
            update: {
                plan,
                razorpaySubscriptionId: subscription.id,
                razorpayCustomerId: customerId,
                status: "ACTIVE",
                startDate: new Date(),
                endDate: new Date(subscription.current_end * 1000),
            },
            create: {
                userId: session.user.id,
                plan,
                razorpaySubscriptionId: subscription.id,
                razorpayCustomerId: customerId,
                status: "ACTIVE",
                startDate: new Date(),
                endDate: new Date(subscription.current_end * 1000),
            },
        });

        return NextResponse.json({
            subscriptionId: subscription.id,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("[CREATE_SUBSCRIPTION]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}