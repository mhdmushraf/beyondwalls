import { SiteNav } from "@/components/site/Site";

// Legacy pages (SEO guides, blog, map) keep their pt-32 layouts: render the new light nav fixed on top.
export default function PublicNav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <SiteNav dark={false} />
    </div>
  );
}
