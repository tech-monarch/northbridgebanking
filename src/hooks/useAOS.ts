import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export function useAOS(): void {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // spring-like ease-out
      once: true,
      offset: 48,
      delay: 0,
      anchorPlacement: 'top-bottom',
    });

    // Refresh on resize so positions recalculate correctly
    const onResize = () => AOS.refresh();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);
}
