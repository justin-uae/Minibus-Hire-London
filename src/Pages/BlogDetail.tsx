import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, User, Tag, ChevronLeft, Share2, Bus, Loader, AlertCircle } from 'lucide-react';
import { fetchBlogPostBySlug, fetchBlogPosts, type BlogPost } from '../services/shopifyClient';

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBlog = async () => {
            if (!slug) return;

            try {
                setLoading(true);
                const [blogData, allBlogs] = await Promise.all([
                    fetchBlogPostBySlug(slug),
                    fetchBlogPosts(),
                ]);

                if (blogData) {
                    setBlog(blogData);

                    // Get related blogs from same category
                    const related = allBlogs
                        .filter((b) => b.category === blogData.category && b.slug !== blogData.slug)
                        .slice(0, 3);
                    setRelatedBlogs(related);
                }
            } catch (error) {
                console.error('Error loading blog:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBlog();
    }, [slug]);

    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: blog?.title,
                    text: blog?.excerpt,
                    url: window.location.href,
                })
                .catch((err) => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!blog) {
        return <NotFoundState />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-16">
            {/* Breadcrumb */}
            <div className="border-b border-gray-200 bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Link to="/" className="hover:text-blue-600 font-medium transition-colors">
                            Home
                        </Link>
                        <span className="text-gray-400">→</span>
                        <Link to="/blogs" className="hover:text-blue-600 font-medium transition-colors">
                            Blog
                        </Link>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-900 font-semibold truncate">{blog.title}</span>
                    </div>
                </div>
            </div>

            {/* Article */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                            {blog.category}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {blog.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-semibold text-gray-900">{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Clock className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium">{blog.readTime}</span>
                        </div>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 ml-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>

                    {/* Author Info */}
                    {blog.authorBio && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200 shadow-lg">
                            <div className="flex items-start gap-4">
                                {blog.authorImage && (
                                    <img
                                        src={blog.authorImage}
                                        alt={blog.author}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-400 shadow-md"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">About {blog.author}</h3>
                                    <p className="text-xs text-gray-700 leading-relaxed">{blog.authorBio}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* Featured Image */}
                <div className="mb-8 sm:mb-12">
                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200">
                        <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-auto object-cover"
                            style={{ maxHeight: '500px' }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none mb-12">
                    <div
                        className="text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
                    />
                </div>

                {/* Tags */}
                {blog.tags.length > 0 && (
                    <div className="mb-12 pb-8 border-b-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Tag className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Tags</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-block bg-white hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-600 transition-all cursor-pointer border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Posts */}
                {relatedBlogs.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Bus className="w-7 h-7 text-blue-600" />
                            Related Articles
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedBlogs.map((relatedBlog) => (
                                <RelatedBlogCard
                                    key={relatedBlog.id}
                                    blog={relatedBlog}
                                    onClick={() => navigate(`/viewBlog/${relatedBlog.slug}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to Blog Link */}
                <div className="mt-12 text-center">
                    <Link
                        to="/blogs"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to All Articles
                    </Link>
                </div>
            </article>
        </div>
    );
}

// Related Blog Card Component
const RelatedBlogCard = ({ blog, onClick }: { blog: BlogPost; onClick: () => void }) => (
    <div
        onClick={onClick}
        className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-blue-300 hover:-translate-y-2"
    >
        <div className="relative overflow-hidden h-40">
            <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-4">
            <div className="flex items-center gap-2 mb-2 text-xs text-blue-600">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">{blog.readTime}</span>
            </div>

            <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {blog.title}
            </h3>

            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
        </div>
    </div>
);

// Loading Skeleton
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-16">
        <div className="border-b border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center py-20">
                <Loader className="h-16 w-16 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium text-lg">Loading article...</p>
            </div>
        </div>
    </div>
);

// Not Found State
const NotFoundState = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center pt-16">
        <div className="text-center px-4">
            <AlertCircle className="w-32 h-32 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Article Not Found
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
                The article you're looking for doesn't exist or has been removed.
            </p>
            <Link
                to="/blogs"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
                <ChevronLeft className="w-5 w-5" />
                Browse All Articles
            </Link>
        </div>
    </div>
);