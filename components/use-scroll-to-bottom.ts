import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(
  shouldScroll?: (mutation: MutationRecord, container: T) => boolean
): [RefObject<T>, RefObject<T>] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver((mutations) => {
        const defaultShouldScroll = (mutation: MutationRecord) => {
          // New message added
          if (mutation.type === 'childList' && 
             mutation.target === container &&
             Array.from(mutation.addedNodes).some(node => 
               node instanceof Element && 
               node.hasAttribute('data-role')
             )) {
            return true;
          }

          // Content streaming in
          if (mutation.type === 'characterData') {
            const target = mutation.target as Node;
            const messageElement = target.parentElement?.closest('[data-role="assistant"]');
            return !!messageElement;
          }

          return false;
        };

        const shouldScrollNow = mutations.some(mutation => 
          shouldScroll ? shouldScroll(mutation, container) : defaultShouldScroll(mutation)
        );

        if (shouldScrollNow) {
          end.scrollIntoView({ behavior: 'instant', block: 'end' });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, [shouldScroll]);

  return [containerRef, endRef];
}
