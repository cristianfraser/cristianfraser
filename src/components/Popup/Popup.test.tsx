import { render, screen, fireEvent, act } from '@testing-library/react';
import { Popup, PopupPosition, ANIMATION_EXIT_DURATION_MS } from './Popup';

describe('Popup', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => { act(() => { jest.runOnlyPendingTimers(); }); jest.useRealTimers(); });

    it('calls onClose after the exit animation when close button is clicked', () => {
        const handleClose = jest.fn();
        render(<Popup isShown={true} onClose={handleClose}><span>Content</span></Popup>);
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(handleClose).not.toHaveBeenCalled();
        act(() => { jest.advanceTimersByTime(ANIMATION_EXIT_DURATION_MS); });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose before the exit animation completes', () => {
        const handleClose = jest.fn();
        render(<Popup isShown={true} onClose={handleClose}><span>Content</span></Popup>);
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        act(() => { jest.advanceTimersByTime(ANIMATION_EXIT_DURATION_MS - 1); });
        expect(handleClose).not.toHaveBeenCalled();
    });

    it('applies the correct position', () => {
        render(<Popup isShown={true} position={PopupPosition.TopLeft}><span>Content</span></Popup>);
        expect(document.body.querySelector('[data-position="top-left"]')).toBeInTheDocument();
    });

    it('defaults to bottom-right position', () => {
        render(<Popup isShown={true}><span>Content</span></Popup>);
        expect(document.body.querySelector('[data-position="bottom-right"]')).toBeInTheDocument();
    });

    it('multiple popups can be shown simultaneously', () => {
        render(
            <>
                <Popup isShown={true}><span data-testid="popup-a">A</span></Popup>
                <Popup isShown={true}><span data-testid="popup-b">B</span></Popup>
            </>
        );
        expect(document.body.querySelector('[data-testid="popup-a"]')).toBeInTheDocument();
        expect(document.body.querySelector('[data-testid="popup-b"]')).toBeInTheDocument();
    });
});
