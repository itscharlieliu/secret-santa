'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Gift } from 'lucide-react'

function ViewPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [participants, setParticipants] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedParticipant, setSelectedParticipant] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Load state from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const participantsParam = searchParams.get('participants')
    const assignmentsParam = searchParams.get('assignments')
    const selectedParam = searchParams.get('selected')

    if (participantsParam) {
      const decoded = decodeURIComponent(participantsParam)
      const parts = decoded.split(',').filter(p => p.trim())
      if (parts.length > 0) {
        setParticipants(parts)
      }
    }

    if (assignmentsParam) {
      try {
        const decoded = atob(decodeURIComponent(assignmentsParam))
        const parsed = JSON.parse(decoded)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAssignments(parsed)
        }
      } catch (e) {
        console.error('Failed to parse assignments from URL:', e)
      }
    }

    if (selectedParam) {
      const decodedSelected = decodeURIComponent(selectedParam)
      setSelectedParticipant(decodedSelected)
      // Redirect to confirmation page if selected participant is in URL
      const params = new URLSearchParams()
      if (participantsParam) params.set('participants', participantsParam)
      if (assignmentsParam) params.set('assignments', assignmentsParam)
      params.set('selected', encodeURIComponent(decodedSelected))
      router.replace(`/view/confirm?${params.toString()}`)
      return
    }

    setIsInitialized(true)
  }, [searchParams, router])

  // Update URL when selection changes
  const handleParticipantSelect = (name) => {
    setSelectedParticipant(name)
    if (typeof window === 'undefined') return

    const params = new URLSearchParams()
    const participantsParam = searchParams.get('participants')
    const assignmentsParam = searchParams.get('assignments')

    if (participantsParam) params.set('participants', participantsParam)
    if (assignmentsParam) params.set('assignments', assignmentsParam)
    
    if (name) {
      // Navigate to confirmation page when a name is selected
      params.set('selected', encodeURIComponent(name))
      router.push(`/view/confirm?${params.toString()}`)
    } else {
      // Clear selection and stay on view page
      const newURL = params.toString() 
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname
      router.replace(newURL, { scroll: false })
    }
  }

  // Dropdown view
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <Gift className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Secret Santa
          </h1>
          <p className="text-gray-600">
            Select your name to see who you're buying for
          </p>
        </div>

        {participants.length > 0 ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Name
            </label>
            <select
              value={selectedParticipant}
              onChange={(e) => handleParticipantSelect(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none bg-white text-lg"
            >
              <option value="">Select your name...</option>
              {participants.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No participants found. Please check the link.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ViewPageContent />
    </Suspense>
  )
}

