"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "~/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "~/components/ui/dropdown-menu"
import { BookOpenText, ChevronUp, Gamepad2, Home, TrendingUpDown, Trophy, User2, Award } from "lucide-react"
import { Link, useLocation } from "react-router"
import { APP_NAME } from "~/lib/constant"
import { Form } from "react-router"

export function AppSidebar() {
    const { state } = useSidebar();
    const pathname = useLocation().pathname;

    const items = [
        {
            title: "Dashboard",
            url: "/app/dashboard",
            icon: <Home size={35} />,
        },
        {
            title: "Simak",
            url: "/app/recitation",
            icon: <BookOpenText size={35} />,
        },
        {
            title: "Laporan",
            url: "/app/progress-report",
            icon: <TrendingUpDown size={35} />,
        },
        {
            title: "Game",
            url: "/app/game",
            icon: <Gamepad2 size={35} />,
        },
        {
            title: "Pencapaian",
            url: "/app/achievements",
            icon: <Award size={35} />,
        },
        {
            title: "Peringkat",
            url: "/app/leaderboard",
            icon: <Trophy size={35} />,
        }
    ]

    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader className="px-4">
                <h1>
                    <Link to="/" className="text-2xl font-bold">
                        {state === "collapsed" ? APP_NAME[0] : APP_NAME}
                    </Link>
                </h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu className="space-y-1">
                        {items.map((item) => {
                            const isActive = pathname === item.url
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild className={`h-auto ${isActive ? 'bg-accent text-accent-foreground' : ''}`}>
                                        <Link to={item.url}>
                                            {/* <span> */}
                                            {item.icon}
                                            {/* </span> */}
                                            <h3 className="font-semibold text-lg">{item.title}</h3>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 /> Username
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem>
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <span>Billing</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Form method="post" action="/auth/signout" className="w-full">
                                        <button type="submit" className="w-full text-left">
                                            Sign out
                                        </button>
                                    </Form>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}