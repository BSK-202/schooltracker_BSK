import { useState } from "react"
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  MapPin, 
  Clock,
  Bus,
  School,
  Map
} from "lucide-react"
import dynamic from "next/dynamic"
import { School as SchoolType } from "@/services/api/schools"
import { Bus as BusType } from "@/services/api/buses"
import { Stop } from "@/services/api/stops"

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false })

interface CreateRouteModalProps {
  isOpen: boolean
  onClose: () => void
  schools: SchoolType[]
  buses: BusType[]
  stops: Stop[]
  onCreate: (formData: any) => Promise<boolean>
}

interface FormData {
  school: string
  bus: string
  type: "PICKUP" | "DROPOFF"
  startTime: string
  endTime: string
  stops: Array<{ id?: number; lat: number; lng: number; name: string; scheduled_time?: string }>
  routeName: string
}

export default function CreateRouteModal({ 
  isOpen, 
  onClose, 
  schools, 
  buses, 
  stops, 
  onCreate 
}: CreateRouteModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    school: "",
    bus: "",
    type: "PICKUP",
    startTime: "07:00",
    endTime: "08:15",
    stops: [],
    routeName: "",
  })

  if (!isOpen) return null

  const handleNextStep = async () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Validation finale
      if (!formData.routeName.trim()) {
        alert("Veuillez saisir un nom pour le trajet")
        return
      }
      if (!formData.school) {
        alert("Veuillez sélectionner une école")
        return
      }
      if (!formData.bus) {
        alert("Veuillez sélectionner un bus")
        return
      }
      if (formData.stops.length === 0) {
        alert("Veuillez ajouter au moins un arrêt")
        return
      }

      const success = await onCreate(formData)
      if (success) {
        resetForm()
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const resetForm = () => {
    setFormData({
      school: "",
      bus: "",
      type: "PICKUP",
      startTime: "07:00",
      endTime: "08:15",
      stops: [],
      routeName: "",
    })
    setCurrentStep(1)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Bus className="w-4 h-4" />
                Nom du trajet *
              </label>
              <input
                type="text"
                value={formData.routeName}
                onChange={(e) => setFormData({...formData, routeName: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="Ex: Circuit Anfa - Matin"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <School className="w-4 h-4" />
                Sélectionner une école *
              </label>
              <select
                value={formData.school}
                onChange={(e) => setFormData({...formData, school: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Choisir une école</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    { school.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Bus className="w-4 h-4" />
                Sélectionner un bus *
              </label>
              <select
                value={formData.bus}
                onChange={(e) => setFormData({...formData, bus: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Choisir un bus</option>
                {buses
                  .filter(bus => bus.school_id === parseInt(formData.school) || !formData.school)
                  .map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.licence_plate} ({bus.capacity} places)
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Type de trajet</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1">
                  <input 
                    type="radio" 
                    name="type" 
                    value="PICKUP" 
                    checked={formData.type === "PICKUP"}
                    onChange={(e) => setFormData({...formData, type: e.target.value as "PICKUP" | "DROPOFF"})}
                    className="cursor-pointer"
                  />
                  <div>
                    <span className="font-medium">Ramassage (matin)</span>
                    <p className="text-xs text-gray-500">Trajet aller vers l'école</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1">
                  <input 
                    type="radio" 
                    name="type" 
                    value="DROPOFF" 
                    checked={formData.type === "DROPOFF"}
                    onChange={(e) => setFormData({...formData, type: e.target.value as "PICKUP" | "DROPOFF"})}
                    className="cursor-pointer"
                  />
                  <div>
                    <span className="font-medium">Retour (soir)</span>
                    <p className="text-xs text-gray-500">Trajet retour depuis l'école</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Heure de début *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Heure de fin estimée *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Arrêts du trajet
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">Ajoutez les arrêts dans l'ordre du trajet</p>
                </div>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      const selectedStop = stops.find(s => s.id === parseInt(e.target.value))
                      if (selectedStop) {
                        const coords = selectedStop.geom.coordinates
                        setFormData({
                          ...formData,
                          stops: [...formData.stops, {
                            id: selectedStop.id,
                            lat: coords[1],
                            lng: coords[0],
                            name: selectedStop.address,
                            scheduled_time: formData.startTime
                          }]
                        })
                      }
                      e.target.value = ""
                    }}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <option value="">Sélectionner un arrêt</option>
                    {stops.map((stop) => (
                      <option key={stop.id} value={stop.id}>
                        {stop.address.length > 40 ? stop.address.substring(0, 40) + "..." : stop.address}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    className="px-3 py-1 bg-black text-white rounded-lg text-sm font-bold hover:opacity-90"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        stops: [...formData.stops, { 
                          lat: 33.5731 + (Math.random() * 0.02 - 0.01), 
                          lng: -7.5898 + (Math.random() * 0.02 - 0.01), 
                          name: `Arrêt ${formData.stops.length + 1}` 
                        }]
                      })
                    }}
                  >
                    + Nouveau
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={stop.name}
                      onChange={(e) => {
                        const newStops = [...formData.stops]
                        newStops[index].name = e.target.value
                        setFormData({...formData, stops: newStops})
                      }}
                      className="flex-1 p-2 border rounded"
                      placeholder="Nom de l'arrêt"
                    />
                    <input
                      type="time"
                      value={stop.scheduled_time || formData.startTime}
                      onChange={(e) => {
                        const newStops = [...formData.stops]
                        newStops[index].scheduled_time = e.target.value
                        setFormData({...formData, stops: newStops})
                      }}
                      className="p-2 border rounded w-32"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newStops = formData.stops.filter((_, i) => i !== index)
                        setFormData({...formData, stops: newStops})
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {formData.stops.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Aucun arrêt ajouté</p>
                    <p className="text-sm">Sélectionnez des arrêts existants ou créez-en de nouveaux</p>
                  </div>
                )}
              </div>
            </div>

            {formData.stops.length > 0 && (
              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Aperçu du trajet
                </h5>
                <div className="h-48 rounded overflow-hidden">
                  <RouteMap stops={formData.stops.map(s => ({ lat: s.lat, lng: s.lng, name: s.name }))} height="100%" />
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-bold text-green-800">Récapitulatif du trajet</h4>
                  <p className="text-sm text-green-600">Vérifiez les informations avant de créer le trajet</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-semibold text-gray-500 mb-1">Informations générales</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="font-medium">Nom :</span>
                      <span>{formData.routeName || "Non spécifié"}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="font-medium">Type :</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${formData.type === "PICKUP" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {formData.type === "PICKUP" ? "Ramassage" : "Retour"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="font-medium">Horaires :</span>
                      <span>{formData.startTime} - {formData.endTime}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="font-medium">École :</span>
                      <span>
                        {schools.find(s => s.id === parseInt(formData.school))?.address || 
                         "Non spécifiée"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="font-medium">Bus :</span>
                      <span>
                        {buses.find(b => b.id === parseInt(formData.bus))?.licence_plate || "Non spécifié"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-500 mb-1">Arrêts ({formData.stops.length})</h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.stops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{stop.name || `Arrêt ${index + 1}`}</span>
                        {stop.scheduled_time && (
                          <div className="text-xs text-gray-500">Heure: {stop.scheduled_time}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {formData.stops.length > 0 && (
              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-semibold text-gray-500 mb-2">Carte finale du trajet</h5>
                <div className="h-64 rounded overflow-hidden">
                  <RouteMap stops={formData.stops.map(s => ({ lat: s.lat, lng: s.lng, name: s.name }))} height="100%" />
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Créer un nouveau trajet</h2>
            <p className="text-sm text-gray-600 mt-1">
              Étape {currentStep}/3 - {currentStep === 1 ? "Informations de base" : 
                             currentStep === 2 ? "Configuration" : 
                             "Confirmation"}
            </p>
          </div>
          <button 
            onClick={() => {
              onClose()
              resetForm()
            }} 
            className="text-gray-500 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 h-[600px]">
          {/* Étapes */}
          <div className="border-r p-6 space-y-8">
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-gray-700">Étapes de création</h3>
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map((step) => (
                  <div 
                    key={step}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${currentStep >= step ? 'bg-blue-50 border border-blue-200' : 'border'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= step ? 'bg-blue-600 text-white' : 'border'}`}>
                      {currentStep > step ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${currentStep >= step ? 'text-blue-700' : ''}`}>
                        {step === 1 ? "Informations de base" : 
                         step === 2 ? "Configuration" : 
                         "Confirmation"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {step === 1 ? "École, bus et type" : 
                         step === 2 ? "Horaires et arrêts" : 
                         "Vérification finale"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="col-span-2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {renderStepContent()}
              
              <div className="flex gap-3 pt-6 border-t">
                {currentStep > 1 && (
                  <button 
                    onClick={handlePrevStep}
                    className="px-6 py-3 border rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Retour
                  </button>
                )}
                
                <button 
                  onClick={handleNextStep}
                  className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${currentStep === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-black hover:opacity-90'} text-white`}
                >
                  {currentStep === 3 ? (
                    <>
                      <Check className="w-4 h-4" />
                      Créer le trajet
                    </>
                  ) : (
                    <>
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                {currentStep < 3 && (
                  <button 
                    onClick={() => {
                      onClose()
                      resetForm()
                    }}
                    className="px-6 py-3 border rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}