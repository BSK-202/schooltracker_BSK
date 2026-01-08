import {
  School,
  Bus,
  Users,
  TrendingUp,
  MoreVertical,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

// Données fakes pour l'interface
const stats = [
  { label: "Écoles actives", value: "12", change: "+2", icon: School, trend: "up" },
  { label: "Bus en service", value: "48", change: "+5%", icon: Bus, trend: "up" },
  { label: "Élèves transportés", value: "1,240", change: "+120", icon: Users, trend: "up" },
  { label: "Alertes trafic", value: "3", change: "-2", icon: MapPin, trend: "down" },
]

const recentActivity = [
  {
    id: 1,
    type: "bus",
    title: "Bus #12 (Zerktouni)",
    desc: "Trajet terminé avec 15 min d'avance",
    time: "Il y a 10 min",
    status: "success",
  },
  {
    id: 2,
    type: "driver",
    title: "Ahmed Benali",
    desc: "A démarré le circuit Anfa - Matin",
    time: "Il y a 25 min",
    status: "progress",
  },
  {
    id: 3,
    type: "alert",
    title: "Retard Bus #04",
    desc: "Circulation dense sur Bd Ghandi (+10 min)",
    time: "Il y a 45 min",
    status: "warning",
  },
]

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="p-6 lg:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">Surveillez l'activité de transport scolaire en temps réel.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black/90 transition-all shadow-md hover:shadow-lg active:scale-95">
              Nouveau circuit
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <stat.icon className="w-5 h-5" />
                </div>
                <button className="p-1 hover:bg-secondary rounded-full transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-black">{stat.value}</h3>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {stat.change}
                  </span>
                  {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/40 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div>
                  <h2 className="text-lg font-bold text-black">Circuits en cours</h2>
                  <p className="text-xs text-muted-foreground">Mise à jour automatique toutes les 30s</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-bold border border-green-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    8 CIRCUITS ACTIFS
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-secondary/30 text-muted-foreground font-bold border-b border-border/40 uppercase tracking-widest text-[10px]">
                      <th className="px-6 py-4">Véhicule</th>
                      <th className="px-6 py-4">Itinéraire</th>
                      <th className="px-6 py-4 text-center">Occupation</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="hover:bg-secondary/10 transition-colors group cursor-pointer">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-black">
                              {i + 10}
                            </div>
                            <div>
                              <p className="font-bold text-black">Bus #{i + 10}</p>
                              <p className="text-xs text-muted-foreground">Mercedes Sprinter</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-medium">Circuit Casablanca {i % 2 === 0 ? "Nord" : "Sud"}</p>
                          <p className="text-xs text-muted-foreground">12 arrêts programmés</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5 items-center max-w-[100px] mx-auto">
                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${i > 3 ? "bg-amber-500" : "bg-black"}`}
                                style={{ width: `${30 + i * 12}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">{30 + i * 12}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                            En route
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-black transition-transform group-hover:translate-x-1" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-8">
            <section className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 overflow-hidden relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-black">Flux d'activité</h2>
                <button className="text-xs font-bold text-black underline underline-offset-4">Voir historique</button>
              </div>
              <div className="relative space-y-8 before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-secondary before:my-1">
                {/* Activité 1 */}
                <div className="relative flex gap-4 pl-8 group">
                  <div className="absolute left-0 w-4 h-4 rounded-full bg-white border-4 border-black z-10 group-hover:scale-125 transition-transform" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-black">Bus #12 (Zerktouni)</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Trajet terminé avec <span className="text-green-600 font-bold">15 min d'avance</span>
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-tighter">
                      Il y a 10 min
                    </p>
                  </div>
                </div>
                {/* Activité 2 */}
                <div className="relative flex gap-4 pl-8 group">
                  <div className="absolute left-0 w-4 h-4 rounded-full bg-white border-4 border-blue-500 z-10 group-hover:scale-125 transition-transform" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-black">Ahmed Benali</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A démarré le circuit <span className="font-bold">Anfa - Matin</span>
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-tighter">
                      Il y a 25 min
                    </p>
                  </div>
                </div>
                {/* Activité 3 */}
                <div className="relative flex gap-4 pl-8 group">
                  <div className="absolute left-0 w-4 h-4 rounded-full bg-white border-4 border-amber-500 z-10 group-hover:scale-125 transition-transform" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-black text-amber-600">Alerte Retard</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Bus #04 : Circulation dense sur Bd Ghandi (+10 min)
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-tighter">
                      Il y a 45 min
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-black rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-2xl mb-3 tracking-tight">Support Prioritaire</h3>
                <p className="text-sm text-white/60 mb-8 font-medium leading-relaxed">
                  Accédez à notre ligne d'assistance dédiée aux administrateurs disponible 24/7.
                </p>
                <button className="w-full bg-white text-black py-4 rounded-xl text-sm font-black hover:bg-white/90 transition-all active:scale-[0.98] shadow-lg">
                  Contacter le support
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
