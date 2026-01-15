import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Integrations/client";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import {
  ShoppingCart,
  Star,
  Filter,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import CartDrawer from "../Components/shop/CartDrawer";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string | null;
  category: string;
  rating: number | null;
  reviews: number | null;
  in_stock: boolean;
}

const Shop = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState<
    {
      id: string;
      name: string;
      price: number;
      image: string;
      quantity: number;
    }[]
  >([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // const categories = [
  //   "Supplements",
  //   "Equipment",
  //   "Accessories",
  //   "Apparel",
  //   "Nutrition",
  // ];

  // Banner carousel images
  const bannerImages = [
    {
      url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=500&fit=crop",
      title: "Premium Supplements",
      subtitle: "Fuel Your Performance",
    },
    {
      url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&h=500&fit=crop",
      title: "Top Equipment",
      subtitle: "Build Your Home Gym",
    },
    {
      url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&h=500&fit=crop",
      title: "Workout Apparel",
      subtitle: "Style Meets Performance",
    },
    {
      url: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1600&h=500&fit=crop",
      title: "Nutrition Essentials",
      subtitle: "Feed Your Goals",
    },
    {
      url: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=1600&h=500&fit=crop",
      title: "Protein Power",
      subtitle: "Build Muscle, Recover Faster",
    },
    {
      url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1600&h=500&fit=crop",
      title: "Home Gym Setup",
      subtitle: "Train Anywhere, Anytime",
    },
    {
      url: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1600&h=500&fit=crop",
      title: "Fitness Accessories",
      subtitle: "Complete Your Workout",
    },
    // {
    //   url: "https://images.unsplash.com/photo-1576678927484-cc907957988c?w=1600&h=500&fit=crop",
    //   title: "Cardio Equipment",
    //   subtitle: "Burn Fat, Build Endurance",
    // },
  ];

  useEffect(() => {
    fetchProducts();
    checkAuth();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);

      // Extract unique categories from products
      const uniqueCategories = Array.from(
        new Set(data?.map((product) => product.category) || [])
      ).sort();
      setCategories(uniqueCategories);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product?.in_stock) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: productId,
          name: product.name,
          price: product.price,
          image: product.image || "",
          quantity: 1,
        },
      ];
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    toast({
      title: "Order Placed",
      description: "your order has been generated.",
    });
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Order Placed",
      description: "your order has been generated.",
    });
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + bannerImages.length) % bannerImages.length
    );
  };

  return (
    <>
      <Helmet>
        <title>Shop - ScanGym | Fitness Supplements & Equipment</title>
        <meta
          name="description"
          content="Shop premium fitness supplements, gym equipment, and accessories. Get the best protein powders, dumbbells, and workout gear in Pakistan."
        />
        <meta
          name="keywords"
          content="gym equipment, protein powder, fitness supplements, dumbbells, Pakistan"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          {/* Hero Section with Carousel */}
          <section className="relative py-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <div className="container mx-auto px-6">
              <br />
              {/* Carousel Banner */}
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-10">
                {bannerImages.map((banner, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img
                      src={banner.url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h2 className="text-4xl md:text-6xl font-bold mb-4">
                          {banner.title}
                        </h2>
                        <p className="text-xl md:text-2xl">{banner.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Carousel Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: "hsl(25 100% 50%)",
                  }}
                >
                  <ChevronLeft
                    className="w-6 h-6 text-gray-800"
                    style={{
                      color: "white",
                    }}
                  />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: "hsl(25 100% 50%)",
                  }}
                >
                  <ChevronRight
                    className="w-6 h-6 text-gray-800"
                    style={{
                      color: "white",
                    }}
                  />
                </button>

                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {bannerImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? "bg-white w-8"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Title and Actions */}
              <div className="text-center max-w-3xl mx-auto pb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  ScanGym <span className="text-primary">Shop</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Premium supplements, equipment, and accessories for your
                  fitness journey.
                </p>

                {/* Cart & Orders */}
                <div className="flex gap-4 justify-center items-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/orders")}
                  >
                    <Package className="w-5 h-5 mr-2" />
                    My Orders
                  </Button>
                  <CartDrawer
                    items={cart}
                    onUpdateQuantity={updateCartQuantity}
                    onRemoveItem={removeFromCart}
                    onClearCart={clearCart}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Search Bar */}
          <section className="py-6 border-b border-border bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>
          </section>

          {/* Main Content with Sidebar */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar - Categories */}
                <aside className="lg:w-64 flex-shrink-0">
                  <div className="sticky top-24 bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Filter className="w-5 h-5 mr-2" />
                      Categories
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant={
                          selectedCategory === null ? "default" : "ghost"
                        }
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(null)}
                      >
                        All Products
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category ? "default" : "ghost"
                          }
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* Products Grid */}
                <div className="flex-1">
                  <div className="mb-4 text-sm text-muted-foreground">
                    Showing {filteredProducts.length} product(s)
                    {searchQuery && ` for "${searchQuery}"`}
                    {selectedCategory && ` in ${selectedCategory}`}
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">
                        No products found. Try adjusting your filters or search.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <Card
                          key={product.id}
                          className="overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={product.image || ""}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.original_price && (
                              <Badge className="absolute top-4 left-4 bg-destructive">
                                {Math.round(
                                  (1 - product.price / product.original_price) *
                                    100
                                )}
                                % OFF
                              </Badge>
                            )}
                            {!product.in_stock && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Badge variant="secondary">Out of Stock</Badge>
                              </div>
                            )}
                          </div>
                          <CardHeader className="pb-2">
                            <Badge variant="outline" className="w-fit mb-2">
                              {product.category}
                            </Badge>
                            <h2 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {product.name}
                            </h2>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="ml-1 text-sm font-medium">
                                  {product.rating}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ({product.reviews} reviews)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-primary">
                                {formatPrice(product.price)}
                              </span>
                              {product.original_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.original_price)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button
                              className="w-full"
                              disabled={!product.in_stock}
                              onClick={() => addToCart(product.id)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {product.in_stock
                                ? "Add to Cart"
                                : "Out of Stock"}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Shop;
