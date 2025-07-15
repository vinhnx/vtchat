import { Button } from "@repo/ui";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">404</h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
                Sorry, we couldn't find the page you're looking for.
            </p>
            <Button asChild className="mt-6" variant="default">
                <Link href="/">Back to VT</Link>
            </Button>
        </div>
    );
}
