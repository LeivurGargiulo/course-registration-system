import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Cursos Web TTNb</h1>
          </div>
          <Button onClick={() => window.location.href = "/api/login"}>
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-4 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
              ✨ Educación Inclusiva en Desarrollo Web
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Aprende Desarrollo Web en un
              <span className="text-indigo-600"> Espacio Seguro</span>
            </h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Cursos de maquetado web diseñados específicamente para la comunidad travesti-trans-no binaria. 
              Un ambiente inclusivo donde tu identidad es respetada y celebrada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => window.location.href = "/api/login"}
              >
                Comenzar Inscripción
              </Button>
              <Button size="lg" variant="outline">
                Ver Cursos Disponibles
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              ¿Por qué elegir nuestros cursos?
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Ofrecemos una experiencia educativa única, diseñada para empoderar y construir comunidad.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏳️‍⚧️</span>
                </div>
                <CardTitle className="text-indigo-900">Espacio Inclusivo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Un ambiente seguro y afirmativo donde tu identidad de género es respetada. 
                  Uso correcto de pronombres y políticas anti-discriminación.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💻</span>
                </div>
                <CardTitle className="text-indigo-900">Educación Práctica</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Aprende HTML, CSS y técnicas de maquetado responsive con proyectos reales 
                  y mentoría personalizada.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <CardTitle className="text-indigo-900">Comunidad</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Conecta con otras personas de la comunidad TTNb, forma redes de apoyo 
                  y crea oportunidades laborales juntas.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Info Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Nuestros Cursos
            </h3>
            
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-indigo-900">Maquetado Web Nivel I</CardTitle>
                    <CardDescription>Introducción al desarrollo web frontend</CardDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800">Principiante</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Lo que aprenderás:</h4>
                    <ul className="text-slate-600 space-y-1">
                      <li>• Fundamentos de HTML5 semántico</li>
                      <li>• CSS3 y diseño responsive</li>
                      <li>• Flexbox y CSS Grid</li>
                      <li>• Accesibilidad web (WCAG)</li>
                      <li>• Herramientas de desarrollo</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Detalles del curso:</h4>
                    <ul className="text-slate-600 space-y-1">
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
      <section className="py-20 px-4 bg-indigo-600">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              ¿Lista para comenzar tu carrera en tech? 💜
            </h3>
            <p className="text-indigo-100 mb-8 text-lg">
              Únete a nuestra comunidad y da el primer paso hacia tu futuro en desarrollo web.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-indigo-50"
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