import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Selected Works — S_DE_SIGN Architecture',
  description: 'Selected architectural commissions, residences, and spatial projects by S_DE_SIGN.',
  alternates: {
    canonical: 'https://sdesign.co.in/work',
  },
}

export default function WorkRedirectPage() {
  redirect('/#selected-work')
}
