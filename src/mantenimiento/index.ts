export default {
  async fetch(request, env) {
    if (env.MAINTENANCE === 'on') {
      return new Response(MAINTENANCE_HTML, {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '120',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
    return fetch(request);
  },
};

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trama Cowork - Mantenimiento</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f7f4;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            color: #1a1a1a;
        }

        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 40px 48px;
            flex: 1;
        }

        .logo {
            margin-bottom: 48px;
        }

        .logo svg {
            height: 72px;
            width: auto;
        }

        .main-content {
            display: flex;
            align-items: center;
            gap: 64px;
            min-height: 520px;
        }

        .image-section {
            flex: 1;
            max-width: 520px;
        }

        .image-section img {
            width: 100%;
            height: auto;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }

        .text-section {
            flex: 1;
            max-width: 520px;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #e8f0f0;
            color: #1a6b6b;
            padding: 10px 20px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 28px;
        }

        .badge svg {
            width: 18px;
            height: 18px;
        }

        .text-section h1 {
            font-size: 52px;
            font-weight: 800;
            line-height: 1.1;
            color: #1a1a1a;
            margin-bottom: 28px;
            letter-spacing: -1px;
        }

        .text-section p {
            font-size: 17px;
            line-height: 1.7;
            color: #4a4a4a;
            margin-bottom: 12px;
        }

        .buttons {
            display: flex;
            gap: 16px;
            margin-top: 40px;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 18px 32px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            font-family: 'Inter', sans-serif;
        }

        .btn-primary {
            background-color: #0d6b6b;
            color: #ffffff;
        }

        .btn-primary:hover {
            background-color: #095555;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(13, 107, 107, 0.3);
        }

        .btn-primary svg {
            width: 20px;
            height: 20px;
        }

        .btn-outline {
            background-color: transparent;
            color: #0d6b6b;
            border: 2px solid #0d6b6b;
        }

        .btn-outline:hover {
            background-color: #0d6b6b;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(13, 107, 107, 0.2);
        }

        .btn-outline svg {
            width: 20px;
            height: 20px;
        }

        footer {
            padding: 24px 48px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e8e6e1;
            background-color: #f8f7f4;
        }

        footer p {
            font-size: 14px;
            color: #6b6b6b;
        }

        .social-links {
            display: flex;
            gap: 24px;
        }

        .social-links a {
            font-size: 14px;
            color: #6b6b6b;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .social-links a:hover {
            color: #0d6b6b;
        }

        @media (max-width: 968px) {
            .main-content {
                flex-direction: column;
                gap: 40px;
            }

            .image-section, .text-section {
                max-width: 100%;
            }

            .text-section h1 {
                font-size: 40px;
            }

            .container {
                padding: 32px 24px;
            }

            footer {
                padding: 20px 24px;
                flex-direction: column;
                gap: 16px;
                text-align: center;
            }
        }

        @media (max-width: 480px) {
            .text-section h1 {
                font-size: 32px;
            }

            .buttons {
                flex-direction: column;
            }

            .btn {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Logo SVG Embebido -->
        <div class="logo">

        </div>

        <div class="main-content">
            <div class="image-section">
                <img src="https://image.qwenlm.ai/public_source/7a70cd6a-f8b2-4bcf-bdd1-3b90c9d3e88c/1e582a1ed-49e0-44bf-af14-2bc158e39b98.png" alt="Página de mantenimiento - Laptop en escritorio">
            </div>

            <div class="text-section">
                <div class="badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>
                    MANTENIMIENTO
                </div>

                <h1>Estamos actualizando nuestro sitio</h1>

                <p>Estamos trabajando para ofrecerte una experiencia más ágil y profesional.</p>
                <p>Por favor, reintenta en unos momentos.</p>

                <div class="buttons">
                    <a href="https://tramacowork.com" class="btn btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="23 4 23 10 17 10"/>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        REINTENTAR AHORA
                    </a>
                    <a href="mailto:soporte@tramacowork.com" class="btn btn-outline">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        CONTACTAR SOPORTE
                    </a>
                </div>
            </div>
        </div>
    </div>

    <footer>
        <p>© 2024 Trama Professional Network. All rights reserved.</p>
        <div class="social-links">
            <a href="#" target="_blank" rel="noopener">LinkedIn</a>
            <a href="#" target="_blank" rel="noopener">Twitter</a>
            <a href="#" target="_blank" rel="noopener">Instagram</a>
        </div>
    </footer>
</body>
</html>
`;
