const need=["GEMINI_API_KEY","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"];
for (const k of need) if (!process.env[k]) throw new Error("Missing GitHub Actions secret: "+k);
const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const target=process.env.TARGET_DATE||today;
if(!/^\d{4}-\d{2}-\d{2}$/.test(target)||target<"2026-01-01"||target>today)throw new Error("TARGET_DATE must be a date from 2026-01-01 through today");
const nextDate=new Date(Date.parse(target+"T00:00:00Z")+86400000).toISOString().slice(0,10);
const feeds=[
`https://news.google.com/rss/search?q=India+current+affairs+after:${target}&before:${nextDate}&hl=hi&gl=IN&ceid=IN:hi`,
`https://news.google.com/rss/search?q=Madhya+Pradesh+news+after:${target}&before:${nextDate}&hl=hi&gl=IN&ceid=IN:hi`,
`https://news.google.com/rss/search?q=India+economy+sports+awards+appointments+after:${target}&before:${nextDate}&hl=en-IN&gl=IN&ceid=IN:en`];
const decode=s=>(s||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");
async function feed(url){const r=await fetch(url);if(!r.ok)throw Error("RSS HTTP "+r.status);const x=await r.text();return [...x.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m=>{const f=n=>decode(m[1].match(new RegExp("<"+n+"[^>]*>([\\s\\S]*?)</"+n+">"))?.[1]).trim();return {title:f("title"),link:f("link"),description:f("description")}}).filter(a=>a.title&&a.link)}
const headlines=(await Promise.all(feeds.map(feed))).flat().filter((x,i,a)=>a.findIndex(y=>y.link===x.link)===i).slice(0,50);
if(headlines.length<12)throw Error("Insufficient news sources");
const prompt=`TET Test Hub के लिए ${target} की daily current affairs सामग्री बनाओ। केवल supplied headlines/snippets से समर्थित तथ्य उपयोग करो, कोई तथ्य/स्रोत न गढ़ो। हिंदी व अंग्रेज़ी दोनों में लिखो। केवल JSON लौटाओ: {"day":"${target}","title":{"hi":"...","en":"..."},"items":[{"id":"unique-id","region":"mp|india|world","cat":"polity|economy|science|sports|awards|schemes|environment|defence|appointments|days|relations|reports|other","title":{"hi":"...","en":"..."},"summary":{"hi":"...","en":"..."},"points":{"hi":["..."],"en":["..."]},"sources":[{"name":"source","url":"exact supplied URL"}]}],"oneliners":{"hi":["..."],"en":["..."]},"quiz":[{"q":{"hi":"...","en":"..."},"o":{"hi":["A","B","C","D"],"en":["A","B","C","D"]},"a":0,"exp":{"hi":"...","en":"..."}}]}. items में 10-15 समाचार और quiz में 8 से 10 प्रश्न हों। हर प्रश्न में चार विकल्प, सही answer का 0-based index और explanation हो। sources में केवल नीचे दिए exact URLs इस्तेमाल हों। समाचार: ${JSON.stringify(headlines)}`;
const ai=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="+process.env.GEMINI_API_KEY,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json",temperature:0.2}})});
if(!ai.ok)throw Error("Gemini HTTP "+ai.status+" "+(await ai.text()).slice(0,400));
const body=await ai.json(), raw=body.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("");
if(!raw)throw Error("AI returned empty response");
const d=JSON.parse(raw);
if(d.day!==target||d.items?.length<8||d.items?.length>15||d.quiz?.length<8||d.quiz?.length>10)throw Error("Invalid date or item/question count");
for(const q of d.quiz)if(!q.q?.hi||!q.q?.en||q.o?.hi?.length!==4||q.o?.en?.length!==4||!Number.isInteger(q.a)||q.a<0||q.a>3||!q.exp?.hi||!q.exp?.en)throw Error("Invalid quiz item");
for(const i of d.items)if(!["mp","india","world"].includes(i.region)||!i.title?.hi||!i.summary?.hi||!i.sources?.length||i.sources.some(s=>!headlines.some(h=>h.link===s.url)))throw Error("News item missing valid source");
const base=process.env.SUPABASE_URL.replace(/\/$/,""), key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const saved=await fetch(base+"/rest/v1/daily_current_affairs?on_conflict=day",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({day:target,content:d,published:true,updated_at:new Date().toISOString()})});
if(!saved.ok)throw Error("Supabase save HTTP "+saved.status+" "+(await saved.text()).slice(0,500));
console.log("Published "+target+": "+d.items.length+" news items, "+d.quiz.length+" free MCQs.");
