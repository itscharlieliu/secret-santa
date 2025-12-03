'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Gift, UserPlus, Shuffle, Copy, Check, Trash2 } from 'lucide-react'

function SecretSantaAppContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [participants, setParticipants] = useState([])
  const [newName, setNewName] = useState('')
  const [assignments, setAssignments] = useState([])
  const [selectedParticipant, setSelectedParticipant] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [copiedViewLink, setCopiedViewLink] = useState(false)

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
    }

    setIsInitialized(true)
  }, [searchParams])

  // Update URL when state changes
  const updateURL = (newParticipants, newAssignments, newSelected = null) => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams()

    if (newParticipants.length > 0) {
      params.set('participants', encodeURIComponent(newParticipants.join(',')))
    }

    if (newAssignments.length > 0) {
      const encoded = encodeURIComponent(btoa(JSON.stringify(newAssignments)))
      params.set('assignments', encoded)
    }

    if (newSelected !== null && newSelected !== '') {
      params.set('selected', encodeURIComponent(newSelected))
    } else if (newSelected === null && selectedParticipant) {
      // Keep current selected if not explicitly changed
      params.set('selected', encodeURIComponent(selectedParticipant))
    }

    const newURL = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname

    router.replace(newURL, { scroll: false })
  }

  const addParticipant = () => {
    if (newName.trim() && !participants.includes(newName.trim())) {
      const updated = [...participants, newName.trim()]
      setParticipants(updated)
      setNewName('')
      setAssignments([])
      setSelectedParticipant('')
      updateURL(updated, [], '')
    }
  }

  const removeParticipant = (name) => {
    const updated = participants.filter(p => p !== name)
    setParticipants(updated)
    setAssignments([])
    if (selectedParticipant === name) {
      setSelectedParticipant('')
      updateURL(updated, [], '')
    } else {
      updateURL(updated, [], selectedParticipant)
    }
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const generateAssignments = () => {
    if (participants.length < 3) {
      alert('Need at least 3 participants!')
      return
    }

    let valid = false
    let shuffled
    let attempts = 0
    const maxAttempts = 100

    while (!valid && attempts < maxAttempts) {
      shuffled = shuffleArray(participants)
      valid = shuffled.every((person, i) => person !== participants[i])
      attempts++
    }

    if (!valid) {
      alert('Could not generate valid assignments. Please try again.')
      return
    }

    // Create assignments
    const assignmentsData = participants.map((giver, i) => ({
      giver,
      receiver: shuffled[i],
    }))

    setAssignments(assignmentsData)
    updateURL(participants, assignmentsData, selectedParticipant)
  }

  const getViewLink = () => {
    if (typeof window === 'undefined' || assignments.length === 0) return ''
    const params = new URLSearchParams()
    params.set('participants', encodeURIComponent(participants.join(',')))
    params.set('assignments', encodeURIComponent(btoa(JSON.stringify(assignments))))
    return `${window.location.origin}/view?${params.toString()}`
  }

  const copyViewLink = () => {
    const link = getViewLink()
    if (link) {
      navigator.clipboard.writeText(link)
      setCopiedViewLink(true)
      setTimeout(() => setCopiedViewLink(false), 2000)
    }
  }

  const resetAll = () => {
    if (confirm('Reset everything? This will clear all participants and assignments.')) {
      setParticipants([])
      setAssignments([])
      setNewName('')
      setSelectedParticipant('')
      updateURL([], [], '')
    }
  }

  const handleParticipantSelect = (name) => {
    setSelectedParticipant(name)
    updateURL(participants, assignments, name)
  }

  const getSelectedAssignment = () => {
    if (!selectedParticipant || assignments.length === 0) return null
    return assignments.find(a => a.giver === selectedParticipant) || null
  }

  const selectedAssignment = getSelectedAssignment()

  // Assignment reveal view
  if (selectedAssignment && isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
          <Gift className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 text-red-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Ho Ho Ho, {selectedAssignment.giver}! 🎅
          </h1>
          <p className="text-gray-600 mb-6">You are the Secret Santa for:</p>
          <div className="bg-gradient-to-r from-red-500 to-green-500 text-white text-2xl sm:text-3xl font-bold py-6 px-4 rounded-xl mb-6 break-words">
            {selectedAssignment.receiver}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Keep it secret! 🤫
          </p>
          <button
            onClick={() => handleParticipantSelect('')}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Back to organizer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 shrink-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Secret Santa Organizer</h1>
            </div>
            {participants.length > 0 && (
              <button
                onClick={resetAll}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition shrink-0"
                title="Reset all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                placeholder="Enter participant name"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none min-w-0"
              />
              <button
                onClick={addParticipant}
                className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition shrink-0"
              >
                <UserPlus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>

          {participants.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Participants ({participants.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {participants.map((name) => (
                  <div
                    key={name}
                    className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    {name}
                    <button
                      onClick={() => removeParticipant(name)}
                      className="hover:text-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {participants.length >= 3 && assignments.length === 0 && (
            <button
              onClick={generateAssignments}
              className="w-full bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white py-4 rounded-lg flex items-center justify-center gap-2 text-base sm:text-lg font-semibold transition"
            >
              <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-center">Generate Secret Santas</span>
            </button>
          )}

          {participants.length > 0 && participants.length < 3 && (
            <div className="text-center text-gray-500 py-4">
              Add at least 3 participants to generate assignments
            </div>
          )}

          {assignments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                View Your Assignment
              </h2>
              <select
                value={selectedParticipant}
                onChange={(e) => handleParticipantSelect(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none bg-white"
              >
                <option value="">Select your name...</option>
                {participants.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {selectedParticipant && (
                <p className="mt-2 text-sm text-gray-500">
                  Your assignment will appear below when you select your name.
                </p>
              )}
            </div>
          )}
        </div>

        {assignments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              🎉 Assignments Generated!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Share this link with all participants. When they open it, they'll see a simple page with a dropdown to select their name and view their assignment.
            </p>
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={getViewLink()}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono min-w-0"
                />
                <button
                  onClick={copyViewLink}
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition whitespace-nowrap shrink-0"
                >
                  {copiedViewLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Share this single link with everyone. Each participant can select their name from the dropdown to see their assignment privately.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SecretSantaApp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <SecretSantaAppContent />
    </Suspense>
  )
}

