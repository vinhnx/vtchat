import { generateMetadata as genMeta } from '../../lib/seo/metadata-utils';
import { AboutPageClient } from './about-client';

export const metadata = genMeta({
    title: 'About VT',
    description: 'Learn about VT - Your privacy-focused AI chat platform',
    pathname: '/about',
});

export default function AboutPage() {
    return <AboutPageClient />;
}
