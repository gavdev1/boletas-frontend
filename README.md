# Sistema de Boletas Escolares - Frontend

Frontend del Sistema de Boletas Escolares construido con React + TypeScript + Vite y Tailwind CSS.

## 🚀 Scripts Disponibles

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Build + Ejecutable standalone (sin necesidad de Node.js/Python)
npm run build:standalone

# Preview del build
npm run preview

# Tests
npm run test

# Tests con coverage
npm run test:coverage

# Linting
npm run lint
```

## 📦 Ejecutable Standalone

El proyecto genera un ejecutable multiplataforma que no requiere tener Node.js ni Python instalado.

### ¿Cómo funciona?
1. Compila React a archivos estáticos (`dist/`)
2. Empaqueta con PyInstaller para crear un ejecutable nativo
3. Incluye un servidor HTTP embebido que sirve los archivos estáticos

### Generar el ejecutable
```bash
npm run build:standalone
```

El ejecutable final quedará en `standalone/release/`:
- **Windows**: `boletas-frontend.exe`
- **Linux**: `boletas-frontend`
- **macOS**: `boletas-frontend`

### Uso del ejecutable
Simplemente haz doble clic o ejecuta desde terminal:
```bash
# Windows
boletas-frontend.exe

# Linux/macOS
./boletas-frontend
```

- Se abre automáticamente en el navegador
- Usa puerto dinámico (3000-3100)
- Presiona `Ctrl+C` para detener

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite
- **Testing**: Vitest + Testing Library
- **Linter**: ESLint
- **Standalone**: Python + PyInstaller

## 📁 Estructura del Proyecto

```
frontend/
├── src/                    # Código fuente React
│   ├── components/         # Componentes
│   ├── pages/             # Páginas
│   ├── services/          # API services
│   └── ...
├── public/                # Archivos estáticos
├── dist/                  # Build de producción (auto-generado)
├── standalone/            # Sistema de ejecutable
│   ├── server.py          # Servidor HTTP embebido
│   ├── server.spec        # Config PyInstaller
│   ├── build.py           # Script de build
│   └── release/           # Ejecutable final
├── package.json           # Dependencias y scripts
└── README.md              # Este archivo
```

## 🌐 Compatibilidad

### Ejecutable Standalone
- **Windows**: Windows 10/11 (x64)
- **Linux**: Distribuciones modernas (x64)
- **macOS**: macOS 10.15+ (Intel y Apple Silicon)

**Nota**: Windows 7 no es compatible debido a requerimientos de Python 3.9+

### Desarrollo
- **Node.js**: 18+
- **npm**: 9+

## 🔧 Desarrollo

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```

El servidor se iniciará en `http://localhost:5173` con hot reload.

## 📝 Tests

```bash
# Ejecutar tests
npm run test

# Ver coverage
npm run test:coverage
```

## 🚀 Despliegue

### Opción 1: Ejecutable Standalone (Recomendado)
```bash
npm run build:standalone
# Distribuye el ejecutable en standalone/release/
```

### Opción 2: Archivos estáticos
```bash
npm run build
# Sirve la carpeta dist/ con cualquier servidor web
```

## 📄 Licencia

Proyecto desarrollado para el Sistema de Boletas Escolares.
