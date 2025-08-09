'use client';
import { useEffect, useState } from 'react';

export default function CanjearPage(){
  const [phone, setPhone] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchBalance(p: string){
    setBalance(null);
    if (p.length !== 10) return;
    try{
      const r = await fetch(`/api/points/${p}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Error');
      setBalance(Number(j.balance ?? 0));
    }catch(e:any){
      setError(e?.message || 'Error');
    }
  }

  useEffect(()=>{ setError(null); setMsg(null); fetchBalance(phone) }, [phone]);

  async function redeem(){
    setLoading(true); setError(null); setMsg(null);
    try{
      const r = await fetch('/api/redeem', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone, points })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Error');
      setMsg(`Canje realizado. Nuevo saldo: ${j.balance} pts`);
      setBalance(j.balance);
      setPoints(0);
    }catch(e:any){
      setError(e?.message || 'Error');
    }finally{
      setLoading(false);
    }
  }

  const disabled = phone.length !== 10 || points <= 0 || (balance ?? 0) < points || loading;

  return (
    <main style={{maxWidth:520, margin:'2rem auto', padding:16}}>
      <h1 style={{fontSize:28, fontWeight:800, marginBottom:16}}>Canjear puntos</h1>

      <label style={{display:'block', marginBottom:6}}>Teléfono (10 dígitos)</label>
      <input
        value={phone}
        onChange={(e)=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
        style={{border:'1px solid #ccc', borderRadius:8, padding:10, width:'100%'}}
        placeholder="Ej. 2281234567"
      />

      <div style={{marginTop:12}}>
        <small>Saldo: <b>{balance ?? '-'}</b> pts</small>
      </div>

      <label style={{display:'block', marginTop:16, marginBottom:6}}>Puntos a canjear</label>
      <input
        type="number"
        value={points}
        onChange={(e)=>setPoints(Math.max(0, Number(e.target.value) || 0))}
        style={{border:'1px solid #ccc', borderRadius:8, padding:10, width:'100%'}}
        min={0}
        max={balance ?? undefined}
      />

      <button onClick={redeem} disabled={disabled}
        style={{marginTop:12, padding:'10px 16px', borderRadius:10, background:'#111', color:'#fff', opacity:disabled?0.6:1}}>
        {loading? 'Canjeando...' : 'Canjear'}
      </button>

      {error && <p style={{color:'crimson', marginTop:12}}>{error}</p>}
      {msg && <p style={{color:'green', marginTop:12}}>{msg}</p>}
    </main>
  );
}
