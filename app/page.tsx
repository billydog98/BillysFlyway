"use client";
import {useEffect,useState} from "react";
import Image from "next/image";
import billy from "../IMG_1237.jpeg";
const col=(s:number)=>s>=9?"#4fd18b":s>=7?"#8fcf5a":s>=5?"#d9b84a":s>=3?"#d98a4a":"#c4524a";
const band=(s:number)=>s>=9?"Exceptional":s>=7?"Good":s>=5?"Average":s>=3?"Poor":"Very poor";
const gcol=(g:number)=>g>=30?"#c4524a":g>=22?"#d98a4a":"#8fcf5a";
const fmt=(s:string)=>new Date(s+"T12:00").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
const MENU=[["home","Home"],["forecast","Hunting forecast"],["places","Location scores"],["wind","Wind"],["slc","Salt Lake City"],["lakes","Salt River lakes"],["alerts","Alerts"]];
export default function Home(){
  const [d,setD]=useState<any>(null);const [err,setErr]=useState("");const [open,setOpen]=useState(0);
  const [view,setView]=useState("home");const [menu,setMenu]=useState(false);
  const load=()=>fetch("/api/forecast").then(r=>r.json()).then(j=>j.error?setErr(j.error):(setErr(""),setD(j))).catch(e=>setErr(String(e)));
  useEffect(()=>{load();const t=setInterval(load,30*60e3);return()=>clearInterval(t)},[]);
  const best=d?[...d.days].sort((a:any,b:any)=>b.score-a.score)[0]:null, t=d?d.days[0]:null, sel=d?d.days[open]:null;
  const cell=(p:any,north:boolean)=>{
    const nside=north&&(p.dir>=292||p.dir<=68)&&p.speed>=12;
    return <td key={p.name} style={{padding:"4px 6px",textAlign:"center",background:nside?"#1c3347":"transparent",whiteSpace:"nowrap"}}>
      <span style={{display:"inline-block",transform:`rotate(${p.dir+180}deg)`,color:gcol(p.gust)}}>↑</span> {p.label} {p.speed}
      <br/><small style={{color:gcol(p.gust)}}>gust {p.gust}</small></td>};
  const body=()=>{
    if(view==="lakes")return <>
      <h2>Salt River lakes</h2>
      <p className="note">SRP runs these lakes and posts levels daily. This page links to the official numbers instead of showing its own, because no verified data feed is connected yet.</p>
      <p><a style={{color:"#6f9bb5"}} href="https://www.watershedconnection.com" target="_blank" rel="noopener noreferrer">SRP daily water report</a></p>
      <p><a style={{color:"#6f9bb5"}} href="https://www.azgfd.com/fishing-2/where-to-fish/lake-levels/" target="_blank" rel="noopener noreferrer">Arizona Game and Fish lake levels</a></p>
      <h3>Lakes in the SRP system</h3>
      <ul>
                <li>Salt River: Roosevelt, Apache, Canyon, Saguaro</li>
        <li>Verde River: Horseshoe, Bartlett</li>
      </ul>
      <p className="note">Lake Pleasant is run by the Central Arizona Project, not SRP, so it is not in SRP's report. Rising or falling water changes how much shoreline and shallow cover the ducks can use, so compare each lake's level to the last few days before you go.</p></>;
    if(err)return <p className="bad">Forecast data unavailable: {err}. Retrying every 30 minutes.</p>;
    if(!d)return <p>Loading forecast…</p>;
        if(view==="places")return <>
      <h2>Scores by location</h2>
      <p className="note">Each place is scored on its own morning wind, gusts and temperature, with Flagstaff overnight conditions as the shared northern signal. Weather only: the score does not know about water or access, and it is capped at 8 because no observed migration data is connected. Tonto Basin is the Roosevelt Lake side.</p>
      <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",minWidth:420}}>
        <thead><tr style={{color:"#8a978f"}}><th style={{textAlign:"left",padding:"4px 6px"}}>Day</th>{d.places.map((p:any)=><th key={p.name}>{p.name}</th>)}</tr></thead>
        <tbody>{d.days.map((x:any,i:number)=><tr key={x.date} style={{borderTop:"1px solid #28402f"}}>
          <td style={{padding:"6px",whiteSpace:"nowrap"}}><b>{fmt(x.date)}</b></td>
          {d.places.map((p:any)=>{const y=p.days[i];return <td key={p.name} style={{textAlign:"center",padding:"6px"}}><span style={{color:col(y.score),fontWeight:700,fontSize:"1.2rem"}}>{y.score}</span><small style={{color:"#8a978f"}}>/10</small><br/><small>{y.tempF}°F, {y.wind}</small></td>})}
        </tr>)}</tbody></table></div></>;
    if(view==="slc")return <>
      <h2>Salt Lake City weather</h2>
      {!d.slc?<p className="bad">Salt Lake City data is unavailable right now.</p>:<>
        <p>Now: {d.slc.now.temp}°F, wind {d.slc.now.dir} {d.slc.now.wind} mph (gusts {d.slc.now.gust}), pressure {d.slc.now.pressure} hPa</p>
        <p className="note">Shown for context only. Weather in Utah can show a front before it reaches Arizona, but it is not part of the hunting score.</p>
        <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",minWidth:420}}>
          <thead><tr style={{color:"#8a978f"}}><th style={{textAlign:"left",padding:"4px 6px"}}>Day</th><th>High / Low</th><th>Wind</th><th>Rain / Snow (in)</th></tr></thead>
          <tbody>{d.slc.days.map((x:any)=><tr key={x.date} style={{borderTop:"1px solid #28402f"}}>
            <td style={{padding:"6px",whiteSpace:"nowrap"}}><b>{fmt(x.date)}</b></td>
            <td style={{textAlign:"center"}}>{x.hi}° / {x.lo}°</td>
            <td style={{textAlign:"center"}}>{x.dir} {x.wind}<br/><small style={{color:gcol(x.gust)}}>gust {x.gust}</small></td>
            <td style={{textAlign:"center"}}>{x.rain} / {x.snow}</td>
          </tr>)}</tbody></table></div></>}</>;

    if(view==="forecast")return <>
      <h2>Hunting forecast</h2>
      <p className="note">Weather-based estimate for the Lake Pleasant area, using Flagstaff overnight conditions as the northern-AZ signal. No observed migration data is included, so scores are capped at 8. Radar cannot identify individual ducks.</p>
      <h3>10-day hunting calendar</h3>
      <div className="grid">{d.days.map((x:any,i:number)=>
        <button key={x.date} className={"card"+(i===open?" on":"")} onClick={()=>setOpen(i)} style={{borderColor:col(x.score)}}>
          <b>{fmt(x.date)}</b>
          <span className="sc" style={{color:col(x.score)}}>{x.score}/10</span>
          <span>{x.migLabel}</span><span>{x.tempF}°F, {x.wind}</span><span>Confidence: {x.confidence}</span>
        </button>)}</div>
      <section className="detail"><h3>{sel.date}: {band(sel.score)}</h3><ul>{sel.why.map((w:string)=><li key={w}>{w}</li>)}</ul></section>
      <h3>Score trend</h3>
      <svg viewBox="0 0 300 80" className="chart"><polyline fill="none" stroke="#6f9bb5" strokeWidth="2" points={d.days.map((x:any,i:number)=>`${15+i*30},${75-x.score*8}`).join(" ")}/>
        {d.days.map((x:any,i:number)=><circle key={i} cx={15+i*30} cy={75-x.score*8} r="3" fill={col(x.score)}/>)}</svg></>;
    if(view==="wind")return <>
      <h2>10-day wind forecast</h2>
      <p className="note">Arrows point the way the wind is blowing toward. Speeds are mph. Central is the Lake Pleasant area; Flagstaff is the northern Arizona check. Blue cells are Flagstaff wind from the north side at 12+ mph, which hunters often watch as a sign of a cold front pushing south. It is a rule of thumb, not proof that ducks are moving. Gusts of 22+ mph make hunting and decoying harder.</p>
      <div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",fontSize:".8rem",minWidth:520,width:"100%"}}>
          <thead><tr style={{color:"#8a978f"}}><th style={{textAlign:"left",padding:"4px 6px"}}>Day</th>{["Overnight","Morning","Afternoon","Evening"].map(p=><th key={p}>{p}</th>)}</tr></thead>
          <tbody>{d.winds.map((w:any)=>[["Central",w.central,false],["Flagstaff",w.north,true]].map(([label,ps,n]:any)=>
            <tr key={w.date+label} style={{borderTop:label==="Central"?"1px solid #28402f":"none"}}>
              <td style={{padding:"4px 6px",whiteSpace:"nowrap"}}>{label==="Central"?<b>{fmt(w.date)}</b>:""}<br/><small style={{color:"#8a978f"}}>{label}</small></td>
              {ps.map((p:any)=>cell(p,n))}</tr>))}</tbody>
        </table></div></>;
    return <>
      <h2>NWS alerts (Arizona)</h2>
      {d.alerts===null?<p className="bad">Alerts unavailable right now.</p>:d.alerts.length===0?<p>No active alerts.</p>:<ul>{d.alerts.map((a:any,i:number)=><li key={i}>{a.event}: {a.area}</li>)}</ul>}</>;
  };
  return <div className="shell">
    <button className="burger" onClick={()=>setMenu(!menu)}>Menu</button>
    <nav className={"side"+(menu?" open":"")}>
      <div className="brand"><b>Billy’s Flyway</b><small>Arizona waterfowl intelligence</small></div>
      {MENU.map(([k,l])=><button key={k} className={view===k?"on":""} onClick={()=>{setView(k);setMenu(false)}}>{l}</button>)}
    </nav>
    <div className="content">
      {view==="home"?
        <section className="photo">
          <Image src={billy} alt="Billy" fill priority sizes="100vw" style={{objectFit:"cover",objectPosition:"50% 30%"}}/>
          <div className="shade"/>
          <div className="logo"><svg viewBox="0 0 600 150" width="100%" role="img" aria-label="Billy’s Flyway">
            <defs><linearGradient id="gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f3e3a8"/><stop offset="1" stopColor="#b8963f"/></linearGradient></defs>
            <g fill="none" stroke="#f3ead0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M30 40 q-8 -9 -18 -3 M30 40 q8 -9 18 -3"/>
              <path d="M62 62 q-7 -8 -15 -2 M62 62 q7 -8 15 -2"/>
              <path d="M24 82 q-7 -8 -15 -2 M24 82 q7 -8 15 -2"/>
              <path d="M570 40 q-8 -9 -18 -3 M570 40 q8 -9 18 -3"/>
              <path d="M538 62 q-7 -8 -15 -2 M538 62 q7 -8 15 -2"/>
              <path d="M576 82 q-7 -8 -15 -2 M576 82 q7 -8 15 -2"/>
            </g>
            <text x="300" y="80" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="58" fontStyle="italic" fontWeight="700" fill="url(#gold)" stroke="#0d1210" strokeWidth="1">Billy’s Flyway</text>
            <text x="300" y="112" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="14" fill="#f3ead0" letterSpacing="6">Arizona waterfowl</text>
            <line x1="30" y1="130" x2="570" y2="130" stroke="url(#gold)" strokeWidth="2"/>
          </svg></div>
          <div className="caption">
            <h2>Central Arizona duck hunting outlook</h2>
            {t?<>
              <div className="big" style={{color:col(t.score)}}>{t.score}<small>/10 today</small></div>
              <p>{band(t.score)}. Migration potential {t.migLabel.toLowerCase()}. Morning wind {t.wind}, gusts {t.gust}.</p>
              <p>Best day ahead: <b>{fmt(best.date)}</b> ({best.score}/10)</p></>
              :<p>{err?"Forecast data unavailable right now.":"Loading forecast…"}</p>}
          </div>
        </section>
        :<main>{body()}
          {d&&<footer>Updated {new Date(d.fetchedAt).toLocaleString()}. Forecast data from: {d.sources.join("; ")}.<br/>Not yet connected: {d.notRecorded.join(", ")}.</footer>}</main>}
    </div>
  </div>}

