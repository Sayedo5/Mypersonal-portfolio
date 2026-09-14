import React, { createContext, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContent } from '../content/ContentProvider';
import { useBodyScrollLock } from './useBodyScrollLock';

type HireContextValue = { open: () => void };
const HireContext = createContext<HireContextValue>({ open: () => {} });

export const useHireMe = () => useContext(HireContext);

const UpworkMark = () => <span className="hire-mark hire-mark-upwork" aria-hidden="true">u</span>;
const FiverrMark = () => <span className="hire-mark hire-mark-fiverr" aria-hidden="true">fi</span>;

export const HireMeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { site } = useContent();

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const goToContact = () => {
    setOpen(false);
    window.setTimeout(() => document.querySelector(site.contactCtaHref || '#contact')?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  return (
    <HireContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="hire-modal-backdrop"
            role="presentation"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
          >
            <motion.section
              role="dialog" aria-modal="true" aria-labelledby="hire-title"
              className="hire-modal"
              initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <button type="button" className="hire-close" aria-label="Close hire options" onClick={() => setOpen(false)}>×</button>
              <span className="label-mono text-gold">OPEN FOR COLLABORATION</span>
              <h2 id="hire-title" className="headline hire-title"><span className="headline-neutral">LET&apos;S WORK</span><span className="headline-gold">TOGETHER.</span></h2>
              <p className="hire-subtitle">Choose your preferred platform to hire me or view my official profiles.</p>
              <div className="hire-platforms">
                <motion.a className="hire-platform hire-upwork" href={site.hireUpworkUrl} target="_blank" rel="noopener noreferrer" whileHover={{ y: -4, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                  <UpworkMark /><span><small>FREELANCE PLATFORM</small><strong>Hire Me on Upwork</strong></span><b aria-hidden="true">↗</b>
                </motion.a>
                <motion.a className="hire-platform hire-fiverr" href={site.hireFiverrUrl} target="_blank" rel="noopener noreferrer" whileHover={{ y: -4, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                  <FiverrMark /><span><small>OFFICIAL PROFILE</small><strong>Hire Me on Fiverr</strong></span><b aria-hidden="true">↗</b>
                </motion.a>
              </div>
              {site.hireUpworkFallbackUrl && <a className="hire-fallback" href={site.hireUpworkFallbackUrl} target="_blank" rel="noopener noreferrer">View secondary Upwork profile ↗</a>}
              {site.hireContactFallback && <button type="button" className="hire-contact-link" onClick={goToContact}>Prefer email? Continue to the contact form <span aria-hidden="true">→</span></button>}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </HireContext.Provider>
  );
};

export default HireMeProvider;
