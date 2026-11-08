const key='marketzz-basket-v1';
function readBasket(){try{return JSON.parse(localStorage.getItem(key))||{}}catch{return {}}}
const saved=readBasket(),cart={},sold={};
for(const [name,p] of Object.entries(products)){
 const safe=(x,max)=>Number.isInteger(x)?Math.max(0,Math.min(max,x)):0;
 sold[name]=safe(saved.sold?.[name],p.stock);p.stock-=sold[name];
 cart[name]=safe(saved.cart?.[name],p.stock);
}
function persist(){try{localStorage.setItem(key,JSON.stringify({cart,sold}))}catch{}}
function paint(){
 const entries=Object.entries(cart).filter(([,n])=>n>0);
 openBasket.textContent='Mandje ('+entries.reduce((a,[,n])=>a+n,0)+')';
 lines.innerHTML=entries.map(([name,n])=>'<div class="line"><strong>'+name+'</strong>'+money.format(products[name].price)+' per stuk<br><button class="qty" aria-label="Eén minder" data-change="-1" data-name="'+name+'">−</button> '+n+' <button class="qty" aria-label="Eén meer" data-change="1" data-name="'+name+'" '+(n>=products[name].stock?'disabled':'')+'>+</button><button class="qty" data-change="clear" data-name="'+name+'">Verwijder</button></div>').join('')||'Je mandje is leeg.';
 const cents=entries.reduce((a,[name,n])=>a+n*Math.round(products[name].price*100),0);
 sum.textContent='Totaal '+money.format(cents/100);checkout.disabled=!entries.length;update();
}
function add(name){const ok=cart[name]<products[name].stock;if(ok){cart[name]++;persist();paint()}return ok?name+' toegevoegd aan je mandje.':'De beschikbare voorraad zit al in je mandje.'}
cards.onclick=e=>{const b=e.target.closest('[data-order]');if(b)notice.textContent=add(b.dataset.order)};
openBasket.onclick=()=>basket.showModal();
lines.onclick=e=>{const b=e.target.closest('[data-change]');if(!b)return;const name=b.dataset.name;cart[name]=b.dataset.change==='clear'?0:Math.max(0,Math.min(products[name].stock,cart[name]+Number(b.dataset.change)));persist();paint()};
checkout.onclick=()=>{if(checkout.disabled)return;const total=sum.textContent;for(const name in cart){products[name].stock-=cart[name];sold[name]+=cart[name];cart[name]=0}persist();paint();basket.close();notice.textContent='Proefbestelling bevestigd. '+total+'.';notice.scrollIntoView({block:'center'})};
paint();launchChat.onclick=()=>{chat.showModal();question.focus()};
const transcript=document.getElementById('history');
function say(t,user=false){const div=document.createElement('div');div.className='turn'+(user?' userturn':'');div.textContent=t;transcript.append(div);transcript.scrollTop=transcript.scrollHeight;return div}
let previous=null;
ask.onsubmit=e=>{e.preventDefault();const q=question.value.trim();if(!q)return;question.value='';say(q,true);
 const result=findProducts(q,data,products,previous);previous=result.filters;
 const reply=say(result.message);
 for(const [country,name,category] of result.rows){const line=document.createElement('div');line.className='hit';const title=document.createElement('strong');title.textContent=name+' · '+money.format(products[name].price);line.append(title,document.createTextNode(country+' · '+category+' · '+products[name].stock+' stuks '));const btn=document.createElement('button');btn.className='suggest';btn.textContent='In mandje';btn.disabled=!products[name].stock;btn.onclick=()=>say(add(name));line.append(btn);reply.append(line)}
 transcript.scrollTop=transcript.scrollHeight;
};
document.querySelectorAll('[data-prompt]').forEach(button=>{
 button.addEventListener('click',()=>{
  chat.showModal();
  question.value=button.textContent.trim();
  ask.requestSubmit();
  question.focus();
 });
});
const menuToggle=document.getElementById('navToggle');
const mainNav=document.getElementById('mainNav');
function closeNavigation(){menuToggle.setAttribute('aria-expanded','false')}
menuToggle.onclick=()=>menuToggle.setAttribute('aria-expanded',String(menuToggle.getAttribute('aria-expanded')!=='true'));
mainNav.addEventListener('click',event=>{
 if(!event.target.closest('a'))return;
 closeNavigation();
 if(event.target.id==='navMakers'){
  land.selectedIndex=category.selectedIndex=0;update();
  cards.querySelectorAll('.maker-story').forEach(story=>story.open=true);
 }
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&menuToggle.getAttribute('aria-expanded')==='true'){closeNavigation();menuToggle.focus()}
});
