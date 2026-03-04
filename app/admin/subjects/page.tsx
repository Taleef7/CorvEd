// Admin subjects management — add new subjects, activate/deactivate existing

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { toggleSubjectActive } from './actions'
import AddSubjectForm from './AddSubjectForm'

export default async function AdminSubjectsPage() {
  const admin = createAdminClient()

  const { data: subjects, error } = await admin
    .from('subjects')
    .select('id, code, name, active, sort_order')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">
            Subjects
          </h1>
          <p className="mt-1 text-sm text-[#121212]/60">
            Manage which subjects appear in the student request form.
          </p>
        </div>
      </div>

      <AddSubjectForm />

      {/* Subjects list */}
      {error ? (
        <div className="border-l-4 border-[#D02020] bg-[#D02020]/5 px-4 py-3 text-sm text-[#D02020]">
          Failed to load subjects: {error.message}
        </div>
      ) : (
        <div className="border-4 border-[#121212] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-4 border-[#121212] bg-[#121212] text-white">
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects && subjects.length > 0 ? (
                subjects.map((subject, i) => (
                  <tr
                    key={subject.id}
                    className={[
                      'border-b-2 border-[#E0E0E0] last:border-0',
                      !subject.active ? 'opacity-50' : '',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 text-[#121212]/40 font-mono text-xs">
                      {subject.sort_order}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#121212]">
                      {subject.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#121212]/60">
                      {subject.code}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'inline-block border-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest',
                          subject.active
                            ? 'border-[#1040C0] text-[#1040C0]'
                            : 'border-[#B0B0B0] text-[#B0B0B0]',
                        ].join(' ')}
                      >
                        {subject.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form
                        action={toggleSubjectActive.bind(null, subject.id, subject.active)}
                      >
                        <button
                          type="submit"
                          className={[
                            'border-2 px-3 py-1 text-xs font-black uppercase tracking-widest transition',
                            subject.active
                              ? 'border-[#D02020] text-[#D02020] hover:bg-[#D02020] hover:text-white'
                              : 'border-[#1040C0] text-[#1040C0] hover:bg-[#1040C0] hover:text-white',
                          ].join(' ')}
                        >
                          {subject.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#121212]/40">
                    No subjects found. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
