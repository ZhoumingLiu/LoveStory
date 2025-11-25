(() => {
  const carousel = document.getElementById('carousel');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const caption = document.getElementById('carousel-caption');
  const bgm = document.getElementById('bgm');
  const musicToggle = document.getElementById('music-toggle');

  let isDragging = false, startX=0, scrollStart=0;
  let autoplayTimer = null; let autoplayDelay = 4000;

  function updateCaption(){
    const center = carousel.scrollLeft + carousel.clientWidth/2;
    let current = slides[0];
    slides.forEach(s => {
      const left = s.offsetLeft;
      const right = left + s.offsetWidth;
      if(center >= left && center <= right) current = s;
    });
    caption.textContent = current.dataset.caption || '';
  }

  function scrollToSlide(index){
    const s = slides[Math.max(0,Math.min(index,slides.length-1))];
    carousel.scrollTo({left: s.offsetLeft - (carousel.clientWidth - s.offsetWidth)/2, behavior: 'smooth'});
  }

  prev.addEventListener('click', ()=>{
    const idx = Math.round(carousel.scrollLeft / slides[0].offsetWidth) - 1;
    scrollToSlide(idx);
    pauseAutoplay();
  });
  next.addEventListener('click', ()=>{
    const idx = Math.round(carousel.scrollLeft / slides[0].offsetWidth) + 1;
    scrollToSlide(idx);
    pauseAutoplay();
  });

  // drag to scroll
  carousel.addEventListener('pointerdown', (e)=>{
    isDragging = true; carousel.setPointerCapture(e.pointerId);
    startX = e.pageX; scrollStart = carousel.scrollLeft;
    carousel.classList.add('dragging'); pauseAutoplay();
  });
  carousel.addEventListener('pointermove', (e)=>{
    if(!isDragging) return;
    const dx = e.pageX - startX;
    carousel.scrollLeft = scrollStart - dx;
    updateCaption();
  });
  carousel.addEventListener('pointerup', (e)=>{
    isDragging = false; carousel.releasePointerCapture(e.pointerId);
    carousel.classList.remove('dragging');
    snapToClosest();
    startAutoplayDelayed();
  });
  carousel.addEventListener('pointercancel', ()=>{isDragging=false;});

  function snapToClosest(){
    const center = carousel.scrollLeft + carousel.clientWidth/2;
    let bestIdx = 0; let bestDist = Infinity;
    slides.forEach((s,idx)=>{
      const centerS = s.offsetLeft + s.offsetWidth/2;
      const d = Math.abs(center-centerS);
      if(d<bestDist){bestDist=d;bestIdx=idx}
    });
    scrollToSlide(bestIdx);
  }

  // autoplay
  function startAutoplay(){
    stopAutoplay();
    autoplayTimer = setInterval(()=>{
      const idx = Math.round(carousel.scrollLeft / slides[0].offsetWidth) + 1;
      scrollToSlide(idx % slides.length);
    }, autoplayDelay);
  }
  function stopAutoplay(){ if(autoplayTimer) clearInterval(autoplayTimer); autoplayTimer=null }
  function pauseAutoplay(){ stopAutoplay(); }
  function startAutoplayDelayed(){ stopAutoplay(); autoplayTimer = setTimeout(()=>startAutoplay(), autoplayDelay); }

  // caption update while scrolling
  carousel.addEventListener('scroll', () => { updateCaption(); });

  // init
  window.addEventListener('load', async ()=>{ 
    updateCaption(); 
    startAutoplay(); 
    // Ensure bgm loops and attempt autoplay; modern browsers may block audible autoplay,
    // so we try play() and fallback to play-on-interaction (existing tryStartMusic listener).
    try{
      if(bgm){ bgm.loop = true; await bgm.play(); musicToggle.classList.add('playing'); }
    }catch(e){
      // Autoplay blocked — will start on first user interaction (tryStartMusic)
      console.debug('Autoplay blocked or failed:', e);
    }
  });

  // timeline reveal
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  }, {threshold:0.12});
  document.querySelectorAll('.timeline-item').forEach(i=>observer.observe(i));

  // hearts on click
  function makeHeart(x,y){
    const h = document.createElement('div'); h.className='heart'; h.textContent='❤';
    h.style.left = x+'px'; h.style.top = y+'px'; h.style.color = ['#3b82f6','#60a5fa','#93c5fd','#ff6b81'][Math.floor(Math.random()*4)];
    document.body.appendChild(h);
    setTimeout(()=>h.remove(),900);
  }
  document.addEventListener('click', (e)=>{ makeHeart(e.clientX, e.clientY); });

  // simple lightbox when clicking slide
  slides.forEach(s=>{
    s.addEventListener('click', (ev)=>{
      if(ev.target!==s) return;
      const overlay = document.createElement('div');
      overlay.style.position='fixed';overlay.style.inset=0;overlay.style.background='rgba(0,0,0,0.9)';overlay.style.display='flex';overlay.style.alignItems='center';overlay.style.justifyContent='center';overlay.style.zIndex=9999;
      const img = document.createElement('div');
      img.style.width='90%';img.style.height='80%';img.style.backgroundImage = s.style.backgroundImage;img.style.backgroundSize='contain';img.style.backgroundRepeat='no-repeat';img.style.backgroundPosition='center';
      overlay.appendChild(img);
      overlay.addEventListener('click', ()=>overlay.remove());
      document.body.appendChild(overlay);
    });
  });

  // play music on first user interaction (to satisfy autoplay policies)
  function tryStartMusic(){
    document.removeEventListener('pointerdown', tryStartMusic);
    document.removeEventListener('keydown', tryStartMusic);
    bgm.play().catch(()=>{});
    musicToggle.classList.add('playing');
  }
  document.addEventListener('pointerdown', tryStartMusic, {once:true});
  document.addEventListener('keydown', tryStartMusic, {once:true});

  musicToggle.addEventListener('click', ()=>{
    if(bgm.paused){ bgm.play(); musicToggle.classList.add('playing'); }
    else { bgm.pause(); musicToggle.classList.remove('playing'); }
  });

  // accessibility: keyboard
  document.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowRight') next.click();
    if(e.key==='ArrowLeft') prev.click();
    if(e.key===' ') { musicToggle.click(); e.preventDefault(); }
  });

  // Timer logic
  const startDate = new Date('2025-02-22T00:00:00');
  const els = {
    d: document.getElementById('days'),
    h: document.getElementById('hours'),
    m: document.getElementById('minutes'),
    s: document.getElementById('seconds')
  };

  function updateTimer(){
    const now = new Date();
    const diff = now - startDate; // ms difference

    if(diff < 0) {
       // Future date? Show 0 or countdown logic if preferred. 
       // Assuming "starting from" means past date. If future, use Math.abs
       // For now, let's assume it's a "Time Since" counter.
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    els.d.textContent = d;
    els.h.textContent = h;
    els.m.textContent = m;
    els.s.textContent = s;
  }
  setInterval(updateTimer, 1000);
  updateTimer();

  // Gift Box Logic
  const giftBox = document.getElementById('gift-box');
  const modal = document.getElementById('gift-modal');
  const postcard = document.getElementById('postcard');
  const flipBtn = document.getElementById('flip-btn');
  const closeBtn = document.getElementById('close-modal');
  const canvas = document.getElementById('fireworks');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const birthdayItem = document.getElementById('birthday-item');

  // Target Date
  const targetDate = new Date('2025-11-25T10:35:00'); // Set your target date here

  // Check date on load for dot color
  const now = new Date();
  if(now < targetDate){
    if(birthdayItem) birthdayItem.classList.add('future');
  } else {
    if(birthdayItem) birthdayItem.classList.remove('future');
  }

  if(giftBox){
    giftBox.addEventListener('click', (e)=>{
      e.stopPropagation();
      const currentNow = new Date();
      
      if(currentNow >= targetDate){
        // Unlock
        giftBox.textContent = '💝';
        giftBox.style.animation = 'none';
        // Change the birthday dot to past (blue)
        if(birthdayItem) birthdayItem.classList.remove('future');
        // Show Modal
        modal.classList.remove('hidden');
        postcard.style.display = 'block';
        canvas.classList.add('hidden');
      } else {
        // Locked
        const diffDays = Math.ceil((targetDate - currentNow) / (1000 * 60 * 60 * 24));
        alert(`🔒 还没到时间哦！\n\n距离惊喜开启还有 ${diffDays} 天。\n请耐心等待~`);
      }
    });
  }

  // Modal Interactions
  if(closeBtn){
    closeBtn.addEventListener('click', ()=>{
      modal.classList.add('hidden');
      stopFireworks();
    });
  }

  if(flipBtn){
    flipBtn.addEventListener('click', ()=>{
      postcard.style.display = 'none';
      canvas.classList.remove('hidden');
      startFireworks();
    });
  }

  // Fireworks Logic
  let particles = [];
  let animationId;

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function createFirework(x, y){
    const count = 100;
    const color = `hsl(${Math.random()*360}, 100%, 50%)`;
    for(let i=0; i<count; i++){
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        alpha: 1,
        color: color
      });
    }
  }

  function loop(){
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.alpha -= 0.01;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
      ctx.fill();
      if(p.alpha <= 0) particles.splice(i, 1);
    });

    if(Math.random() < 0.05){
      createFirework(Math.random()*canvas.width, Math.random()*canvas.height/2);
    }

    animationId = requestAnimationFrame(loop);
  }

  function startFireworks(){
    if(animationId) return;
    loop();
  }
  function stopFireworks(){
    cancelAnimationFrame(animationId);
    animationId = null;
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Map Logic
  if(document.getElementById('map')){
    // Restrict map to China bounds
    const chinaBounds = [
      [15.0, 73.0],  // South West
      [54.0, 135.0]  // North East
    ];
    
    const map = L.map('map', {
      center: [35.8617, 104.1954],
      zoom: 4,
      minZoom: 3,
      maxBounds: chinaBounds,
      maxBoundsViscosity: 1.0, // Sticky bounds
      attributionControl: false // Optional: cleaner look
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const locations = [
      {name: '深圳 (足迹)', coords: [22.5431, 114.0579], type: 'visited'},
      {name: '南京 (足迹)', coords: [32.0603, 118.7969], type: 'visited'},
      {name: '汕尾 (足迹)', coords: [22.7856, 115.3753], type: 'visited'},
      {name: '河源 (我的家)', coords: [23.7298, 114.7006], type: 'birth'},
      {name: '牡丹江 (你的家)', coords: [44.5765, 129.6332], type: 'birth'}
    ];

    locations.forEach(loc => {
      const className = loc.type === 'visited' ? 'pin-visited' : 'pin-birth';
      const icon = L.divIcon({
        className: 'custom-pin',
        html: `<div class="pin-inner ${className}"></div><div class="pin-pulse"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker(loc.coords, {icon: icon}).addTo(map).bindPopup(loc.name);
    });
  }

  // Timeline Gallery Logic
  const galleryModal = document.getElementById('gallery-modal');
  const gallerySlide = document.getElementById('gallery-slide');
  const galleryCaption = document.getElementById('gallery-caption');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');
  const closeGallery = document.getElementById('close-gallery');
  
  let currentPhotos = [];
  let currentPhotoIdx = 0;

  function openGallery(photos){
    if(!photos || photos.length===0) return;
    currentPhotos = photos;
    currentPhotoIdx = 0;
    updateGallery();
    galleryModal.classList.remove('hidden');
  }

  function updateGallery(){
    const p = currentPhotos[currentPhotoIdx];
    gallerySlide.innerHTML = ''; // Clear previous content
    
    let media;
    if(p.type === 'video'){
      media = document.createElement('video');
      media.src = p.url;
      media.controls = true;
      media.autoplay = true;
      media.loop = true;
      media.className = 'gallery-media';
    } else {
      media = document.createElement('img');
      media.src = p.url;
      media.className = 'gallery-media';
    }
    
    gallerySlide.appendChild(media);
    galleryCaption.textContent = p.desc;
  }

  if(galleryPrev){
    galleryPrev.addEventListener('click', ()=>{
      currentPhotoIdx = (currentPhotoIdx - 1 + currentPhotos.length) % currentPhotos.length;
      updateGallery();
    });
  }
  if(galleryNext){
    galleryNext.addEventListener('click', ()=>{
      currentPhotoIdx = (currentPhotoIdx + 1) % currentPhotos.length;
      updateGallery();
    });
  }
  if(closeGallery){
    closeGallery.addEventListener('click', ()=>{
      galleryModal.classList.add('hidden');
      gallerySlide.innerHTML = ''; // Stop video playback
    });
  }

  // Event delegation for gallery buttons
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.gallery-btn');
    if(btn){
      const item = btn.closest('.timeline-item');
      const photoDivs = item.querySelectorAll('.timeline-photos div');
      const photos = Array.from(photoDivs).map(div => ({
        url: div.dataset.url,
        desc: div.dataset.desc,
        type: div.dataset.type || 'image' // Support video type
      }));
      if(photos.length > 0) openGallery(photos);
      else alert('这里暂时没有照片哦~');
    }
  });

})();
