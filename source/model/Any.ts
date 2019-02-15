/**
 * Various any-type utilities.
 */
export namespace Any {
    /**
     * Converts object into a canonical string representation, suitable for
     * being hashed.
     *
     * @param object Object to represent as canonical string.
     */
    export function canonicalStringOf(object: any): string {
        switch (typeof object) {
        case "function":
            return `"${object.constructor.name}()"`;

        case "object":
            if (object === null) {
                return "null";
            }
            if (Array.isArray(object)) {
                return "[" + object.map(item => canonicalStringOf(item)).join(",") + "]";
            }
            return "{" + Object.getOwnPropertyNames(object).sort().map(key => {
                const value = object[key];
                return value !== undefined
                    ? `"${key}":${canonicalStringOf(value)}`
                    : undefined;
            }).filter(entry => entry !== undefined).join(",") + "}";

        case "string":
            return `"${object}"`;

        case "undefined":
            return "undefined";

        default:
            return object.toString();
        }
    }

    /**
     * Creates deep copy of `object`, if `object` is an object type. Returns
     * `object` in any other case.
     *
     * @param object Object to clone.
     * @return Deep copy of `object`.
     */
    export function clone<T>(object: T): T {
        if (typeof object !== "object" || object === null) {
            return object;
        }
        if (Array.isArray(object)) {
            return object.slice() as any;
        }
        let copy: any = {};
        for (let name of Object.getOwnPropertyNames(object)) {
            copy[name] = clone((object as any)[name]);
        }
        return copy;
    }

    /**
     * Recursively determines if all data of `a` is present in `b`.
     *
     * If `a` or `b` is a non-object, they are tested for equality.
     *
     * @param a Object to be contained in `b`.
     * @param b Object to contain all fields and values of `a`.
     * @return Whether `b` contains all fields and values of `a`.
     */
    export function containedIn(a: any, b: any): boolean {
        if (a === b) {
            return true;
        }

        if (a && b && typeof a == 'object' && typeof b == 'object') {
            const aIsArray = Array.isArray(a);
            const bIsArray = Array.isArray(b);
            if (aIsArray && bIsArray) {
                if (a.length != b.length) {
                    return false;
                }
                for (let i = a.length; i-- !== 0;) {
                    if (!containedIn(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            }
            if (aIsArray != bIsArray) {
                return false;
            }

            var aKeys = Object.getOwnPropertyNames(a);
            for (let i = aKeys.length; i-- !== 0;) {
                const key = aKeys[i];
                if (!containedIn(a[key], b[key])) {
                    return false;
                }
            }
            return true;
        }

        return a !== a && b !== b;
    }

    /**
     * Recursively determines if `a` and `b` contain the same data.
     *
     * @param a First compared object.
     * @param b Second compared object.
     * @return Whether `a` and `b` are equal or not.
     */
    export function deepEqual(a: any, b: any): boolean {
        if (a === b) {
            return true;
        }

        if (a && b && typeof a == 'object' && typeof b == 'object') {
            const aIsArray = Array.isArray(a);
            const bIsArray = Array.isArray(b);
            if (aIsArray && bIsArray) {
                if (a.length != b.length) {
                    return false;
                }
                for (let i = a.length; i-- !== 0;) {
                    if (!deepEqual(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            }
            if (aIsArray != bIsArray) {
                return false;
            }

            var aKeys = Object.getOwnPropertyNames(a);
            if (aKeys.length !== Object.getOwnPropertyNames(b).length) {
                return false;
            }
            for (let i = aKeys.length; i-- !== 0;) {
                const key = aKeys[i];
                if (!deepEqual(a[key], b[key])) {
                    return false;
                }
            }
            return true;
        }

        return a !== a && b !== b;
    }

    export function mapIfNotEmpty<T, U>(v: T | undefined, f: (v: T) => U): U | undefined {
        return v === undefined
            ? undefined
            : f(v);
    }
}