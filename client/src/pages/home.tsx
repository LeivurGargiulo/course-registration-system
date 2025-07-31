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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Sistema de Inscripciones</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user?.profileImageUrl && (
              <img 
                src={user.profileImageUrl} 
                alt="Perfil" 
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-slate-700">
              Hola, {user?.firstName || user?.email || "Usuario"}!
            </span>
            <Button variant="outline" onClick={() => window.location.href = "/api/logout"}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              ¡Bienvenide al Sistema de Inscripciones! 🌟
            </h2>
            <p className="text-slate-600 text-lg">
              Desde aquí puedes inscribirte a nuestros cursos de desarrollo web y acceder a funciones administrativas.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Registration Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                  <span className="text-3xl">📚</span>
                </div>
                <CardTitle className="text-indigo-900">Inscripción a Cursos</CardTitle>
                <CardDescription>
                  Explora nuestros cursos disponibles e inscríbete en las comisiones que mejor se adapten a tu horario.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/registration">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Comenzar Inscripción
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                  <span className="text-3xl">⚙️</span>
                </div>
                <CardTitle className="text-emerald-900">Panel de Administración</CardTitle>
                <CardDescription>
                  Accede al panel administrativo para gestionar cursos, comisiones e inscripciones.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/admin">
                  <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                    Acceder al Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Course Highlight */}
          <Card className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Maquetado Web Nivel I</CardTitle>
                  <CardDescription className="text-indigo-100">
                    Nuestro curso estrella de introducción al desarrollo web frontend
                  </CardDescription>
                </div>
                <Badge className="bg-white/20 text-white">Principiante</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Aprenderás:</h4>
                  <ul className="text-indigo-100 space-y-1 text-sm">
                    <li>• HTML5 semántico y accesible</li>
                    <li>• CSS3 moderno y responsive design</li>
                    <li>• Flexbox y CSS Grid</li>
                    <li>• Mejores prácticas de desarrollo</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Detalles:</h4>
                  <ul className="text-indigo-100 space-y-1 text-sm">
                    <li>• 8 semanas de duración</li>
                    <li>• Horarios flexibles</li>
                    <li>• Ambiente inclusivo y seguro</li>
                    <li>• Certificación incluida</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/registration">
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                    Ver Comisiones Disponibles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">¿Necesitas ayuda?</h3>
            <p className="text-slate-600 mb-6">
              Nuestro equipo está aquí para apoyarte en cada paso de tu proceso de inscripción.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                📧 Contactar Soporte
              </Button>
              <Button variant="outline">
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