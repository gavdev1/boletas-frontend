import React, { useState } from 'react';
import SeccionForm from '../components/SeccionForm';
import SeccionesList from '../components/SeccionesList';
import Navbar from '../components/Navbar';
import type { Seccion } from '../services/api';

const SeccionesManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [editingSeccion, setEditingSeccion] = useState<Seccion | undefined>();

  const handleCreateNew = () => {
    setEditingSeccion(undefined);
    setCurrentView('form');
  };

  const handleEdit = (seccion: Seccion) => {
    setEditingSeccion(seccion);
    setCurrentView('form');
  };

  const handleSave = () => {
    setCurrentView('list');
    setEditingSeccion(undefined);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingSeccion(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === 'list' ? (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Gestión de Secciones</h2>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Nueva Sección
                </button>
              </div>
              <SeccionesList onEdit={handleEdit} />
            </div>
          ) : (
            <SeccionForm
              seccion={editingSeccion}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default SeccionesManagement;
