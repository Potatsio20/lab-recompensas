export default function BrandHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-r from-green-50 to-blue-50 p-6 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Registrar venta
          </h1>
          <p className="text-gray-600 mt-1">
            Acumula puntos a tus pacientes de forma rápida.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 shadow-lg" />
        </div>
      </div>
    </div>
  );
}
