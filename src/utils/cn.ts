type ClassArg = string | false | null | undefined;

export function cn(...args: ClassArg[]): string {
    return args.filter(Boolean).join(' ');
}
