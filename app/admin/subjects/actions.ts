'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const addSubjectSchema = z.object({
  name: z.string().min(1).max(100),
  code: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9_]+$/, 'Code must be lowercase letters, numbers, or underscores'),
})

export async function addSubject(formData: FormData) {
  const parsed = addSubjectSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()

  // Get max sort_order to append at end
  const { data: last } = await admin
    .from('subjects')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (last?.sort_order ?? 0) + 1

  const { error } = await admin.from('subjects').insert({
    name: parsed.data.name,
    code: parsed.data.code,
    sort_order: nextOrder,
    active: true,
  })

  if (error) {
    if (error.code === '23505') return { error: 'A subject with that code already exists.' }
    return { error: error.message }
  }

  revalidatePath('/admin/subjects')
  revalidatePath('/dashboard/requests/new')
  return { error: null }
}

export async function toggleSubjectActive(id: number, active: boolean) {
  const admin = createAdminClient()
  await admin
    .from('subjects')
    .update({ active: !active })
    .eq('id', id)

  revalidatePath('/admin/subjects')
  revalidatePath('/dashboard/requests/new')
}
