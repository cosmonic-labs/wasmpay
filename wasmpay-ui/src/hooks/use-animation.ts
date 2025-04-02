"use client"

import { useState, useEffect } from "react"
import { useSpring } from "framer-motion"

export function useCountAnimation(targetValue: number, duration = 1000) {
  const [displayValue, setDisplayValue] = useState(0)
  const spring = useSpring(0, { stiffness: 100, damping: 30 })

  useEffect(() => {
    spring.set(targetValue)

    const unsubscribe = spring.onChange((value) => {
      setDisplayValue(Math.round(value * 100) / 100)
    })

    return () => unsubscribe()
  }, [targetValue, spring])

  return displayValue
}

