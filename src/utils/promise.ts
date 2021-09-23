export const PromiseUtils = {
    awaitFn: <R>(fn: () => Promise<R>) => PromiseUtils.await(fn()),
    async await<R>(promise: Promise<R>): Promise<[undefined, R] | [any]> {
        try {
            return [undefined, await promise];
        } catch (err) {
            return [err];
        }
    },
};
