"use client";
import {useEffect,useState} from "react";
import Image from "next/image";
import billy from "../IMG_1237.jpeg";
const col=(s:number)=>s>=9?"#4fd18b":s>=7?"#8fcf5a":s>=5?"#d9b84a":s>=3?"#d98a4a":"#c4524a";
const band=(s:number)=>s>=9?"Exceptional":s>=7?"Good":s>=5?"Average":s>=3?"Poor":"Very poor";
const gcol=(g:number)=>g>=30?"#c4524a":g>=22?"#d98a4a":"#8fcf5a";
const fmt=(s:string)=>new Date(s+"T12:00").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
const MENU=[["home","Home"],["forecast","Hunting forecast"],["wind","Wind"],["lakes","Salt River lakes"],["alerts","Alerts"]];
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
        
