# Rutina visual

App personal de rutinas diarias con estrellas y premios, pensada para niños que necesitan una estructura visual clara. Funciona en el navegador del iPhone y se puede añadir a la pantalla de inicio.

Es un proyecto independiente. No está afiliado a Charty ni usa su código, nombre ni recursos.

## Antes de publicar: privacidad

Este repositorio es **público**. Por eso:

- **No subas datos de tu hija al código.** Su nombre, sus tareas reales, sus premios y sus estrellas se escriben dentro de la app y se guardan solo en el navegador de cada dispositivo (localStorage). No se envían a ningún servidor.
- **El PIN de Ajustes es una protección sencilla**, no seguridad real. Cualquiera con acceso al teléfono podría borrarlo desde las herramientas del navegador. Sirve para que un niño no cambie las reglas por error o a propósito, no para proteger información sensible.
- **La URL de GitHub Pages es pública.** Cualquiera que la tenga puede abrir la app, aunque no vea tus datos, que están en tu teléfono.
- Los datos de ejemplo de `src/storage.js` son genéricos. Cámbialos desde la pestaña Ajustes, no editando el código.

## Uso en iPhone

1. Abre la URL de la app en Safari.
2. Toca el botón **Compartir** y luego **Añadir a pantalla de inicio**.
3. Abre la app desde el ícono nuevo.
4. Entra a **Ajustes** (PIN de 4 números, que lo creas la primera vez), ponle el nombre, edita las tareas y los premios.

Cada dispositivo tiene sus propios datos. Si usas la app en dos teléfonos, tendrás que configurarla en ambos.

## Cómo funciona

- **Hoy:** la lista de tareas del día. Al marcar una, suma sus estrellas. Si se desmarca, las resta.
- **Premios:** canjea estrellas por premios. Cada canje pide confirmación.
- **Ajustes:** nombre, regla de la casa, tareas, premios, estrellas y PIN.
- Al cambiar de día se desmarcan las tareas. Las estrellas se conservan.

La app no bloquea el teléfono. Para eso se necesita otra herramienta del propio iPhone.

## Desarrollo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev      # desarrollo local
npm run build    # genera la carpeta dist/
```

## Publicar en GitHub Pages

1. En el repositorio, ve a **Settings → Pages**.
2. En **Build and deployment**, elige **Source: GitHub Actions**.
3. Cada `push` a `main` despliega la app automáticamente con el workflow de `.github/workflows/deploy.yml`.

La URL queda como `https://<usuario>.github.io/rutina-visual/`.
