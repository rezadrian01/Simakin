import { Outlet, redirect } from "react-router"
import type { Route } from "../+types/home";
import { getUserId } from "~/services/auth/auth.server";


export async function loader({ request }: Route.LoaderArgs) {
    const userId = await getUserId(request);
    if (userId) return redirect("/app/dashboard");
    return {};
}

export default function AuthLayout() {
    return <>
        <Outlet />
    </>
}   