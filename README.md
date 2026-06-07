# TalentoRD

Repositorio de documentación, diseño y desarrollo para validar TalentoRD con una primera versión simple en WordPress.com.

## Objetivo

Validar la idea con un sitio manual en WordPress.com antes de invertir en WordPress.org, hosting propio y desarrollo a medida.

## Enfoque actual

- Usar este repositorio solo para documentar, diseñar y desarrollar.
- Montar la primera version del sitio manualmente en WordPress.com.
- Crear paginas, menu, formularios y configuraciones con herramientas disponibles en WordPress.com.
- Medir interes real antes de migrar a WordPress.org.

## Sitio de validacion

- WordPress.com: https://talentordcom.wordpress.com/
- GitHub: https://github.com/atapia08/TalentoRD

## Validacion actual

- Landing page: `docs/wordpress-com/landing-validacion.md`
- Formularios de lista de espera: `docs/wordpress-com/formularios-lista-espera.md`
- Landing codificada: `site/index.html`
- Meta: 10,000 talentos registrados y 1,000 empresas en lista de espera.
- Referencias de marketplaces: `docs/diseno/referencias-marketplaces.md`

## Vista local

Para usar el contador real y guardar registros:

```bash
node server.js
```

Luego abrir `http://localhost:4173/`.

Los registros se guardan localmente en `data/waitlist.json`. Ese archivo esta ignorado por Git porque puede contener correos y WhatsApp. La plantilla versionada es `data/waitlist.example.json`.

Detalle tecnico: `docs/desarrollo/contador-real.md`.

Para guardar registros en la base de datos de WordPress, usar el plugin `wordpress-plugin/talentord-waitlist` y la guia `docs/wordpress-com/base-datos-wordpress.md`.

ZIP instalable local: `dist/talentord-waitlist.zip` despues de empaquetar el plugin.

## Estructura

- `docs/producto/`: vision, alcance, usuarios y propuesta de valor.
- `docs/wordpress-com/`: guia de montaje manual en WordPress.com.
- `docs/diseno/`: identidad visual, estructura de paginas y experiencia.
- `docs/funcionalidades/`: funcionalidades del MVP y backlog futuro.
- `docs/migracion/`: criterios y plan para pasar a WordPress.org.

## Estado

Fase inicial: documentacion base y preparacion del primer sitio validable.
