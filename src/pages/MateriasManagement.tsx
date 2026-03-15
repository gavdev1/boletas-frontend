import React, { useState } from 'react';
import MateriaForm from '../components/MateriaForm';
import MateriasList from '../components/MateriasList';
import Navbar from '../components/Navbar';
import type { Materia } from '../services/api';

const MateriasManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [editingMateria, setEditingMateria] = useState<Materia | undefined>();

  const handleCreateNew = () => {
    setEditingMateria(undefined);
    setCurrentView('form');
  };

  const handleEdit = (materia: Materia) => {
    setEditingMateria(materia);
    setCurrentView('form');
  };

  const handleSave = () => {
    setCurrentView('list');
    setEditingMateria(undefined);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingMateria(undefined);
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
                <h2 className="text-2xl font-bold text-slate-900">Gestión de Materias</h2>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Nueva Materia
                </button>
              </div>
              <MateriasList onEdit={handleEdit} />
            </div>
          ) : (
            <MateriaForm
              materia={editingMateria}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default MateriasManagement;
