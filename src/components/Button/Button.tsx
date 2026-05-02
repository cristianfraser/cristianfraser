import { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import styles from './Button.module.css';

type ButtonVariant = 'default' | 'icon';

interface BaseProps {
    variant?: ButtonVariant;
    children: ReactNode;
    'aria-label'?: string;
}

interface ButtonAsButton extends BaseProps {
    href?: never;
    onClick?: () => void;
    disabled?: boolean;
}

interface ButtonAsAnchor extends BaseProps {
    href: string;
    target?: string;
    rel?: string;
    onClick?: never;
    disabled?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export function Button({ variant = 'default', children, ...props }: ButtonProps) {
    const className = cn(styles[variant]);

    if ('href' in props && props.href) {
        const { href, target, rel } = props;
        return (
            <a className={className} href={href} target={target} rel={rel} aria-label={props['aria-label']}>
                {children}
            </a>
        );
    }

    const { onClick, disabled } = props as ButtonAsButton;
    return (
        <button type="button" className={className} onClick={onClick} disabled={disabled} aria-label={props['aria-label']}>
            {children}
        </button>
    );
}
