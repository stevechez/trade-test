import { PlusCircle, LayoutDashboard, FileVideo, Settings } from "lucide-react"
import Link from "next/link"

export function AppSidebar() {
  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 p-4 flex flex-col">
      <h2 className="text-white font-bold text-xl mb-8 px-2">TradeTest AI</h2>
      
      <nav className="space-y-2 flex-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        
        {/* ACTION BUTTON: Create New Assessment */}
        <Link 
          href="/dashboard/new" 
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-md"
        >
          <PlusCircle className="w-5 h-5" />
          New Assessment
        </Link>

        <Link href="/dashboard/submissions" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <FileVideo className="w-5 h-5" />
          Review Submissions
        </Link>
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </div>
  )
}