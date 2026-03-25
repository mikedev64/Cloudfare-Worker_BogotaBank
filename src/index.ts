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

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

export default app;