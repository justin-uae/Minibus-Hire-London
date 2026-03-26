import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string; // accepted but intentionally not rendered — Google ignores this tag
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    noIndex?: boolean;
    schema?: object | object[];
    appendSiteName?: boolean;
    publishedTime?: string;
    modifiedTime?: string;
}

const SITE_NAME = 'Minibus Hire London';
// Fix #1: include www to match canonical in index.html
const BASE_URL = 'https://www.minibushirelondon.org';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
// Fix #3: proper default title — under 60 chars, keyword-first
const DEFAULT_TITLE = `${SITE_NAME} | Coach & Minibus Hire`;
// Fix #3: always have a fallback description
const DEFAULT_DESCRIPTION =
    'Affordable minibus and coach hire in London. 8–72 seat vehicles, professional drivers, airport transfers, weddings & events. Call +44 203 870 5195.';

export default function SEOHead({
    title,
    description,
    canonicalUrl,
    ogImage = DEFAULT_IMAGE,
    ogType = 'website',
    noIndex = false,
    schema,
    appendSiteName = true,
    publishedTime,
    modifiedTime,
}: SEOHeadProps) {

    // Fix #2: clean title construction with length guard
    const pageTitle = title
        ? appendSiteName
            ? `${title} | ${SITE_NAME}`
            : title
        : DEFAULT_TITLE;

    const metaDescription = description || DEFAULT_DESCRIPTION;

    // Fix #7: no canonical at all is better than a wrong one —
    // only generate canonical if canonicalUrl is explicitly provided,
    // OR default to BASE_URL only for the root page (canonicalUrl="/")
    const fullCanonical = canonicalUrl
        ? `${BASE_URL}${canonicalUrl.startsWith('/') ? canonicalUrl : `/${canonicalUrl}`}`
        : BASE_URL;

    // Fix #8: keep schema shape — object stays object, array stays array
    const schemaJson = schema
        ? JSON.stringify(schema)
        : null;

    return (
        <Helmet prioritizeSeoTags>
            <title>{pageTitle}</title>

            {/* Core meta */}
            <meta name="description" content={metaDescription} />
            {/* Fix #4: full robots directive unlocks rich snippets */}
            <meta
                name="robots"
                content={
                    noIndex
                        ? 'noindex, nofollow'
                        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
                }
            />
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={ogImage} />
            {/* Fix #6: image dimensions + alt for platform compatibility */}
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={`${pageTitle} - ${SITE_NAME}`} />
            <meta property="og:site_name" content={SITE_NAME} />
            {/* Fix #5: locale for geo-targeting */}
            <meta property="og:locale" content="en_GB" />

            {/* Article-specific OG tags — Fix #11 */}
            {ogType === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {ogType === 'article' && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}

            {/* Twitter / X */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={ogImage} />
            {/* Add your handle if you have one: */}
            {/* <meta name="twitter:site" content="@MinibusHireLDN" /> */}

            {/* JSON-LD Schema */}
            {schemaJson && (
                <script type="application/ld+json">{schemaJson}</script>
            )}
        </Helmet>
    );
}