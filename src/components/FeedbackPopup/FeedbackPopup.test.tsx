import type { ComponentProps, Key } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FeedbackPopup, SUCCESS_DISMISS_MS } from './FeedbackPopup';
import { BETTER_FEEDBACK_MIN_LENGTH } from './BetterFeedbackView';
import { ANIMATION_EXIT_DURATION_MS } from '../Popup/Popup';
import { submitFeedback } from '../../api/feedbackApi';

jest.mock('../../api/feedbackApi');
const mockSubmit = submitFeedback as jest.MockedFunction<typeof submitFeedback>;

type FeedbackPopupRenderOverrides = Partial<ComponentProps<typeof FeedbackPopup>> & {
    key?: Key;
};

describe('FeedbackPopup', () => {
    const onClose = jest.fn();

    function feedbackPopupElement(overrides: FeedbackPopupRenderOverrides = {}) {
        const { key, ...props } = overrides;
        return (
            <FeedbackPopup
                key={key}
                featureId="test-feature"
                isShown={true}
                onClose={onClose}
                {...props}
            />
        );
    }

    function renderFeedbackPopup(overrides: FeedbackPopupRenderOverrides = {}) {
        return render(feedbackPopupElement(overrides));
    }

    beforeEach(() => {
        jest.useFakeTimers();
        onClose.mockClear();
        mockSubmit.mockResolvedValue(undefined);
    });

    afterEach(() => {
        act(() => { jest.runOnlyPendingTimers(); });
        jest.useRealTimers();
    });

    // ── Rating buttons ───────────────────────────────────────────

    it('shows success view after clicking Positive', async () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Positive' }));
        await act(async () => {});
        expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
    });

    it('shows success view after clicking Stellar', async () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Stellar' }));
        await act(async () => {});
        expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
    });

    it('shows better-feedback view immediately after clicking Negative', () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Negative' }));
        expect(screen.getByText('How can we make things better?')).toBeInTheDocument();
    });

    it('disables rating buttons while API is pending', () => {
        mockSubmit.mockImplementation(() => new Promise(() => {})); // never resolves
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Positive' }));
        expect(screen.getByRole('button', { name: 'Positive' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Stellar' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Negative' })).toBeDisabled();
    });

    // ── Better-feedback flow ─────────────────────────────────────

    it('shows success view after submitting better feedback', async () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Negative' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'needs improvement' } });
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        await act(async () => {});
        expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
    });

    it('submit button is disabled when text is below minimum length', () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Negative' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x'.repeat(BETTER_FEEDBACK_MIN_LENGTH - 1) } });
        expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    });

    it('submit button is enabled once minimum length is reached', () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Negative' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x'.repeat(BETTER_FEEDBACK_MIN_LENGTH) } });
        expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    });

    it('disables submit button while API is pending', () => {
        mockSubmit.mockImplementation(() => new Promise(() => {}));
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Negative' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'needs improvement' } });
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    });

    // ── Success state ────────────────────────────────────────────

    it('hides the close button in success state', async () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Positive' }));
        await act(async () => {});
        expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    });

    it('auto-dismisses and calls onClose after success for Positive', async () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Positive' }));
        await act(async () => {});
        act(() => { jest.advanceTimersByTime(SUCCESS_DISMISS_MS); });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('auto-dismisses and calls onClose after success for Negative → submit', async () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Negative' }));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'needs improvement' } });
        fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        await act(async () => {});
        act(() => { jest.advanceTimersByTime(SUCCESS_DISMISS_MS); });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose before success dismiss timer fires', async () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Positive' }));
        await act(async () => {});
        act(() => { jest.advanceTimersByTime(SUCCESS_DISMISS_MS - 1); });
        expect(onClose).not.toHaveBeenCalled();
    });

    // ── Stellar → Trustpilot flow ────────────────────────────────

    it('shows trustpilot view after success auto-dismisses for Stellar', async () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Stellar' }));
        await act(async () => {});
        act(() => { jest.advanceTimersByTime(SUCCESS_DISMISS_MS); });
        expect(screen.getByText('Enjoying bunq?')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('trustpilot view has a link that opens in a new tab', async () => {
        renderFeedbackPopup();
        fireEvent.click(screen.getByRole('button', { name: 'Stellar' }));
        await act(async () => {});
        act(() => { jest.advanceTimersByTime(SUCCESS_DISMISS_MS); });
        const link = screen.getByRole('link', { name: 'Go to Trustpilot (opens in new tab)' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    // ── State reset ──────────────────────────────────────────────

    it('resets to initial state when reopened', async () => {
        const { rerender } = renderFeedbackPopup({ key: 'session-a' });
        fireEvent.click(screen.getByRole('button', { name: 'Positive' }));
        await act(async () => {});

        rerender(feedbackPopupElement({ key: 'session-a', isShown: false }));
        rerender(feedbackPopupElement({ key: 'session-b' }));

        expect(screen.getByText('How would you rate this feature?')).toBeInTheDocument();
    });

    describe('multiple-popups variant', () => {
        it('shows only the initial popup first', () => {
            renderFeedbackPopup({ variant: 'multiple-popups' });
            expect(document.querySelector('[data-popup-name="initial"]')).toBeInTheDocument();
            expect(document.querySelector('[data-popup-name="better-feedback"]')).toBeNull();
            expect(document.querySelector('[data-popup-name="success"]')).toBeNull();
        });

        it('swaps to the better-feedback popup after Negative', () => {
            renderFeedbackPopup({ variant: 'multiple-popups' });
            fireEvent.click(screen.getByRole('button', { name: 'Negative' }));
            expect(screen.getByText('How can we make things better?')).toBeInTheDocument();
            expect(document.querySelector('[data-popup-name="better-feedback"]')).toBeInTheDocument();
            act(() => { jest.advanceTimersByTime(ANIMATION_EXIT_DURATION_MS); });
            expect(document.querySelector('[data-popup-name="initial"]')).toBeNull();
        });

        it('shows the success popup after Positive', async () => {
            renderFeedbackPopup({ variant: 'multiple-popups' });
            fireEvent.click(screen.getByRole('button', { name: 'Positive' }));
            await act(async () => {});
            expect(document.querySelector('[data-popup-name="success"]')).toBeInTheDocument();
            expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
            act(() => { jest.advanceTimersByTime(ANIMATION_EXIT_DURATION_MS); });
            expect(document.querySelector('[data-popup-name="initial"]')).toBeNull();
        });

        it('shows Trustpilot popup after success dismiss for Stellar', async () => {
            renderFeedbackPopup({ variant: 'multiple-popups' });
            fireEvent.click(screen.getByRole('button', { name: 'Stellar' }));
            await act(async () => {});
            act(() => { jest.advanceTimersByTime(SUCCESS_DISMISS_MS); });
            expect(document.querySelector('[data-popup-name="trustpilot"]')).toBeInTheDocument();
            expect(screen.getByText('Enjoying bunq?')).toBeInTheDocument();
        });
    });
});
