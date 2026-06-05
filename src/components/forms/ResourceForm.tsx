import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { useNavigate } from "@tanstack/react-router";

export interface FieldDef {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

export interface ResourceFormProps<T extends Record<string, any>> {
  title: string;
  fields: FieldDef[];
  defaultValues?: Partial<T>;
  onSubmit: (values: T) => Promise<void> | void;
  submitting?: boolean;
  submitLabel?: string;
}

export function ResourceForm<T extends Record<string, any>>({ title, fields, defaultValues, onSubmit, submitting, submitLabel = "Enregistrer" }: ResourceFormProps<T>) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<T>({ defaultValues: defaultValues as any });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="mx-auto max-w-3xl">
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit as any)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <Input
                  label={f.label}
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  error={(errors as FieldErrors)[f.name]?.message as string}
                  {...(register as UseFormRegister<any>)(f.name, f.required ? { required: `${f.label} requis` } : {})}
                />
              </div>
            ))}
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: ".." as any })}>Annuler</Button>
              <Button type="submit" variant="accent" loading={submitting}>{submitLabel}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
