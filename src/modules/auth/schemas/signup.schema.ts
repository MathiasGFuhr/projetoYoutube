import { z } from "zod";

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome muito longo"),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("Formato de e-mail inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter um número")
      .regex(/[^A-Za-z0-9]/, "Senha deve conter um caractere especial"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Você deve aceitar os termos",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
