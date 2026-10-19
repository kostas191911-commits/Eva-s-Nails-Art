'use strict';
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(hover: hover) and (pointer: fine)');
 const root=document.documentElement,hero=document.querySelector('.hero'),heading=hero?.querySelector('h1');
 if(!hero||!heading)return;
 // Keep the original heading text available once to assistive technology.
 const title=heading.textContent;heading.setAttribute('aria-label',title);const words=title.trim().split(/\s+/);let letterIndex=0;
 heading.replaceChildren();words.forEach((word,i)=>{const span=document.createElement('span');span.className='hero-title-word';span.setAttribute('aria-hidden','true');for(const char of word){const letter=document.createElement('span');letter.className='hero-title-letter';letter.textContent=char;letter.style.setProperty('--letter-index',letterIndex++);span.append(letter)}heading.append(span);if(i<words.length-1)heading.append(document.createTextNode(' '))});
 const atmosphere=document.createElement('div');atmosphere.className='hero-atmosphere';atmosphere.setAttribute('aria-hidden','true');
 for(let i=0;i<9;i++){const dust=document.createElement('i');dust.className='hero-dust';dust.style.cssText=`--dust-x:${8+i*10}%;--dust-y:${25+(i*17)%65}%;--dust-time:${7+(i%4)}s;--dust-delay:-${i*.8}s`;atmosphere.append(dust)}hero.append(atmosphere);
 document.querySelectorAll('.gallery-group').forEach(group=>group.querySelectorAll('.gallery-item').forEach((card,i)=>card.style.setProperty('--wave-index',i)));
 document.querySelectorAll('.price-row').forEach((row,i)=>row.style.setProperty('--price-index',i));
 const photos=[...document.querySelectorAll('.studio-image')];let frame=0;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function paint(){frame=0;if(preference.matches||document.hidden)return;const height=innerHeight,box=hero.getBoundingClientRect();if(box.bottom>0&&box.top<height){const moved=clamp(-box.top,0,height);hero.style.setProperty('--hero-drift',`${Math.min(moved*.075,35)}px`);hero.style.setProperty('--video-drift',`${Math.min(moved*.025,14)}px`)}photos.forEach(photo=>{const r=photo.getBoundingClientRect();if(r.bottom>0&&r.top<height){const t=(r.top+r.height/2-height/2)/height;photo.style.setProperty('--photo-drift',`${clamp(-t*18,-9,9)}px`)}})}
 function schedule(){if(!frame&&!preference.matches&&!document.hidden)frame=requestAnimationFrame(paint)}
 function setPreference(){root.classList.toggle('effects-on',!preference.matches);if(preference.matches){if(frame)cancelAnimationFrame(frame);frame=0;photos.forEach(p=>p.style.removeProperty('--photo-drift'));hero.style.removeProperty('--hero-drift');hero.style.removeProperty('--video-drift')}else schedule()}
 preference.addEventListener('change',setPreference);addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);
 if('IntersectionObserver' in window){const visibility=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('motion-offscreen',!e.isIntersecting)),{rootMargin:'150px'});[hero,document.querySelector('.gallery')].filter(Boolean).forEach(e=>visibility.observe(e))}
 document.querySelectorAll('.service-card').forEach(card=>{
  let pointerFrame=0,point;
  function reset(){if(pointerFrame)cancelAnimationFrame(pointerFrame);pointerFrame=0;['--card-rx','--card-ry','--card-lift','--light-x','--light-y'].forEach(key=>card.style.removeProperty(key))}
  card.addEventListener('pointermove',e=>{if(preference.matches||!finePointer.matches||e.pointerType==='touch')return;point={x:e.clientX,y:e.clientY};if(pointerFrame)return;pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;const r=card.getBoundingClientRect(),x=(point.x-r.left)/r.width,y=(point.y-r.top)/r.height;card.style.setProperty('--card-rx',`${(0.5-y)*10}deg`);card.style.setProperty('--card-ry',`${(x-0.5)*12}deg`);card.style.setProperty('--card-lift','-6px');card.style.setProperty('--light-x',`${x*100}%`);card.style.setProperty('--light-y',`${y*100}%`)})});
  card.addEventListener('pointerleave',reset);card.addEventListener('pointercancel',reset);preference.addEventListener('change',reset);
 });
 setPreference();
})();
