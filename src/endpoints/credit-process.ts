import { OpenAPIRoute, OpenAPIRouteSchema } from "chanfana";
import { CreditBadResponse, CreditRequest, CreditResponse } from "../types";

import type { ICreditResponse, ICreditRequest, AppContext } from "../types";

export class CreditProcess extends OpenAPIRoute {
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

	async handle(c: AppContext): Promise<ICreditResponse> {
		const data = await this.getValidatedData<typeof this.schema>();

		// Retrieve the validated parameters
		const { ticketId, dni, monto, callbackUrl } = data.body as ICreditRequest;

		return {
			ticketId,
			score: 100,
			finalStatus: "Aprobado",
		} satisfies ICreditResponse;
	}
}
