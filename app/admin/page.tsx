'use client'
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import BrandHeader from '@/components/BrandHeader';

export default function AdminRegisterSale() {
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [folio, setFolio] = useState('');
  const [subtotal, setSubtotal] = useState<number | string>(0);
  const [discount, setDiscount] = useState<number | string>(0);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResp(null);

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(0, 10);
    if (!/^\d{10}$/.test(cleanPhone)) {
      setErr('El teléfono debe tener 10 dígitos.');
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
          subtotal: Number(subtotal) || 0,
          discount: Number(discount) || 0,
          source: 'mostrador',
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Error guardando venta');
      setResp(j);
      setPhone(''); setFirstName(''); setLastName(''); setFolio('');
      setSubtotal(0); setDiscount(0);
    } catch (e: any) {
      setErr(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <BrandHeader />

        <Card className="p-6">
          <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <Label>Teléfono (10 dígitos)</Label>
              <Input inputMode="numeric" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="2811129299" />
            </div>
            <div>
              <Label>Nombre</Label>
              <Input value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder="Nombre(s)" />
            </div>
            <div>
              <Label>Apellidos</Label>
              <Input value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder="Apellidos" />
            </div>
            <div>
              <Label>Folio (opcional)</Label>
              <Input value={folio} onChange={(e)=>setFolio(e.target.value)} placeholder="Folio o nota" />
            </div>
            <div>
              <Label>Subtotal (MXN)</Label>
              <Input type="number" step="0.01" value={subtotal} onChange={(e)=>setSubtotal(e.target.value)} />
            </div>
            <div>
              <Label>Descuento (MXN)</Label>
              <Input type="number" step="0.01" value={discount} onChange={(e)=>setDiscount(e.target.value)} />
            </div>

            <div className="lg:col-span-2 flex items-center gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando…' : 'Guardar y acumular'}
              </Button>
              <Button type="button" variant="ghost" onClick={()=>{setPhone('');setFirstName('');setLastName('');setFolio('');setSubtotal(0);setDiscount(0);}}>
                Limpiar
              </Button>
            </div>
          </form>

          {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
          {resp && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="font-medium text-green-800">Venta registrada con éxito.</p>
              <pre className="mt-2 text-xs text-green-900 overflow-auto">{JSON.stringify(resp, null, 2)}</pre>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
