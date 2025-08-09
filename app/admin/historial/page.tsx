'use client';
import { useState } from 'react';

export default function HistorialPage(){
  const [phone, setPhone] = useState('');
  const [data, setData] = useState<any|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    setLoading(true); setError(null); setData(null);
    try{
      const r = await fetch(`/api/history/${phone}`);
      const j = await r.json();
      if(!r.ok) throw new Error(j.error || 'Error');
      setData(j);
    }catch(e:any){ setError(e?.message || 'Error'); }
    finally{ setLoading(false); }
  }

  function fmt(d:string){ try{ return new Date(d).toLocaleString() } catch { return d } }

  return (
    <main style={{maxWidth:1100, margin:'2rem auto', padding:16}}>
      <h1 style={{fontSize:28, fontWeight:800}}>Historial del paciente</h1>
      <div style={{display:'flex', gap:8, marginTop:12}}>
        <input
          placeholder="Teléfono (10 dígitos)"
          value={phone}
          onChange={(e)=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
          style={{border:'1px solid #ccc', borderRadius:8, padding:10, width:260}}
        />
        <button onClick={buscar} disabled={phone.length!==10 || loading}
          style={{padding:'10px 16px', borderRadius:10, background:'#111', color:'#fff', opacity:(phone.length!==10||loading)?0.6:1}}>
          {loading? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && <p style={{color:'crimson', marginTop:12}}>{error}</p>}

      {data && (
        <div style={{marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div style={{padding:12, border:'1px solid #eee', borderRadius:10}}>
            <h3 style={{fontWeight:700, marginBottom:8}}>Datos del paciente</h3>
            <p><b>Nombre:</b> {data.patient?.first_name} {data.patient?.last_name}</p>
            <p><b>Teléfono:</b> {data.patient?.phone}</p>
            <p><b>Saldo:</b> {data.balance} pts</p>
          </div>

          <div style={{padding:12, border:'1px solid #eee', borderRadius:10}}>
            <h3 style={{fontWeight:700, marginBottom:8}}>Transacciones</h3>
            {data.transactions?.length ? (
              <table style={{width:'100%', fontSize:14}}>
                <thead><tr><th align="left">Fecha</th><th align="right">Total</th><th align="left">Folio</th></tr></thead>
                <tbody>
                  {data.transactions.map((t:any)=>(
                    <tr key={t.id}>
                      <td>{fmt(t.created_at)}</td>
                      <td align="right">{t.total}</td>
                      <td>{t.folio || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Sin transacciones.</p>}
          </div>

          <div style={{gridColumn:'1 / span 2', padding:12, border:'1px solid #eee', borderRadius:10}}>
            <h3 style={{fontWeight:700, marginBottom:8}}>Movimientos de puntos</h3>
            {data.ledger?.length ? (
              <table style={{width:'100%', fontSize:14}}>
                <thead><tr><th align="left">Fecha</th><th>Tipo</th><th align="right">Pts</th><th>Motivo / Folio</th></tr></thead>
                <tbody>
                  {data.ledger.map((l:any)=>(
                    <tr key={l.id}>
                      <td>{fmt(l.created_at)}</td>
                      <td>{l.type}</td>
                      <td align="right" style={{color: (Number(l.points) < 0 ? 'crimson' : 'inherit')}}>{l.points}</td>
                      <td>{l.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Sin movimientos.</p>}
          </div>

          {/* Sección opcional solo para canjes rápidos */}
          {data.redeems?.length ? (
            <div style={{gridColumn:'1 / span 2', padding:12, border:'1px solid #eee', borderRadius:10}}>
              <h3 style={{fontWeight:700, marginBottom:8}}>Canjes</h3>
              <table style={{width:'100%', fontSize:14}}>
                <thead><tr><th align="left">Fecha</th><th align="right">Pts</th><th>Motivo</th></tr></thead>
                <tbody>
                  {data.redeems.map((r:any)=>(
                    <tr key={r.id}>
                      <td>{fmt(r.created_at)}</td>
                      <td align="right" style={{color:'crimson'}}>{r.points}</td>
                      <td>{r.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
