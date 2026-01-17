import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Textarea } from "../Components/ui/texarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Switch } from "../Components/ui/switch";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "../Components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Plus,
  Edit,
  Image as ImageIcon,
  Calendar,
  X,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../Contexts/AuthContext";
import { supabase } from "../Integrations/client";
import RichTextEditor from "../Components/blog/RichTextEditor";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../Components/ui/dialog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author_name: string;
  category: string;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const BlogAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [category, setCategory] = useState("Fitness");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  const categories = ["Fitness", "Nutrition", "Workouts", "Lifestyle", "Tips"];

  useEffect(() => {
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasRole = roles?.some(
        (r) => r.role === "admin" || r.role === "partner",
      );
      if (!hasRole) {
        toast({
          title: "Access Denied",
          description: "You need admin or partner access to manage blog posts.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setHasAccess(true);
      fetchPosts();
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/");
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (isNewPost) {
      setSlug(generateSlug(value));
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setFeaturedImage("");
    setCategory("Fitness");
    setTags([]);
    setTagInput("");
    setIsPublished(false);
    setEditingPost(null);
    setIsNewPost(false);
  };

  const startNewPost = () => {
    resetForm();
    setIsNewPost(true);
  };

  const editPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsNewPost(false);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || "");
    setContent(post.content);
    setFeaturedImage(post.featured_image || "");
    setCategory(post.category);
    setTags(post.tags || []);
    setIsPublished(post.is_published);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFeaturedImageUpload = async (file: File) => {
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `featured-${Date.now()}.${fileExt}`;

    try {
      const { error } = await supabase.storage
        .from("blog-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        setFeaturedImage(urlData.publicUrl);
        toast({
          title: "Image uploaded",
          description: "Featured image has been uploaded.",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload featured image.",
        variant: "destructive",
      });
    }
  };

  const savePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const postData = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        excerpt: excerpt.trim() || null,
        content,
        featured_image: featuredImage || null,
        author_id: user?.id,
        author_name: user?.email?.split("@")[0] || "ScanGym Team",
        category,
        tags,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;

        toast({
          title: "Post Updated",
          description: "Your blog post has been updated.",
        });
      } else {
        const { error } = await supabase.from("blog_posts").insert(postData);

        if (error) throw error;

        toast({
          title: "Post Created",
          description: "Your blog post has been created.",
        });
      }

      resetForm();
      fetchPosts();
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save blog post.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async () => {
    if (!deleteDialog.id) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", deleteDialog.id);

      if (error) throw error;

      toast({
        title: "Post Deleted",
        description: "The blog post has been deleted.",
        duration: 3000,
      });

      if (editingPost?.id === deleteDialog.id) {
        resetForm();
      }
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete blog post.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (!hasAccess) {
    return null;
  }

  const isEditing = isNewPost || editingPost;

  return (
    <>
      <Helmet>
        <title>Blog Admin - ScanGym</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Blog Admin</h1>
            </div>
            {isEditing && (
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={savePost} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Post"}
                </Button>
              </div>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {!isEditing ? (
            /* Posts List View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">All Posts</h2>
                <Button onClick={startNewPost}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </div>

              {loading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      No blog posts yet.
                    </p>
                    <Button onClick={startNewPost}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {posts.map((post) => (
                    <Card
                      key={post.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold truncate">
                                {post.title}
                              </h3>
                              <Badge
                                variant={
                                  post.is_published ? "default" : "secondary"
                                }
                              >
                                {post.is_published ? "Published" : "Draft"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {post.excerpt || "No excerpt"}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(
                                  new Date(post.created_at),
                                  "MMM d, yyyy",
                                )}
                              </span>
                              <Badge variant="outline">{post.category}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                window.open(`/blog/${post.slug}`, "_blank")
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editPost(post)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDeleteDialog({ open: true, id: post.id })
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Editor View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter post title..."
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-xl font-semibold h-14"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="post-url-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Preview: /blog/{slug || "your-post-slug"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Brief description for SEO and post previews..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <RichTextEditor content={content} onChange={setContent} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Publish</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="publish-toggle">Published</Label>
                      <Switch
                        id="publish-toggle"
                        checked={isPublished}
                        onCheckedChange={setIsPublished}
                        className="data-[state=checked]:bg-orange-500 [&>span]:data-[state=checked]:bg-white"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isPublished
                        ? "This post is visible to the public."
                        : "This post is saved as a draft."}
                    </p>
                  </CardContent>
                </Card>

                {/* Featured Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {featuredImage ? (
                      <div className="relative">
                        <img
                          src={featuredImage}
                          alt="Featured"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setFeaturedImage("")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="h-40 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFeaturedImageUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                      />
                      <Button variant="outline" onClick={addTag} type="button">
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this post? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await deletePost();
                setDeleteDialog({ open: false, id: null });
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogAdmin;
