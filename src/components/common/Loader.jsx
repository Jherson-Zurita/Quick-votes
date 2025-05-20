
export default function Loader({ message = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-indigo-600 border-r-indigo-600 border-b-indigo-200 border-l-indigo-200 mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}