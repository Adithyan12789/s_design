import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Studio CMS — Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell" data-lenis-prevent>
      {children}
    </div>
  )
}

