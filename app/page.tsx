"use client";
import {useEffect,useState} from "react";
const col=(s:number)=>s>=9?"#4fd18b":s>=7?"#8fcf5a":s>=5?"#d9b84a":s>=3?"#d98a4a":"#c4524a";
const band=(s:number)=>s>=9?"Exceptional":s>=7?"Good":s>=5?"Average":s>=3?"Poor":"Very poor";
export default function Home(){
  const [d,setD]=useState<any>(null);const [err,setErr]=useState("");const [open,setOpen]=useState(0);
  const load=()=>fetch("/api/forecast").then(r=>r.json()).then(j=>j.error?setErr(j.error):(setErr(""),setD(j))).catch(e=>setErr(String(e)));
  useEffect(()=>{load();const t=setInterval(load,30*60e3);return()=>clearInterval(t)},[]);
  if(err)return <main><h1>Bills Ducks</h1><p className="bad">Forecast data unavailable: {err}. Retrying every 30 minutes.</p></main>;
  if(!d)return <main><h1>Bills Ducks</h1><p>Loading forecast…</p></main>;
  const best=[...d.days].sort((a:any,b:any)=>b.score-a.score)[0], t=d.days[0], sel=d.days[open];
  return <main>
    <header><h1>Bills Ducks</h1><p>Arizona waterfowl intelligence</p></header>
    <section className="hero">
      <div className="big" style={{color:col(t.score)}}>{t.score}<small>/10</small></div>
      <div><h2>Central Arizona duck hunting outlook</h2>
        <p>Today: {band(t.score)}. Migration potential {t.migLabel.toLowerCase()}. Morning wind {t.wind}, gusts {t.gust}.</p>
        <p>Best day ahead: <b>{best.date}</b> ({best.score}/10)</p></div>
    </section>
    <p className="note">Weather-based estimate for the Lake Pleasant area, using Flagstaff overnight conditions as the northern-AZ signal. No observed migration data is included, so scores are capped at 8. Radar cannot identify individual ducks.</p>
    <h3>10-day hunting calendar</h3>
    <div className="grid">{d.days.map((x:any,i:number)=>
      <button key={x.date} className={"card"+(i===open?" on":"")} onClick={()=>setOpen(i)} style={{borderColor:col(x.score)}}>
        <b>{new Date(x.date+"T12:00").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</b>
        <span className="sc" style={{color:col(x.score)}}>{x.score}/10</span>
        <span>{x.migLabel}</span><span>{x.tempF}°F, {x.wind}</span><span>Confidence: {x.confidence}</span>
      </button>)}</div>
    <section className="detail"><h3>{sel.date}: {band(sel.score)}</h3><ul>{sel.why.map((w:string)=><li key={w}>{w}</li>)}</ul></section>
    <h3>Score trend</h3>
    <svg viewBox="0 0 300 80" className="chart"><polyline fill="none" stroke="#6f9bb5" strokeWidth="2" points={d.days.map((x:any,i:number)=>`${15+i*30},${75-x.score*8}`).join(" ")}/>
      {d.days.map((x:any,i:number)=><circle key={i} cx={15+i*30} cy={75-x.score*8} r="3" fill={col(x.score)}/>)}</svg>
    <h3>NWS alerts (Arizona)</h3>
    {d.alerts===null?<p className="bad">Alerts unavailable right now.</p>:d.alerts.length===0?<p>No active alerts.</p>:<ul>{d.alerts.map((a:any,i:number)=><li key={i}>{a.event}: {a.area}</li>)}</ul>}
    <footer>Updated {new Date(d.fetchedAt).toLocaleString()}. Forecast data from: {d.sources.join("; ")}.<br/>Not yet connected: {d.notRecorded.join(", ")}.</footer>
  </main>}
