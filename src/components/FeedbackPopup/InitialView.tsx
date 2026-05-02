import { Button } from '../Button/Button';
import { RatingType } from './types';
import styles from './FeedbackPopup.module.css';

interface InitialViewProps {
    onRate: (rating: RatingType) => void;
    isLoading: boolean;
}

export function InitialView({ onRate, isLoading }: InitialViewProps) {
    return (
        <div className={styles.panel}>
            <p className={styles.title}>How would you rate this feature?</p>
            <div className={styles.ratings}>
                <Button variant="icon" onClick={() => onRate(RatingType.Negative)} disabled={isLoading} aria-label="Negative">👎</Button>
                <Button variant="icon" onClick={() => onRate(RatingType.Positive)} disabled={isLoading} aria-label="Positive">👍</Button>
                <Button variant="icon" onClick={() => onRate(RatingType.Stellar)} disabled={isLoading} aria-label="Stellar">😁</Button>
            </div>
        </div>
    );
}
