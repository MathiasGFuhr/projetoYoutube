"use client";

import { useEffect } from "react";

const EXTENSION_ATTRS = ["bis_skin_checked", "data-bis"] as const;

function cleanNode(node: Element) {
  EXTENSION_ATTRS.forEach((attr) => {
    if (node.hasAttribute?.(attr)) {
      node.removeAttribute(attr);
    }
  });
}

function walkAndClean(root: Element) {
  cleanNode(root);
  root.querySelectorAll?.("*").forEach(cleanNode);
}

export function ExtensionCleanup() {
  useEffect(() => {
    // Initial cleanup
    walkAndClean(document.body);

    // Watch for dynamically added nodes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            walkAndClean(node);
          }
        });
        // Also check modified attributes on existing nodes
        if (mutation.target instanceof Element) {
          cleanNode(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: Array.from(EXTENSION_ATTRS),
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
