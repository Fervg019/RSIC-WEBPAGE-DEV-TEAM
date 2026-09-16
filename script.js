/* RSIC 2026, v7. Small enhancements plus the moving background; every page still reads fine without this file. */
(()=>{
  const root=document.documentElement;
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

  // phone menu
  const head=document.querySelector(".site-head");
  const menuBtn=document.querySelector(".menu-btn");
  if(head&&menuBtn){
    root.classList.add("has-menu");
    const setOpen=open=>{
      head.classList.toggle("open",open);
      menuBtn.setAttribute("aria-expanded",String(open));
    };
    menuBtn.addEventListener("click",()=>setOpen(!head.classList.contains("open")));
    addEventListener("keydown",e=>{
      if(e.key==="Escape"&&head.classList.contains("open")){setOpen(false);menuBtn.focus();}
    });
    addEventListener("resize",()=>{if(innerWidth>1040)setOpen(false)});
  }

  // countdown to Friday 13 November 2026, 1:45 PM PKT (RSIC runs 13 to 15 November); each number rolls in when it changes
  const grid=document.querySelector("[data-countdown]");
  if(grid){
    const target=new Date("2026-11-13T13:45:00+05:00").getTime();
    const cells=["d","h","m","s"].map(k=>grid.querySelector(`[data-${k}]`));
    const label=document.querySelector("[data-countdown-label]");
    const pad=n=>String(n).padStart(2,"0");
    let started=false;
    const tick=()=>{
      let left=Math.max(0,target-Date.now());
      const d=Math.floor(left/864e5);left%=864e5;
      const h=Math.floor(left/36e5);left%=36e5;
      const m=Math.floor(left/6e4);left%=6e4;
      const s=Math.floor(left/1e3);
      [d,h,m,s].forEach((v,i)=>{
        const cell=cells[i],text=pad(v);
        if(cell.textContent===text)return;
        cell.textContent=text;
        if(started&&!reduce){cell.classList.remove("tick");void cell.offsetWidth;cell.classList.add("tick");}
      });
      started=true;
      if(target<=Date.now()){
        if(label)label.textContent="RSIC is live";
        document.body.classList.add("rsic-live");
      }
    };
    tick();
    grid.classList.add("ready");
    setInterval(tick,1000);
  }

  // experience list: items fade in as they scroll into view
  const revealItems=document.querySelectorAll(".reveal > li");
  if(revealItems.length&&!reduce&&"IntersectionObserver" in window){
    root.classList.add("reveal-on");
    const io=new IntersectionObserver(entries=>{
      entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in-view");io.unobserve(en.target);}});
    },{threshold:.2});
    revealItems.forEach(el=>io.observe(el));
  }

  // lab: hover, focus or tap a realm to draw its pattern
  const labNodes=[...document.querySelectorAll(".lab-node")];
  if(labNodes.length){
    const patterns=document.querySelectorAll(".lab-pattern");
    const caption=document.querySelector(".lab-caption");
    const activate=node=>{
      labNodes.forEach(n=>{
        const on=n===node;
        n.classList.toggle("active",on);
        n.setAttribute("aria-pressed",String(on));
      });
      patterns.forEach(p=>p.classList.toggle("active",p.dataset.for===node.dataset.key));
      if(caption)caption.textContent=node.dataset.caption||"";
    };
    labNodes.forEach(n=>["mouseenter","focus","click"].forEach(ev=>n.addEventListener(ev,()=>activate(n))));
  }

  // register: delegate / school toggle
  const form=document.querySelector(".reg-panel form");
  const status=document.querySelector(".reg-status");
  const switches=document.querySelectorAll(".reg-switch button");
  if(form&&switches.length){
    const fields=form.querySelectorAll(".reg-field");
    const routeInput=form.elements.namedItem("route");
    const setRoute=route=>{
      switches.forEach(b=>{
        const on=b.dataset.route===route;
        b.classList.toggle("active",on);
        b.setAttribute("aria-pressed",String(on));
      });
      // the hidden route is disabled so its required fields can't block submitting the visible one
      fields.forEach(f=>{
        const on=f.dataset.route===route;
        f.classList.toggle("active",on);
        f.disabled=!on;
      });
      if(routeInput)routeInput.value=route;
      if(status)status.textContent="";
    };
    switches.forEach(b=>b.addEventListener("click",()=>setRoute(b.dataset.route)));
  }
  if(form){
    form.addEventListener("submit",e=>{
      e.preventDefault();
      if(status)status.textContent="Preview only. Registration opens closer to RSIC. Nothing was sent.";
    });
  }

  // realm pages link here with ?realm=key to preselect it
  const realm=new URLSearchParams(location.search).get("realm");
  const select=document.getElementById("d-realm");
  if(realm&&select&&[...select.options].some(o=>o.value===realm))select.value=realm;
})();

/* ===== top bar, wordmark and small reactions ===== */
// Pointer reactions run even with reduced motion on: they're small and only happen when you point at something.
(()=>{
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer=matchMedia("(hover: hover) and (pointer: fine)").matches;
  const head=document.querySelector(".site-head");

  // header tightens after you scroll, and a thin pink line shows how far down the page you are
  if(head){
    const line=document.createElement("span");
    line.className="scroll-line";
    line.setAttribute("aria-hidden","true");
    head.appendChild(line);
    let queued=false;
    const update=()=>{
      queued=false;
      const max=document.documentElement.scrollHeight-innerHeight;
      line.style.setProperty("--progress",(max>0?Math.min(1,scrollY/max):0).toFixed(4));
      head.classList.toggle("scrolled",scrollY>24);
    };
    addEventListener("scroll",()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
    addEventListener("resize",update);
    update();
  }

  // RSIC wordmark: draws itself in on load, then the letters hop and the dot bounces whenever you point at it
  document.querySelectorAll(".logo").forEach(logo=>{
    const paths=[...logo.querySelectorAll("path")];
    paths.forEach((p,i)=>{
      p.style.setProperty("--len",Math.ceil(p.getTotalLength()+1));
      p.style.setProperty("--i",i);
    });
    const play=name=>{logo.classList.remove("draw","wave");void logo.getBoundingClientRect();logo.classList.add(name);};
    logo.addEventListener("animationend",e=>{
      if(e.target instanceof Element&&e.target.classList.contains("dot"))logo.classList.remove("draw","wave");
    });
    if(!reduce&&head&&head.contains(logo))play("draw");
    logo.addEventListener("pointerenter",()=>{if(!logo.classList.contains("draw"))play("wave");});
  });

  // the big RSIC on the homepage: each letter nudges up when you point at it
  const heroTitle=document.querySelector(".hero-title");
  if(heroTitle&&!heroTitle.querySelector(".hl")){
    const word=heroTitle.textContent.trim();
    heroTitle.setAttribute("aria-label",word);
    heroTitle.innerHTML=[...word].map(c=>`<span class="hl" aria-hidden="true">${c}</span>`).join("");
  }

  if(!finePointer)return;

  // magnetic: the wordmark and the main buttons lean a few pixels toward the cursor
  document.querySelectorAll(".site-head .logo,.nav-cta,.hero-actions .btn,.cta-band .btn,.realm-cta .btn,.form-actions .btn").forEach(el=>{
    const max=el.classList.contains("logo")?4:6;
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-(r.left+r.width/2))/(r.width/2);
      const y=(e.clientY-(r.top+r.height/2))/(r.height/2);
      el.style.setProperty("--bx",`${(x*max).toFixed(1)}px`);
      el.style.setProperty("--by",`${(y*max*.6).toFixed(1)}px`);
    });
    el.addEventListener("pointerleave",()=>{el.style.removeProperty("--bx");el.style.removeProperty("--by");});
  });

  // spotlight: cards light up softly under the cursor
  const SPOT=".realm-strip a,.map a,.principles>div,.disc-list a,.realm-card,.glyph-panel,.facts>div,.pager a,.exp-list li,.org-node,.lab-node,.tile,.info-card,.faq-item,.countdown-grid>div";
  document.addEventListener("pointermove",e=>{
    const el=e.target instanceof Element&&e.target.closest(SPOT);
    if(!el)return;
    const r=el.getBoundingClientRect();
    el.style.setProperty("--mx",`${e.clientX-r.left}px`);
    el.style.setProperty("--my",`${e.clientY-r.top}px`);
  },{passive:true});
})();

/* ===== night sky, realm drawings, head artwork ===== */
// Speckle stars and V6's realm drawings sit behind the content, and the RSIC head artwork tilts toward the cursor
// with a few hand-drawn doodles around it. With reduced motion on, the sky holds still; the artwork still follows the mouse.
(()=>{
  const body=document.body;
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer=matchMedia("(hover: hover) and (pointer: fine)").matches;
  const pointer={x:innerWidth/2,y:innerHeight/2,active:false};
  addEventListener("pointermove",e=>{pointer.x=e.clientX;pointer.y=e.clientY;pointer.active=true;},{passive:true});
  document.addEventListener("pointerout",e=>{if(!e.relatedTarget)pointer.active=false;});
  const rand=Math.random;

  // 1. sky like the Instagram posts: tiny twinkling stars and a few four-point sparkles, no joining lines
  const canvas=document.createElement("canvas");
  canvas.className="particles";
  canvas.setAttribute("aria-hidden","true");
  body.prepend(canvas);
  const ctx=canvas.getContext("2d");
  let w=innerWidth,h=innerHeight;
  const resize=()=>{
    const dpr=Math.min(devicePixelRatio||1,2);
    w=innerWidth;h=innerHeight;
    canvas.width=w*dpr;canvas.height=h*dpr;
    canvas.style.width=w+"px";canvas.style.height=h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  resize();
  const makeStars=()=>Array.from({length:Math.min(260,Math.max(90,Math.floor(w*h/5200)))},()=>({
    x:rand()*w,y:rand()*h,r:.3+rand()**2.2*1.2,a:.2+rand()*.55,ph:rand()*6.28,sp:.5+rand()*1.5,depth:.3+rand()*.9,pink:rand()<.16
  }));
  let stars=makeStars();
  const sparkles=Array.from({length:8},()=>({x:rand(),y:rand(),size:2.5+rand()*3.5,ph:rand()*6.28,sp:.25+rand()*.35,depth:.6+rand()*.8,pink:rand()<.5}));
  let px=0,py=0;
  const sparkle=(x,y,s)=>{
    ctx.beginPath();ctx.moveTo(x,y-s);
    ctx.quadraticCurveTo(x,y,x+s,y);ctx.quadraticCurveTo(x,y,x,y+s);
    ctx.quadraticCurveTo(x,y,x-s,y);ctx.quadraticCurveTo(x,y,x,y-s);
    ctx.fill();
  };
  const drawSky=t=>{
    const sec=t/1000;
    ctx.clearRect(0,0,w,h);
    for(const s of stars){
      if(!reduce){s.y-=.012*s.depth;if(s.y<0)s.y+=h;}
      let x=(s.x+px*s.depth)%w,y=(s.y+py*s.depth)%h;
      if(x<0)x+=w;
      if(y<0)y+=h;
      ctx.globalAlpha=s.a*(reduce?.8:.6+.4*Math.sin(sec*s.sp+s.ph));
      ctx.fillStyle=s.pink?"#e7a3b6":"#cfe0f7";
      ctx.beginPath();ctx.arc(x,y,s.r,0,6.283);ctx.fill();
    }
    for(const s of sparkles){
      const tw=reduce?.8:.35+.65*Math.max(0,Math.sin(sec*s.sp+s.ph));
      ctx.globalAlpha=.55*tw;
      ctx.fillStyle=s.pink?"#d0768f":"#a9c8ef";
      sparkle(s.x*w+px*s.depth*1.4,s.y*h+py*s.depth*1.4,s.size*(.7+.3*tw));
    }
    ctx.globalAlpha=1;
  };

  // 2. v6's realm drawings, styled like the atoms in the Instagram posts (blue lines, pink nuclei)
  const svg=inner=>`<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const dot=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#d0768f" stroke="none"/>`;
  const shapes=[
    {x:5,y:12,size:260,depth:1.2,dur:64,svg:svg(`<circle cx="60" cy="60" r="20"/><circle cx="60" cy="60" r="36"/><circle cx="60" cy="60" r="52"/>${dot(80,60,2.5)}${dot(60,24,2)}`)},
    {x:72,y:6,size:220,depth:.8,dur:52,svg:svg(`<ellipse cx="60" cy="60" rx="50" ry="19"/><ellipse cx="60" cy="60" rx="50" ry="19" transform="rotate(60 60 60)"/><ellipse cx="60" cy="60" rx="50" ry="19" transform="rotate(120 60 60)"/>${dot(60,60,5)}${dot(110,60,2.5)}${dot(35,17,2.5)}`)},
    {x:80,y:56,size:300,depth:1.5,dur:72,svg:svg(`<path d="M10 20H110M10 40H110M10 60H110M10 80H110M10 100H110M20 10V110M40 10V110M60 10V110M80 10V110M100 10V110" stroke-opacity=".55"/><path d="M20 100L100 20"/>`)},
    {x:36,y:70,size:200,depth:1,spin:true,dur:90,svg:svg(`<path d="M60 16L98 38V82L60 104L22 82V38Z"/>${dot(60,16,4)}${dot(98,38,4)}${dot(98,82,4)}${dot(60,104,4)}${dot(22,82,4)}${dot(22,38,4)}`)},
    {x:-3,y:60,size:240,depth:.7,pink:true,dur:58,svg:svg(`<path d="M20 12C50 32 70 32 100 12M20 42C50 62 70 62 100 42M20 72C50 92 70 92 100 72M20 102C50 122 70 122 100 102"/>`)},
    {x:52,y:28,size:170,depth:.5,spin:true,dur:120,svg:svg(`<circle cx="60" cy="60" r="44" stroke-dasharray="4 7"/>`)},
    {x:22,y:34,size:150,depth:1.8,dur:44,svg:svg(`<ellipse cx="60" cy="60" rx="46" ry="17"/><ellipse cx="60" cy="60" rx="46" ry="17" transform="rotate(60 60 60)"/><ellipse cx="60" cy="60" rx="46" ry="17" transform="rotate(120 60 60)"/>${dot(60,60,5)}`)},
    {x:88,y:32,size:160,depth:1.1,pink:true,dur:62,svg:svg(`<circle cx="60" cy="60" r="42"/><path d="M60 18V38M102 60H82M60 102V82M18 60H38M90 30L76 44M90 90L76 76M30 90L44 76M30 30L44 44"/>`)},
    {x:60,y:84,size:210,depth:.9,dur:56,svg:svg(`<path d="M60 14V96M22 92H98M60 14L26 40M60 14L94 40M14 40A12 12 0 0 0 38 40ZM82 40A12 12 0 0 0 106 40Z"/>`)}
  ];
  const layer=document.createElement("div");
  layer.className="ambient";
  layer.setAttribute("aria-hidden","true");
  const items=shapes.map((s,i)=>{
    const el=document.createElement("div");
    el.className="ambient-item"+(s.pink?" pink":"")+(s.spin?" spin":"");
    el.style.cssText=`left:${s.x}%;top:${s.y}%;width:${s.size}px;height:${s.size}px`;
    el.innerHTML=`<div class="ambient-shape" style="animation-duration:${s.dur}s;animation-delay:-${i*7}s">${s.svg}</div>`;
    layer.appendChild(el);
    return {el,s,cx:0,cy:0,x:0,y:0,near:0};
  });
  canvas.after(layer);
  const place=()=>items.forEach(it=>{
    it.cx=it.s.x/100*innerWidth+it.s.size/2;
    it.cy=it.s.y/100*innerHeight+it.s.size/2;
  });
  place();
  addEventListener("resize",()=>{resize();stars=makeStars();place();if(reduce)drawSky(0);});
  if(reduce)drawSky(0);

  // 3. the RSIC head artwork: hand-drawn doodles like the poster's, a tilt toward the cursor, and a spin of the doodles when clicked
  const fig=document.querySelector(".hero-poster");
  const heroImg=fig&&fig.querySelector("img");
  let doodles=[];
  if(fig){
    const d=(inner,filled)=>`<svg viewBox="0 0 40 40" fill="${filled?"currentColor":"none"}" stroke="${filled?"none":"currentColor"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
    const star='<path d="M20 3c1.1 10 5.7 15.4 16.5 17-10.8 1.6-15.4 7-16.5 17C18.9 27 14.3 21.6 3.5 20 14.3 18.4 18.9 13 20 3z"/>';
    const spec=[
      {x:10,y:34,k:6,depth:1.6,color:"#d0768f",svg:d(star,true),ox:-14,oy:-8},
      {x:90,y:26,k:4,depth:2.4,color:"#a9c8ef",svg:d(star,false),ox:14,oy:-10},
      {x:13,y:74,k:7,depth:1.1,color:"#7fb0e6",svg:d('<path d="M21 20.5c1.6-1.6 4.1-.3 3.8 2-.4 3.2-4.6 4-6.9 2-3.3-2.9-2-8.3 2-9.5 5.3-1.6 10.2 2.5 9.8 8-.5 6.6-7.6 10.4-13.5 8"/>',false),ox:-12,oy:10},
      {x:87,y:70,k:8,depth:1.8,color:"#7fb0e6",svg:d('<ellipse cx="20" cy="20" rx="16" ry="6.5" transform="rotate(-25 20 20)"/><circle cx="20" cy="20" r="3.2" fill="#d0768f" stroke="none"/>',false),ox:14,oy:10},
      {x:52,y:7,k:3.5,depth:2.8,color:"#d0768f",svg:d('<path d="M20 8v24M8 20h24"/>',false),ox:0,oy:-14},
      {x:30,y:93,k:4.5,depth:1.4,color:"#d0768f",svg:d('<circle cx="10" cy="24" r="2.6"/><circle cx="21" cy="15" r="1.9"/><circle cx="30" cy="26" r="1.4"/>',true),ox:-8,oy:12}
    ];
    const wrap=document.createElement("div");
    wrap.className="doodles";
    wrap.setAttribute("aria-hidden","true");
    doodles=spec.map((s,i)=>{
      const el=document.createElement("span");
      el.className="doodle";
      el.style.cssText=`left:${s.x}%;top:${s.y}%;--k:${s.k};--ox:${s.ox}px;--oy:${s.oy}px;--d:${(4+i*.7).toFixed(1)}s;--delay:-${(i*1.3).toFixed(1)}s;color:${s.color}`;
      el.innerHTML=s.svg;
      wrap.appendChild(el);
      return {el,depth:s.depth};
    });
    fig.appendChild(wrap);
    fig.addEventListener("click",()=>{fig.classList.remove("burst");void fig.offsetWidth;fig.classList.add("burst");});
    fig.addEventListener("animationend",e=>{if(e.animationName==="doodle-spin")fig.classList.remove("burst");});
  }

  // 4. faint page glow that follows the mouse (desktop only)
  let glow=null;
  if(finePointer){
    glow=document.createElement("div");
    glow.className="cursor-glow";
    glow.setAttribute("aria-hidden","true");
    layer.after(glow);
  }

  // with reduced motion and no mouse there is nothing left to animate
  if(reduce&&!finePointer)return;

  let gx=pointer.x,gy=pointer.y;
  const tilt={x:0,y:0};
  const frame=t=>{
    if(!reduce){
      const tx=finePointer&&pointer.active?-(pointer.x-w/2)*.02:0;
      const ty=finePointer&&pointer.active?-(pointer.y-h/2)*.02:0;
      px+=(tx-px)*.04;py+=(ty-py)*.04;
      drawSky(t);
      const mx=pointer.x-innerWidth/2,my=pointer.y-innerHeight/2;
      for(const it of items){
        // gentle parallax (deeper shapes move more), plus a soft push away from the pointer
        let ix=finePointer?-mx*it.s.depth*.02:0,iy=finePointer?-my*it.s.depth*.02:0,near=0;
        if(finePointer&&pointer.active){
          const dx=it.cx+ix-pointer.x,dy=it.cy+iy-pointer.y,dist=Math.hypot(dx,dy)||1,reach=it.s.size/2+140;
          if(dist<reach){const f=1-dist/reach;ix+=dx/dist*f*30;iy+=dy/dist*f*30;near=f;}
        }
        it.x+=(ix-it.x)*.06;it.y+=(iy-it.y)*.06;it.near+=(near-it.near)*.08;
        if(finePointer){
          it.el.style.transform=`translate3d(${it.x.toFixed(1)}px,${it.y.toFixed(1)}px,0)`;
          it.el.style.setProperty("--near",it.near.toFixed(3));
        }
      }
    }

    if(glow){
      const ease=reduce?1:.1;
      gx+=(pointer.x-gx)*ease;gy+=(pointer.y-gy)*ease;
      glow.style.transform=`translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0)`;
      glow.classList.toggle("on",pointer.active);
    }

    if(heroImg&&finePointer){
      // the artwork turns a little to face the cursor, and the doodles drift further than the head for depth
      const r=fig.getBoundingClientRect();
      let nx=0,ny=0;
      if(pointer.active&&r.bottom>0&&r.top<innerHeight){
        nx=Math.max(-1,Math.min(1,(pointer.x-(r.left+r.width/2))/(r.width*.9)));
        ny=Math.max(-1,Math.min(1,(pointer.y-(r.top+r.height/2))/(r.height*.9)));
      }
      tilt.x+=(nx-tilt.x)*.07;tilt.y+=(ny-tilt.y)*.07;
      heroImg.style.transform=`perspective(1200px) rotateY(${(tilt.x*9).toFixed(2)}deg) rotateX(${(-tilt.y*7).toFixed(2)}deg) translate3d(${(tilt.x*10).toFixed(1)}px,${(tilt.y*8).toFixed(1)}px,0)`;
      for(const dd of doodles)dd.el.style.transform=`translate3d(${(tilt.x*dd.depth*12).toFixed(1)}px,${(tilt.y*dd.depth*10).toFixed(1)}px,0)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
