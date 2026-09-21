import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 pt-20 lg:pt-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            Colección Ecológica
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 text-balance">
            Productos <span className="text-emerald-200">100% Ecológicos</span>
          </h1>
          <p className="text-lg lg:text-xl text-emerald-100 mb-8 max-w-xl mx-auto">
            Descubre productos naturales y orgánicos del Ecuador. Envío rápido, devoluciones fáciles y calidad incomparable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Comprar Ahora
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
            >
              Ver Colecciones
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 lg:mt-20 max-w-4xl mx-auto">
          {[
            { icon: Truck, title: 'Envío Gratis', desc: 'En compras sobre $50' },
            { icon: ShieldCheck, title: 'Pago Seguro', desc: '100% protegido' },
            { icon: RotateCcw, title: 'Devoluciones Fáciles', desc: 'Política de 30 días' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-emerald-100">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-16 bg-gradient-to-b from-transparent to-white" />
    </section>
  )
}
