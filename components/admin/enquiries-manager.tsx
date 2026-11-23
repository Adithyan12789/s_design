'use client'

import React, { useState, useMemo } from 'react'
import {
  Inbox,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  Archive,
  Search,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  X,
  FileText,
  DollarSign,
  Filter,
} from 'lucide-react'
import type { CmsEnquiry, EnquiryStatus } from '@/lib/cms/types'

interface EnquiriesManagerProps {
  inquiries?: CmsEnquiry[]
  onNotify: (msg: string, type?: 'success' | 'error') => void
}

export function EnquiriesManager({
  inquiries: initialInquiries = [],
  onNotify,
}: EnquiriesManagerProps) {
  const [inquiries, setInquiries] = useState<CmsEnquiry[]>(initialInquiries)
  const [activeFilter, setActiveFilter] = useState<'all' | EnquiryStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEnquiry, setSelectedEnquiry] = useState<CmsEnquiry | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState<string>('')

  // Calculate status counts
  const counts = useMemo(() => {
    const total = inquiries.length
    const newCount = inquiries.filter((i) => i.status === 'new').length
    const contactedCount = inquiries.filter((i) => i.status === 'contacted').length
    const archivedCount = inquiries.filter((i) => i.status === 'archived').length
    return { total, newCount, contactedCount, archivedCount }
  }, [inquiries])

  // Filtered and searched list
  const filteredInquiries = useMemo(() => {
    let result = inquiries

    if (activeFilter !== 'all') {
      result = result.filter((i) => i.status === activeFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          (i.phone && i.phone.toLowerCase().includes(q)) ||
          (i.location && i.location.toLowerCase().includes(q)) ||
          (i.projectType && i.projectType.toLowerCase().includes(q)) ||
          (i.budget && i.budget.toLowerCase().includes(q)) ||
          i.message.toLowerCase().includes(q)
      )
    }

    return result
  }, [inquiries, activeFilter, searchQuery])

  // Update status
  async function handleStatusChange(id: string, newStatus: EnquiryStatus) {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update status')

      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      )
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
      onNotify(`Enquiry marked as ${newStatus}.`)
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to update status', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Save notes
  async function handleSaveNotes(id: string) {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: notesDraft }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save notes')

      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, notes: notesDraft } : item))
      )
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, notes: notesDraft } : null))
      }
      onNotify('Internal notes updated.')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to save notes', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Delete enquiry
  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/enquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete enquiry')

      setInquiries((prev) => prev.filter((item) => item.id !== id))
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null)
      }
      onNotify('Enquiry removed.')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Failed to delete enquiry', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  function openDetails(item: CmsEnquiry) {
    setSelectedEnquiry(item)
    setNotesDraft(item.notes || '')
  }

  function formatTime(iso: string) {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="admin-serif text-3xl text-[#1c1a17] flex items-center gap-3">
            <Inbox className="w-7 h-7 text-[#b68d54]" />
            Client Inquiries &amp; Leads
          </h2>
          <p className="text-xs text-[#7c7367] mt-0.5">
            Incoming project inquiries submitted through the studio website contact form.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg border border-[#dfd7c9] bg-white text-xs text-[#1c1a17] flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#b68d54] animate-pulse" />
            <span className="font-semibold">{counts.newCount}</span> New
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-[#dfd7c9] bg-white text-xs text-[#1c1a17] flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">{counts.contactedCount}</span> Contacted
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-[#dfd7c9] bg-white text-xs text-[#7c7367] flex items-center gap-2 shadow-sm">
            <span>{counts.total}</span> Total
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#1c1a17] text-white font-medium'
                : 'bg-white text-[#6b6358] border border-[#dfd7c9] hover:bg-[#ede7dc]'
            }`}
          >
            All Inquiries ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('new')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeFilter === 'new'
                ? 'bg-[#b68d54] text-white font-medium'
                : 'bg-white text-[#6b6358] border border-[#dfd7c9] hover:bg-[#ede7dc]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            New ({counts.newCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('contacted')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              activeFilter === 'contacted'
                ? 'bg-emerald-700 text-white font-medium'
                : 'bg-white text-[#6b6358] border border-[#dfd7c9] hover:bg-[#ede7dc]'
            }`}
          >
            Contacted ({counts.contactedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('archived')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              activeFilter === 'archived'
                ? 'bg-[#5c5449] text-white font-medium'
                : 'bg-white text-[#6b6358] border border-[#dfd7c9] hover:bg-[#ede7dc]'
            }`}
          >
            Archived ({counts.archivedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#8b8174] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, city, brief..."
            className="admin-input pl-9 text-xs w-full py-1.5"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b8174] hover:text-[#1c1a17]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main List */}
      {filteredInquiries.length === 0 ? (
        <div className="admin-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#f4eee4] text-[#b68d54] flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="admin-serif text-lg text-[#1c1a17]">
            {searchQuery
              ? 'No inquiries match your search'
              : activeFilter !== 'all'
              ? `No ${activeFilter} inquiries found`
              : 'No project inquiries yet'}
          </h3>
          <p className="text-xs text-[#7c7367] max-w-sm mx-auto">
            {searchQuery
              ? 'Try using different search keywords or clear your search query.'
              : 'When visitors submit the project inquiry form on your website, their details and project briefs will appear here instantly.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInquiries.map((item) => {
            const isNew = item.status === 'new'
            const isContacted = item.status === 'contacted'
            const isArchived = item.status === 'archived'

            return (
              <div
                key={item.id}
                onClick={() => openDetails(item)}
                className={`admin-card p-5 cursor-pointer transition-all hover:border-[#b68d54] hover:shadow-md ${
                  isNew ? 'border-l-4 border-l-[#b68d54] bg-[#fbf9f6]' : 'bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left Column: Client Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#1c1a17]">{item.name}</span>
                      {isNew && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          New
                        </span>
                      )}
                      {isContacted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Contacted
                        </span>
                      )}
                      {isArchived && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700">
                          Archived
                        </span>
                      )}
                      <span className="text-[11px] text-[#8b8174] flex items-center gap-1 ml-auto md:ml-0">
                        <Clock className="w-3 h-3 text-[#b68d54]" />
                        {formatTime(item.createdAt)}
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-3 text-xs text-[#6b6358] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#b68d54]" />
                        {item.email}
                      </span>
                      {item.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#b68d54]" />
                          {item.phone}
                        </span>
                      )}
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#b68d54]" />
                          {item.location}
                        </span>
                      )}
                      {item.projectType && (
                        <span className="px-2 py-0.5 rounded bg-[#f4eee4] text-[#7a5a2d] text-[11px] font-medium">
                          {item.projectType}
                        </span>
                      )}
                      {item.budget && (
                        <span className="px-2 py-0.5 rounded bg-[#efece4] text-[#1c1a17] text-[11px] font-medium">
                          {item.budget}
                        </span>
                      )}
                    </div>

                    {/* Message Preview */}
                    <p className="text-xs text-[#4a443c] line-clamp-2 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Right Actions */}
                  <div
                    className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#f0ece3]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as EnquiryStatus)
                      }
                      className="admin-input text-xs py-1 px-2 font-medium bg-white"
                    >
                      <option value="new">Mark New</option>
                      <option value="contacted">Mark Contacted</option>
                      <option value="archived">Mark Archived</option>
                    </select>

                    <a
                      href={`mailto:${item.email}?subject=Regarding%20your%20project%20inquiry%20%E2%80%94%20S_Designs`}
                      className="p-1.5 text-[#7c7367] hover:text-[#1c1a17] hover:bg-[#ede7dc] rounded transition-colors"
                      title="Reply via Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-[#9a4242] hover:bg-red-50 rounded transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <ChevronRight className="w-4 h-4 text-[#8b8174]" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#dfd7c9] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 p-6 md:p-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#dfd7c9] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#b68d54] block">
                  Project Inquiry Details
                </span>
                <h3 className="admin-serif text-2xl text-[#1c1a17] mt-0.5">
                  {selectedEnquiry.name}
                </h3>
                <span className="text-xs text-[#7c7367]">
                  Received on {formatTime(selectedEnquiry.createdAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="p-1 rounded-lg hover:bg-[#ede7dc] text-[#6b6358] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${selectedEnquiry.email}?subject=Regarding%20your%20project%20inquiry%20%E2%80%94%20S_Designs`}
                className="admin-btn-primary text-xs py-2 px-3.5 flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                Reply via Email
              </a>

              {selectedEnquiry.phone && (
                <a
                  href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-md bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </a>
              )}

              {selectedEnquiry.phone && (
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  className="px-3.5 py-2 rounded-md border border-[#dfd7c9] bg-white text-xs text-[#1c1a17] hover:bg-[#ede7dc] transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#b68d54]" />
                  Call Client
                </a>
              )}

              {/* Status Switcher in Modal */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-[#7c7367]">Status:</span>
                <select
                  value={selectedEnquiry.status}
                  disabled={updatingId === selectedEnquiry.id}
                  onChange={(e) =>
                    handleStatusChange(selectedEnquiry.id, e.target.value as EnquiryStatus)
                  }
                  className="admin-input text-xs py-1 px-2.5 font-medium bg-white"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#faf8f5] p-4 rounded-lg border border-[#e6dfd3]">
              <div>
                <span className="text-[11px] text-[#7c7367] uppercase tracking-wider block font-medium">
                  Email Address
                </span>
                <a
                  href={`mailto:${selectedEnquiry.email}`}
                  className="text-sm font-medium text-[#b68d54] hover:underline"
                >
                  {selectedEnquiry.email}
                </a>
              </div>

              <div>
                <span className="text-[11px] text-[#7c7367] uppercase tracking-wider block font-medium">
                  Phone Number
                </span>
                <span className="text-sm font-medium text-[#1c1a17]">
                  {selectedEnquiry.phone || '—'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#7c7367] uppercase tracking-wider block font-medium">
                  Project Location
                </span>
                <span className="text-sm font-medium text-[#1c1a17]">
                  {selectedEnquiry.location || '—'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#7c7367] uppercase tracking-wider block font-medium">
                  Project Type
                </span>
                <span className="text-sm font-medium text-[#1c1a17]">
                  {selectedEnquiry.projectType || '—'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#7c7367] uppercase tracking-wider block font-medium">
                  Estimated Budget
                </span>
                <span className="text-sm font-medium text-[#1c1a17]">
                  {selectedEnquiry.budget || '—'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#7c7367] uppercase tracking-wider block font-medium">
                  Submission IP
                </span>
                <span className="text-xs font-mono text-[#7c7367]">
                  {selectedEnquiry.ip || '—'}
                </span>
              </div>
            </div>

            {/* Project Brief */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6b6358] block">
                Project Brief / Description
              </span>
              <div className="p-4 rounded-lg bg-[#faf8f5] border border-[#e6dfd3] text-sm text-[#1c1a17] leading-relaxed whitespace-pre-wrap font-serif">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Internal Studio Notes */}
            <div className="space-y-2 pt-2 border-t border-[#dfd7c9]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6b6358] block">
                  Internal Studio Notes
                </span>
                <span className="text-[11px] text-[#7c7367]">Visible only to administrators</span>
              </div>
              <textarea
                rows={3}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Add private notes about this client, follow-up dates, call logs, or architect assigned..."
                className="admin-input text-xs w-full py-2 px-3 resize-vertical"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={updatingId === selectedEnquiry.id}
                  onClick={() => handleSaveNotes(selectedEnquiry.id)}
                  className="px-3 py-1.5 rounded bg-[#1c1a17] text-white text-xs font-medium hover:bg-[#333] transition-colors"
                >
                  {updatingId === selectedEnquiry.id ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#dfd7c9]">
              <button
                type="button"
                disabled={deletingId === selectedEnquiry.id}
                onClick={() => handleDelete(selectedEnquiry.id)}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1.5 py-1 px-2 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete this inquiry
              </button>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-1.5 rounded border border-[#dfd7c9] bg-white text-xs text-[#1c1a17] hover:bg-[#ede7dc] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
