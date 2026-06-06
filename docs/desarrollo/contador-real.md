# Contador Real Y Almacenamiento

## Estado actual

La landing ya no depende de `localStorage` para contar registros. Ahora usa una API local en `server.js`.

## Donde se almacenan los datos

Los registros se guardan en:

`data/waitlist.json`

Ese archivo es local y esta ignorado por Git porque puede contener datos personales como correo y WhatsApp. La plantilla segura versionada es:

`data/waitlist.example.json`

Estructura:

- `seed.talento`: conteo inicial de talentos antes de usar la API.
- `seed.empresa`: conteo inicial de empresas antes de usar la API.
- `entries`: registros recibidos desde los formularios.

## Contador

El contador se calcula asi:

- Talentos actuales = `seed.talento` + registros en `entries` con `type: "talento"`.
- Empresas actuales = `seed.empresa` + registros en `entries` con `type: "empresa"`.

Metas:

- Talentos: 10,000.
- Empresas: 1,000.

## Ejecutar localmente

Desde la raiz del proyecto:

```bash
node server.js
```

Luego abrir:

```text
http://localhost:4173/
```

## Endpoints

Obtener contador:

```text
GET /api/stats
```

Registrar talento o empresa:

```text
POST /api/register
```

## Nota para produccion

Este almacenamiento en JSON sirve para prototipo local. Para WordPress.com, los datos deben guardarse usando formularios de WordPress.com o una herramienta conectada. Para WordPress.org/hosting propio, conviene mover esto a base de datos, CRM o plugin/formulario con exportacion.
