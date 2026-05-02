import { CSSProperties, ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import styles from './Popup.module.css';

export enum PopupPosition {
    TopRight = 'top-right',
    TopLeft = 'top-left',
    BottomLeft = 'bottom-left',
    BottomRight = 'bottom-right',
}

interface PopupProps {
    isShown: boolean;
    onClose?: () => void;
    position?: PopupPosition;
    background?: string;
    enterDuration?: number;
    exitDuration?: number;
    children: ReactNode;
    name?: string;
    /** Landmark label for lightweight overlays (role="region"); omit for modal dialog semantics. */
    ariaLabel?: string;
}

const ANIMATION_ENTER_DURATION_MS = 280;
export const ANIMATION_EXIT_DURATION_MS = 160;

const POSITION_CLASS: Record<PopupPosition, string> = {
    [PopupPosition.TopRight]: styles.topRight,
    [PopupPosition.TopLeft]: styles.topLeft,
    [PopupPosition.BottomRight]: styles.bottomRight,
    [PopupPosition.BottomLeft]: styles.bottomLeft,
};

function isTopPosition(pos: PopupPosition): boolean {
    return pos === PopupPosition.TopRight || pos === PopupPosition.TopLeft;
}

export function Popup({ isShown, onClose, position = PopupPosition.BottomRight, background, enterDuration, exitDuration, children, name, ariaLabel }: PopupProps) {
    const enterDurationMs = enterDuration ?? ANIMATION_ENTER_DURATION_MS;
    const exitDurationMs = exitDuration ?? ANIMATION_EXIT_DURATION_MS;
    const [shouldRender, setShouldRender] = useState(isShown);
    const [isExiting, setIsExiting] = useState(false);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const contentRef = useRef<HTMLDivElement>(null);
    const isExitingRef = useRef(false);
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelExit = useCallback(() => {
        if (exitTimerRef.current !== null) {
            clearTimeout(exitTimerRef.current);
            exitTimerRef.current = null;
        }
        isExitingRef.current = false;
    }, []);

    const startExit = useCallback((onComplete?: () => void) => {
        if (isExitingRef.current) return;
        isExitingRef.current = true;
        setIsExiting(true);
        exitTimerRef.current = setTimeout(() => {
            exitTimerRef.current = null;
            setShouldRender(false);
            setIsExiting(false);
            isExitingRef.current = false;
            onComplete?.();
        }, exitDurationMs);
    }, [exitDurationMs]);

    // Cancel any in-flight exit timer on unmount.
    useEffect(() => {
        return () => cancelExit();
    }, [cancelExit]);

    useEffect(() => {
        if (isShown) {
            cancelExit();
            setShouldRender(true);
            setIsExiting(false);
            setHeight(undefined);
        } else if (shouldRender) {
            startExit();
        }
    }, [isShown, shouldRender, startExit, cancelExit]);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
            setHeight(h);
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, [shouldRender]);

    if (!shouldRender) return null;

    const isTop = isTopPosition(position);
    const animClass = isExiting
        ? (isTop ? styles.exitTop : styles.exitBottom)
        : (isTop ? styles.enterTop : styles.enterBottom);

    const isMeasured = height !== undefined;

    return createPortal(
        <div
            className={cn(styles.container, POSITION_CLASS[position], animClass)}
            role={ariaLabel ? 'region' : 'dialog'}
            aria-label={ariaLabel}
            aria-modal={ariaLabel ? undefined : true}
            data-position={position}
            data-popup-name={name}
            style={{
                '--popup-enter-duration': `${enterDurationMs}ms`,
                '--popup-exit-duration': `${exitDurationMs}ms`,
                height: isMeasured ? height : undefined,
                overflow: isMeasured ? 'hidden' : 'unset',
                backgroundColor: background,
            } as CSSProperties}
        >
            {onClose && (
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => startExit(onClose)}
                    aria-label="Close"
                >
                    ✕
                </button>
            )}
            <div ref={contentRef} className={styles.content}>
                {children}
            </div>
        </div>,
        document.body
    );
}
