import Link from "next/link";

const links = [
    {
        title: "Home",
        href: "/",
    },
    {
        title: "Terms",
        href: "/terms",
    },
    {
        title: "Privacy",
        href: "/privacy",
    },
    {
        title: "VT+",
        href: "/plus",
    },
    {
        title: "Contact",
        href: "mailto:hello@vtdotai.io.vn",
    },
    {
        title: "Help Center",
        href: "/faq",
    },
    {
        title: "About",
        href: "/about",
    },
    {
        title: "X/Twitter",
        href: "https://x.com/vtdotai",
    },
];

export const Footer = () => {
    return (
        <footer className="py-4 md:py-16">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="my-2 md:my-8 flex flex-wrap justify-center gap-3 md:gap-6 text-xs md:text-sm">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="text-muted-foreground hover:text-primary block duration-150"
                        >
                            <span>{link.title}</span>
                        </Link>
                    ))}
                </div>
                <span className="text-muted-foreground block text-center text-xs md:text-sm">
                    {" "}
                    © {new Date().getFullYear()} VT, All rights reserved
                </span>
            </div>
        </footer>
    );
};
