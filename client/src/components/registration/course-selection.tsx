import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourseWithCommissions } from "@shared/schema";

interface CourseSelectionProps {
  onCourseSelect: (course: CourseWithCommissions) => void;
}

export default function CourseSelection({ onCourseSelect }: CourseSelectionProps) {
  const { data: courses, isLoading, error } = useQuery<CourseWithCommissions[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cursos Disponibles</CardTitle>
            <p className="text-sm text-slate-600">Cargando cursos...</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Error al cargar cursos</h3>
            <p className="text-slate-600">No se pudieron cargar los cursos disponibles. Por favor, intenta nuevamente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-slate-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No hay cursos disponibles</h3>
            <p className="text-slate-600">En este momento no hay cursos disponibles para inscripción.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "Principiante":
        return "bg-emerald-100 text-emerald-800";
      case "Intermedio":
        return "bg-amber-100 text-amber-800";
      case "Avanzado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getAvailabilityBadge = (availableCommissions: number) => {
    if (availableCommissions === 0) {
      return <Badge className="bg-red-100 text-red-800">Sin cupos</Badge>;
    }
    if (availableCommissions <= 2) {
      return <Badge className="bg-amber-100 text-amber-800">Pocos cupos</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-800">Disponible</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cursos Disponibles</CardTitle>
        <p className="text-sm text-slate-600">Selecciona el curso que te interesa</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border border-slate-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => onCourseSelect(course)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-medium text-slate-900 group-hover:text-primary">
                    {course.name}
                  </h4>
                  <Badge className={getLevelBadgeVariant(course.level)}>
                    {course.level}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{course.description}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H5z" />
                    </svg>
                    <span>{course.commissions.length} comisiones</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>Inicio: {course.startDate}</span>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
                {getAvailabilityBadge(course.availableCommissions)}
                <span className="text-lg font-bold text-slate-900">Gratuito</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}