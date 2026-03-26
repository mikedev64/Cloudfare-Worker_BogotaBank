import { OpenAPIRoute, OpenAPIRouteSchema } from "chanfana";
import { CreditBadResponse, CreditRequest, CreditResponse } from "../types";

import type { ICreditResponse, ICreditRequest, AppContext, ICreditBadResponse } from "../types";

let flowRetrys = 0;

export class CreditProcess extends OpenAPIRoute {
	riskScore = 0;
	schema: OpenAPIRouteSchema = {
		tags: ["Credit Process Request"],
		summary: "Procesa la solicitud de credito",
		request: {
			body: {
				description: "Cuerpo de datos para procesar la solicitud del credito",
				content: {
					"application/json": {
						schema: CreditRequest,
					},
				},
				required: true,
			},
		},
		responses: {
			"200": {
				description: "Retorna la respuesta de la evaluacion de las entradas",
				content: {
					"application/json": {
						schema: CreditResponse,
					},
				},
			},
			"500": {
				description: "Retorna un mensaje JSON por defecto tras un error inesperado",
				content: {
					"application/json": {
						schema: CreditBadResponse,
					},
				},
			},
		},
	};

	increaseRiskScore(increase: number): void {
		this.riskScore += increase;

		if (this.riskScore > 100) this.riskScore = 100;
	}

	decreaseRiskScore(decrease: number): void {
		this.riskScore -= decrease;

		if (this.riskScore < 0) this.riskScore = 0;
	}

	checkBody(body: ICreditRequest): boolean {
		if (!body.ticketId || typeof body.ticketId !== "string") return false;
		if (!body.dni || typeof body.dni !== "string") return false;
		if (!body.monto || typeof body.monto !== "number" || body.monto < 0) return false;
		if (!body.callbackUrl || typeof body.callbackUrl !== "string") return false;

		return true;
	}

	async sendWebhook(callbackUrl: string, data: ICreditResponse): Promise<void> {
		try {
			await new Promise((resolve) => setTimeout(resolve, 6000));

			await fetch(callbackUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
		} catch (error: unknown) {
			console.error("Error enviando webhook:", error);
		}
	}

	checkVerification(dni: string, monto: number): ICreditResponse["finalStatus"] {
		if (monto > 50000) this.increaseRiskScore(15);
		if (dni.length > 8) return "Aprobado";

		const dniTotal = dni.split("").reduce((acumulador, digitoActual) => {
			return acumulador + parseInt(digitoActual, 10);
		}, 0);

		if (dniTotal % 2 === 0) this.decreaseRiskScore(20);

		if (this.riskScore > 60) return "Rechazado";
		if (this.riskScore > 30) return "Observado";

		return "Aprobado";
	}

	async handle(c: AppContext): Promise<Response | ICreditBadResponse> {
		try {
			++flowRetrys;

			console.log(`Intentos del flujo ${flowRetrys}`);

			const min = 1;
			const max = 100;
			const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);

			if (randomNumber === 1)
				return Response.json(
					{
						message: "Error del servidor",
						statusCode: 500,
					} satisfies ICreditBadResponse,
					{
						status: 500,
					},
				);

			const data = await this.getValidatedData<typeof this.schema>();

			if (!this.checkBody(data.body))
				return Response.json(
					{
						message: "Error del servidor",
						statusCode: 401,
					} satisfies ICreditBadResponse,
					{
						status: 401,
					},
				);

			const { ticketId, dni, monto, callbackUrl } = data.body as ICreditRequest;

			const dniLength = dni.length;
			const montoFactor = Math.min(30, Math.floor(Number(monto) / 1000));
			const randomFactor = Math.floor(randomNumber / 2);
			this.riskScore = dniLength + montoFactor + randomFactor;

			const aprobacion: ICreditResponse["finalStatus"] = this.checkVerification(dni, monto);

			const responseData: ICreditResponse = {
				ticketId,
				score: this.riskScore,
				finalStatus: aprobacion,
			};

			this.sendWebhook(callbackUrl, responseData);

			flowRetrys = 0;

			return {
				statusCode: 200,
				message: "La solicitud de crédito se está procesando. Recibirá los resultados en el webhook proporcionado.",
			} as ICreditBadResponse;
		} catch (error: unknown) {
			flowRetrys = 0;
			return Response.json(
				{
					message: "Error del servidor",
					statusCode: 500,
				} satisfies ICreditBadResponse,
				{
					status: 500,
				},
			);
		}
	}
}
