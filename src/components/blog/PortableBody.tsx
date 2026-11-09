import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Link } from "react-router-dom";
import { safeHref } from "@/lib/blog";
import { BodyImage, Callout, Checklist, DataTable, IngredientCards, ProductPicks } from "./blocks";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-muted-foreground leading-7 mb-4">{children}</p>,
    h2: ({ children }) => (
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-10 mb-4 pb-2 border-b border-border">
        {children}
      </h2>
    ),
    h3: ({ children }) => <h3 className="font-semibold text-lg text-foreground mt-6 mb-2">{children}</h3>,
  },
  list: {
    bullet: ({ children }) => <ul className="mb-4 ml-5 list-disc space-y-1.5 text-muted-foreground leading-7">{children}</ul>,
    number: ({ children }) => <ol className="mb-4 ml-5 list-decimal space-y-1.5 text-muted-foreground leading-7">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const link = safeHref(value?.href);
      if (!link) return <>{children}</>; // unsafe or empty: render as plain text
      const cls = "text-primary underline underline-offset-2 hover:text-primary/80";
      return link.internal ? (
        <Link to={link.href} className={cls}>
          {children}
        </Link>
      ) : (
        <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    },
  },
  types: {
    image: BodyImage,
    ingredientCards: IngredientCards,
    callout: Callout,
    dataTable: DataTable,
    productPicks: ProductPicks,
    checklist: Checklist,
  },
  // Unknown block types (e.g. added in the Studio before the site supports
  // them) are skipped instead of breaking the page.
  unknownType: () => null,
  unknownMark: ({ children }) => <>{children}</>,
};

const PortableBody = ({ value }: { value: unknown[] }) => (
  <PortableText value={value as never} components={components} onMissingComponent={false} />
);

export default PortableBody;
