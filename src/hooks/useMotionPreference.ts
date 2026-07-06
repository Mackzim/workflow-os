import { useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { instant } from '@/lib/motion/motionPresets';

/**
 * Returns the given variants, or an instant (no-op) variant set when the user
 * prefers reduced motion. Central place so components stay declarative.
 */
export function useMotionVariants(variants: Variants): Variants {
  const reduced = useReducedMotion();
  return reduced ? instant : variants;
}
