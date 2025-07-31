import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, CommissionWithAvailability } from "@shared/schema";

interface CommissionSelectionProps {
  course: Course;
  onCommissionSelect: (commission: CommissionWithAvailability) => void;
  onPrevious: () => void;
}

export default function CommissionSelection({
  course,
  onCommissionSelect,
  onPrevious,
}: CommissionSelectionProps) {
  const { data: commissions, isLoading, error } = useQuery<CommissionWithAvailability[]>({
    queryKey: ["/api/courses", course.id, "commissions"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Comisión</CardTitle>
            <p className="text-sm text-slate-600">Cargando horarios...</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <div className="flex space-x-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
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
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-500 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Error al cargar comisiones</h3>
              <p className="text-slate-600">No se pudieron cargar los horarios disponibles.</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Anterior
          </Button>
        </div>
      </div>
    );
  }

  if (!commissions || commissions.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-slate-400 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No hay comisiones disponibles</h3>
              <p className="text-slate-600">Este curso no tiene horarios disponibles en este momento.</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Anterior
          </Button>
        </div>
      </div>
    );
  }

  const getAvailabilityBadge = (commission: CommissionWithAvailability) => {
    if (commission.availableSpots === 0) {
      return <Badge className="bg-red-100 text-red-800">Sin cupos</Badge>;
    }
    if (commission.availableSpots <= 3) {
      return <Badge className="bg-amber-100 text-amber-800">{commission.availableSpots} cupos disponibles</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-800">{commission.availableSpots} cupos disponibles</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Course Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <span className="font-medium text-blue-900">Curso seleccionado:</span>
              <span className="text-blue-700 ml-2">{course.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Comisión</CardTitle>
          <p className="text-sm text-slate-600">Elige el horario que mejor se adapte a tu disponibilidad</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {commissions.map((commission) => (
            <div
              key={commission.id}
              className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                commission.availableSpots > 0
                  ? "border-slate-200 hover:border-primary hover:shadow-md"
                  : "border-slate-200 opacity-60 cursor-not-allowed"
              }`}
              onClick={() => commission.availableSpots > 0 && onCommissionSelect(commission)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-slate-900">{commission.code}</h4>
                    {getAvailabilityBadge(commission)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>{commission.days}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{commission.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H5z" />
                      </svg>
                      <span>{commission.instructor}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-slate-500">Inicio</div>
                  <div className="font-medium text-slate-900">{commission.startDate}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Anterior
        </Button>
      </div>
    </div>
  );
}