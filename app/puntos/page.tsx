'use client';
import { useState } from 'react';

export default function PuntosPage() {
  const [phone, setPhone] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consultar = async () => {
    setLoading(true);
    setError(null);
    setBalance(null);
    try {
      const r = await fetch(`/api/points/${phone}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Error');
      setBalance(Number(j.balance ?? 0));
    } catch (e:any) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{maxWidth:480, margin:'2rem auto', padding:16}}>
      <h1 style={{fontSize:28, fontWeight:800, marginBottom:16}}>Consulta de puntos</h1>
      <input
        placeholder="Teléfono (10 dígitos)"
        value={phone}
        onChange={(e)=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
        style={{border:'1px solid #ccc', borderRadius:8, padding:10, width:'100%'}}
      />
      <button
        onClick={consultar}
        disabled={phone.length !== 10 || loading}
        style={{marginTop:12, padding:'10px 16px', borderRadius:10, background:'#111', color:'#fff', opacity:(phone.length!==10||loading)?0.6:1}}
      >
        {loading ? 'Consultando...' : 'Consultar'}
      </button>

      {error && <p style={{color:'crimson', marginTop:12}}>{error}</p>}
      {balance !== null && !error && (
        <p style={{marginTop:16, fontSize:18}}>Saldo: <b>{balance}</b> puntos</p>
      )}
    </main>
  );
}
