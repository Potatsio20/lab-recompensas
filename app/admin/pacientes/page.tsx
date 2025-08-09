'use client';
import { useEffect, useState } from 'react';

export default function Pacientes() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

      const url = new URL('/api/patients/list', origin);
      if (q) url.searchParams.set('q', q);

      const r = await fetch(url.toString(), { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Error');
      setRows(Array.isArray(j.rows) ? j.rows : []);
    } catch (e: any) {
      setErr(e?.message || 'Error cargando pacientes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{maxWidth: 960, margin: '2rem auto', padding: 16}}>
      <h1 style={{fontSize: 24, fontWeight: 800, marginBottom: 12}}>Pacientes</h1>

      <div style={{display:'flex', gap:8, marginBottom:12}}>
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Buscar por nombre o teléfono"
          style={{border:'1px solid #ccc', borderRadius:8, padding:10, flex:1}}
        />
        <button onClick={load} disabled={loading}
          style={{padding:'10px 16px', borderRadius:10, background:'#111', color:'#fff', opacity:loading?0.6:1}}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {err && <p style={{color:'crimson'}}>{err}</p>}

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', fontSize:14, borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{textAlign:'left', padding:'8px 4px', borderBottom:'1px solid #eee'}}>Teléfono</th>
              <th style={{textAlign:'left', padding:'8px 4px', borderBottom:'1px solid #eee'}}>Nombre</th>
              <th style={{textAlign:'right', padding:'8px 4px', borderBottom:'1px solid #eee'}}>Saldo</th>
              <th style={{textAlign:'left', padding:'8px 4px', borderBottom:'1px solid #eee'}}>Alta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r:any)=>(
              <tr key={r.phone}>
                <td style={{padding:'8px 4px', borderBottom:'1px solid #f2f2f2'}}>{r.phone}</td>
                <td style={{padding:'8px 4px', borderBottom:'1px solid #f2f2f2'}}>{r.name || '-'}</td>
                <td style={{padding:'8px 4px', textAlign:'right', borderBottom:'1px solid #f2f2f2'}}>{Number(r.balance ?? 0).toFixed(1)}</td>
                <td style={{padding:'8px 4px', borderBottom:'1px solid #f2f2f2'}}>{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} style={{padding:'16px 4px', color:'#666'}}>Sin resultados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
