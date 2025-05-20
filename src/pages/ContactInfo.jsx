import React from 'react';
import { useUser } from '@clerk/clerk-react';

const ContactInfo = () => {
  const { user } = useUser();

  if (!user) {
    return <div className="text-gray-300">Cargando información del usuario...</div>;
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Información de Contacto</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Nombre</p>
          <p className="text-white font-medium">
            Jherson Zurita
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">Correo electrónico</p>
          <p className="text-white font-medium">
            j.e.z.paco@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;