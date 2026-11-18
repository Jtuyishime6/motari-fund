import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/** Counts from `from` to `to` once, when scrolled into view. */
export function CountUp({ to, from = 0, decimals = 0, prefix = '', suffix = '', duration = 1.6, format = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const value = useMotionValue(from);
  const spring = useSpring(value, { duration: duration * 1000, bounce: 0 });

  const render = (n) => {
    const fixed = Number(n).toFixed(decimals);
    const shown = format ? Number(fixed).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : fixed;
    return `${prefix}${shown}${suffix}`;
  };

  useEffect(() => {
    if (!inView) return;
    if (reduce) { if (ref.current) ref.current.textContent = render(to); return; }
    value.set(to);
  }, [inView, to]);

  useEffect(() => spring.on('change', (n) => { if (ref.current) ref.current.textContent = render(n); }), [spring, decimals, prefix, suffix]);

  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>{render(from)}</span>;
}

/** Fades and lifts its children in when they enter the viewport. */
export function Reveal({ children, delay = 0, y = 24, className, as = 'div' }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/** Container that staggers `Item` children. */
export function Stagger({ children, className, gap = 0.08 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
};

export function Item({ children, className, as = 'div', ...rest }) {
  const M = motion[as];
  return <M className={className} variants={itemVariants} {...rest}>{children}</M>;
}

/** Headline that reveals word by word with a soft blur. */
export function SplitText({ text, className, accent }) {
  const words = text.split(' ');
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          className={accent?.includes(i) ? 'accent' : undefined}
          variants={{
            hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
            show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } }
          }}
        >
          {w + (i < words.length - 1 ? ' ' : '')}
        </motion.span>
      ))}
    </motion.span>
  );
}

export { motion, EASE };
