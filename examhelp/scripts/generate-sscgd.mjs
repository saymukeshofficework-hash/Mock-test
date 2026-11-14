import fs from "node:fs";
import path from "node:path";
const root=path.resolve("public/mock-tests/sscgd");
fs.mkdirSync(path.join(root,"tests"),{recursive:true});
const sections=[
{key:"re",label:{hi:"रीजनिंग एवं सामान्य बुद्धिमत्ता",en:"Reasoning & General Intelligence"}},
{key:"gk",label:{hi:"सामान्य ज्ञान एवं जागरूकता",en:"General Knowledge & General Awareness"}},
{key:"ma",label:{hi:"प्रारंभिक गणित",en:"Elementary Mathematics"}},
{key:"la",label:{hi:"हिंदी / English",en:"Hindi / English"}}
];
const facts=[
["भारत का संविधान कब अंगीकृत किया गया?","When was the Constitution of India adopted?",["26 नवम्बर 1949","15 अगस्त 1947","26 जनवरी 1950","2 अक्टूबर 1950"],["26 November 1949","15 August 1947","26 January 1950","2 October 1950"]],
["भारत का राष्ट्रीय जलीय जीव कौन-सा है?","What is India's national aquatic animal?",["गंगा डॉल्फिन","नीली व्हेल","मगरमच्छ","कछुआ"],["Ganges river dolphin","Blue whale","Crocodile","Turtle"]],
["भारतीय रिजर्व बैंक की स्थापना किस वर्ष हुई?","In which year was RBI established?",["1935","1947","1950","1921"],["1935","1947","1950","1921"]],
["भारत का सर्वोच्च नागरिक सम्मान कौन-सा है?","What is India's highest civilian award?",["भारत रत्न","पद्म विभूषण","पद्म भूषण","पद्म श्री"],["Bharat Ratna","Padma Vibhushan","Padma Bhushan","Padma Shri"]],
["काजीरंगा राष्ट्रीय उद्यान किस राज्य में है?","Kaziranga National Park is in which state?",["असम","गुजरात","मध्य प्रदेश","केरल"],["Assam","Gujarat","Madhya Pradesh","Kerala"]],
["पंचायती राज को संवैधानिक दर्जा किस संशोधन से मिला?","Which amendment gave constitutional status to Panchayati Raj?",["73वाँ","42वाँ","44वाँ","74वाँ"],["73rd","42nd","44th","74th"]],
["'जय जवान जय किसान' का नारा किसने दिया?","Who gave the slogan 'Jai Jawan Jai Kisan'?",["लाल बहादुर शास्त्री","जवाहरलाल नेहरू","सरदार पटेल","महात्मा गांधी"],["Lal Bahadur Shastri","Jawaharlal Nehru","Sardar Patel","Mahatma Gandhi"]],
["सूर्य के सबसे निकट कौन-सा ग्रह है?","Which planet is closest to the Sun?",["बुध","शुक्र","पृथ्वी","मंगल"],["Mercury","Venus","Earth","Mars"]],
["रतौंधी किस विटामिन की कमी से होती है?","Deficiency of which vitamin causes night blindness?",["विटामिन A","विटामिन B12","विटामिन C","विटामिन D"],["Vitamin A","Vitamin B12","Vitamin C","Vitamin D"]],
["भारत का पहला उपग्रह कौन-सा था?","What was India's first satellite?",["आर्यभट्ट","भास्कर","रोहिणी","इनसैट-1A"],["Aryabhata","Bhaskara","Rohini","INSAT-1A"]],
["लोकसभा का सामान्य कार्यकाल कितने वर्ष है?","What is the normal term of the Lok Sabha?",["5 वर्ष","4 वर्ष","6 वर्ष","3 वर्ष"],["5 years","4 years","6 years","3 years"]],
["हरित क्रांति का प्रमुख संबंध किस फसल से था?","The Green Revolution was initially most associated with which crop?",["गेहूँ","चाय","कपास","जूट"],["Wheat","Tea","Cotton","Jute"]],
["भारत का राष्ट्रीय पशु कौन है?","What is India's national animal?",["बाघ","सिंह","हाथी","तेंदुआ"],["Tiger","Lion","Elephant","Leopard"]],
["विश्व पर्यावरण दिवस कब मनाया जाता है?","When is World Environment Day observed?",["5 जून","22 अप्रैल","16 सितम्बर","1 दिसम्बर"],["5 June","22 April","16 September","1 December"]],
["क्षेत्रफल के आधार पर भारत का सबसे बड़ा राज्य कौन-सा है?","Which is India's largest state by area?",["राजस्थान","मध्य प्रदेश","महाराष्ट्र","उत्तर प्रदेश"],["Rajasthan","Madhya Pradesh","Maharashtra","Uttar Pradesh"]],
["'गीतांजलि' के लेखक कौन हैं?","Who wrote 'Gitanjali'?",["रवीन्द्रनाथ टैगोर","बंकिमचंद्र","प्रेमचंद","महादेवी वर्मा"],["Rabindranath Tagore","Bankim Chandra","Premchand","Mahadevi Verma"]],
["ध्वनि की चाल सबसे अधिक किसमें होती है?","Sound travels fastest in which medium?",["ठोस","द्रव","गैस","निर्वात"],["Solids","Liquids","Gases","Vacuum"]],
["मौलिक अधिकार संविधान के किस भाग में हैं?","Fundamental Rights are in which Part of the Constitution?",["भाग III","भाग II","भाग IV","भाग V"],["Part III","Part II","Part IV","Part V"]],
["रक्त को छानने का मुख्य कार्य कौन करता है?","Which organ mainly filters blood?",["गुर्दे","हृदय","फेफड़े","अग्न्याशय"],["Kidneys","Heart","Lungs","Pancreas"]],
["भारत का राष्ट्रीय फूल कौन-सा है?","What is India's national flower?",["कमल","गुलाब","चमेली","गेंदा"],["Lotus","Rose","Jasmine","Marigold"]]
];
const words=[["प्रकाश","Light","उजाला","Brightness"],["परिश्रम","Hard work","मेहनत","Effort"],["साहस","Courage","वीरता","Bravery"],["निर्मल","Pure","स्वच्छ","Clean"],["प्राचीन","Ancient","पुराना","Old"],["विस्तार","Expansion","फैलाव","Spread"],["उन्नति","Progress","प्रगति","Advancement"],["विनम्र","Humble","नम्र","Modest"],["दुर्लभ","Rare","असामान्य","Uncommon"],["आनंद","Joy","खुशी","Happiness"],["सत्य","Truth","सच","Fact"],["आरंभ","Beginning","शुरुआत","Start"],["समाप्त","Finished","पूर्ण","Complete"],["शांत","Calm","स्थिर","Quiet"],["कठिन","Difficult","मुश्किल","Hard"],["लाभ","Benefit","फायदा","Advantage"],["हानि","Loss","नुकसान","Damage"],["स्वतंत्र","Independent","आजाद","Free"],["आवश्यक","Necessary","जरूरी","Essential"],["विशाल","Huge","बड़ा","Enormous"]];
let optionCounter=0;function makeQ(s,qh,qe,oh,oe,correct){const shift=(optionCounter++*7+3)%4;const order=[0,1,2,3].map((_,i)=>(i+shift)%4);return {s:s,d:"m",a:order.indexOf(correct),q:{hi:qh,en:qe},o:{hi:order.map(i=>oh[i]),en:order.map(i=>oe[i])},sol:{hi:"सही विकल्प चुनें।",en:"Choose the correct option."}}}
for(let n=1;n<=25;n++){
 const q=[];
 for(let i=0;i<20;i++){let a=(n*13+i*7)%43+8,b=(n*5+i*3)%17+4,k=i%4,ans,txtH,txtE,opts;
 if(k===0){ans=a+4*b;txtH="श्रेणी पूरी करें: "+a+", "+(a+b)+", "+(a+2*b)+", "+(a+3*b)+", ?";txtE="Complete the series: "+a+", "+(a+b)+", "+(a+2*b)+", "+(a+3*b)+", ?";opts=[ans,ans+2,ans-2,ans+4]}
 else if(k===1){ans=a*b;txtH=a+" × "+b+" का मान क्या है?";txtE="What is "+a+" × "+b+"?";opts=[ans,ans+a,ans-b,ans+1]}
 else if(k===2){ans=a-b;txtH=a+" − "+b+" का मान ज्ञात करें।";txtE="Find "+a+" − "+b+".";opts=[ans,ans+1,ans-1,ans+2]}
 else{ans=a;txtH=(a*b)+" को "+b+" से भाग देने पर भागफल क्या होगा?";txtE="What is "+(a*b)+" divided by "+b+"?";opts=[ans,ans+1,ans-1,ans+2]}
 q.push(makeQ("re",txtH,txtE,opts.map(String),opts.map(String),0))}
 for(let i=0;i<20;i++){const f=facts[(n*7+i*3)%facts.length];q.push(makeQ("gk","पेपर "+n+": "+f[0],"Paper "+n+": "+f[1],f[2],f[3],0))}
 for(let i=0;i<20;i++){let a=(n*17+i*11)%79+19,b=(n*3+i*5)%13+3,k=i%5,ans,txtH,txtE,opts;
 if(k===0){ans=a+b;txtH=a+" + "+b+" का मान ज्ञात कीजिए।";txtE="Find "+a+" + "+b+".";opts=[ans,ans+2,ans-2,ans+4]}
 else if(k===1){ans=a*b;txtH=a+" × "+b+" का मान ज्ञात करें।";txtE="Calculate "+a+" × "+b+".";opts=[ans,ans+b,ans-a,ans+1]}
 else if(k===2){ans=a-b;txtH=a+" − "+b+" का मान क्या है?";txtE="What is "+a+" − "+b+"?";opts=[ans,ans+1,ans-1,ans+2]}
 else if(k===3){ans=a;txtH=(a*b)+" को "+b+" से भाग दें।";txtE="Divide "+(a*b)+" by "+b+".";opts=[ans,ans+1,ans-1,ans+2]}
 else{ans=a*10;txtH=a+" का 10 गुना कितना होगा?";txtE="What is ten times "+a+"?";opts=[ans,ans+10,ans-10,ans+100]}
 q.push(makeQ("ma",txtH,txtE,opts.map(String),opts.map(String),0))}
 for(let i=0;i<20;i++){const w=words[(n*3+i*7)%words.length];q.push(makeQ("la","पेपर "+n+": '"+w[0]+"' का समानार्थी शब्द चुनिए।","Paper "+n+": choose the synonym of '"+w[1]+"'.",[w[2],"विपरीत अर्थ","असंबंधित शब्द","इनमें से कोई नहीं"],[w[3],"Opposite meaning","Unrelated word","None of these"],0))}
 const data={test:n,title:{hi:"SSC GD मॉक टेस्ट "+n,en:"SSC GD Mock Test "+n},sections,questions:q};
 fs.writeFileSync(path.join(root,"tests",String(n).padStart(2,"0")+".json"),JSON.stringify(data));
}
const html=String.raw`<!doctype html><html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SSC GD Mock Test</title><style>body{margin:0;background:#f2f5fb;color:#172033;font:16px system-ui,"Noto Sans Devanagari",sans-serif}main{max-width:850px;margin:auto;background:white;min-height:100vh;padding:16px;box-sizing:border-box}.bar{background:#192b63;color:white;padding:14px;border-radius:12px;display:flex;justify-content:space-between;gap:8px}button{border:0;border-radius:8px;padding:10px 14px;background:#315bd6;color:white;font-weight:700}.hide{display:none!important}.opts{display:grid;gap:10px}.opt{display:flex;gap:10px;border:1px solid #dce2ee;border-radius:10px;padding:12px}.opt:has(input:checked){border-color:#315bd6;background:#eef3ff}.grid{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin:12px 0}.grid button{padding:7px;background:#e9edf5;color:#1b2945}.grid button.done{background:#1d9b69;color:white}.row{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}.score{font-size:32px;font-weight:900;color:#1b7d59}input,select{padding:10px;border:1px solid #ccd4e3;border-radius:8px}</style></head><body><main><section id="intro"><div class="bar"><b>SSC GD · TET TESTHUB</b><button id="langIntro">English</button></div><h2 id="title">SSC GD मॉक टेस्ट</h2><p id="rules">80 प्रश्न · 160 अंक · 60 मिनट<br>सही +2 · गलत −0.25 · छोड़ा गया 0<br>हिंदी / English · सभी टेस्ट मुफ्त</p><label>विद्यार्थी का नाम</label><br><input id="student"><button id="start">टेस्ट शुरू करें</button><p><a href="/examhelp/ssc-gd-mock-tests/">सभी टेस्ट पर वापस जाएँ</a></p></section><section id="exam" class="hide"><div class="bar"><b>SSC GD · <span id="count">1/80</span></b><span><span id="clock">60:00</span> <button id="lang">English</button></span></div><div class="row"><select id="section"></select><span>सही +2 · गलत −0.25</span></div><div class="grid" id="palette"></div><h3 id="q"></h3><div class="opts" id="opts"></div><div class="row"><button id="prev">पिछला</button><button id="next">अगला</button><button id="submit">जमा करें</button></div></section><section id="result" class="hide"><div class="bar"><b>SSC GD · परिणाम</b><button id="resultLang">English</button></div><h2 id="resultName"></h2><div class="score" id="score"></div><p id="summary"></p><div id="review"></div><button onclick="location.reload()">फिर से दें</button></section></main><script>
const params=new URLSearchParams(location.search),num=String(Math.max(1,Math.min(25,Number(params.get("t")||1)))).padStart(2,"0");let data,lang="hi",idx=0,answers={},left=3600,timer;const $=id=>document.getElementById(id),fmt=x=>String(Math.floor(x/60)).padStart(2,"0")+":"+String(x%60).padStart(2,"0");
fetch("/examhelp/mock-tests/sscgd/tests/"+num+".json").then(r=>r.json()).then(d=>{data=d;$("title").textContent=d.title.hi;d.sections.forEach(s=>{let o=document.createElement("option");o.value=s.key;o.textContent=s.label.hi;$("section").append(o)});$("section").onchange=()=>{idx=data.questions.findIndex(q=>q.s===$("section").value);render()};});
function render(){let q=data.questions[idx];$("count").textContent=(idx+1)+"/80";$("q").textContent=q.q[lang];$("section").value=q.s;$("opts").innerHTML="";q.o[lang].forEach((v,j)=>{let l=document.createElement("label");l.className="opt";l.innerHTML='<input type="radio" name="answer" '+(answers[idx]===j?"checked":"")+'><span>'+"ABCD"[j]+". "+v+"</span>";l.querySelector("input").onchange=()=>{answers[idx]=j;palette()};$("opts").append(l)});palette()}
function palette(){$("palette").innerHTML="";data.questions.forEach((q,i)=>{let b=document.createElement("button");b.textContent=i+1;if(answers[i]!==undefined)b.className="done";b.onclick=()=>{idx=i;render()};$("palette").append(b)})}
function toggle(){lang=lang==="hi"?"en":"hi";$("lang").textContent=lang==="hi"?"English":"हिंदी";$("langIntro").textContent=$("lang").textContent;$("resultLang").textContent=$("lang").textContent;if(data)render()}
$("lang").onclick=toggle;$("langIntro").onclick=toggle;$("resultLang").onclick=()=>{toggle();result()};
$("start").onclick=()=>{$("intro").classList.add("hide");$("exam").classList.remove("hide");render();timer=setInterval(()=>{left--;$("clock").textContent=fmt(left);if(left<=0)finish()},1000)};
$("prev").onclick=()=>{idx=Math.max(0,idx-1);render()};$("next").onclick=()=>{idx=Math.min(79,idx+1);render()};$("submit").onclick=()=>{if(confirm("टेस्ट जमा करें?"))finish()};
function finish(){clearInterval(timer);$("exam").classList.add("hide");result()}
function result(){if(!data)return;let correct=0,wrong=0,skip=0,score=0;data.questions.forEach((q,i)=>{if(answers[i]===undefined)skip++;else if(answers[i]===q.a){correct++;score+=2}else{wrong++;score-=.25}});$("result").classList.remove("hide");$("resultName").textContent=($("student").value||"विद्यार्थी")+" · "+data.title[lang];$("score").textContent=score.toFixed(2)+" / 160";$("summary").textContent=lang==="hi"?"सही "+correct+" · गलत "+wrong+" · छोड़े "+skip:"Correct "+correct+" · Wrong "+wrong+" · Skipped "+skip;$("review").innerHTML="";data.questions.forEach((q,i)=>{let d=document.createElement("details"),s=document.createElement("summary"),p=document.createElement("p");s.textContent=(i+1)+". "+q.q[lang];p.textContent=(lang==="hi"?"सही उत्तर: ":"Correct answer: ")+q.o[lang][q.a];d.append(s,p);$("review").append(d)})}
</script></body></html>`;
fs.writeFileSync(path.join(root,"test.html"),html);
