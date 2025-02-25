import { useCallback, useEffect, useRef, useState } from "react"

export interface AnimationFrameService {
  cancel: () => void
  reset: () => void
}

export interface AnimationFrameOptions {
  callback: (timeElapsed: number, service: AnimationFrameService) => void
}

/**
 * Hook that provides an animation frame with a time elapsed in seconds since mount.
 * @param callback Function to execute on each animation frame. Return true to pause animation until state change.
 * @returns Function to cancel animation frame.
 */
export function useAnimationFrame(callback: (timeElapsed: number, service: AnimationFrameService) => void) {
  const done = useRef(false)
  const [startedAt, setStartedAt] = useState(performance.now() / 1000)

  const service = {
    startedAt,
    done: done.current,
    cancel: () => done.current = true,
    reset: () => {
      done.current = false
      setStartedAt(performance.now() / 1000)
    },
  }

  const animate = useCallback(function animate(elapsedTime: number) {
    elapsedTime /= 1000
    elapsedTime -= startedAt
    callback(elapsedTime, service)
    if (done.current) return
    requestAnimationFrame(animate)
  }, [done.current, startedAt])

  useEffect(() => {
    if (done.current) return
    const animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [done.current, animate])

  return service
}

export default useAnimationFrame
