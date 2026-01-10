// // import { useState, useEffect } from "react";
// // import { Helmet } from "react-helmet-async";
// // import { useNavigate } from "react-router-dom";
// // import { supabase } from "../Integrations/client";
// // import Navbar from "../Components/layout/Navbar";
// // import Footer from "../Components/layout/Footer";
// // import {
// //   Card,
// //   CardContent,
// //   CardFooter,
// //   CardHeader,
// // } from "../Components/ui/card";
// // import { Badge } from "../Components/ui/badge";
// // import { Button } from "../Components/ui/button";
// // import { ShoppingCart, Star, Filter, Package } from "lucide-react";
// // import { useToast } from "../hooks/use-toast";
// // import CartDrawer from "../Components/shop/CartDrawer";

// // interface Product {
// //   id: string;
// //   name: string;
// //   description: string | null;
// //   price: number;
// //   original_price: number | null;
// //   image: string | null;
// //   category: string;
// //   rating: number | null;
// //   reviews: number | null;
// //   in_stock: boolean;
// // }

// // const Shop = () => {
// //   const { toast } = useToast();
// //   const navigate = useNavigate();
// //   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
// //   const [cart, setCart] = useState<
// //     {
// //       id: string;
// //       name: string;
// //       price: number;
// //       image: string;
// //       quantity: number;
// //     }[]
// //   >([]);
// //   const [products, setProducts] = useState<Product[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   const categories = [
// //     "Supplements",
// //     "Equipment",
// //     "Accessories",
// //     "Apparel",
// //     "Nutrition",
// //   ];

// //   useEffect(() => {
// //     fetchProducts();
// //   }, []);

// //   useEffect(() => {
// //     checkAuth();
// //   }, []);

// //   const checkAuth = async () => {
// //     const {
// //       data: { user },
// //     } = await supabase.auth.getUser();

// //     if (!user) {
// //       navigate("/login");
// //     }
// //   };
// //   const fetchProducts = async () => {
// //     const { data, error } = await supabase
// //       .from("products")
// //       .select("*")
// //       .order("created_at", { ascending: false });

// //     if (error) {
// //       console.error("Error fetching products:", error);
// //     } else {
// //       setProducts(data || []);
// //     }
// //     setLoading(false);
// //   };

// //   const filteredProducts = products.filter((product) => {
// //     const matchesCategory =
// //       !selectedCategory || product.category === selectedCategory;
// //     return matchesCategory;
// //   });

// //   const addToCart = (productId: string) => {
// //     const product = products.find((p) => p.id === productId);
// //     if (!product?.in_stock) return;

// //     setCart((prev) => {
// //       const existing = prev.find((item) => item.id === productId);
// //       if (existing) {
// //         return prev.map((item) =>
// //           item.id === productId
// //             ? { ...item, quantity: item.quantity + 1 }
// //             : item
// //         );
// //       }
// //       return [
// //         ...prev,
// //         {
// //           id: productId,
// //           name: product.name,
// //           price: product.price,
// //           image: product.image || "",
// //           quantity: 1,
// //         },
// //       ];
// //     });

// //     toast({
// //       title: "Added to cart",
// //       description: `${product.name} has been added to your cart.`,
// //     });
// //   };

// //   const updateCartQuantity = (productId: string, quantity: number) => {
// //     if (quantity <= 0) {
// //       removeFromCart(productId);
// //       return;
// //     }
// //     setCart((prev) =>
// //       prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
// //     );
// //   };

// //   const removeFromCart = (productId: string) => {
// //     setCart((prev) => prev.filter((item) => item.id !== productId));
// //     toast({
// //       title: "Removed from cart",
// //       description: "Item has been removed from your cart.",
// //     });
// //   };

// //   const clearCart = () => {
// //     setCart([]);
// //     toast({
// //       title: "Cart cleared",
// //       description: "All items have been removed from your cart.",
// //     });
// //   };

// //   const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

// //   const formatPrice = (price: number) => {
// //     return `Rs. ${price.toLocaleString()}`;
// //   };

// //   return (
// //     <>
// //       <Helmet>
// //         <title>Shop - ScanGym | Fitness Supplements & Equipment</title>
// //         <meta
// //           name="description"
// //           content="Shop premium fitness supplements, gym equipment, and accessories. Get the best protein powders, dumbbells, and workout gear in Pakistan."
// //         />
// //         <meta
// //           name="keywords"
// //           content="gym equipment, protein powder, fitness supplements, dumbbells, Pakistan"
// //         />
// //       </Helmet>

// //       <div className="min-h-screen bg-background">
// //         <Navbar />
// //         <main className="pt-20">
// //           {/* Hero Section */}
// //           <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
// //             <div className="container mx-auto px-4">
// //               <div className="text-center max-w-3xl mx-auto">
// //                 <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
// //                   ScanGym <span className="text-primary">Shop</span>
// //                 </h1>
// //                 <p className="text-lg text-muted-foreground mb-8">
// //                   Premium supplements, equipment, and accessories for your
// //                   fitness journey.
// //                 </p>

// //                 {/* Cart & Orders */}
// //                 <div className="flex gap-4 justify-center items-center">
// //                   <Button
// //                     variant="outline"
// //                     size="lg"
// //                     onClick={() => navigate("/orders")}
// //                   >
// //                     <Package className="w-5 h-5 mr-2" />
// //                     My Orders
// //                   </Button>
// //                   <CartDrawer
// //                     items={cart}
// //                     onUpdateQuantity={updateCartQuantity}
// //                     onRemoveItem={removeFromCart}
// //                     onClearCart={clearCart}
// //                   />
// //                 </div>
// //               </div>
// //             </div>
// //           </section>

// //           {/* Categories */}
// //           <section className="py-8 border-b border-border">
// //             <div className="container mx-auto px-4">
// //               <div className="flex flex-wrap gap-2 justify-center">
// //                 <Button
// //                   variant={selectedCategory === null ? "default" : "outline"}
// //                   size="sm"
// //                   onClick={() => setSelectedCategory(null)}
// //                 >
// //                   <Filter className="w-4 h-4 mr-2" />
// //                   All Products
// //                 </Button>
// //                 {categories.map((category) => (
// //                   <Button
// //                     key={category}
// //                     variant={
// //                       selectedCategory === category ? "default" : "outline"
// //                     }
// //                     size="sm"
// //                     onClick={() => setSelectedCategory(category)}
// //                   >
// //                     {category}
// //                   </Button>
// //                 ))}
// //               </div>
// //             </div>
// //           </section>

// //           {/* Products Grid */}
// //           <section className="py-16">
// //             <div className="container mx-auto px-4">
// //               {filteredProducts.length === 0 ? (
// //                 <div className="text-center py-16">
// //                   <p className="text-muted-foreground text-lg">
// //                     No products found.
// //                   </p>
// //                 </div>
// //               ) : (
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //                   {filteredProducts.map((product) => (
// //                     <Card
// //                       key={product.id}
// //                       className="overflow-hidden hover:shadow-lg transition-shadow group"
// //                     >
// //                       <div className="relative h-48 overflow-hidden">
// //                         <img
// //                           src={product.image || ""}
// //                           alt={product.name}
// //                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
// //                         />
// //                         {product.original_price && (
// //                           <Badge className="absolute top-4 left-4 bg-destructive">
// //                             {Math.round(
// //                               (1 - product.price / product.original_price) * 100
// //                             )}
// //                             % OFF
// //                           </Badge>
// //                         )}
// //                         {!product.in_stock && (
// //                           <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
// //                             <Badge variant="secondary">Out of Stock</Badge>
// //                           </div>
// //                         )}
// //                       </div>
// //                       <CardHeader className="pb-2">
// //                         <Badge variant="outline" className="w-fit mb-2">
// //                           {product.category}
// //                         </Badge>
// //                         <h2 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
// //                           {product.name}
// //                         </h2>
// //                       </CardHeader>
// //                       <CardContent className="pb-2">
// //                         <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
// //                           {product.description}
// //                         </p>
// //                         <div className="flex items-center gap-2 mb-2">
// //                           <div className="flex items-center">
// //                             <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
// //                             <span className="ml-1 text-sm font-medium">
// //                               {product.rating}
// //                             </span>
// //                           </div>
// //                           <span className="text-sm text-muted-foreground">
// //                             ({product.reviews} reviews)
// //                           </span>
// //                         </div>
// //                         <div className="flex items-center gap-2">
// //                           <span className="text-xl font-bold text-primary">
// //                             {formatPrice(product.price)}
// //                           </span>
// //                           {product.original_price && (
// //                             <span className="text-sm text-muted-foreground line-through">
// //                               {formatPrice(product.original_price)}
// //                             </span>
// //                           )}
// //                         </div>
// //                       </CardContent>
// //                       <CardFooter>
// //                         <Button
// //                           className="w-full"
// //                           disabled={!product.in_stock}
// //                           onClick={() => addToCart(product.id)}
// //                         >
// //                           <ShoppingCart className="w-4 h-4 mr-2" />
// //                           {product.in_stock ? "Add to Cart" : "Out of Stock"}
// //                         </Button>
// //                       </CardFooter>
// //                     </Card>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           </section>
// //         </main>
// //         <Footer />
// //       </div>
// //     </>
// //   );
// // };

// // export default Shop;

// import { useState, useEffect } from "react";
// import { Helmet } from "react-helmet-async";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../Integrations/client";
// import Navbar from "../Components/layout/Navbar";
// import Footer from "../Components/layout/Footer";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from "../Components/ui/card";
// import { Badge } from "../Components/ui/badge";
// import { Button } from "../Components/ui/button";
// import { ShoppingCart, Star, Filter, Package } from "lucide-react";
// import { useToast } from "../hooks/use-toast";
// import CartDrawer from "../Components/shop/CartDrawer";

// interface Product {
//   id: string;
//   name: string;
//   description: string | null;
//   price: number;
//   original_price: number | null;
//   image: string | null;
//   category: string;
//   rating: number | null;
//   reviews: number | null;
//   in_stock: boolean;
// }

// const Shop = () => {
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [cart, setCart] = useState<
//     {
//       id: string;
//       name: string;
//       price: number;
//       image: string;
//       quantity: number;
//     }[]
//   >([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);

//   const categories = [
//     "Supplements",
//     "Equipment",
//     "Accessories",
//     "Apparel",
//     "Nutrition",
//   ];

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   // ❌ REMOVED - No auth check on shop page
//   // useEffect(() => {
//   //   checkAuth();
//   // }, []);
//   //
//   // const checkAuth = async () => {
//   //   const {
//   //     data: { user },
//   //   } = await supabase.auth.getUser();
//   //
//   //   if (!user) {
//   //     navigate("/login");
//   //   }
//   // };

//   const fetchProducts = async () => {
//     const { data, error } = await supabase
//       .from("products")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching products:", error);
//     } else {
//       setProducts(data || []);
//     }
//     setLoading(false);
//   };

//   const filteredProducts = products.filter((product) => {
//     const matchesCategory =
//       !selectedCategory || product.category === selectedCategory;
//     return matchesCategory;
//   });

//   const addToCart = (productId: string) => {
//     const product = products.find((p) => p.id === productId);
//     if (!product?.in_stock) return;

//     setCart((prev) => {
//       const existing = prev.find((item) => item.id === productId);
//       if (existing) {
//         return prev.map((item) =>
//           item.id === productId
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [
//         ...prev,
//         {
//           id: productId,
//           name: product.name,
//           price: product.price,
//           image: product.image || "",
//           quantity: 1,
//         },
//       ];
//     });

//     toast({
//       title: "Added to cart",
//       description: `${product.name} has been added to your cart.`,
//     });
//   };

//   const updateCartQuantity = (productId: string, quantity: number) => {
//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }
//     setCart((prev) =>
//       prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
//     );
//   };

//   const removeFromCart = (productId: string) => {
//     setCart((prev) => prev.filter((item) => item.id !== productId));
//     toast({
//       title: "Removed from cart",
//       description: "Item has been removed from your cart.",
//     });
//   };

//   const clearCart = () => {
//     setCart([]);
//     toast({
//       title: "Cart cleared",
//       description: "All items have been removed from your cart.",
//     });
//   };

//   const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

//   const formatPrice = (price: number) => {
//     return `Rs. ${price.toLocaleString()}`;
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Shop - ScanGym | Fitness Supplements & Equipment</title>
//         <meta
//           name="description"
//           content="Shop premium fitness supplements, gym equipment, and accessories. Get the best protein powders, dumbbells, and workout gear in Pakistan."
//         />
//         <meta
//           name="keywords"
//           content="gym equipment, protein powder, fitness supplements, dumbbells, Pakistan"
//         />
//       </Helmet>

//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <main className="pt-20">
//           {/* Hero Section */}
//           <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
//             <div className="container mx-auto px-4">
//               <div className="text-center max-w-3xl mx-auto">
//                 <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
//                   ScanGym <span className="text-primary">Shop</span>
//                 </h1>
//                 <p className="text-lg text-muted-foreground mb-8">
//                   Premium supplements, equipment, and accessories for your
//                   fitness journey.
//                 </p>

//                 {/* Cart & Orders */}
//                 <div className="flex gap-4 justify-center items-center">
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     onClick={() => navigate("/orders")}
//                   >
//                     <Package className="w-5 h-5 mr-2" />
//                     My Orders
//                   </Button>
//                   <CartDrawer
//                     items={cart}
//                     onUpdateQuantity={updateCartQuantity}
//                     onRemoveItem={removeFromCart}
//                     onClearCart={clearCart}
//                   />
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Categories */}
//           <section className="py-8 border-b border-border">
//             <div className="container mx-auto px-4">
//               <div className="flex flex-wrap gap-2 justify-center">
//                 <Button
//                   variant={selectedCategory === null ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setSelectedCategory(null)}
//                 >
//                   <Filter className="w-4 h-4 mr-2" />
//                   All Products
//                 </Button>
//                 {categories.map((category) => (
//                   <Button
//                     key={category}
//                     variant={
//                       selectedCategory === category ? "default" : "outline"
//                     }
//                     size="sm"
//                     onClick={() => setSelectedCategory(category)}
//                   >
//                     {category}
//                   </Button>
//                 ))}
//               </div>
//             </div>
//           </section>

//           {/* Products Grid */}
//           <section className="py-16">
//             <div className="container mx-auto px-4">
//               {filteredProducts.length === 0 ? (
//                 <div className="text-center py-16">
//                   <p className="text-muted-foreground text-lg">
//                     No products found.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {filteredProducts.map((product) => (
//                     <Card
//                       key={product.id}
//                       className="overflow-hidden hover:shadow-lg transition-shadow group"
//                     >
//                       <div className="relative h-48 overflow-hidden">
//                         <img
//                           src={product.image || ""}
//                           alt={product.name}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         />
//                         {product.original_price && (
//                           <Badge className="absolute top-4 left-4 bg-destructive">
//                             {Math.round(
//                               (1 - product.price / product.original_price) * 100
//                             )}
//                             % OFF
//                           </Badge>
//                         )}
//                         {!product.in_stock && (
//                           <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
//                             <Badge variant="secondary">Out of Stock</Badge>
//                           </div>
//                         )}
//                       </div>
//                       <CardHeader className="pb-2">
//                         <Badge variant="outline" className="w-fit mb-2">
//                           {product.category}
//                         </Badge>
//                         <h2 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
//                           {product.name}
//                         </h2>
//                       </CardHeader>
//                       <CardContent className="pb-2">
//                         <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
//                           {product.description}
//                         </p>
//                         <div className="flex items-center gap-2 mb-2">
//                           <div className="flex items-center">
//                             <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                             <span className="ml-1 text-sm font-medium">
//                               {product.rating}
//                             </span>
//                           </div>
//                           <span className="text-sm text-muted-foreground">
//                             ({product.reviews} reviews)
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <span className="text-xl font-bold text-primary">
//                             {formatPrice(product.price)}
//                           </span>
//                           {product.original_price && (
//                             <span className="text-sm text-muted-foreground line-through">
//                               {formatPrice(product.original_price)}
//                             </span>
//                           )}
//                         </div>
//                       </CardContent>
//                       <CardFooter>
//                         <Button
//                           className="w-full"
//                           disabled={!product.in_stock}
//                           onClick={() => addToCart(product.id)}
//                         >
//                           <ShoppingCart className="w-4 h-4 mr-2" />
//                           {product.in_stock ? "Add to Cart" : "Out of Stock"}
//                         </Button>
//                       </CardFooter>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </section>
//         </main>
//         <Footer />
//       </div>
//     </>
//   );
// };

// export default Shop;

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
import { ShoppingCart, Star, Filter, Package, LogIn } from "lucide-react";
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

  const categories = [
    "Supplements",
    "Equipment",
    "Accessories",
    "Apparel",
    "Nutrition",
  ];

  useEffect(() => {
    fetchProducts();
    checkAuth();
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
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesCategory;
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
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
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
          {/* Hero Section */}
          <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  ScanGym <span className="text-primary">Shop</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Premium supplements, equipment, and accessories for your
                  fitness journey.
                </p>

                {/* Cart & Orders */}
                <div className="flex gap-4 justify-center items-center">
                  {isLoggedIn ? (
                    <>
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
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => navigate("/login")}
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Login to Order
                    </Button>
                  )}
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
                  <Filter className="w-4 h-4 mr-2" />
                  All Products
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

          {/* Products Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    No products found.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                              (1 - product.price / product.original_price) * 100
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
                          {product.in_stock ? "Add to Cart" : "Out of Stock"}
                        </Button>
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

export default Shop;
