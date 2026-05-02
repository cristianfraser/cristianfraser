import { useState, useEffect, useRef, useCallback } from 'react';
import { Popup, PopupPosition } from '../Popup/Popup';
import { InitialView } from './InitialView';
import { SuccessView } from './SuccessView';
import { BetterFeedbackView } from './BetterFeedbackView';
import { TrustpilotView } from './TrustpilotView';
import { submitFeedback } from '../../api/feedbackApi';
import { RatingType } from './types';
export { RatingType };

enum FeedbackState {
    Initial = 'initial',
    Success = 'success',
    BetterFeedback = 'better-feedback',
    Trustpilot = 'trustpilot',
}

const COLOR_SURFACE = '#2c2c2e';
const COLOR_SUCCESS = '#3b82f6';

const STATE_BACKGROUND: Record<FeedbackState, string> = {
    [FeedbackState.Initial]: COLOR_SURFACE,
    [FeedbackState.BetterFeedback]: COLOR_SURFACE,
    [FeedbackState.Trustpilot]: COLOR_SURFACE,
    [FeedbackState.Success]: COLOR_SUCCESS,
};

export const SUCCESS_DISMISS_MS = 2000;
const DEFAULT_VARIANT_EXIT_MS = 250;

/** Non-modal landmark for screen readers (Popup uses role="region"). */
const FEEDBACK_POPUP_ARIA_LABEL = 'Feature feedback';

type FeedbackPopupVariant = 'default' | 'multiple-popups';

interface FeedbackPopupProps {
    featureId: string;
    isShown: boolean;
    onClose: () => void;
    position?: PopupPosition;
    variant?: FeedbackPopupVariant;
}

export function FeedbackPopup({ featureId, isShown, onClose, position, variant = 'default' }: FeedbackPopupProps) {
    const [state, setState] = useState<FeedbackState>(FeedbackState.Initial);
    const [selectedRating, setSelectedRating] = useState<RatingType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const onCloseRef = useRef(onClose);
    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        return () => { if (successTimerRef.current !== null) clearTimeout(successTimerRef.current); };
    }, []);

    const handleSuccess = useCallback((nextView: FeedbackState | null) => {
        setState(FeedbackState.Success);
        if (successTimerRef.current !== null) clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => {
            successTimerRef.current = null;
            if (nextView !== null) {
                setState(nextView);
            } else {
                onCloseRef.current();
            }
        }, SUCCESS_DISMISS_MS);
    }, []);

    async function submitRating(rating: RatingType) {
        setIsLoading(true);
        try {
            await submitFeedback({ featureId, rating });
            handleSuccess(rating === RatingType.Stellar ? FeedbackState.Trustpilot : null);
        } catch {
            console.error('Error submitting feedback. Try again.');
        } finally {
            setIsLoading(false);
        }
    }

    function handleRating(rating: RatingType) {
        setSelectedRating(rating);
        if (rating === RatingType.Negative) {
            setState(FeedbackState.BetterFeedback);
        } else {
            submitRating(rating);
        }
    }

    const submitBetterFeedback = async (rating: RatingType, feedback: string) => {
        setIsLoading(true);
        try {
            await submitFeedback({ featureId, rating, feedback });
            handleSuccess(rating === RatingType.Stellar ? FeedbackState.Trustpilot : null);
        } catch {
            console.error('Error submitting feedback. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === 'multiple-popups') {
        return (
            <>
                <Popup
                    isShown={isShown && state === FeedbackState.Initial}
                    onClose={() => onCloseRef.current()}
                    position={position}
                    background={STATE_BACKGROUND[FeedbackState.Initial]}
                    name="initial"
                    ariaLabel={FEEDBACK_POPUP_ARIA_LABEL}
                >
                    <InitialView onRate={handleRating} isLoading={isLoading} />
                </Popup>
                <Popup
                    isShown={isShown && state === FeedbackState.BetterFeedback}
                    onClose={() => onCloseRef.current()}
                    position={position}
                    background={STATE_BACKGROUND[FeedbackState.BetterFeedback]}
                    name="better-feedback"
                    ariaLabel={FEEDBACK_POPUP_ARIA_LABEL}
                >
                    <BetterFeedbackView
                        onSubmit={(feedback) => submitBetterFeedback(selectedRating!, feedback)}
                        isLoading={isLoading}
                    />
                </Popup>
                <Popup
                    isShown={isShown && state === FeedbackState.Success}
                    position={position}
                    background={STATE_BACKGROUND[FeedbackState.Success]}
                    name="success"
                    ariaLabel={FEEDBACK_POPUP_ARIA_LABEL}
                >
                    <SuccessView />
                </Popup>
                <Popup
                    isShown={isShown && state === FeedbackState.Trustpilot}
                    onClose={() => onCloseRef.current()}
                    position={position}
                    background={STATE_BACKGROUND[FeedbackState.Trustpilot]}
                    name="trustpilot"
                    ariaLabel={FEEDBACK_POPUP_ARIA_LABEL}
                >
                    <TrustpilotView />
                </Popup>
            </>
        );
    }

    return (
        <Popup
            isShown={isShown}
            onClose={state === FeedbackState.Success ? undefined : onCloseRef.current}
            position={position}
            background={STATE_BACKGROUND[state]}
            exitDuration={DEFAULT_VARIANT_EXIT_MS}
            ariaLabel={FEEDBACK_POPUP_ARIA_LABEL}
        >
            {state === FeedbackState.Initial && (
                <InitialView onRate={handleRating} isLoading={isLoading} />
            )}
            {state === FeedbackState.Success && (
                <SuccessView />
            )}
            {state === FeedbackState.BetterFeedback && (
                <BetterFeedbackView
                    onSubmit={(feedback) => submitBetterFeedback(selectedRating!, feedback)}
                    isLoading={isLoading}
                />
            )}
            {state === FeedbackState.Trustpilot && (
                <TrustpilotView />
            )}
        </Popup>
    );
}
