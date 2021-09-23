export const ArrayUtils = {
    chunk: <T>(arr: T[], slices: number): T[][] => [
        arr.slice(0, slices),
        ...(arr.length - slices > 0
            ? ArrayUtils.chunk(arr.slice(slices), slices)
            : []),
    ],
    shuffle: <T>(arr: T[]): T[] => arr.sort((a, b) => Math.random() - 0.5),
    random: <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)],
};
