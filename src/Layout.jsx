import React, { useEffect } from "react";

// All pages are public marketing pages for now. The dashboard shell was
// removed (Nov 2026) ahead of the signage-first rebuild.
export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPageName]);

  return <>{children}</>;
}
