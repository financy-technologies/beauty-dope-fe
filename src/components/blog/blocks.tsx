import { AlertTriangle, Check, Lightbulb } from "lucide-react";
import { sanityImageUrl } from "@/lib/blog";

/**
 * Custom blocks editors can use in a post body. Field names match the Sanity
 * schema in studio/schemaTypes/blocks.ts. Styling is unchanged from the old
 * hard-coded blog.
 */

export interface IngredientItem {
  _key?: string;
  name: string;
  inci?: string;
  benefit: string;
  skinTypes?: string[];
  caution?: string;
}

function IngredientCard({ item }: { item: IngredientItem }) {
  const inci = item.inci ?? "";
  const showInci =
    !!inci && inci.toLowerCase() !== item.name.toLowerCase() && !item.name.toLowerCase().startsWith(inci.toLowerCase());
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 my-1">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="font-semibold text-foreground">{item.name}</h4>
          {showInci && <p className="text-xs text-muted-foreground font-mono">{inci}</p>}
        </div>
        <div className="flex flex-wrap gap-1">
          {(item.skinTypes ?? []).map((st) => (
            <span key={st} className="text-xs rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground font-medium">
              {st}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{item.benefit}</p>
      {item.caution && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          {item.caution}
        </p>
      )}
    </div>
  );
}

export function IngredientCards({ value }: { value: { layout?: "stack" | "grid"; items?: IngredientItem[] } }) {
  const items = value.items ?? [];
  return (
    <div className={value.layout === "grid" ? "my-6 grid gap-3 sm:grid-cols-2" : "my-6 space-y-3"}>
      {items.map((item, i) => (
        <IngredientCard key={item._key ?? i} item={item} />
      ))}
    </div>
  );
}

export function Callout({ value }: { value: { tone?: "tip" | "warning"; text?: string } }) {
  if (value.tone === "warning") {
    return (
      <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">{value.text}</p>
      </div>
    );
  }
  return (
    <div className="my-6 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 flex gap-3">
      <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
      <p className="text-sm text-foreground leading-relaxed">{value.text}</p>
    </div>
  );
}

export function DataTable({ value }: { value: { headers?: string[]; rows?: { _key?: string; cells?: string[] }[] } }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60">
            {(value.headers ?? []).map((h, i) => (
              <th key={i} className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(value.rows ?? []).map((row, ri) => (
            <tr key={row._key ?? ri} className={ri % 2 === 0 ? "bg-card" : "bg-muted/30"}>
              {(row.cells ?? []).map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-muted-foreground border-b border-border/50 last:border-b-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductPicks({
  value,
}: {
  value: { products?: { _key?: string; brand: string; name: string; price?: string; why?: string }[] };
}) {
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2">
      {(value.products ?? []).map((product, i) => (
        <div key={product._key ?? i} className="rounded-xl border border-accent/20 bg-accent/5 p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">{product.brand}</p>
              <h4 className="font-semibold text-foreground text-sm leading-snug">{product.name}</h4>
            </div>
            {product.price && (
              <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
                {product.price}
              </span>
            )}
          </div>
          {product.why && <p className="text-xs text-muted-foreground leading-relaxed">{product.why}</p>}
        </div>
      ))}
    </div>
  );
}

export function Checklist({ value }: { value: { items?: { _key?: string; label: string; note?: string }[] } }) {
  return (
    <div className="my-6 space-y-2">
      {(value.items ?? []).map((item, i) => (
        <div key={item._key ?? i} className="flex gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-semibold text-foreground">{item.label}</span>
            {item.note && <span className="text-sm text-muted-foreground"> — {item.note}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BodyImage({
  value,
}: {
  value: { url?: string; alt?: string; caption?: string; width?: number; height?: number; lqip?: string };
}) {
  if (!value.url) return null;
  return (
    <figure className="my-8">
      <img
        src={sanityImageUrl(value.url, 1200)}
        srcSet={[600, 900, 1200, 1800].map((w) => `${sanityImageUrl(value.url!, w)} ${w}w`).join(", ")}
        sizes="(min-width: 768px) 768px, 100vw"
        alt={value.alt ?? ""}
        width={value.width}
        height={value.height}
        loading="lazy"
        className="w-full h-auto rounded-xl border border-border bg-muted"
        style={value.lqip ? { backgroundImage: `url(${value.lqip})`, backgroundSize: "cover" } : undefined}
      />
      {value.caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{value.caption}</figcaption>}
    </figure>
  );
}
