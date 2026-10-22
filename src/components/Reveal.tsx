import { useEffect, useRef, type ElementType, type ComponentPropsWithoutRef } from "react";

type Props<T extends ElementType> = { as?: T; delay?: number } & ComponentPropsWithoutRef<T>;

/** Fondu + montée de 24px quand l’élément entre à l’écran, une seule fois, par transition CSS. */
export function Reveal<T extends ElementType = "div">({ as, delay = 0, style, ...rest }: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.dataset.reveal = "in";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <Tag ref={ref} data-reveal="" style={{ ...style, "--reveal-delay": `${delay}ms` }} {...rest} />;
}
