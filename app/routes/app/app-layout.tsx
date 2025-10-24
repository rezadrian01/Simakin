import { Outlet, redirect } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import type { Route } from "../+types/home";

export async function loader({ request }: Route.LoaderArgs) {
    const { requireUserId } = await import("~/services/auth/auth.server");
    const userId = await requireUserId(request);
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