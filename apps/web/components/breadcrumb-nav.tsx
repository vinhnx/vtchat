'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbNavProps {
    items?: BreadcrumbItem[];
    className?: string;
}

const pathToLabel: Record<string, string> = {
    '': 'Home',
    'about': 'About',
    'pricing': 'Pricing',
    'help': 'Help',
    'faq': 'FAQ',
    'ai-resources': 'AI Resources',
    'ai-glossary': 'AI Glossary',
    'privacy': 'Privacy',
    'terms': 'Terms',
    'settings': 'Settings',
    'profile': 'Profile',
};

export function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
    const pathname = usePathname();
    
    const breadcrumbItems = items || generateBreadcrumbItems(pathname);
    
    if (breadcrumbItems.length <= 1) {
        return null;
    }

    return (
        <nav className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`} aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {breadcrumbItems.map((item, index) => (
                    <li key={item.href} className="flex items-center">
                        {index > 0 && (
                            <ChevronRight className="mx-2 h-3 w-3" aria-hidden="true" />
                        )}
                        {index === 0 && <Home className="mr-2 h-3 w-3" aria-hidden="true" />}
                        {index === breadcrumbItems.length - 1 ? (
                            <span className="font-medium text-foreground" aria-current="page">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className="hover:text-foreground transition-colors"
                                title={`Go to ${item.label}`}
                            >
                                {item.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    
    let currentPath = '';
    for (const segment of segments) {
        currentPath += `/${segment}`;
        const label = pathToLabel[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        items.push({ label, href: currentPath });
    }
    
    return items;
}