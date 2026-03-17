#!/usr/bin/env python3
"""
Servidor standalone para el frontend de Boletas Escolares.
Sirve los archivos estáticos del build de React.
"""
import os
import sys
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
from pathlib import Path


def get_dist_path():
    """Obtiene la ruta a la carpeta dist (embebida o local)."""
    if getattr(sys, 'frozen', False):
        # Ejecutando como executable de PyInstaller
        base_path = sys._MEIPASS
    else:
        # Ejecutando como script normal
        base_path = Path(__file__).parent.parent
    
    return Path(base_path) / 'dist'


def find_free_port(start_port=3000, max_port=3100):
    """Encuentra un puerto libre."""
    for port in range(start_port, max_port + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(('localhost', port)) != 0:
                return port
    return None


class CustomHandler(SimpleHTTPRequestHandler):
    """Handler personalizado para servir desde dist/."""
    
    def __init__(self, *args, **kwargs):
        dist_path = get_dist_path()
        super().__init__(*args, directory=str(dist_path), **kwargs)
    
    def do_GET(self):
        # Redirigir rutas SPA a index.html
        if self.path != '/' and not self.path.startswith('/assets/'):
            if not (get_dist_path() / self.path.lstrip('/')).exists():
                self.path = '/'
        return super().do_GET()
    
    def log_message(self, format, *args):
        # Logs más limpios
        print(f"[{self.log_date_time_string()}] {args[0]}")


def main():
    dist_path = get_dist_path()
    
    if not dist_path.exists():
        print(f"❌ Error: No se encontró la carpeta dist en: {dist_path}")
        print("   Asegúrate de haber ejecutado 'npm run build' primero.")
        sys.exit(1)
    
    port = find_free_port()
    if not port:
        print("❌ Error: No se pudo encontrar un puerto libre entre 3000-3100")
        sys.exit(1)
    
    server = HTTPServer(('0.0.0.0', port), CustomHandler)
    url = f"http://localhost:{port}"
    
    print("=" * 50)
    print("  📚 Sistema de Boletas Escolares - Frontend")
    print("=" * 50)
    print(f"\n   🌐 URL: {url}")
    print(f"   📂 Serving: {dist_path}")
    print("\n   Presiona Ctrl+C para detener")
    print("=" * 50 + "\n")
    
    # Abrir navegador automáticamente
    try:
        webbrowser.open(url)
    except Exception:
        pass
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido.")
        server.shutdown()


if __name__ == "__main__":
    main()
