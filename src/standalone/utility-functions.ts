/**
 * Checks if the code is running in a browser by checking the existance of the window object.
 * @returns boolean
 */
export function isBrowser() {
    if (typeof window !== 'undefined') {
        return true;
    } else {
        return false;
    }
}
