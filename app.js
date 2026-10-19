'use strict';
const $=s=>document.querySelector(s);
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
// Booking stays outside all transformed and animated containers.
function berlinNow(now=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
 return {date:`${p.year}-${p.month}-${p.day}`,minutes:Number(p.hour)*60+Number(p.minute)};
}
function availableTimes(date,now=berlinNow()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<now.date)return [];
 const day=new Date(date+'T12:00:00Z').getUTCDay();if(day===0||day===1)return [];
 const end=day===6?14*60:18*60+30, times=[];
 for(let minute=9*60;minute<end;minute+=30){if(date===now.date&&minute<=now.minutes)continue;times.push(String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0'))}return times;
}
function bookingUrl(data){
 const message=["Hallo Eva's Nails Art! Ich möchte gerne einen Termin anfragen.",'',`Name: ${data.name.trim()}`,data.phone.trim()?`Telefon: ${data.phone.trim()}`:'',`Dienstleistung: ${data.service}`,`Wunschdatum: ${data.date.split('-').reverse().join('.')}`,`Wunschuhrzeit: ${data.time} Uhr`,data.notes.trim()?`Zusätzliche Wünsche: ${data.notes.trim()}`:'','Bitte bestätigt mir, ob der Termin verfügbar ist. Vielen Dank!'].filter(Boolean).join('\n');
 return 'https://wa.me/4917680852106?text='+encodeURIComponent(message);
}
const form=$('#bookingForm'),dateField=$('#bookingDate'),timeField=$('#bookingTime'),status=$('#bookingStatus'),fallback=$('#whatsappBookingFallback');
function formData(){const d=new FormData(form);return Object.fromEntries(['name','phone','service','date','time','notes'].map(k=>[k,String(d.get(k)||'')]))}
function refreshTimes(){
 dateField.min=berlinNow().date;const previous=timeField.value,times=availableTimes(dateField.value);timeField.replaceChildren(new Option(times.length?'Uhrzeit auswählen':dateField.value?'Anderes Datum wählen':'Zuerst Datum wählen',''));
 times.forEach(t=>timeField.add(new Option(t+' Uhr',t)));if(times.includes(previous))timeField.value=previous;
}
function updateLink(){fallback.href=bookingUrl(formData())}
function fail(field,message){status.hidden=false;status.classList.remove('success');status.textContent=message;field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','bookingStatus');field.focus();field.scrollIntoView({behavior:'auto',block:'center'});return false}
function validateBooking(){
 const d=formData();form.querySelectorAll('[aria-invalid]').forEach(el=>{el.removeAttribute('aria-invalid');el.removeAttribute('aria-describedby')});
 if(!d.name.trim())return fail($('#bookingName'),'Bitte gib deinen Vor- und Nachnamen ein.');
 if(!d.service)return fail($('#bookingService'),'Bitte wähle eine Behandlung aus.');
 if(!d.date)return fail(dateField,'Bitte wähle dein Wunschdatum.');
 if(d.date<berlinNow().date)return fail(dateField,'Bitte wähle ein Datum, das nicht in der Vergangenheit liegt.');
 const slots=availableTimes(d.date);if(!slots.length)return fail(dateField,'An diesem Tag sind keine Wunschzeiten verfügbar. Wir haben Dienstag bis Freitag von 09:00 bis 18:30 Uhr und Samstag von 09:00 bis 14:00 Uhr geöffnet.');
 if(!slots.includes(d.time))return fail(timeField,'Bitte wähle eine gültige Wunschuhrzeit innerhalb unserer Öffnungszeiten.');
 return true;
}
form.addEventListener('submit',event=>{
 event.preventDefault();if(!validateBooking())return;
 const url=bookingUrl(formData());fallback.href=url;status.hidden=false;status.classList.add('success');status.textContent='WhatsApp wird geöffnet. Sende dort deine vorbereitete Nachricht ab. Dein Termin gilt erst nach unserer Bestätigung.';
 // Synchronous same-tab navigation from a native submit: no popup or delayed touch handler.
 window.location.assign(url);
});
fallback.addEventListener('click',event=>{if(!validateBooking()){event.preventDefault();return}updateLink()});
dateField.addEventListener('change',()=>{refreshTimes();updateLink()});form.addEventListener('input',updateLink);form.addEventListener('change',updateLink);refreshTimes();updateLink();
// Accessible mobile navigation.
const menu=$('#menuToggle'),links=$('#navLinks');function closeMenu(){links.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Menü öffnen')}
menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen')});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
// Muted background playback with a static fallback for reduced motion.
const video=$('#heroVideo');
video.muted=true;video.defaultMuted=true;video.playsInline=true;
function tryVideo(){if(!reducedMotion.matches&&!document.hidden)video.play().catch(()=>{})}
if(reducedMotion.matches){video.autoplay=false;video.pause()}
video.addEventListener('loadeddata',tryVideo);
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else tryVideo()});
window.addEventListener('pageshow',tryVideo);tryVideo();
// A complete repeated group makes the left-moving gallery loop without a jump.
const track=$('.gallery-track');
function motionPreference(){document.documentElement.classList.toggle('motion-ready',!reducedMotion.matches);if(reducedMotion.matches){video.pause()}else{tryVideo()}}
// Full photo view. Duplicated marquee cards are excluded from keyboard navigation.
const dialog=$('#imageDialog'),full=$('#imageFull'),caption=$('#imageCaption');const photos=[...document.querySelectorAll('.image-open')].filter(e=>!e.closest('[aria-hidden="true"]'));let photoIndex=0,returnFocus;
function showPhoto(index){photoIndex=(index+photos.length)%photos.length;const p=photos[photoIndex];full.src=p.dataset.image;full.alt=p.querySelector('img').alt;caption.textContent=p.dataset.caption;}
document.querySelectorAll('.image-open').forEach(p=>p.addEventListener('click',()=>{returnFocus=p;showPhoto(photos.findIndex(original=>original.dataset.image===p.dataset.image));if(typeof dialog.showModal==='function'){dialog.showModal();track.classList.add('is-paused')}else window.location.assign(p.dataset.image)}));
$('#imagePrev').addEventListener('click',()=>showPhoto(photoIndex-1));$('#imageNext').addEventListener('click',()=>showPhoto(photoIndex+1));$('.image-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{track.classList.remove('is-paused');returnFocus?.focus({preventScroll:true})});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1)}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1)}});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
// Reveal on entry; interactive booking content is intentionally never transformed.
if('IntersectionObserver' in window){
 const targets=document.querySelectorAll('.studio-story,.studio-scene,#services .section-header,.service-card,#gallery .section-header,#prices .section-header,.price-wrapper,.contact-info,.map-box');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
 targets.forEach((el,i)=>{el.classList.add('reveal');if(el.matches('.service-card,.studio-scene'))el.style.setProperty('--reveal-delay',`${(i%3)*90}ms`);el.style.setProperty('--entry-turn',i%2?'9deg':'-9deg');observer.observe(el)});
 motionPreference();reducedMotion.addEventListener('change',motionPreference);
 const floating=$('.whatsapp-float');const bookingObserver=new IntersectionObserver(entries=>{floating.classList.toggle('is-hidden',entries.some(e=>e.isIntersecting))},{threshold:0,rootMargin:'50px 0px 50px 0px'});bookingObserver.observe($('.booking-card'));
}
const progress=$('#scrollProgress');let scrollFrame=false;function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.max(0,Math.min(1,scrollY/max)):0})`;scrollFrame=false}addEventListener('scroll',()=>{if(!scrollFrame){scrollFrame=true;requestAnimationFrame(updateProgress)}},{passive:true});updateProgress();
