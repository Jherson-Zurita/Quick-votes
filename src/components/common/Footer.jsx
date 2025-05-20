export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} Quick votes. Todos los derechos reservados.
          </p>
          <div className="mt-4 md:mt-0">
            <nav className="flex space-x-4">
              <span href="#" className="text-gray-600 hover:text-indigo-600 text-sm">
                Creado por Jherson Zurita
              </span>
              <a href="contact/" className="text-gray-600 hover:text-indigo-600 text-sm">
                Contacto
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}