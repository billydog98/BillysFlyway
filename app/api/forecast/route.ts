import {scoreDay,compass} from "../../../lib/score";
import type {H} from "../../../lib/score";
export const revalidate=1800;
const Q="forecast_days=10&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch";
const om=async(lat:number,lon:number):Promise<H>=>{
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=America%2FPhoenix&${Q}&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,precipitation`;
  const r=await fetch(u,{next:{revalidate:1800}}); if(!r.ok)throw new Error("Open-Meteo "+r.status);
  return (await r.json()).hourly;
};
const slc=async()=>{
  try{
    const u=`https://api.open-meteo.com/v1/forecast?latitude=40.7608&longitude=-111.891&timezone=America%2FDenver&${Q}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant`;
    const r=await fetch(u,{next:{revalidate:1800}}); if(!r.ok)return null;
    const j=await r.json(),dl=j.daily,c=j.current;
    return {now:{temp:Math.round(c.temperature_2m),wind:Math.round(c.wind_speed_10m),gust:Math.round(c.wind_gusts_10m),dir:compass(c.wind_direction_10m),pressure:Math.round(c.pressure_msl)},
      days:dl.time.map((t:string,i:number)=>({date:t,hi:Math.round(dl.temperature_2m_max[i]),lo:Math.round(dl.temperature_2m_min[i]),rain:dl.precipitation_sum[i],snow:dl.snowfall_sum[i],wind:Math.round(dl.wind_speed_10m_max[i]),gust:Math.round(dl.wind_gusts_10m_max[i]),dir:compass(dl.wind_direction_10m_dominant[i])}))};
  }catch{return null}
};
const alerts=async()=>{
  try{const r=await fetch("https://api.weather.gov/alerts/active?area=AZ",{headers:{"User-Agent":"BillsDucks (YOUR-EMAIL-HERE)",Accept:"application/geo+json"},next:{revalidate:600}});
    if(!r.ok)return null;
    return (await r.json()).features.slice(0,8).map((f:any)=>({event:f.properties.event,area:f.properties.areaDesc}));}catch{return null}
};
const P:[string,number,number][]=[["Overnight",0,5],["Morning",6,11],["Afternoon",12,17],["Evening",18,23]];
const wind=(h:H,i:number)=>P.map(([name,a,b])=>{
  let sp=0,g=0,x=0,y=0;const n=b-a+1;
  for(let k=i*24+a;k<=i*24+b;k++){
    const s=h.wind_speed_10m[k],d=h.wind_direction_10m[k]*Math.PI/180;
    sp+=s;g=Math.max(g,h.wind_gusts_10m[k]);x+=s*Math.sin(d);y+=s*Math.cos(d);
  }
  const dir=(Math.atan2(x,y)*180/Math.PI+360)%360;
  return {name,speed:Math.round(sp/n),gust:Math.round(g),dir:Math.round(dir),label:compass(dir)};
});
export async function GET(){
  try{
    const [N,C,T,al,sl]=await Promise.all([om(35.1983,-111.6513),om(33.8645,-112.2713),om(33.8828,-111.3143),alerts(),slc()]);
    const run=(L:H)=>Array.from({length:10},(_,i)=>scoreDay(i,N,L));
    const days=run(C);
    const winds=days.map((x,i)=>({date:x.date,central:wind(C,i),north:wind(N,i)}));
    const places=[{name:"Flagstaff",days:run(N)},{name:"Tonto Basin",days:run(T)},{name:"Lake Pleasant",days}];
    return Response.json({fetchedAt:new Date().toISOString(),days,winds,places,slc:sl,alerts:al,
      sources:["Open-Meteo (blends NOAA GFS/HRRR and other models) – forecast","NWS api.weather.gov – live alerts"],
      notRecorded:["Radar loops","Observed migration (eBird/BirdCast)","USGS water levels"]});
  }catch(e:any){return Response.json({error:e.message},{status:502})}
}
