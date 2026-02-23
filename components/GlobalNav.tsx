// components/GlobalNav.tsx
import { LayoutDashboard, HardHat, Paintbrush, LineChart, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { name: "SiteVerdict", icon: HardHat, href: "/dashboard/audits" },
  { name: "Realtor Pack", icon: Home, href: "/dashboard/realtor" },
  { name: "Painter Pack", icon: Paintbrush, href: "/dashboard/painter" },
  { name: "AAA Analytics", icon: LineChart, href: "/dashboard/analytics" },
]

export default function GlobalNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 h-screen sticky top-0 border-r border-slate-800 p-4">
        <div className="mb-8 px-4">
          <h2 className="text-white font-black tracking-tighter text-xl">DUNN STRATEGIC</h2>
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Aptos HQ</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                pathname.startsWith(item.href) ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1">
            <item.icon className={`w-6 h-6 ${pathname.startsWith(item.href) ? "text-blue-600" : "text-slate-400"}`} />
            <span className={`text-[10px] font-bold ${pathname.startsWith(item.href) ? "text-blue-600" : "text-slate-400"}`}>
              {item.name.split(' ')[0]}
            </span>
          </Link>
        ))}
      </nav>
    </>
  )
}