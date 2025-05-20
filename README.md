# Quick-votes
=======
# React + Vite

# 🚀 Integración Clerk-Supabase para Proyecto de Interacción en Tiempo Real

Este proyecto implementa una plataforma interactiva para **cuestionarios, sorteos, ruletas y votaciones** en tiempo real con **integración Clerk-Supabase**. Utiliza Clerk para la autenticación de usuarios y Supabase para el almacenamiento y la gestión de datos, garantizando una experiencia segura y fluida.

## 🌐 Demo
🔗 [https://quick-votes-delta.vercel.app/](#)

## 📸 Capturas de pantalla
Aquí puedes agregar imágenes o GIFs mostrando las funcionalidades:
- Página de inicio
![Image](https://github.com/user-attachments/assets/dbb43743-ffc9-4d6c-9e6a-646048eea287)
- Dashboard
![Image](https://github.com/user-attachments/assets/80b99852-c8ed-4350-8a2a-11d525f5e611)
- Votaciones, sorteos y ruletas en acción
![Image](https://github.com/user-attachments/assets/86ff2d1c-5c4d-4573-aa28-3217720f3f59)

## 🛠️ Tecnologías utilizadas

### React + Vite para el desarrollo frontend
<a href="https://react.dev/">
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" width="50"/>
</a>
<a href="https://vitejs.dev/">
  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg" alt="Vite" width="50"/>
</a>

### Clerk para autenticación y gestión de usuarios

<a href="https://clerk.com/">
  <img src="https://github.com/user-attachments/assets/c17fda05-df37-4bc9-b5a1-e1375ff3c2fc" alt="Clerk Logo" width="150"/>
</a>

### Supabase como backend y base de datos en tiempo real
<a href="https://supabase.com/">
  <img src="https://supabase.com/_next/image?url=https%3A%2F%2Ffrontend-assets.supabase.com%2Fwww%2Fffceb79fd6dc%2F_next%2Fstatic%2Fmedia%2Fsupabase-logo-wordmark--light.daaeffd3.png&w=128&q=75&dpl=dpl_J7NuXyWtXK6Pdqnqt3yuK5A2PTZD" alt="Supabase" width="150"/>
</a>

### TailwindCSS para estilos rápidos y personalizables
<a href="https://tailwindcss.com/">
  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="TailwindCSS" width="50"/>
</a>


## 🔗 Integración con Clerk
La integración con Clerk incluye:

Autenticación de usuarios Clerk.

Sincronización con Supabase mediante el ID de usuario de Clerk.

Reglas de acceso con Supabase RLS, asegurando que cada usuario acceda solo a sus datos.

Gestión de participaciones en actividades utilizando Clerk y Supabase.
