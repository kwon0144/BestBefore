'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

function FrozenRouter(props: { children: React.ReactNode }) {
    const context = useContext(LayoutRouterContext ?? {});
    const frozen = useRef(context).current;
  
    if (!frozen) {
      return <>{props.children}</>;
    }
  
    return (
      <LayoutRouterContext.Provider value={frozen}>
        {props.children}
      </LayoutRouterContext.Provider>
    );
  }

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();
    const animate = (variants: any) => {
        return {
            initial: "initial",
            animate: "enter",
            exit: "exit",
            variants: variants
        }
    }

    const opacity = {
        initial: { opacity: 0 },
        enter: { opacity: 1, transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } },
        exit: { opacity: 1 }
    };

    const slide = {
        initial: { y: "100vh" },
        enter: { y: "100vh" },
        exit: { y: "0vh", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }
    }

    const perspective = {
        initial: { opacity: 1},
        enter: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }
    }

    return (
        <div className="relative">
            <AnimatePresence initial={false}>
                <motion.div
                    key={pathname}
                    {...animate(slide)}
                    className="fixed inset-0 bg-background z-50 w-full h-full"
                />
            </AnimatePresence>
            <AnimatePresence 
                mode="wait"
                onExitComplete={() => window.scrollTo(0, 0)}
            >
                <motion.div
                    key={pathname}
                    {...animate(opacity)}
                >
                    <motion.div
                        key={pathname}
                        {...animate(perspective)}
                    >
                        <div className="relative">
                            <FrozenRouter>{children}</FrozenRouter>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
            
        </div>
    );
}