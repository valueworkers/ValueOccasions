import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Function to scroll to top
    const scrollToTop = () => {
      // Try modern scrollTo API first
      if (window.scrollTo) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto' // 'auto' is equivalent to instant
        });
      }
      
      // Fallback for older browsers and ensure all scroll containers are reset
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
      
      // Also try window.pageYOffset for compatibility
      if (window.pageYOffset !== undefined) {
        window.scrollTo(0, 0);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Immediate scroll as well
    scrollToTop();

    // Scroll after a short delay to handle async content loading
    const timeoutId = setTimeout(() => {
      scrollToTop();
    }, 0);

    // Additional scroll after content might have loaded (for async data)
    const timeoutId2 = setTimeout(() => {
      scrollToTop();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [pathname]);

  return null;
}