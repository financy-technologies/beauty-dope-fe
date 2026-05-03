import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Package, Sparkles } from "lucide-react";
import { useProducts } from "@/hooks/api/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerChild } from "@/lib/animations";

function formatPrice(price: number, currency?: string, normalizedInr?: number): string {
  if (currency === 'USD') return `$${price.toLocaleString()}`;
  const inr = normalizedInr ?? price;
  return `₹${Math.round(inr).toLocaleString('en-IN')}`;
}

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  category: string;
  index: number;
}

function ProductCard({ id, name, brand, price, imageUrl, category }: ProductCardProps) {
  return (
    <motion.div
      variants={staggerChild}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
    >
      <Link
        to={`/product/${id}`}
        className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-elevated transition-[border-color,box-shadow] duration-200"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-2.5 right-2.5">
            <span className="rounded-full bg-background/90 backdrop-blur-sm border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm">
              {category}
            </span>
          </div>
          {/* "View Details" hover overlay */}
          <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="bg-white text-primary text-sm font-semibold rounded-xl px-4 py-2 shadow-lg flex items-center gap-1.5">
              View Details <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 flex-1 flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{brand}</p>
          <p className="text-sm font-display font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">{name}</p>
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-base font-bold text-primary">{formatPrice(price)}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5">
              <Zap className="h-2.5 w-2.5 text-primary" /> Dupes available
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const FeaturedProducts = () => {
  const { data: products, isLoading, error } = useProducts({ limit: 8 });

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Explore Products</span>
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Popular Products
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Discover individual products with full ingredient analysis, SkinEvora scores, and ingredient-matched dupes — all in one place.
            </p>
          </div>
          <Link
            to="/browse?mode=products"
            className="text-sm font-medium text-primary hover:text-gold-dark transition-colors flex items-center gap-2 shrink-0"
          >
            Browse all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground text-sm">Unable to load products. Please try again later.</p>
            </div>
          ) : (
            products?.map((product, index) => (
              <ProductCard
                key={product.id}
                index={index}
                id={product.id}
                name={product.name}
                brand={product.brand}
                price={product.price}
                imageUrl={(product as any).imageUrl}
                category={product.category}
              />
            ))
          )}
        </motion.div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/browse?mode=products"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-6 py-3",
              "text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
            )}
          >
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/ingredient-analyzer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-colors"
          >
            <Zap className="h-4 w-4 text-primary" />
            Analyse an ingredient list
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
