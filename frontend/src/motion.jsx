import { Fragment, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, useReducedMotion, useScroll, useTransform } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];

/** Rolls a number up once when it scrolls into view (React Bits "CountUp"). */
export function CountUp({ to, from = 0, decimals = 0, prefix = '', suffix = '', duration = 1.4, format = true }) {
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

  // Subscribe before setting the target so the first change is never missed.
  useEffect(() => spring.on('change', (n) => { if (ref.current) ref.current.textContent = render(n); }), [spring, decimals, prefix, suffix]);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { if (ref.current) ref.current.textContent = render(to); return; }
    value.set(to);
  }, [inView, to, reduce]);

  return <span ref={ref} className="tnum">{render(reduce ? to : from)}</span>;
}

/** Lifts content in once as it enters the viewport. Used sparingly, for section heads. */
export function Reveal({ children, delay = 0, y = 20, className, as = 'div', ...rest }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  );
}

export function Stagger({ children, className, gap = 0.07, as = 'div' }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </M>
  );
}

export const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
};

export function Item({ children, className, as = 'div', ...rest }) {
  const M = motion[as];
  return <M className={className} variants={itemVariants} {...rest}>{children}</M>;
}

/** Headline whose words rise out of a clipped line, one after another. */
export function Words({ text, delay = 0, className }) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="word-mask" aria-hidden="true">
            <motion.span
              style={{ display: 'inline-block' }}
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.06 }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}

/** Endless horizontal track (Aceternity "Infinite Moving Cards"). Pauses on hover, stops for reduced motion. */
export function Marquee({ children, speed = 40, className = '' }) {
  return (
    <div className={'marquee ' + className}>
      <div className="marquee-track" style={{ '--marquee-duration': `${speed}s` }}>
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

/** A product frame that tilts flat as it scrolls into place (Aceternity "Container Scroll"). */
export function ScrollTilt({ children, className }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.35'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.94, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 40, 0]);
  return (
    <div ref={ref} className={'tilt-stage ' + (className || '')}>
      <motion.div style={{ rotateX, scale, y, transformPerspective: 1400 }} className="tilt-frame">
        {children}
      </motion.div>
    </div>
  );
}

/** Vertical progress rail that fills as the reader scrolls through a sequence (Aceternity "Timeline"). */
export function ScrollRail({ targetRef }) {
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start 70%', 'end 60%'] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <div className="rail" aria-hidden="true">
      <motion.div className="rail-fill" style={{ scaleY }} />
    </div>
  );
}

export { motion };
