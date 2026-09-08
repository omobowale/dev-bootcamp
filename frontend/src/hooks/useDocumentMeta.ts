import { useEffect } from "react";

interface DocumentMetaOptions {
  title: string;
  description?: string;
  jsonLd?: object;
}

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function readMetaTag(attr: "name" | "property", key: string): string | null {
  return document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)?.getAttribute("content") ?? null;
}

/**
 * Sets og:/twitter: meta tags and JSON-LD for the current page. Does not touch
 * document.title — RouteExperience already derives that from the page's <h1>.
 */
export function useDocumentMeta({ title, description, jsonLd }: DocumentMetaOptions) {
  useEffect(() => {
    const previousDescription = readMetaTag("name", "description");
    const previousOgDescription = readMetaTag("property", "og:description");
    const previousTwitterDescription = readMetaTag("name", "twitter:description");
    const previousOgTitle = readMetaTag("property", "og:title");
    const previousTwitterTitle = readMetaTag("name", "twitter:title");

    setMetaTag("property", "og:title", title);
    setMetaTag("name", "twitter:title", title);

    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
      setMetaTag("name", "twitter:description", description);
    }

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      if (previousOgTitle) setMetaTag("property", "og:title", previousOgTitle);
      if (previousTwitterTitle) setMetaTag("name", "twitter:title", previousTwitterTitle);
      if (previousDescription) setMetaTag("name", "description", previousDescription);
      if (previousOgDescription) setMetaTag("property", "og:description", previousOgDescription);
      if (previousTwitterDescription) setMetaTag("name", "twitter:description", previousTwitterDescription);
      if (script) document.head.removeChild(script);
    };
  }, [title, description, jsonLd]);
}
