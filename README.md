# E-Commerce Storefront — Tienda Online Moderna

![Desarrollado por Diana Trujillo](https://img.shields.io/badge/Autora-Diana%20Trujillo-6366f1?style=for-the-badge&logo=github)
![Estado](https://img.shields.io/badge/Estado-Profesional-10b981?style=for-the-badge)
![Licencia](https://img.shields.io/badge/Licencia-MIT-3b82f6?style=for-the-badge)

## Descripción

Plataforma de comercio electrónico en **React 18 + Vite**: catálogo de productos, carrito de compras con contexto global, checkout y animaciones con Framer Motion. Lista para conectar pasarela de pago (Stripe) vía variables de entorno.

## Demo

- Repositorio: <https://github.com/Diani39ec/ecommerce>
- Demo local (Laragon): `http://ecommerce.test`
- Demo dev: `npm run dev` → `http://localhost:5173`

## Características

- Catálogo con datos locales y filtros
- Carrito persistente (contexto React)
- Flujo de checkout
- Animaciones fluidas y diseño responsivo

## Tecnologías

`React 18` `Vite` `React Router` `Framer Motion` `lucide-react` `JavaScript` `CSS3`

## Instalación

```bash
git clone https://github.com/Diani39ec/ecommerce.git
cd ecommerce
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción (genera dist/)
npm run preview  # previsualizar el build
```

## Variables de entorno

Copia `.env.example` a `.env`. La clave de Stripe incluida es un placeholder de prueba.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de API del backend | `/api` |
| `VITE_STRIPE_KEY` | Clave pública de Stripe | `pk_test_tu_clave_aquí` |
| `VITE_STORE_NAME` | Nombre de la tienda | `GreenMart` |

> Seguridad: sin secretos hardcodeados; usa solo la clave **pública** (`pk_*`) en el frontend. La clave secreta (`sk_*`) debe vivir exclusivamente en el backend y nunca se sube al repo.

## Autora

**Diana Trujillo © 2026**
Desarrolladora de Software — GitHub: [Diani39ec](https://github.com/Diani39ec)

## Licencia

MIT. Consulta el archivo `LICENSE` para más detalles.
