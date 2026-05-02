import { Outlet, redirect } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import type { Route } from "../+types/home";
import { db } from "~/lib/db.server";

export async function loader({ request }: Route.LoaderArgs) {
    const { requireUserId } = await import("~/services/auth/auth.server");
    const userId = await requireUserId(request);

    // Check if user has completed onboarding
    const userProfile = await db.userProfile.findUnique({
        where: { userId },
        select: { referralSource: true },
    });

    // If no referral source, redirect to onboarding
    if (!userProfile?.referralSource) {
        throw redirect("/app/onboarding");
    }

    return {};
}

export default function AppLayout() {
    return <>
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    </>
}