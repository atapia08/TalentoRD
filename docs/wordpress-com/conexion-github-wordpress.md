# Conexion GitHub Y WordPress.com

## Sitios conectados al proyecto

- Repositorio GitHub: https://github.com/atapia08/TalentoRD
- Sitio WordPress.com: https://talentordcom.wordpress.com/

## Decision actual

El repositorio TalentoRD se usa para documentacion, diseno y desarrollo. La primera version del sitio se construye manualmente en WordPress.com para validar la idea con rapidez.

## Conexion recomendada en esta fase

En esta etapa, la conexion correcta es operativa:

- GitHub conserva documentacion, decisiones, diseno y backlog.
- WordPress.com aloja el sitio visible para validacion.
- El campo Website del repositorio GitHub apunta al sitio WordPress.com.
- Los cambios de contenido del sitio se documentan en este repositorio antes o despues de aplicarlos manualmente.

## Sobre GitHub Deployments de WordPress.com

WordPress.com permite conectar repositorios de GitHub para despliegues, pero esta funcion esta pensada para desplegar codigo del sitio, temas, plugins o cambios completos. Tambien depende del plan de WordPress.com.

No se recomienda desplegar este repositorio ahora porque contiene documentacion y no un tema o plugin listo para produccion.

## Si se activa GitHub Deployments mas adelante

Antes de conectar el repo como despliegue:

1. Confirmar que el plan de WordPress.com soporte GitHub Deployments.
2. Separar el codigo desplegable de la documentacion.
3. Definir destino de despliegue:
   - Tema: `/wp-content/themes/talentord`
   - Plugin: `/wp-content/plugins/talentord`
   - Varios componentes: `/wp-content`
4. Usar despliegue manual para evitar cambios accidentales en produccion.
5. Crear `.deployignore` si el repositorio contiene archivos que no deben copiarse al sitio.

## Flujo de trabajo actual

1. Definir contenido, funcionalidades o decisiones en GitHub.
2. Aplicar manualmente los cambios necesarios en WordPress.com.
3. Registrar aprendizajes en `docs/decisiones.md` o documentos relacionados.
4. Cuando la idea valide, preparar migracion a WordPress.org.

