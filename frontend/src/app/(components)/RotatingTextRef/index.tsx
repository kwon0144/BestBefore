/**
 * RotatingTextRef Component
 * 
 * This component provides an animated text rotation system with:
 * - Character-by-character animation
 * - Customizable animation properties
 * - Automatic and manual rotation control
 * - Staggered animations
 * - Accessibility support
 * - Multiple text splitting options
 */
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
  } from "react";
  import {
    motion,
    AnimatePresence,
    Transition,
    type VariantLabels,
    type Target,
    type AnimationControls,
    type TargetAndTransition,
  } from "framer-motion";
  
/**
 * Utility function to combine class names
 * 
 * @param {...(string | undefined | null | boolean)} classes - Class names to combine
 * @returns {string} Combined class names string
 */
function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes.filter(Boolean).join(" ");
}
  
/**
 * Interface for the rotating text component's ref methods
 */
export interface RotatingTextRef {
    /** Move to the next text in the sequence */
    next: () => void;
    /** Move to the previous text in the sequence */
    previous: () => void;
    /** Jump to a specific text index */
    jumpTo: (index: number) => void;
    /** Reset to the first text */
    reset: () => void;
}
  
/**
 * Props interface for the RotatingText component
 * Extends motion.span props with additional configuration options
 */
export interface RotatingTextProps
    extends Omit<
      React.ComponentPropsWithoutRef<typeof motion.span>,
      "children" | "transition" | "initial" | "animate" | "exit"
    > {
    /** Array of texts to rotate through */
    texts: string[];
    /** Animation transition configuration */
    transition?: Transition;
    /** Initial animation state */
    initial?: boolean | Target | VariantLabels;
    /** Animation state */
    animate?: boolean | VariantLabels | AnimationControls | TargetAndTransition;
    /** Exit animation state */
    exit?: Target | VariantLabels;
    /** AnimatePresence mode */
    animatePresenceMode?: "sync" | "wait";
    /** Whether to show initial animation */
    animatePresenceInitial?: boolean;
    /** Interval between rotations in milliseconds */
    rotationInterval?: number;
    /** Duration of stagger effect */
    staggerDuration?: number;
    /** Direction of stagger effect */
    staggerFrom?: "first" | "last" | "center" | "random" | number;
    /** Whether to loop through texts */
    loop?: boolean;
    /** Whether to auto-rotate */
    auto?: boolean;
    /** How to split the text for animation */
    splitBy?: string;
    /** Callback when text changes */
    onNext?: (index: number) => void;
    /** Main container class name */
    mainClassName?: string;
    /** Split level class name */
    splitLevelClassName?: string;
    /** Element level class name */
    elementLevelClassName?: string;
}

/**
 * Component that renders animated rotating text with various effects
 * 
 * @param {RotatingTextProps} props - Component properties
 * @param {React.Ref<RotatingTextRef>} ref - Forwarded ref for controlling the component
 * @returns {JSX.Element} Rendered animated text component
 */
const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
    (
      {
        texts,
        transition = { type: "spring", damping: 25, stiffness: 300 },
        initial = { y: "100%", opacity: 0 },
        animate = { y: 0, opacity: 1 },
        exit = { y: "-120%", opacity: 0 },
        animatePresenceMode = "wait",
        animatePresenceInitial = false,
        rotationInterval = 2000,
        staggerDuration = 0,
        staggerFrom = "first",
        loop = true,
        auto = true,
        splitBy = "characters",
        onNext,
        mainClassName,
        splitLevelClassName,
        elementLevelClassName,
        ...rest
      },
      ref
    ) => {
      const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  
      const splitIntoCharacters = (text: string): string[] => {
        if (typeof Intl !== "undefined" && Intl.Segmenter) {
          const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
          return Array.from(
            segmenter.segment(text),
            (segment) => segment.segment
          );
        }
        return Array.from(text);
      };
  
      const elements = useMemo(() => {
        const currentText: string = texts[currentTextIndex];
        if (splitBy === "characters") {
          const words = currentText.split(" ");
          return words.map((word, i) => ({
            characters: splitIntoCharacters(word),
            needsSpace: i !== words.length - 1,
          }));
        }
        if (splitBy === "words") {
          return currentText.split(" ").map((word, i, arr) => ({
            characters: [word],
            needsSpace: i !== arr.length - 1,
          }));
        }
        if (splitBy === "lines") {
          return currentText.split("\n").map((line, i, arr) => ({
            characters: [line],
            needsSpace: i !== arr.length - 1,
          }));
        }
  
        return currentText.split(splitBy).map((part, i, arr) => ({
          characters: [part],
          needsSpace: i !== arr.length - 1,
        }));
      }, [texts, currentTextIndex, splitBy]);
  
      const getStaggerDelay = useCallback(
        (index: number, totalChars: number): number => {
          const total = totalChars;
          if (staggerFrom === "first") return index * staggerDuration;
          if (staggerFrom === "last")
            return (total - 1 - index) * staggerDuration;
          if (staggerFrom === "center") {
            const center = Math.floor(total / 2);
            return Math.abs(center - index) * staggerDuration;
          }
          if (staggerFrom === "random") {
            const randomIndex = Math.floor(Math.random() * total);
            return Math.abs(randomIndex - index) * staggerDuration;
          }
          return Math.abs((staggerFrom as number) - index) * staggerDuration;
        },
        [staggerFrom, staggerDuration]
      );
  
      const handleIndexChange = useCallback(
        (newIndex: number) => {
          setCurrentTextIndex(newIndex);
          if (onNext) onNext(newIndex);
        },
        [onNext]
      );
  
      const next = useCallback(() => {
        const nextIndex =
          currentTextIndex === texts.length - 1
            ? loop
              ? 0
              : currentTextIndex
            : currentTextIndex + 1;
        if (nextIndex !== currentTextIndex) {
          handleIndexChange(nextIndex);
        }
      }, [currentTextIndex, texts.length, loop, handleIndexChange]);
  
      const previous = useCallback(() => {
        const prevIndex =
          currentTextIndex === 0
            ? loop
              ? texts.length - 1
              : currentTextIndex
            : currentTextIndex - 1;
        if (prevIndex !== currentTextIndex) {
          handleIndexChange(prevIndex);
        }
      }, [currentTextIndex, texts.length, loop, handleIndexChange]);
  
      const jumpTo = useCallback(
        (index: number) => {
          const validIndex = Math.max(0, Math.min(index, texts.length - 1));
          if (validIndex !== currentTextIndex) {
            handleIndexChange(validIndex);
          }
        },
        [texts.length, currentTextIndex, handleIndexChange]
      );
  
      const reset = useCallback(() => {
        if (currentTextIndex !== 0) {
          handleIndexChange(0);
        }
      }, [currentTextIndex, handleIndexChange]);
  
      useImperativeHandle(
        ref,
        () => ({
          next,
          previous,
          jumpTo,
          reset,
        }),
        [next, previous, jumpTo, reset]
      );
  
      useEffect(() => {
        if (!auto) return;
        const intervalId = setInterval(next, rotationInterval);
        return () => clearInterval(intervalId);
      }, [next, rotationInterval, auto]);
  
      return (
        <motion.span
          className={cn(
            "flex flex-wrap whitespace-pre-wrap relative",
            mainClassName
          )}
          {...rest}
          layout
          transition={transition}
        >
          <span className="sr-only">{texts[currentTextIndex]}</span>
          <AnimatePresence
            mode={animatePresenceMode}
            initial={animatePresenceInitial}
          >
            <motion.div
              key={currentTextIndex}
              className={cn(
                splitBy === "lines"
                  ? "flex flex-col w-full"
                  : "flex flex-wrap whitespace-pre-wrap relative"
              )}
              layout
              aria-hidden="true"
            >
              {elements.map((wordObj, wordIndex, array) => {
                const previousCharsCount = array
                  .slice(0, wordIndex)
                  .reduce((sum, word) => sum + word.characters.length, 0);
                return (
                  <span
                    key={wordIndex}
                    className={cn("inline-flex", splitLevelClassName)}
                  >
                    {wordObj.characters.map((char, charIndex) => (
                      <motion.span
                        key={charIndex}
                        initial={initial}
                        animate={animate}
                        exit={exit}
                        transition={{
                          ...transition,
                          delay: getStaggerDelay(
                            previousCharsCount + charIndex,
                            array.reduce(
                              (sum, word) => sum + word.characters.length,
                              0
                            )
                          ),
                        }}
                        className={cn("inline-block", elementLevelClassName)}
                      >
                        {char}
                      </motion.span>
                    ))}
                    {wordObj.needsSpace && (
                      <span className="whitespace-pre"> </span>
                    )}
                  </span>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.span>
      );
    }
  );
  
  RotatingText.displayName = "RotatingText";
  export default RotatingText;
  