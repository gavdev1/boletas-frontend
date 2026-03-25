#!/usr/bin/env python3
"""
Script de build para crear el ejecutable standalone del frontend.
Builds React + PyInstaller executable.
"""
import subprocess
import sys
import os
import shutil
from pathlib import Path


def run_command(cmd, cwd=None, description=None):
    """Ejecuta un comando y maneja errores."""
    if description:
        print(f"\n{'='*50}")
        print(f"  {description}")
        print(f"{'='*50}")
    
    print(f"  → {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Error:\n{result.stderr}")
        return False
    
    if result.stdout:
        print(result.stdout)
    return True


def clean_build():
    """Limpia archivos de build anteriores."""
    standalone_dir = Path(__file__).parent
    dirs_to_clean = ['build', 'dist']
    
    for d in dirs_to_clean:
        path = standalone_dir / d
        if path.exists():
            print(f"  🗑️  Eliminando {d}/...")
            shutil.rmtree(path)


def main():
    frontend_dir = Path(__file__).parent.parent
    standalone_dir = Path(__file__).parent
    
    print("\n" + "="*50)
    print("  🔨 BUILD: Frontend Standalone Executable")
    print("="*50)
    
    # 1. Clean
    clean_build()
    
    # 2. Build React
    print("\n📦 Paso 1: Build de React...")
    if not run_command("npm run build", cwd=frontend_dir, description="Compilando React"):
        print("❌ Falló el build de React")
        sys.exit(1)
    
    # 3. PyInstaller
    print("\n📦 Paso 2: Creando ejecutable con PyInstaller...")
    spec_file = standalone_dir / "server.spec"
    # Usar uv run para asegurar que pyinstaller esté disponible
    if not run_command(f"uv run --with pyinstaller pyinstaller \"{spec_file}\" --clean --noconfirm", 
                       cwd=standalone_dir,
                       description="Empaquetando con PyInstaller"):
        print("❌ Falló PyInstaller")
        sys.exit(1)
    
    # 4. Mover ejecutable final
    print("\n📦 Paso 3: Organizando archivos...")
    exe_name = "boletas-frontend.exe" if sys.platform == "win32" else "boletas-frontend"
    
    source = standalone_dir / "dist" / exe_name
    final_dir = standalone_dir / "release"
    final_dir.mkdir(exist_ok=True)
    
    if source.exists():
        # Eliminar ejecutable anterior si existe
        final_exe = final_dir / exe_name
        if final_exe.exists():
            final_exe.unlink()
        
        shutil.move(str(source), str(final_dir / exe_name))
        print(f"  ✅ Ejecutable: {final_dir / exe_name}")
    
    # 5. Cleanup
    for d in ['build', 'dist']:
        path = standalone_dir / d
        if path.exists():
            shutil.rmtree(path)
    
    print("\n" + "="*50)
    print("  ✅ BUILD COMPLETADO")
    print("="*50)
    print(f"\n  📁 Ejecutable en: {final_dir / exe_name}")
    print(f"\n  Para ejecutar:")
    print(f"     {final_dir / exe_name}")
    print("\n  El servidor se abrirá automáticamente en el navegador.")
    print("="*50 + "\n")


if __name__ == "__main__":
    main()
