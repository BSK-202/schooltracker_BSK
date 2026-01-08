"use client"

import Link from "next/link"
import { usePathname } from "next/navigation" // ajout de usePathname pour l'état actif
import { LayoutDashboard, School, Bus, Users, MapPin, Route, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: School, label: "Écoles", href: "/schools" },
  { icon: Users, label: "Chauffeurs", href: "/drivers" },
  { icon: Bus, label: "Bus", href: "/buses" },
  { icon: MapPin, label: "Arrêts", href: "/stops" },
  { icon: Route, label: "Trajets", href: "/routes" },
  { icon: Users, label: "Parents", href: "/parents" },
  { icon: GraduationCap, label: "Élèves", href: "/students" },


]

export function AdminSidebar() {
  const pathname = usePathname() // récupération du chemin actuel

  return (
    <div className="w-64 border-r border-zinc-100 bg-white h-screen flex flex-col sticky top-0 z-50 overflow-y-auto shrink-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-950 rounded-md flex items-center justify-center">
          <Bus className="text-white w-4 h-4" />
        </div>
        <span className="font-semibold text-lg tracking-tight">TransRoute</span>
      </div>

      <nav className="flex-1 px-4 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                isActive ? "bg-zinc-100 text-zinc-950" : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50",
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-zinc-950" : "text-zinc-400")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-100 mt-auto">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
            <img src="/diverse-avatars.png" alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-zinc-950 truncate">Yassine</span>
            <span className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider truncate">
              Administrateur
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
