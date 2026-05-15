# Trama CoWork

Plataforma de networking profesional para independientes en Latinoamerica. Permite explorar perfiles de profesionales, conectar y colaborar en proyectos de arquitectura, diseno, tecnologia, urbanismo y mas.

## Tech Stack

- [Astro 6](https://astro.build) - Framework web
- [Tailwind CSS 4](https://tailwindcss.com) - Estilos utilitarios
- [TypeScript](https://www.typescriptlang.org) - Tipado estatico
- [pnpm](https://pnpm.io) - Package manager
- [Docker](https://www.docker.com) - Contenedorizacion

## Requisitos previos

- **Node.js** >= 22.12.0 (incluye corepack para pnpm)
- **pnpm** >= 11 (se activa con `corepack enable`)
- **Docker** y **Docker Compose** (recomendado)

## Configuracion

Copiar el archivo de variables de entorno y ajustar los valores:

```sh
cp .env.example .env
```

| Variable                   | Descripcion                        | Default                    |
| :------------------------- | :--------------------------------- | :------------------------- |
| `PORT`                     | Puerto del servidor de desarrollo  | `4321`                     |
| `PUBLIC_API_BASE_URL`      | URL base de la API backend         | `http://localhost:3003`    |
| `PUBLIC_BASE_URL`          | URL base del frontend (produccion) | `http://localhost:4321`    |
| `PUBLIC_TURNSTILE_SITE_KEY`| Clave publica de Cloudflare Turnstile | (ver `.env.example`)    |

## Ejecucion con Docker (recomendado)

```sh
# Construir la imagen y levantar el contenedor
docker compose up --build

# Levantar sin reconstruir (si ya se construyo antes)
docker compose up

# Levantar en segundo plano (detached)
docker compose up -d

# Ver logs cuando corre en segundo plano
docker compose logs -f

# Detener los contenedores
docker compose down
```

La aplicacion estara disponible en `http://localhost:4321` (o el puerto configurado en `.env`).

Los cambios en el codigo se reflejan automaticamente gracias al volume mount configurado en `docker-compose.yml`.

## Ejecucion sin Docker

```sh
# Activar pnpm via corepack (una sola vez)
corepack enable

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

## Comandos disponibles

| Comando            | Accion                                          |
| :----------------- | :---------------------------------------------- |
| `pnpm dev`         | Inicia el servidor de desarrollo en `:4321`     |
| `pnpm build`       | Genera el sitio para produccion en `./dist/`    |
| `pnpm preview`     | Previsualiza el build localmente                |
| `pnpm lint`        | Ejecuta el linter (Biome)                       |
| `pnpm lint:fix`    | Corrige errores de lint automaticamente         |
| `pnpm test`        | Ejecuta los tests (Vitest)                      |
| `pnpm test:watch`  | Ejecuta los tests en modo watch                 |
| `pnpm ci`          | Ejecuta lint + tests + build (simula el CI)     |

## Verificacion local (pre-push)

Antes de hacer push o abrir un PR, ejecuta las verificaciones localmente:

```sh
# Todo junto (lint + tests + build)
pnpm ci

# O individualmente
pnpm lint        # Verifica estilo y errores de codigo
pnpm test        # Ejecuta tests unitarios
pnpm build       # Verifica que compile sin errores
```

Con Docker:

```sh
docker compose exec app pnpm ci

# O individualmente
docker compose exec app pnpm lint
docker compose exec app pnpm test
docker compose exec app pnpm build
```

Estas mismas verificaciones se ejecutan automaticamente en cada Pull Request via GitHub Actions.

## Estructura del proyecto

```
src/
├── assets/images/         # Imagenes del proyecto (logo, fotos)
├── components/            # Componentes Astro reutilizables
├── layouts/               # Layouts (general y dashboard)
├── pages/                 # Paginas y rutas
│   ├── index.astro        # Home con buscador
│   ├── about.astro        # Mision, vision y equipo
│   ├── como-funciona.astro
│   ├── contacto.astro     # Formulario de contacto (Turnstile)
│   ├── login.astro
│   ├── registro.astro
│   ├── recuperar-contrasena.astro
│   ├── reset-password.astro
│   ├── terminos.astro
│   ├── rubros/            # Listado de especialidades
│   ├── profesionales/     # Directorio y perfil profesional
│   ├── dashboard/         # Panel autenticado
│   │   ├── index.astro    # Dashboard principal
│   │   ├── perfil.astro   # Wizard de perfil / formulario
│   │   ├── estudios.astro # Educacion y formacion
│   │   ├── comunidad.astro# Comunidad (posts y comentarios)
│   │   └── pagos/         # Suscripciones y pagos (MercadoPago)
│   └── admin/             # Panel de administracion
│       ├── index.astro    # Dashboard admin
│       ├── profesionales/ # Gestion de profesionales
│       └── cambiar-clave.astro
├── services/              # Clientes API y servicios
└── styles/                # Estilos globales
```

## Paginas principales

| Ruta                       | Descripcion                              |
| :------------------------- | :--------------------------------------- |
| `/`                        | Home con buscador de profesionales       |
| `/profesionales`           | Directorio de profesionales              |
| `/profesionales/perfil`    | Perfil detallado de un profesional       |
| `/rubros`                  | Especialidades disponibles               |
| `/contacto`                | Formulario de contacto                   |
| `/login`                   | Inicio de sesion                         |
| `/registro`                | Registro de usuario                      |
| `/recuperar-contrasena`    | Solicitar recuperacion de contrasena     |
| `/reset-password`          | Restablecer contrasena con token         |
| `/dashboard`               | Panel del profesional (requiere sesion)  |
| `/dashboard/perfil`        | Perfil y wizard de onboarding            |
| `/dashboard/estudios`      | Educacion y formacion                    |
| `/dashboard/comunidad`     | Comunidad y posts                        |
| `/dashboard/pagos`         | Suscripciones y pagos                    |
| `/admin`                   | Panel de administracion                  |
| `/admin/profesionales`     | Gestion de profesionales                 |
| `/about`                   | Sobre Trama CoWork                       |
| `/como-funciona`           | Como funciona la plataforma              |
| `/terminos`                | Terminos y condiciones                   |
