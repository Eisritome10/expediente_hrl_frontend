import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export function AdminLayout() {
  const location = useLocation()
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!contentRef.current) return
      gsap.fromTo(contentRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' })
    },
    { dependencies: [location.pathname], scope: contentRef },
  )

  return (
    <div className="flex h-dvh bg-surface-muted">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div ref={contentRef}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
