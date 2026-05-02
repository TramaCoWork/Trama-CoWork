# Trama CoWork

Plataforma de networking profesional para independientes en Latinoamerica. Permite explorar perfiles de profesionales, conectar y colaborar en proyectos de arquitectura, diseno, tecnologia, urbanismo y mas.

## Tech Stack

- [Astro 6](https://astro.build) - Framework web
- [Tailwind CSS 4](https://tailwindcss.com) - Estilos utilitarios
- [TypeScript](https://www.typescriptlang.org) - Tipado estatico
- [Docker](https://www.docker.com) - Contenedorizacion

## Requisitos previos

- **Node.js** >= 22.12.0 (solo si se ejecuta sin Docker)
- **Docker** y **Docker Compose** (recomendado)

## Configuracion

Copiar el archivo de variables de entorno y ajustar los valores:

```sh
cp .env.example .env
```

| Variable              | Descripcion                        | Default                 |
| :-------------------- | :--------------------------------- | :---------------------- |
| `PORT`                | Puerto del servidor de desarrollo  | `4321`                  |
| `PUBLIC_API_BASE_URL` | URL base de la API backend         | `http://localhost:3000` |

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
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Comandos disponibles

| Comando           | Accion                                          |
| :---------------- | :---------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo en `:4321`     |
| `npm run build`   | Genera el sitio para produccion en `./dist/`    |
| `npm run preview` | Previsualiza el build localmente                |

## Estructura del proyecto

```
src/
├── assets/images/         # Imagenes del proyecto (logo, etc.)
├── components/            # Componentes Astro reutilizables
├── data/                  # Datos mock para desarrollo
├── layouts/               # Layouts (general y dashboard)
├── pages/                 # Paginas y rutas
│   ├── index.astro        # Home con buscador
│   ├── about.astro        # Mision, vision y equipo
│   ├── como-funciona.astro
│   ├── login.astro
│   ├── registro.astro
│   ├── terminos.astro
│   ├── categorias/        # Listado de especialidades
│   ├── profesionales/     # Directorio y perfil profesional
│   └── dashboard/         # Panel autenticado
├── services/              # Clientes API y servicios
└── styles/                # Estilos globales
```

## Paginas principales

| Ruta                    | Descripcion                              |
| :---------------------- | :--------------------------------------- |
| `/`                     | Home con buscador de profesionales       |
| `/profesionales`        | Directorio de profesionales              |
| `/profesionales/perfil` | Perfil detallado de un profesional       |
| `/categorias`           | Especialidades disponibles               |
| `/login`                | Inicio de sesion                         |
| `/registro`             | Registro de usuario                      |
| `/dashboard`            | Panel del profesional (requiere sesion)  |
| `/about`                | Sobre Trama CoWork                       |
| `/como-funciona`        | Como funciona la plataforma              |
| `/terminos`             | Terminos y condiciones                   |
