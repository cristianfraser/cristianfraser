import styles from './FeedbackPopup.module.css';

export function SuccessView() {
    return (
        <div className={styles.success} role="status" aria-live="polite">
            <span className={styles.checkmark} aria-hidden="true">✓</span>
            <p className={styles.successText}>Thanks for your feedback!</p>
        </div>
    );
}
