import { Outlet, redirect } from "react-router"
import type { Route } from "../+types/home";
import { getUserId, getSafeRedirectUrl } from "~/services/auth/auth.server";


export async function loader({ request }: Route.LoaderArgs) {
    const userId = await getUserId(request);

    if (userId) {
        // If user is already logged in, redirect to intended URL or dashboard
        const safeRedirectUrl = getSafeRedirectUrl(request);
        return redirect(safeRedirectUrl);
    }
    return {};
} export default function AuthLayout() {
    return <>
        <Outlet />
    </>
}   