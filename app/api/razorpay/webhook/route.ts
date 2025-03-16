import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return new NextResponse("Missing signature", { status: 401 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            return new NextResponse("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(body);

        switch (event.event) {
            case "subscription.charged":
                await handleSubscriptionCharged(event.payload.subscription.entity);
                break;
            case "subscription.cancelled":
                await handleSubscriptionCancelled(event.payload.subscription.entity);
                break;
            case "subscription.expired":
                await handleSubscriptionExpired(event.payload.subscription.entity);
                break;
        }

        return new NextResponse("Webhook processed", { status: 200 });
    } catch (error) {
        console.error("[RAZORPAY_WEBHOOK]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

async function handleSubscriptionCharged(subscription: any) {
    await prisma.subscription.update({
        where: {
            razorpaySubscriptionId: subscription.id,
        },
        data: {
            status: "ACTIVE",
            endDate: new Date(subscription.current_end * 1000),
        },
    });
}

async function handleSubscriptionCancelled(subscription: any) {
    await prisma.subscription.update({
        where: {
            razorpaySubscriptionId: subscription.id,
        },
        data: {
            status: "CANCELLED",
            endDate: new Date(),
        },
    });
}

async function handleSubscriptionExpired(subscription: any) {
    await prisma.subscription.update({
        where: {
            razorpaySubscriptionId: subscription.id,
        },
        data: {
            status: "EXPIRED",
            endDate: new Date(),
        },
    });
}