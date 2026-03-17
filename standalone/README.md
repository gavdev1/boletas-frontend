# Frontend Standalone

Ejecutable multiplataforma que sirve el frontend de React sin necesidad de tener Node.js ni Python instalado.

## Estructura

```
standalone/
├── server.py        # Servidor HTTP que sirve los archivos estáticos
├── server.spec      # Configuración de PyInstaller
├── build.py         # Script de build automático
├── release/         # Ejecutable generado (después del build)
├── build/           # Temporales de build (auto-limpio)
└── dist/            # Temporales de PyInstaller (auto-limpio)
```

## Requisitos para Build

- Python 3.8+
- PyInstaller: `pip install pyinstaller`
- Node.js y npm (para compilar React primero)

## Cómo Generar el Ejecutable

### Opción 1: Script Automático (Recomendado)

```bash
cd standalone
python build.py
```

Esto hará:
1. Build de React (`npm run build`)
2. Empaquetado con PyInstaller
3. El ejecutable quedará en `standalone/release/`

### Opción 2: Manual

```bash
# 1. Build React
cd ..
npm run build

# 2. PyInstaller
cd standalone
pyinstaller server.spec --clean --noconfirm

# Ejecutable en: standalone/dist/boletas-frontend
```

## Uso del Ejecutable

Simplemente haz doble clic en el ejecutable o ejecútalo desde terminal:

**Windows:**
```cmd
boletas-frontend.exe
```

**Linux/macOS:**
```bash
./boletas-frontend
```

- Se abrirá automáticamente en el navegador
- Por defecto usa el puerto 3000 (o el primero disponible 3000-3100)
- Presiona `Ctrl+C` para detener

## Multiplataforma

| Plataforma | Comando de build | Ejecutable |
|------------|------------------|------------|
| Windows    | `python build.py` | `boletas-frontend.exe` |
| Linux      | `python3 build.py` | `boletas-frontend` |
| macOS      | `python3 build.py` | `boletas-frontend` |

**Nota:** PyInstaller genera ejecutables nativos para la plataforma donde se ejecuta el build. Para generar ejecutables de Windows desde Linux/macOS, usa Wine o un CI/CD como GitHub Actions.
