Desplegada en Cloudfare Workers
### Puntos de entrada
- api/credit/process -> método POST
### Flujo
- Recibe una solicitud HTTP -> ítem generado y actualizado -> {Pantalla de Power Apps}
- Validar entradas: DNI numérico, monto no negativo
- Calcular el `riskScore`, determina el estado de la solicitud, registra en consola los intentos del Flow
### Temas a considerar:
- Simulación de fallos al 1% (cada 100 peticiones puede haber un error)
- Simulación de espera (responder por medio de `CallbackUrl` después de 6 segundos de haber recibido y procesado la petición inicial hecha por la Pantalla de Power Apps)