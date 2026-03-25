import { fromHono } from "chanfana";
import { Hono } from "hono";
import { CreditProcess } from "./endpoints/credit-process";

const app = new Hono<{ Bindings: Env }>();

const openapi = fromHono(app, {
	docs_url: "/",
	openapi_url: "/openapi",
});

// Register OpenAPI endpoints
openapi.post("/api/credit/process", CreditProcess);

// Almacenar el spec de OpenAPI en memoria
let cachedSpec: Record<string, any> | null = null;

// Endpoint para servir openapi.json
app.get("/openapi.json", async (c) => {
	try {
		// Si no tenemos en caché, solicitar desde /openapi
		if (!cachedSpec) {
			const openAPIUrl = new URL(c.req.url);
			openAPIUrl.pathname = "/openapi";

			const res = await fetch(openAPIUrl.toString());
			if (res.ok) {
				cachedSpec = await res.json();
			}
		}

		// Servir el spec y descargar como archivo
		return c.json(cachedSpec || {}, 200, {
			"Content-Disposition": 'attachment; filename="openapi.json"',
		});
	} catch (error) {
		console.error("Error sirviendo openapi.json:", error);
		return c.json({ error: "No se pudo obtener el spec OpenAPI" }, 500);
	}
});

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

export default app;
