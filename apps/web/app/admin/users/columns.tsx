'use client';

import { getSessionCacheBustedAvatarUrl } from '@repo/common/utils/avatar-cache';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Checkbox,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/ui';
import type { ColumnDef } from '@tanstack/react-table';
import {
    ArrowUpDown,
    Ban,
    CheckCircle,
    Clock,
    CreditCard,
    MoreHorizontal,
    Shield,
    UserCheck,
    XCircle,
} from 'lucide-react';

export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    role: string;
    banned: boolean;
    banReason?: string;
    banExpires?: string;
    protected: boolean;
    planSlug: string;
    creemCustomerId?: string;
    createdAt: string;
    updatedAt: string;
}

interface ColumnsProps {
    onUserAction: (userId: string, action: string, data?: any) => Promise<void>;
}

export const createColumns = ({ onUserAction }: ColumnsProps): ColumnDef<User>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()
                    || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='h-auto p-0 hover:bg-transparent'
            >
                User
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                        <AvatarImage
                            src={getSessionCacheBustedAvatarUrl(user.image) || user.image}
                        />
                        <AvatarFallback>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className='font-medium'>{user.name}</div>
                        <div className='text-muted-foreground text-sm'>{user.email}</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'emailVerified',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='h-auto p-0 hover:bg-transparent'
            >
                Status
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => {
            const user = row.original;

            const getStatusIcon = () => {
                if (user.banned) return <XCircle className='h-4 w-4 text-red-500' />;
                if (user.emailVerified) return <CheckCircle className='h-4 w-4 text-green-500' />;
                return <Clock className='h-4 w-4 text-yellow-500' />;
            };

            const getStatusText = () => {
                if (user.banned) return 'Banned';
                if (user.emailVerified) return 'Verified';
                return 'Pending';
            };

            return (
                <div className='flex items-center gap-2'>
                    {getStatusIcon()}
                    <span className='text-sm'>{getStatusText()}</span>
                </div>
            );
        },
        filterFn: (row, _id, value) => {
            const user = row.original;
            if (value === 'active') return !user.banned;
            if (value === 'banned') return user.banned;
            if (value === 'verified') return user.emailVerified;
            if (value === 'pending') return !user.emailVerified && !user.banned;
            return true;
        },
    },
    {
        accessorKey: 'planSlug',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='h-auto p-0 hover:bg-transparent'
            >
                Plan
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => {
            const user = row.original;
            const getPlanBadgeVariant = (plan: string) => {
                switch (plan) {
                    case 'vt_plus':
                        return 'default';
                    case 'vt_base':
                        return 'secondary';
                    default:
                        return 'outline';
                }
            };

            return (
                <Badge variant={getPlanBadgeVariant(user.planSlug)}>
                    {user.planSlug === 'vt_plus' ? 'VT+' : 'VT Base'}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            if (value === 'all') return true;
            return row.getValue(id) === value;
        },
    },
    {
        accessorKey: 'role',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='h-auto p-0 hover:bg-transparent'
            >
                Role
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => {
            const user = row.original;
            return (
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='h-auto p-0 hover:bg-transparent'
            >
                Joined
                <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
        ),
        cell: ({ row }) => {
            const user = row.original;
            return new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const user = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        {user.banned
                            ? (
                                <DropdownMenuItem onClick={() => onUserAction(user.id, 'unban')}>
                                    <UserCheck className='mr-2 h-4 w-4' />
                                    Unban User
                                </DropdownMenuItem>
                            )
                            : (
                                <DropdownMenuItem
                                    onClick={() =>
                                        onUserAction(user.id, 'ban', {
                                            reason: 'Banned by admin',
                                        })}
                                >
                                    <Ban className='mr-2 h-4 w-4' />
                                    Ban User
                                </DropdownMenuItem>
                            )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() =>
                                onUserAction(user.id, 'updateRole', {
                                    role: user.role === 'admin' ? 'user' : 'admin',
                                })}
                        >
                            <Shield className='mr-2 h-4 w-4' />
                            {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onUserAction(user.id, 'updatePlan', {
                                    planSlug: user.planSlug === 'vt_plus' ? 'vt_base' : 'vt_plus',
                                })}
                        >
                            <CreditCard className='mr-2 h-4 w-4' />
                            {user.planSlug === 'vt_plus' ? 'Downgrade to Base' : 'Upgrade to Plus'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
];
