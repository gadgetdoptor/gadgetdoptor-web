"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRowProps {
  children: ReactNode;
  className?: string;
}

export function ScrollRow({ children, className }: ScrollRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [cardCenter, setCardCenter] = useState<number | null>(null);

  const updateScrollState = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const overflowing = el.scrollWidth > el.clientWidth + 1;
    setScrollable(overflowing);
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);

    const card = el.querySelector<HTMLElement>("[data-scroll-card]");
    if (card) setCardCenter(card.offsetTop + card.offsetHeight / 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    updateScrollState();

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollBy = (amount: number) => {
    ref.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div ref={ref} className={className}>
        {children}
      </div>

      {scrollable && canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-240)}
          style={cardCenter != null ? { top: cardCenter } : undefined}
          className="flex sm:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 items-center justify-center w-9 h-9 rounded-md backdrop-blur-md bg-background/70 border border-border/50 shadow-lg hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {scrollable && canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(240)}
          style={cardCenter != null ? { top: cardCenter } : undefined}
          className="flex sm:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 items-center justify-center w-9 h-9 rounded-md backdrop-blur-md bg-background/70 border border-border/50 shadow-lg hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
