import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { RegistrationFormData } from "@/lib/types";

const personalInfoSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  pronouns: z.string().min(1, "Los pronombres son obligatorios"),
  email: z.string().email("Ingresa un email válido"),
  discordUsername: z.string().regex(/^.+#\d{4}$/, "Formato de Discord inválido (usuario#1234)"),
  communityAffiliation: z.enum(["si", "no", "prefiero-no-decir"], {
    required_error: "Por favor selecciona una opción",
  }),
  dataConsent: z.boolean().refine(val => val === true, "Debes aceptar el consentimiento de datos"),
  newsletter: z.boolean().optional(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoFormProps {
  formData: RegistrationFormData;
  onComplete: (data: Partial<RegistrationFormData>) => void;
  onPrevious: () => void;
}

export default function PersonalInfoForm({ formData, onComplete, onPrevious }: PersonalInfoFormProps) {
  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: formData.fullName,
      pronouns: formData.pronouns,
      email: formData.email,
      discordUsername: formData.discordUsername,
      communityAffiliation: formData.communityAffiliation || undefined,
      dataConsent: formData.dataConsent,
      newsletter: formData.newsletter,
    },
  });

  const onSubmit = (data: PersonalInfoFormData) => {
    onComplete(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <p className="text-sm text-slate-600">Completa tus datos para finalizar la inscripción</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre completo <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ejemplo: Alex Rivera Martínez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pronouns */}
              <FormField
                control={form.control}
                name="pronouns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pronombres <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tus pronombres" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ella">Ella</SelectItem>
                        <SelectItem value="el">Él</SelectItem>
                        <SelectItem value="elle">Elle</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
                        <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Correo electrónico <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discord Username */}
              <FormField
                control={form.control}
                name="discordUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Usuario de Discord <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="usuario#1234" {...field} />
                    </FormControl>
                    <p className="text-xs text-slate-500">Incluye el # y los números al final</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Community Affiliation */}

              {/* Data Consent */}
              <div className="border-t border-slate-200 pt-6">
                <FormField
                  control={form.control}
                  name="dataConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          <span className="font-medium">Confirmo que los datos proporcionados son correctos</span>{" "}
                          y doy mi consentimiento para su uso con fines organizativos (no comerciales, privados){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Newsletter */}
              <FormField
                control={form.control}
                name="newsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Deseo recibir información sobre futuros cursos y actualizaciones
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={onPrevious}>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Anterior
                </Button>
                <Button type="submit">
                  Continuar con confirmación
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}