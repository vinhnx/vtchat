"use client";

import {
    Avatar,
    AvatarFallback,
    Badge,
    Button,
    Checkbox,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@repo/ui";
import type { ColumnDef } from "@tanstack/react-table";
import {
    ArrowUpDown,
    CheckCircle,
    Copy,
    Eye,
    Globe,
    Monitor,
    MoreHorizontal,
    Shield,
    XCircle,
} from "lucide-react";

export interface SessionLog {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
    impersonatedBy: string | null;
    createdAt: string;
    expiresAt: string;
}

interface ColumnsProps {
    onSessionAction?: (sessionId: string, action: string) => Promise<void>;
}

export const createColumns = ({ onSessionAction }: ColumnsProps): ColumnDef<SessionLog>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "userName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 hover:bg-transparent"
            >
                User
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const session = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>
                            {session.userName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{session.userName || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">{session.userEmail}</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "expiresAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 hover:bg-transparent"
            >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const session = row.original;
            const isActive = new Date(session.expiresAt) > new Date();

            return (
                <div className="flex items-center gap-2">
                    {isActive ? (
                        <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Active</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Expired</span>
                        </>
                    )}
                </div>
            );
        },
        filterFn: (row, _id, value) => {
            const session = row.original;
            const isActive = new Date(session.expiresAt) > new Date();
            if (value === "active") return isActive;
            if (value === "expired") return !isActive;
            return true;
        },
    },
    {
        accessorKey: "ipAddress",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 hover:bg-transparent"
            >
                Location
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const session = row.original;
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-mono">
                                    {session.ipAddress || "Unknown"}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>IP Address: {session.ipAddress}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: "userAgent",
        header: "Browser",
        cell: ({ row }) => {
            const session = row.original;

            const getBrowserIcon = (userAgent: string) => {
                if (userAgent?.toLowerCase().includes("firefox"))
                    return <Shield className="h-4 w-4" />;
                if (userAgent?.toLowerCase().includes("chrome"))
                    return <Globe className="h-4 w-4" />;
                if (userAgent?.toLowerCase().includes("safari"))
                    return <Monitor className="h-4 w-4" />;
                return <Monitor className="h-4 w-4" />;
            };

            const getBrowserName = (userAgent: string) => {
                if (userAgent?.toLowerCase().includes("firefox")) return "Firefox";
                if (userAgent?.toLowerCase().includes("chrome")) return "Chrome";
                if (userAgent?.toLowerCase().includes("safari")) return "Safari";
                if (userAgent?.toLowerCase().includes("edge")) return "Edge";
                return "Unknown";
            };

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                                {getBrowserIcon(session.userAgent)}
                                <span className="text-sm">{getBrowserName(session.userAgent)}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs text-wrap">{session.userAgent || "Unknown"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 hover:bg-transparent"
            >
                Session Time
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const session = row.original;
            return (
                <div className="text-sm">
                    <div className="font-medium">
                        {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-muted-foreground">
                        {new Date(session.createdAt).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Expires: {new Date(session.expiresAt).toLocaleDateString()}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "impersonatedBy",
        header: "Special",
        cell: ({ row }) => {
            const session = row.original;
            return (
                <div className="flex flex-col gap-1">
                    {session.impersonatedBy && (
                        <Badge variant="outline" className="text-yellow-600 w-fit">
                            <Eye className="h-3 w-3 mr-1" />
                            Impersonated
                        </Badge>
                    )}
                </div>
            );
        },
        filterFn: (row, _id, value) => {
            const session = row.original;
            if (value === "impersonated") return !!session.impersonatedBy;
            if (value === "normal") return !session.impersonatedBy;
            return true;
        },
        enableSorting: false,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const session = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(session.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Session ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(session.ipAddress)}
                        >
                            <Globe className="mr-2 h-4 w-4" />
                            Copy IP Address
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() =>
                                window.open(`/admin/users?search=${session.userEmail}`, "_blank")
                            }
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View User Details
                        </DropdownMenuItem>
                        {onSessionAction && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onSessionAction(session.id, "revoke")}
                                    className="text-red-600"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Revoke Session
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
];
