# Sistema de Recompensas — Laboratorio

Proyecto listo para subir a **Vercel** y usar **Supabase** como base de datos.

## Features
- Identificador por teléfono de **10 dígitos**.
- Acumulación del **10%** del total.
- Canje **sin límite** (valida saldo suficiente).
- Consulta pública de puntos por teléfono.
- Notificación opcional por **WhatsApp (Twilio)**.

## Requisitos
- Node.js 18+
- Cuenta en Supabase y Vercel

## Variables de entorno
Crea `.env.local` (en local) y en Vercel (Project Settings → Environment Variables) con:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# WhatsApp opcional
WHATSAPP_ENABLED=false
WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_TWILIO_SID=
WHATSAPP_TWILIO_TOKEN=
LAB_NAME="Laboratorio de análisis clínicos Orizaba"
```

> Si no usarás WhatsApp aún, deja `WHATSAPP_ENABLED=false`.

## Primeros pasos
1. En **Supabase → SQL Editor**, ejecuta `schema.sql` (contenido de este repo).
2. En local:
   ```bash
   npm install
   npm run dev
   ```
   - `/puntos`: consulta pública del saldo.
   - `/admin`: registrar ventas y acumular puntos.

3. Sube el repo a GitHub y luego en **Vercel → New Project** → importa el repo → configura las env vars → Deploy.

## Endpoints
- `POST /api/patients` — crea/actualiza paciente (upsert por teléfono).
- `POST /api/transactions` — registra venta y acumula puntos.
- `GET  /api/points/:phone` — consulta saldo público.
- `POST /api/redeem` — canje de puntos (sin límite).

## Notas
- Este repositorio es un MVP funcional. Ajusta políticas RLS en Supabase para roles de staff en producción.
