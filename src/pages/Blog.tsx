import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import { supabase } from "../Integrations/client";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  author_name: string;
  category: string;
  tags: string[] | null;
  published_at: string | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["Fitness", "Nutrition", "Workouts", "Lifestyle", "Tips"];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          "id, title, slug, excerpt, featured_image, author_name, category, tags, published_at"
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      // Convert null tags to empty arrays
      const postsWithTags = (data || []).map((post) => ({
        ...post,
        tags: post.tags || [],
      }));
      setPosts(postsWithTags);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sample posts for display when no real posts exist
  const samplePosts: BlogPost[] = [
    {
      id: "1",
      title: "10 Essential Exercises for Building Core Strength",
      slug: "core-strength-exercises",
      excerpt:
        "Discover the most effective exercises to build a strong core and improve your overall fitness performance.",
      featured_image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
      author_name: "ScanGym Team",
      category: "Workouts",
      tags: ["core", "strength", "exercises"],
      published_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "The Ultimate Guide to Pre-Workout Nutrition",
      slug: "pre-workout-nutrition",
      excerpt:
        "Learn what to eat before your workout to maximize energy and performance at the gym.",
      featured_image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
      author_name: "ScanGym Team",
      category: "Nutrition",
      tags: ["nutrition", "pre-workout", "energy"],
      published_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      title: "How to Stay Motivated on Your Fitness Journey",
      slug: "stay-motivated-fitness",
      excerpt:
        "Tips and strategies to keep your motivation high and achieve your fitness goals.",
      featured_image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
      author_name: "ScanGym Team",
      category: "Lifestyle",
      tags: ["motivation", "fitness", "goals"],
      published_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const displayPosts =
    posts.length > 0
      ? filteredPosts
      : samplePosts.filter((post) => {
          const matchesSearch =
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory =
            !selectedCategory || post.category === selectedCategory;
          return matchesSearch && matchesCategory;
        });

  return (
    <>
      <Helmet>
        <title>Fitness Blog - ScanGym | Workout Tips, Nutrition & More</title>
        <meta
          name="description"
          content="Read the latest fitness tips, workout guides, nutrition advice, and gym insights from the ScanGym team."
        />
        <meta
          name="keywords"
          content="fitness blog, workout tips, nutrition advice, gym exercises, ScanGym"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  ScanGym <span className="text-primary">Fitness Blog</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Expert tips, workout guides, and nutrition advice to help you
                  achieve your fitness goals.
                </p>

                {/* Search */}
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="py-8 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-muted rounded-t-lg" />
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : displayPosts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    No blog posts found.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            post.featured_image ||
                            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
                          }
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 left-4">
                          {post.category}
                        </Badge>
                      </div>
                      <CardHeader>
                        <h2 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3">
                          {post.excerpt}
                        </p>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author_name}
                          </span>
                          {post.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(
                                new Date(post.published_at),
                                "MMM d, yyyy"
                              )}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Read <ArrowRight className="w-4 h-4" />
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Blog;
