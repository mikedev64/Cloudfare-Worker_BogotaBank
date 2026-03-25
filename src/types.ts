import { Num, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export interface ICreditRequest {
	ticketId: string;
	dni: string;
	monto: number;
	callbackUrl: string;
}
export const CreditRequest = z.object({
	ticketId: Str({
		description: "Codigo de ticket del cliente",
		required: true,
	}),
	dni: Str({
		description: "Numero de identificacion del cliente",
		required: true,
	}),
	monto: Num({
		description: "Valor del monto a solicitar como credito",
		required: true,
	}),
	callbackUrl: Str({
		description: "Direccion/URL de integracion",
		required: true,
	}),
});

export interface ICreditResponse {
	ticketId: string;
	score: number;
	finalStatus: "Aprobado" | "Rechazado" | "Observado";
}
export const CreditResponse = z.object({
	ticketId: z.string({ description: "codigo de solicitud del cliente" }),
	score: z.number({ description: "puntaje del cliente" }),
	finalStatus: z.enum(["Aprobado", "Rechazado", "Observado"]),
});

export const CreditBadResponse = z.object({
	message: z.string({ message: "Error interno del servidor." }),
	statusCode: z.number(),
});
