// Weather-based hunting score. NO observed migration data (eBird/BirdCast/radar biology) is used yet,
// so scores are capped at 8 and labelled "weather-based estimate".
export type H={time:string[];temperature_2m:number[];wind_speed_10m:number[];wind_direction_10m:number[];wind_gusts_10m:number[];pressure_msl:number[];precipitation:number[]};
const north=(s:number,d:number)=>s*Math.cos(d*Math.PI/180); // + when wind blows FROM the north
const avg=(a:number[])=>a.reduce((x,y)=>x+y,0)/(a.length||1);
const cl=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
export const compass=(d:number)=>["N","NE","E","SE","S","SW","W","NW"][Math.round(d/45)%8];
export function scoreDay(i:number,N:H,C:H){
  const d0=i*24, r=(a:number,b:number)=>Array.from({length:b-a+1},(_,k)=>a+k);
  const night=r(d0-6,d0+6).filter(k=>k>=0); // 6pm prev day -> 6am (Flagstaff)
  const nn=Math.max(...night.map(k=>north(N.wind_speed_10m[k],N.wind_direction_10m[k])));
  const drop=i>0?N.temperature_2m[d0-9]-N.temperature_2m[d0+5]:0;
  const dp=i>0?N.pressure_msl[d0+6]-N.pressure_msl[d0-12]:0;
  const nightRain=night.reduce((s,k)=>s+N.precipitation[k],0);
  const mig=cl(nn/8,0,3)+cl(drop/6,0,3)+cl(dp/3,0,2)+cl(nightRain*4,0,1);
  const migLabel=mig<2.5?"Low":mig<4.5?"Moderate":mig<6.5?"High potential":"Major weather event";
  const m=r(d0+6,d0+10), ws=avg(m.map(k=>C.wind_speed_10m[k])), g=Math.max(...m.map(k=>C.wind_gusts_10m[k]));
  const rain=m.reduce((s,k)=>s+C.precipitation[k],0), dir=C.wind_direction_10m[d0+8];
  let s=3+mig*0.45; const why:string[]=[];
  why.push(`Northern AZ (Flagstaff) overnight north-wind component peaked near ${nn.toFixed(0)} mph.`);
  if(i>0)why.push(`Flagstaff cooled ${drop.toFixed(0)}°F from mid-afternoon to pre-dawn; pressure changed ${dp.toFixed(1)} hPa.`);
  else why.push("Today: no prior-night comparison available, so migration potential is understated.");
  if(g>30){s-=2;why.push(`Gusts to ${g.toFixed(0)} mph at Lake Pleasant during shooting hours are rough on hunters.`)}
  else if(g>22){s-=1;why.push(`Gusty morning (${g.toFixed(0)} mph).`)}
  if(ws>=5&&ws<=15){s+=0.7;why.push(`${ws.toFixed(0)} mph ${compass(dir)} wind is workable for decoying.`)}
  if(ws<3){s-=0.5;why.push("Near-calm morning; ducks tend to flare from still decoys.")}
  if(rain>0.1)why.push(`${rain.toFixed(2)} in rain expected in the morning window.`);
  const score=Math.round(cl(s,1,8));
  return {date:N.time[d0].slice(0,10),score,mig:+mig.toFixed(1),migLabel,tempF:Math.round(C.temperature_2m[d0+7]),
    wind:`${compass(dir)} ${ws.toFixed(0)} mph`,gust:Math.round(g),rain:+rain.toFixed(2),
    confidence:i<=2?"High":i<=5?"Medium":"Low",why};
}
