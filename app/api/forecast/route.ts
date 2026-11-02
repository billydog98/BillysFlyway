import {scoreDay} from "../../../lib/score";
import type {H} from "../../../lib/score";
export const revalidate=1800;
// Swap providers here: each fetcher returns hourly arrays in the H shape.
const om=async(lat:number,lon:number):Promise<H>=>{
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&forecast_days=10&timezone=America%2FPhoenix&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,precipitation`;
  const r=await fetch(u,{next:{revalidate:1800}}); if(!r.ok)throw new Error("Open-Meteo "+r.status);
  return (await r.json()).hourly;
};
const alerts=async()=>{
  try{const r=await fetch("https://api.weather.gov/alerts/active?area=AZ",{headers:{"User-Agent":"BillsDucks (set-your-email@example.com)",Accept:"application/geo+json"},next:{revalidate:600}});
    if(!r.ok)return null;
    return (await r.json()).features.slice(0,8).map((f:any)=>({event:f.properties.event,area:f.properties.areaDesc}));}catch{return null}
};
export async function GET(){
  try{
    const [N,C,al]=await Promise.all([om(35.1983,-111.6513),om(33.8645,-112.2713),alerts()]);
    const days=Array.from({length:10},(_,i)=>scoreDay(i,N,C));
    return Response.json({fetchedAt:new Date().toISOString(),days,alerts:al,
      sources:["Open-Meteo (blends NOAA GFS/HRRR and other models) – forecast","NWS api.weather.gov – live alerts"],
      notRecorded:["Radar loops","Observed migration (eBird/BirdCast)","USGS water levels"]});
  }catch(e:any){return Response.json({error:e.message},{status:502})}
}
