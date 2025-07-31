import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">CR</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Cursos Web TTNb</h1>
          </div>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            size="sm"
            className="text-sm px-3 py-2 sm:px-4 sm:py-2"
          >
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-xs sm:text-sm px-3 py-1">
              ✨ Educación Inclusiva en Desarrollo Web
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
              Aprende Desarrollo Web en un
              <span className="text-indigo-600 block sm:inline"> Espacio Seguro</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed px-2">
              Cursos de maquetado web diseñados específicamente para la comunidad travesti-trans-no binaria. 
              Un ambiente inclusivo donde tu identidad es respetada y celebrada.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                onClick={() => window.location.href = "/api/login"}
              >
                Comenzar Inscripción
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver Cursos Disponibles
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
              ¿Por qué elegir nuestros cursos?
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto px-4 text-sm sm:text-base">
              Ofrecemos una experiencia educativa única, diseñada para empoderar y construir comunidad.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">🏳️‍⚧️</span>
                </div>
                <CardTitle className="text-indigo-900 text-lg sm:text-xl">Espacio Inclusivo</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-sm sm:text-base">
                  Un ambiente seguro y afirmativo donde tu identidad de género es respetada. 
                  Uso correcto de pronombres y políticas anti-discriminación.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">💻</span>
                </div>
                <CardTitle className="text-indigo-900 text-lg sm:text-xl">Educación Práctica</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-sm sm:text-base">
                  Aprende HTML, CSS y técnicas de maquetado responsive con proyectos reales 
                  y mentoría personalizada.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">🤝</span>
                </div>
                <CardTitle className="text-indigo-900 text-lg sm:text-xl">Comunidad</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-sm sm:text-base">
                  Conecta con otras personas de la comunidad TTNb, forma redes de apoyo 
                  y crea oportunidades laborales juntas.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Info Section */}
      <section className="py-12 sm:py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 text-center">
              Nuestros Cursos
            </h3>
            
            <Card className="mb-6 sm:mb-8">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl text-indigo-900 mb-1">Maquetado Web Nivel I</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Introducción al desarrollo web frontend</CardDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 self-start text-xs sm:text-sm px-2 py-1">Principiante</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Lo que aprenderás:</h4>
                    <ul className="text-slate-600 space-y-1 text-sm sm:text-base">
                      <li>• Fundamentos de HTML5 semántico</li>
                      <li>• CSS3 y diseño responsive</li>
                      <li>• Flexbox y CSS Grid</li>
                      <li>• Accesibilidad web (WCAG)</li>
                      <li>• Herramientas de desarrollo</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Detalles del curso:</h4>
                    <ul className="text-slate-600 space-y-1 text-sm sm:text-base">
                      <li>• <strong>Duración:</strong> 8 semanas</li>
                      <li>• <strong>Modalidad:</strong> Presencial/Virtual</li>
                      <li>• <strong>Horarios:</strong> Flexibles</li>
                      <li>• <strong>Certificación:</strong> Incluida</li>
                      <li>• <strong>Costo:</strong> Gratuito</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-indigo-600">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 px-2">
              ¿Lista para comenzar tu carrera en tech? 💜
            </h3>
            <p className="text-indigo-100 mb-6 sm:mb-8 text-base sm:text-lg px-4">
              Únete a nuestra comunidad y da el primer paso hacia tu futuro en desarrollo web.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto max-w-xs mx-auto"
              onClick={() => window.location.href = "/api/login"}
            >
              Inscribirme Ahora
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-slate-400">
            © 2024 Cursos Web TTNb. Un espacio seguro para aprender y crecer juntas.
          </p>
        </div>
      </footer>
    </div>
  );
}