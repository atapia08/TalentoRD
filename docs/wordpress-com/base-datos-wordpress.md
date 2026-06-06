# Guardar Registros En La Base De Datos De WordPress

## Objetivo

Guardar talentos y empresas en una tabla propia de WordPress en lugar de `localStorage` o el JSON local del prototipo.

## Plugin creado

Ruta:

`wordpress-plugin/talentord-waitlist/talentord-waitlist.php`

Este plugin:

- Crea la tabla `wp_talentord_waitlist` al activarse.
- Guarda registros de talentos y empresas.
- Expone endpoints REST para la landing.
- Muestra los ultimos registros en el panel de WordPress.

El prefijo `wp_` puede cambiar segun la instalacion. WordPress usa el prefijo configurado en `$wpdb->prefix`.

## Tabla

Nombre logico:

`talentord_waitlist`

Nombre final usual:

`wp_talentord_waitlist`

Campos principales:

- `id`
- `type`
- `full_name`
- `email`
- `whatsapp`
- `company_name`
- `location`
- `sector`
- `talent_area`
- `experience_level`
- `opportunity_type`
- `profile_url`
- `talent_needs`
- `estimated_hires`
- `hiring_challenge`
- `message`
- `raw_data`
- `source`
- `created_at`

## Endpoints

Contador:

```text
GET /wp-json/talentord/v1/stats
```

Registro:

```text
POST /wp-json/talentord/v1/register
```

## Configurar la landing para WordPress

Antes de cargar `site/script.js`, definir:

```html
<script>
  window.TALENTORD_ENDPOINTS = {
    stats: "https://talentordcom.wordpress.com/wp-json/talentord/v1/stats",
    register: "https://talentordcom.wordpress.com/wp-json/talentord/v1/register"
  };
</script>
```

Si la landing vive dentro del mismo WordPress, tambien puede usarse:

```html
<script>
  window.TALENTORD_ENDPOINTS = {
    stats: "/wp-json/talentord/v1/stats",
    register: "/wp-json/talentord/v1/register"
  };
</script>
```

## Instalacion en WordPress.com

Segun la documentacion actual de WordPress.com, la instalacion de plugins requiere un plan pago con plugins habilitados. Si el sitio esta en un plan que no permite subir plugins personalizados, no se podra crear una tabla propia desde WordPress.com.

En ese caso, opciones:

- Usar formularios nativos de WordPress.com para validar.
- Usar un servicio externo de formularios/CRM.
- Migrar a WordPress.org o hosting propio cuando la validacion justifique control total.

## Instalacion manual

1. Comprimir la carpeta `wordpress-plugin/talentord-waitlist`.
2. Subir el ZIP desde `Plugins > Add New > Upload Plugin`.
3. Activar el plugin.
4. Probar `GET /wp-json/talentord/v1/stats`.
5. Configurar la landing para usar esos endpoints.

