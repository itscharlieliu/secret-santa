'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Gift, CheckCircle, XCircle } from 'lucide-react'

function ConfirmPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [participants, setParticipants] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedParticipant, setSelectedParticipant] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

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
      setSelectedParticipant(decodeURIComponent(selectedParam))
    } else {
      // If no selected participant, redirect back to view page
      router.replace('/view?' + (participantsParam ? `participants=${participantsParam}` : '') + (assignmentsParam ? `&assignments=${assignmentsParam}` : ''))
      return
    }

    setIsInitialized(true)
  }, [searchParams, router])

  const handleConfirm = () => {
    setIsConfirmed(true)
  }

  const handleCancel = () => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams()
    const participantsParam = searchParams.get('participants')
    const assignmentsParam = searchParams.get('assignments')

    if (participantsParam) params.set('participants', participantsParam)
    if (assignmentsParam) params.set('assignments', assignmentsParam)

    const newURL = params.toString() 
      ? `/view?${params.toString()}`
      : '/view'

    router.replace(newURL)
  }

  const getSelectedAssignment = () => {
    if (!selectedParticipant || assignments.length === 0) return null
    return assignments.find(a => a.giver === selectedParticipant) || null
  }

  const selectedAssignment = getSelectedAssignment()

  // Show assignment after confirmation
  if (isConfirmed && selectedAssignment && isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Gift className="w-20 h-20 mx-auto mb-6 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Ho Ho Ho, {selectedAssignment.giver}! 🎅
          </h1>
          <p className="text-gray-600 mb-6">You are the Secret Santa for:</p>
          <div className="bg-gradient-to-r from-red-500 to-green-500 text-white text-3xl font-bold py-6 px-4 rounded-xl mb-6">
            {selectedAssignment.receiver}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Keep it secret! 🤫
          </p>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Select different name
          </button>
        </div>
      </div>
    )
  }

  // Confirmation view
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!selectedParticipant) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <Gift className="w-16 h-16 mx-auto mb-6 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Is this you??
        </h1>
        <p className="text-gray-600 mb-6">
          If you are not this person, Santa Claus will visit you and break your wrists.
        </p>
        <div className="bg-gradient-to-r from-red-100 to-green-100 border-2 border-red-300 text-gray-800 text-2xl font-bold py-6 px-4 rounded-xl mb-8">
          {selectedParticipant}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
          >
            <XCircle className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white rounded-lg font-semibold transition"
          >
            <CheckCircle className="w-5 h-5" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  )
}

