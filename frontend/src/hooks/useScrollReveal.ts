import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const REVEAL_SELECTOR = "[data-reveal], [data-reveal-stagger]";

let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            sharedObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
  }
  return sharedObserver;
}

function observeWithin(root: ParentNode, observer: IntersectionObserver) {
  root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
    if (!el.classList.contains("is-visible")) observer.observe(el);
  });
}

/**
 * Reveals any `[data-reveal]` / `[data-reveal-stagger]` element as it scrolls into view (see the
 * matching CSS in index.css). One shared IntersectionObserver for the whole app rather than one
 * per element — cheap to keep watching, and each element unobserves itself once revealed since
 * this is a one-time entrance effect, not a repeating scroll animation.
 *
 * A plain scan on mount isn't enough: content that loads asynchronously (course grids,
 * testimonials, team members — anything gated behind a React Query fetch) mounts into the DOM
 * *after* this effect's initial querySelectorAll already ran, so it would never get observed and
 * would sit at its CSS-defined opacity: 0 forever. A MutationObserver watches for exactly that
 * and picks up late-arriving elements too.
 *
 * Mounted once in PublicLayout and re-scans on every route change, since each page mounts a
 * fresh set of these elements. Does nothing when the visitor has requested reduced motion — the
 * CSS itself also has a `prefers-reduced-motion` fallback, but skipping the observers entirely
 * avoids doing pointless work.
 */
export function useScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = document.getElementById("main-content");
    if (!container) return;

    const observer = getObserver();
    observeWithin(container, observer);

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(REVEAL_SELECTOR) && !node.classList.contains("is-visible")) {
            observer.observe(node);
          }
          observeWithin(node, observer);
        });
      }
    });
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      container.querySelectorAll(REVEAL_SELECTOR).forEach((el) => observer.unobserve(el));
    };
  }, [pathname]);
}
