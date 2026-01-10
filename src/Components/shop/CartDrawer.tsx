import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { supabase } from "../../Integrations/client";
import { useToast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Json } from "../../Integrations/types";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartDrawerProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  [key: string]: Json;
}

const CartDrawer = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"cart" | "shipping">("cart");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const validateShipping = () => {
    if (!shippingAddress.fullName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return false;
    }
    if (
      !shippingAddress.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)
    ) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return false;
    }
    if (!shippingAddress.address.trim()) {
      toast({
        title: "Error",
        description: "Please enter your address",
        variant: "destructive",
      });
      return false;
    }
    if (!shippingAddress.city.trim()) {
      toast({
        title: "Error",
        description: "Please enter your city",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleProceedToShipping = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      setIsOpen(false);
      navigate("/login");
      return;
    }

    setStep("shipping");
  };

  const handleGenerateOrder = async () => {
    if (items.length === 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      setIsOpen(false);
      navigate("/login");
      return;
    }

    if (!validateShipping()) return;

    setIsLoading(true);
    try {
      const orderNumber = `SG-${Date.now().toString(36).toUpperCase()}`;

      const { error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        total_amount: subtotal,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })) as Json,
        shipping_address: shippingAddress as Json,
      });

      if (orderError) {
        console.error("Order creation error:", orderError);
        toast({
          title: "Order Failed",
          description: "Failed to create order. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Order Created!",
        description: `Order ${orderNumber} has been created successfully. Admin will review it soon.`,
      });

      onClearCart();
      setShippingAddress({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
      });
      setStep("cart");
      setIsOpen(false);
      navigate("/orders");
    } catch (err) {
      console.error("Order error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCartItems = () => (
    <>
      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-4 py-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-primary font-semibold mt-1">
                  {formatPrice(item.price)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-lg">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            size="lg"
            onClick={handleProceedToShipping}
          >
            Proceed to Checkout
          </Button>
          <Button variant="outline" className="w-full" onClick={onClearCart}>
            Clear Cart
          </Button>
        </div>
      </div>
    </>
  );

  const renderShippingForm = () => (
    <>
      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("cart")}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={shippingAddress.fullName}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={shippingAddress.email}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="03XX-XXXXXXX"
                value={shippingAddress.phone}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                placeholder="House #, Street, Area"
                value={shippingAddress.address}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="Optional"
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress((prev) => ({
                      ...prev,
                      postalCode: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center justify-between text-lg">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary">
            {formatPrice(subtotal)}
          </span>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleGenerateOrder}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Order...
            </>
          ) : (
            "Generate Order"
          )}
        </Button>
      </div>
    </>
  );

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setStep("cart");
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" size="lg" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {step === "cart"
              ? `Your Cart (${totalItems} items)`
              : "Shipping Address"}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm">
              Add some products to get started!
            </p>
          </div>
        ) : step === "cart" ? (
          renderCartItems()
        ) : (
          renderShippingForm()
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
