// Lightweight nearest-neighbour intent model. Character n-grams also handle
// inflections and minor spelling variations in Dutch catalogue queries.
const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function vector(s){const v=new Map();for(const word of normalize(s).split(/\W+/).filter(Boolean)){
 const w='^'+word+'$';for(let i=0;i<w.length-2;i++){const g=w.slice(i,i+3);v.set(g,(v.get(g)||0)+1)}}return v}
function similarity(a,b){let dot=0,aa=0,bb=0;for(const [k,v] of a){aa+=v*v;dot+=v*(b.get(k)||0)}for(const v of b.values())bb+=v*v;return dot/Math.sqrt(aa*bb)||0}
const examples={Spanje:['spanje','spaans','spaanse','spain'],Italië:['italie','italiaans','italiaanse','italy'],Frankrijk:['frankrijk','frans','franse','france'],Pasta:['pasta','deegwaren','macaroni'],Olie:['olie','olien'],Smaakmakers:['smaakmakers','smaakmaker','condimenten','sauzen']};
const training=Object.entries(examples).flatMap(([label,terms])=>terms.map(t=>[label,vector(t)]));
function labels(q){
 const found=new Set();
 for(const token of q.split(/[^a-z]+/).filter(x=>x.length>=3)){
  let best=0,label=null;const v=vector(token);
  for(const [k,sample] of training){const score=similarity(v,sample);if(score>best){best=score;label=k}}
  if(best>=.64)found.add(label)
 }return found
}
function findProducts(input,data,products,previous){
 const q=normalize(input), all=/alle producten|toon alles|hele collectie|alles tonen/.test(q);
 const follow=/^(en\b|maar\b|alleen\b|daarvan\b)/.test(q)&&!all;
 const f=follow&&previous?{...previous}:{}, known=labels(q);
 const countries=new Set(data.map(r=>r[0])),categories=new Set(data.map(r=>r[2]));
 const cc=[...known].filter(x=>countries.has(x)),gg=[...known].filter(x=>categories.has(x));
 if(cc.length)f.countries=cc;if(gg.length)f.groups=gg;
 const named=data.filter(r=>normalize(r[1]).split(' ').some(t=>q.includes(t))).map(r=>r[1]);
 if(named.length)f.names=named;
 const n='(?:€\\s*)?(\\d+(?:[.,]\\d{1,2})?)',val=x=>Number(x.replace(',','.'));
 let m=q.match(new RegExp('tussen\\s+'+n+'\\s*(?:euro)?\\s*(?:en|tot)\\s*'+n));
 if(m){f.low=[val(m[1]),true];f.high=[val(m[2]),true]}else{
  m=q.match(new RegExp('(onder|minder dan|goedkoper dan|maximaal|max\\.?|hoogstens|tot en met|tot)\\s*'+n));if(m)f.high=[val(m[2]),!['onder','minder dan','goedkoper dan'].includes(m[1])];
  m=q.match(new RegExp('(boven|meer dan|duurder dan|minimaal|vanaf)\\s*'+n));if(m)f.low=[val(m[2]),['minimaal','vanaf'].includes(m[1])];
 }
 const cheap=/goedkoopste|laagste prijs/.test(q),expensive=/duurste|hoogste prijs/.test(q);
 const foreign=/\b(duits\w*|duitsland|belgi\w*|belgisch\w*|nederland\w*|portug\w*|griek\w*|oostenrijk\w*)\b/.test(q);
 if(foreign)return {filters:null,rows:[],message:'Voor dat land staan er nog geen producten in de collectie.'};
 if(!Object.keys(f).length&&!all&&!cheap&&!expensive)return {filters:null,rows:[],message:'Zoek op Spanje, Italië of Frankrijk, op een product of categorie, of stel een prijsgrens. Bijvoorbeeld: “producten tussen €4 en €8”.'};
 let rows=data.filter(([country,name,group])=>{const p=products[name].price;return (!f.countries||f.countries.includes(country))&&(!f.groups||f.groups.includes(group))&&(!f.names||f.names.includes(name))&&(!f.low||(f.low[1]?p>=f.low[0]:p>f.low[0]))&&(!f.high||(f.high[1]?p<=f.high[0]:p<f.high[0]))}).sort((a,b)=>products[a[1]].price-products[b[1]].price);
 if(cheap||expensive)rows=rows.length?[rows[expensive?rows.length-1:0]]:[];
 return {filters:f,rows,message:rows.length?'Gevonden in de collectie:':'Geen producten voor deze combinatie. Probeer een ander land, een andere categorie of een ruimere prijsgrens.'}
}
