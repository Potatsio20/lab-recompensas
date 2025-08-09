'use client';

import { useState, useEffect } from 'react';

function fmt(n: number | string) {
  const num = Number(n || 0);
  return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RegistrarVenta() {
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [folio, setFolio] = useState('');
  const [subtotal, setSubtotal] = useState<number | string>(0);
  const [discount, setDiscount] = useState<number | string>(0);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setPhone('');
  }, []);me quedaria

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResp(null);

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(0, 10);
    if (!/^\d{10}$/.test(cleanPhone)) {
      setErr('El teléfono debe tener 10 dígitos.');
      return;
    }
    const sub = Number(subtotal) || 0;
    const dis = Number(discount) || 0;
    if (sub < 0 || dis < 0) {
      setErr('Subtotal/Descuento no pueden ser negativos.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          first_name: firstName || null,
          last_name: lastName || null,
          folio: folio || null,
          subtotal: sub,
          discount: dis,
          source: 'mostrador',
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Error guardando venta');
      setResp(j);

      setPhone('');
      setFirstName('');
      setLastName('');
      setFolio('');
      setSubtotal(0);
      setDiscount(0);
    } catch (e: any) {
      setErr(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  function limpiar() {
    setPhone('');
    setFirstName('');
    setLastName('');
    setFolio('');
    setSubtotal(0);
    setDiscount(0);
    setErr(null);
    setResp(null);
  }

  const canjeSolicitado = Number(resp?.canje?.solicitado_mxn || 0);
  const canjeAplicado = Number(resp?.canje?.aplicado_mxn || 0);
  const canjeParcial = resp?.canje && canjeAplicado < canjeSolicitado;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <h1 className="text-3xl font-black text-white">Registrar venta</h1>
          <p className="text-white/90 mt-1">
            Acumula puntos y canjea automáticamente (1 punto = $1 MXN).
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Teléfono (10 dígitos)
              </label>
              <input
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="2811129299"
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombre(s)"
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Apellidos</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellidos"
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Folio (opcional)
              </label>
              <input
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
                placeholder="Folio o nota"
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subtotal (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descuento / Canje solicitado (MXN)
              </label>
              <input
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="lg:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-2 text-white shadow hover:opacity-95 disabled:opacity-60"
              >
                {loading ? 'Guardando…' : 'Guardar y acumular'}
              </button>
              <button
                type="button"
                onClick={limpiar}
                className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Limpiar
              </button>
            </div>
          </form>

        {err && (
          <div className="mx-6 mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-800">Error</p>
            <p className="text-red-700 text-sm">{err}</p>
          </div>
        )}

        {resp && (
          <div className="mx-6 mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-green-900">Venta registrada con éxito.</p>
                {canjeParcial && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    Canje parcial aplicado
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-3 border border-gray-100">
                  <p className="text-gray-500">Canje solicitado</p>
                  <p className="text-gray-900 font-semibold">${fmt(canjeSolicitado)}</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-gray-100">
                  <p className="text-gray-500">Canje aplicado</p>
                  <p className="text-gray-900 font-semibold">${fmt(canjeAplicado)}</p>
                  {canjeParcial && (
                    <p className="text-xs text-amber-600 mt-1">
                      {resp?.canje?.motivo || 'Canje parcial automático.'}
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-white p-3 border border-gray-100">
                  <p className="text-gray-500">Puntos ganados</p>
                  <p className="text-gray-900 font-semibold">{fmt(resp?.puntos?.ganados || 0)} pts</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-gray-100">
                  <p className="text-gray-500">Subtotal</p>
                  <p className="text-gray-900 font-semibold">${fmt(resp?.montos?.subtotal || 0)}</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-gray-100">
                  <p className="text-gray-500">Total a cobrar</p>
                  <p className="text-gray-900 font-semibold">${fmt(resp?.montos?.total || 0)}</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-gray-100">
                  <p className="text-gray-500">Saldo final</p>
                  <p className="text-gray-900 font-semibold">{fmt(resp?.balance_final || 0)} pts</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-800">Detalle (debug)</p>
              <pre className="mt-2 text-[11px] leading-5 text-gray-700 overflow-auto max-h-72">
{JSON.stringify(resp, null, 2)}
              </pre>
            </div>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
