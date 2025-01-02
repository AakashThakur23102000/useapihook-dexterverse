const throttlerInstances: { [key: string]: boolean } = {};

export function useApiHookThrottler(functionName: string, delay: number|null): boolean {
    if (typeof delay !== 'number' || delay <= 0) {
        return false; 
    }

    if (!throttlerInstances[functionName]) {
        throttlerInstances[functionName] = false; 
    }

    if (throttlerInstances[functionName]) {
        return true; 
    }

    throttlerInstances[functionName] = true;

    setTimeout(() => {
        throttlerInstances[functionName] = false; 
    }, delay);

    return false; 
}
