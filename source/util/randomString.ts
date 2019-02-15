// TODO: Not a very secure source of random.
export function randomString(length: number, prefix: string): string {
    if (prefix.length >= length) {
        return prefix.slice(0, length);
    }
    const n = Math.floor(Math.abs(Math.random()) * 4294967295).toString(16);
    return randomString(length, prefix + n);
}