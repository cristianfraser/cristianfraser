const MOCK_DELAY_MS = 900;
const MOCK_FAILURE_RATE = 0.04;

export interface FeedbackPayload {
    featureId: string;
    rating: string;
    feedback?: string;
}

export function submitFeedback(payload: FeedbackPayload): Promise<void> {
    console.info('Submitting feedback:', payload.featureId, payload);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < MOCK_FAILURE_RATE) {
                reject(new Error('Network error'));
            } else {
                resolve();
            }
        }, MOCK_DELAY_MS);
    });
}
