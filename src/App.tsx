import { useState } from 'react';
import { Button } from './components/Button/Button';
import { DemoCard } from './components/DemoCard/DemoCard';
import { FeedbackPopup } from './components/FeedbackPopup/FeedbackPopup';
import { PopupPosition } from './components/Popup/Popup';
import './styles.css';

export default function App() {
    const [isDefaultOpen, setIsDefaultOpen] = useState(false);
    const [isMultiOpen, setIsMultiOpen] = useState(false);
    const [defaultSessionKey, setDefaultSessionKey] = useState(0);
    const [multiSessionKey, setMultiSessionKey] = useState(0);

    return (
        <div className="App">
            <DemoCard description="A single popup that changes its content for each step.">
                <Button
                    onClick={() => {
                        setDefaultSessionKey((k) => k + 1);
                        setIsDefaultOpen(true);
                    }}
                    disabled={isDefaultOpen}
                >
                    Rate this feature
                </Button>
            </DemoCard>
            <DemoCard description="Each step is a different popup.">
                <Button
                    onClick={() => {
                        setMultiSessionKey((k) => k + 1);
                        setIsMultiOpen(true);
                    }}
                    disabled={isMultiOpen}
                >
                    Rate this feature (multi)
                </Button>
            </DemoCard>
            <FeedbackPopup
                key={`default-${defaultSessionKey}`}
                featureId="demo-feedback-single-popup"
                isShown={isDefaultOpen}
                onClose={() => setIsDefaultOpen(false)}
                position={PopupPosition.BottomLeft}
            />
            <FeedbackPopup
                key={`multi-${multiSessionKey}`}
                featureId="demo-feedback-multi-popup"
                isShown={isMultiOpen}
                onClose={() => setIsMultiOpen(false)}
                position={PopupPosition.BottomRight}
                variant="multiple-popups"
            />
        </div>
    );
}
