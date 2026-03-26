Definicion de datos de entrada a /api/credit/process
```ts
export interface ICreditRequest {
        ticketId: string;
        dni: string;
        monto: number;
        callbackUrl: string;
}
```

Definicion de datos de envio a travez /api/credit/process hacia el `CallbackUrl`
```ts
export interface ICreditResponse {
	ticketId: string;
	score: number;
	finalStatus: "Aprobado" | "Rechazado" | "Observado";
}
```

Definicion de datos como retorno por defecto en caso de fallo o proceso asincrono post-peticion
```ts
export interface ICreditBadResponse {
	message: string;
	statusCode: number;
}
```