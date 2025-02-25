export const bind = (value: number, min: number, max = Infinity) => value <= min ? min : value >= max ? max : value
export const flipRatio = (ratio: number, flip?: boolean) => flip ? 1 - ratio : ratio
export const map = (value: number, fromStart: number, fromEnd: number, toStart: number, toEnd: number) => (value - fromStart) / (fromEnd - fromStart) * (toEnd - toStart) + toStart
