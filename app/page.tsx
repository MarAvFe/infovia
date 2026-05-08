'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { hasReported, markReported } from '@/lib/gate'

const SubmitForm = dynamic(() => import('@/components/SubmitForm'), { ssr: false })
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function Home() {
  const [showMap, setShowMap] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setShowMap(hasReported())
    setMounted(true)
  }, [])

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
