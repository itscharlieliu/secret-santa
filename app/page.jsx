'use client'

import React, { useState, useEffect } from 'react'
import { Gift, UserPlus, Shuffle, Copy, Check, Trash2 } from 'lucide-react'

export default function SecretSantaApp() {
  const [participants, setParticipants] = useState([])
  const [newName, setNewName] = useState('')
  const [assignments, setAssignments] = useState([])
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [showAssignment, setShowAssignment] = useState(null)

  useEffect(() => {
    // Check if URL has assignment info
    if (typeof window !== 'undefined' && window.location.hash) {
      try {
        const data = JSON.parse(atob(window.location.hash.slice(1)))
        if (data.giver && data.receiver) {
          setShowAssignment(data)
        }
      } catch (e) {
        // Invalid hash, ignore
      }
    }
  }, [])

  const addParticipant = () => {
    if (newName.trim() && !participants.includes(newName.trim())) {
      setParticipants([...participants, newName.trim()])
      setNewName('')
      setAssignments([])
    }
  }

  const removeParticipant = (name) => {
    setParticipants(participants.filter(p => p !== name))
    setAssignments([])
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

    const newAssignments = participants.map((giver, i) => ({
      giver,
      receiver: shuffled[i],
      link: `${typeof window !== 'undefined' ? window.location.origin : ''}${typeof window !== 'undefined' ? window.location.pathname : ''}#${btoa(JSON.stringify({ giver, receiver: shuffled[i] }))}`,
    }))

    setAssignments(newAssignments)
  }

  const copyLink = (link, index) => {
    navigator.clipboard.writeText(link)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const resetAll = () => {
    if (confirm('Reset everything? This will clear all participants and assignments.')) {
      setParticipants([])
      setAssignments([])
      setNewName('')
    }
  }

  // Assignment reveal view
  if (showAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Gift className="w-20 h-20 mx-auto mb-6 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Ho Ho Ho, {showAssignment.giver}! 🎅
          </h1>
          <p className="text-gray-600 mb-6">You are the Secret Santa for:</p>
          <div className="bg-gradient-to-r from-red-500 to-green-500 text-white text-3xl font-bold py-6 px-4 rounded-xl mb-6">
            {showAssignment.receiver}
          </div>
          <p className="text-sm text-gray-500">
            Keep it secret! 🤫
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-800">Secret Santa Organizer</h1>
            </div>
            {participants.length > 0 && (
              <button
                onClick={resetAll}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                title="Reset all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                placeholder="Enter participant name"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
              />
              <button
                onClick={addParticipant}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
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
              className="w-full bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white py-4 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold transition"
            >
              <Shuffle className="w-6 h-6" />
              Generate Secret Santa Assignments
            </button>
          )}

          {participants.length > 0 && participants.length < 3 && (
            <div className="text-center text-gray-500 py-4">
              Add at least 3 participants to generate assignments
            </div>
          )}
        </div>

        {assignments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎉 Assignments Generated!
            </h2>
            <p className="text-gray-600 mb-6">
              Share each link with the corresponding person. When they open it, they'll see who they're buying for. Keep the links secret!
            </p>
            <div className="space-y-3">
              {assignments.map((assignment, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-800">
                      {assignment.giver}
                    </div>
                    <button
                      onClick={() => copyLink(assignment.link, index)}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      {copiedIndex === index ? (
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
              ))}
            </div>
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Don't click on the links yourself! Each link reveals who that person should buy for. Save or screenshot this page, then share each link privately with the corresponding participant.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

