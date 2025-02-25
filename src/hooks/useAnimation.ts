import { useCallback, useState } from "react"
import { interpolate } from "../animation"
import { bind, flipRatio } from "../math"
import useAnimationFrame, { AnimationFrameService } from "./useAnimationFrame"

export const timingMap = {
  linear: (x: number) => x,
  ease: (x: number) => Math.pow(x, 3),
  easeIn: (x: number) => Math.pow(x, 2),
  easeOut: (x: number) => 1 - Math.pow(1 - x, 3),
  easeInOut: (x: number) => x < 0.5 ? 2 * Math.pow(x, 2) : 1 - Math.pow(-2 * x + 2, 2) / 2,
  bounce: (x: number) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (x < 1 / d1) {
      return n1 * x * x
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375
    }
  },
  elastic: (x: number) => Math.pow(2, 10 * (x - 1)) * Math.cos(20 * Math.PI * x / 3 * x),
  back: (x: number) => Math.pow(x, 2) * ((x + 1) * x - x),
}

export interface UseAnimationOptions<From, To> {
  /** Initial value to interpolate. */
  from: From
  /** Final value to interpolate. */
  to: To
  /** Delay before the first animation in cycle. */
  delay?: number
  /** Duration of the animation in cycle */
  duration: number
  /** Interval between each animation in cycle. */
  interval?: number
  /** Target count of animation cycles. Defaults to Infinity. */
  maxCount?: number
  /** Alternate animation and reversed animation */
  alternate?: unknown
  /** Start the animation reversed. */
  reverse?: unknown
  /** On value update. */
  handle?: (value: ReturnType<typeof interpolate<From, To>>, animation: AnimationService<From, To>) => void
  /** Time density map. */
  timing?: keyof typeof timingMap | ((x: number) => number)
}

export interface AnimationService<From, To> extends NonNullable<Exclude<Readonly<UseAnimationOptions<From, To>>, "handle">>, AnimationFrameService {
  cycleCount: number
  value: ReturnType<typeof interpolate<From, To>>
}

export function useAnimation<From, To>({ from, to, delay, duration, interval, timing, maxCount, alternate, reverse, handle }: UseAnimationOptions<From, To>) {
  delay = bind(delay || 0, 0)
  interval = bind(interval || 0, 0)
  maxCount = bind(maxCount !== undefined ? maxCount : 1, 0)
  alternate = !!alternate
  reverse = !!reverse

  const timingFn = typeof timing === "function" ? timing : timing && timingMap[timing] || timingMap.linear
  const cycleDuration = duration + interval
  const [value, setValue] = useState(interpolate(from, to, 0))
  const [count, setCount] = useState(0)

  const service = {
    from, to, delay, duration, interval, timing, maxCount, alternate, reverse,
    cycleCount: count,
    value,
  } as AnimationService<From, To>
  const { cancel, reset } = useAnimationFrame(useCallback(time => {
    const cycle = bind((time - delay) / cycleDuration, 0, maxCount)
    const cycleCount = Math.floor(cycle)
    setCount(cycleCount)
    if (cycle >= maxCount) cancel()

    const isReverse = !!(alternate && cycleCount % 2) !== reverse
    const cycleTime = cycle - cycleCount + (cycle >= maxCount ? 1 : 0)
    const animationTime = bind(cycleTime / duration * cycleDuration, 0, 1)
    const animationRatio = flipRatio(timingFn(animationTime), isReverse)
    const newValue = interpolate(from, to, animationRatio)
    handle && handle(newValue, service)
    setValue(newValue)
  }, [from, to, duration, cycleDuration, delay, handle, value, maxCount, timingFn, alternate, reverse, service]))

  service.cancel = cancel
  service.reset = reset

  return { value, count, reset }
}
