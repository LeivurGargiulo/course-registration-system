import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">CR</span>
            </div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 truncate">Sistema de Inscripciones</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user?.profileImageUrl && (
              <img 
                src={user.profileImageUrl} 
                alt="Perfil" 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
            )}
            <span className="text-slate-700 text-sm sm:text-base hidden sm:block">
              Hola, {user?.firstName || user?.email || "Usuario"}!
            </span>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
              onClick={() => window.location.href = "/api/logout"}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
              ¡Bienvenide al Sistema de Inscripciones! 🌟
            </h2>
            <p className="text-slate-600 text-base sm:text-lg px-2">
              Desde aquí puedes inscribirte a nuestros cursos de desarrollo web y acceder a funciones administrativas.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Registration Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-indigo-200 transition-colors">
                  <span className="text-2xl sm:text-3xl">📚</span>
                </div>
                <CardTitle className="text-indigo-900 text-lg sm:text-xl">Inscripción a Cursos</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Explora nuestros cursos disponibles e inscríbete en las comisiones que mejor se adapten a tu horario.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link href="/registration">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base">
                    Comenzar Inscripción
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-emerald-200 transition-colors">
                  <span className="text-2xl sm:text-3xl">⚙️</span>
                </div>
                <CardTitle className="text-emerald-900 text-lg sm:text-xl">Panel de Administración</CardTitle>
                <CardDescription className="text-sm sm:text-base px-2">
                  Accede al panel administrativo para gestionar cursos, comisiones e inscripciones.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link href="/admin">
                  <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm sm:text-base">
                    Acceder al Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Course Highlight */}
          <Card className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">Maquetado Web Nivel I</CardTitle>
                  <CardDescription className="text-indigo-100 text-sm sm:text-base">
                    Nuestro curso estrella de introducción al desarrollo web frontend
                  </CardDescription>
                </div>
                <Badge className="bg-white/20 text-white self-start text-xs sm:text-sm px-2 py-1">Principiante</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Aprenderás:</h4>
                  <ul className="text-indigo-100 space-y-1 text-xs sm:text-sm">
                    <li>• HTML5 semántico y accesible</li>
                    <li>• CSS3 moderno y responsive design</li>
                    <li>• Flexbox y CSS Grid</li>
                    <li>• Mejores prácticas de desarrollo</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Detalles:</h4>
                  <ul className="text-indigo-100 space-y-1 text-xs sm:text-sm">
                    <li>• 8 semanas de duración</li>
                    <li>• Horarios flexibles</li>
                    <li>• Ambiente inclusivo y seguro</li>
                    <li>• Certificación incluida</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 sm:mt-6">
                <Link href="/registration">
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto text-sm sm:text-base">
                    Ver Comisiones Disponibles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <div className="mt-8 sm:mt-12 text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">¿Necesitas ayuda?</h3>
            <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
              Nuestro equipo está aquí para apoyarte en cada paso de tu proceso de inscripción.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Button variant="outline" className="text-sm sm:text-base">
                📧 Contactar Soporte
              </Button>
              <Button variant="outline" className="text-sm sm:text-base">
                💬 Chat en Discord
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 py-8 px-4 mt-16">
        <div className="container mx-auto text-center">
          <p className="text-slate-600">
            Sistema de Inscripciones - Cursos Web TTNb © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}