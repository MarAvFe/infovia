'use client'

import { supabase } from './supabase'
export type { Condition } from './weathercode'
import { Condition } from './weathercode'

export type Report = {
  id: string
  lat: number
  lng: number
  condition: Condition
  created_at: string
}

export async function fetchActiveReports(): Promise<Report[]> {
  const cutoff = new Date(Date.now() - 45 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .gt('created_at', cutoff)
  if (error) throw error
  return data as Report[]
}

export async function submitReport(lat: number, lng: number, condition: Condition): Promise<void> {
  const { error } = await supabase.from('reports').insert({ lat, lng, condition })
  if (error) throw error
}

export async function submitFeedback(message: string): Promise<void> {
  const { error } = await supabase.from('feedback').insert({ message })
  if (error) throw error
}
