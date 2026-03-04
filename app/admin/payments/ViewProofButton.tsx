'use client'

import { useState } from 'react'
import { getPaymentProofUrl } from './actions'

export function ViewProofButton({ proofPath }: { proofPath: string }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleOpen() {
    setOpen(true)
    if (url) return // already loaded
    setLoading(true)
    setError(null)
    try {
      const signedUrl = await getPaymentProofUrl(proofPath)
      if (!signedUrl) {
        setError('Could not generate URL. File may not exist.')
        return
      }
      setUrl(signedUrl)
    } catch {
      setError('Failed to load proof.')
    } finally {
      setLoading(false)
    }
  }

  const isImage = /\.(jpe?g|png|gif|webp|bmp)$/i.test(proofPath)

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="View payment proof"
        className="inline-flex items-center gap-1.5 border-2 border-[#1040C0] bg-[#1040C0]/10 px-3 py-1.5 text-xs font-bold text-[#1040C0] transition hover:bg-[#1040C0] hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        Proof
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-auto border-4 border-[#121212] bg-white p-4 shadow-[8px_8px_0px_0px_#121212]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#121212]">Payment Proof</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center border-2 border-[#121212] bg-white text-[#121212] transition hover:bg-[#121212] hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin border-2 border-[#1040C0] border-t-transparent rounded-full" />
                <span className="ml-2 text-sm text-[#121212]/60">Loading proof…</span>
              </div>
            )}

            {error && (
              <p className="py-8 text-center text-sm text-red-600">{error}</p>
            )}

            {url && !loading && (
              <div className="space-y-3">
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt="Payment proof"
                    className="mx-auto max-h-[70vh] w-auto border border-[#E0E0E0]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#121212]/40"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                    <p className="text-sm text-[#121212]/60">Document file</p>
                  </div>
                )}
                <div className="flex justify-center">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border-2 border-[#121212] bg-[#121212] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:-translate-y-0.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Open in new tab
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
