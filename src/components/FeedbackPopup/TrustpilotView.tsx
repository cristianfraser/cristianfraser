import { Button } from '../Button/Button';
import styles from './FeedbackPopup.module.css';

const TRUSTPILOT_URL = 'https://www.trustpilot.com/review/www.bunq.com';

export function TrustpilotView() {
    return (
        <div className={styles.panel}>
            <p className={styles.title}>Enjoying bunq?</p>
            <p className={styles.text}>
                Your feedback helps us improve!{' '}
                Please leave us a review on Trustpilot.
            </p>
            <Button href={TRUSTPILOT_URL} target="_blank" rel="noopener noreferrer" aria-label="Go to Trustpilot (opens in new tab)">
                Go to Trustpilot
            </Button>
        </div>
    );
}
