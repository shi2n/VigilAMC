'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const handleScrollAnimations = () => {
      const targets = document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right, .reveal-scale');
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              // Unobserve after revealing to maintain performance
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -60px 0px',
          threshold: 0.12,
        }
      );

      targets.forEach((target) => {
        // If element is already in viewport on load, reveal immediately
        const rect = target.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) {
          target.classList.add('is-revealed');
        } else {
          observer.observe(target);
        }
      });

      return () => {
        targets.forEach((target) => observer.unobserve(target));
      };
    };

    // Delay slightly to ensure DOM has rendered
    const timer = setTimeout(handleScrollAnimations, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
