# Tailwind Scaffold para tu proyecto

Archivos incluidos (colócalos en estas rutas exactas):

- app/layout.tsx
- app/globals.css
- tailwind.config.js
- postcss.config.js

## Pasos

1) Copia estos archivos a la raíz de tu proyecto, respetando rutas.
2) Asegúrate de tener instalado:
   npm i -D tailwindcss postcss autoprefixer
3) Limpia la caché y corre el server:
   rm -rf .next
   npm run dev

Si ya tienes un `layout.tsx`, solo verifica que:
- importe `./globals.css`
- el <body> tenga clases tailwind (p. ej. bg-gray-50 text-gray-900)

Listo ✨
