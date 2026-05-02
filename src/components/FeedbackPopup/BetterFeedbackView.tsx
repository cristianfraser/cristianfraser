import { useState } from 'react';
import { Button } from '../Button/Button';
import styles from './FeedbackPopup.module.css';

export const BETTER_FEEDBACK_MIN_LENGTH = 1;

interface BetterFeedbackViewProps {
    onSubmit: (feedback: string) => void;
    isLoading: boolean;
}

export function BetterFeedbackView({ onSubmit, isLoading }: BetterFeedbackViewProps) {
    const [text, setText] = useState('');

    return (
        <div className={styles.panel}>
            <p className={styles.title}>How can we make things better?</p>
            <textarea
                className={styles.textarea}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                aria-label="How can we make things better?"
            />
            <Button
                onClick={() => onSubmit(text)}
                disabled={text.length < BETTER_FEEDBACK_MIN_LENGTH || isLoading}
            >
                Submit
            </Button>
        </div>
    );
}
