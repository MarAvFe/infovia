'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { hasRecentReport, markReported } from '@/lib/gate'

const SubmitForm = dynamic(() => import('@/components/SubmitForm'), { ssr: false })
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

const STALE_MS = 10 * 60 * 1000

export default function Home() {
  const [showMap, setShowMap] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setShowMap(hasRecentReport())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showMap) return
    const remaining = STALE_MS - (Date.now() - parseInt(localStorage.getItem('raincheck_last_report') || '0', 10))
    const timer = setTimeout(() => setShowMap(false), Math.max(0, remaining))
    return () => clearTimeout(timer)
  }, [showMap])

  if (!mounted) return null

  return showMap ? (
    <MapView />
  ) : (
    <SubmitForm
      onSuccess={() => {
        markReported()
        setShowMap(true)
      }}
    />
  )
}
