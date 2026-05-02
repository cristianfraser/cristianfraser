import { ReactNode } from 'react';
import styles from './DemoCard.module.css';

interface DemoCardProps {
    description: string;
    children: ReactNode;
}

export function DemoCard({ description, children }: DemoCardProps) {
    return (
        <div className={styles.card}>
            {children}
            <p className={styles.description}>{description}</p>
        </div>
    );
}
