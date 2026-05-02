import type { ComponentProps, ReactNode } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Popup, PopupPosition, ANIMATION_EXIT_DURATION_MS } from './Popup';

describe('Popup', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => { act(() => { jest.runOnlyPendingTimers(); }); jest.useRealTimers(); });

    function popupElement(
        overrides: Partial<ComponentProps<typeof Popup>> & { children?: ReactNode } = {},
    ) {
        const { children = <span>Content</span>, ...props } = overrides;
        return (
            <Popup isShown={true} {...props}>
                {children}
            </Popup>
        );
    }

    function renderPopup(overrides: Parameters<typeof popupElement>[0] = {}) {
        return render(popupElement(overrides));
    }

    it('calls onClose after the exit animation when close button is clicked', () => {
        const handleClose = jest.fn();
        renderPopup({ onClose: handleClose });
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(handleClose).not.toHaveBeenCalled();
        act(() => { jest.advanceTimersByTime(ANIMATION_EXIT_DURATION_MS); });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose before the exit animation completes', () => {
        const handleClose = jest.fn();
        renderPopup({ onClose: handleClose });
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        act(() => { jest.advanceTimersByTime(ANIMATION_EXIT_DURATION_MS - 1); });
        expect(handleClose).not.toHaveBeenCalled();
    });

    it('applies the correct position', () => {
        renderPopup({ position: PopupPosition.TopLeft });
        expect(document.body.querySelector('[data-position="top-left"]')).toBeInTheDocument();
    });

    it('defaults to bottom-right position', () => {
        renderPopup();
        expect(document.body.querySelector('[data-position="bottom-right"]')).toBeInTheDocument();
    });

    it('multiple popups can be shown simultaneously', () => {
        render(
            <>
                {popupElement({ children: <span data-testid="popup-a">A</span> })}
                {popupElement({ children: <span data-testid="popup-b">B</span> })}
            </>,
        );
        expect(document.body.querySelector('[data-testid="popup-a"]')).toBeInTheDocument();
        expect(document.body.querySelector('[data-testid="popup-b"]')).toBeInTheDocument();
    });
});
