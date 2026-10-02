(function () {
  if (customElements.get('sdf-field')) return;
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uMorph;uniform float uVar;uniform vec3 uTint;uniform vec2 uOff;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdBox(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
float sdOct(vec3 p,float s){p=abs(p);return (p.x+p.y+p.z-s)*0.57735;}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float shape(float i,vec3 p){
  if(i<.5) return length(p)-1.;
  if(i<1.5) return sdBox(p,vec3(.66),.18);
  if(i<2.5) return sdTorus(p.xzy,vec2(.86,.32));
  if(i<3.5) return sdOct(p,1.28)-.04;
  float g=abs(dot(sin(p*3.4),cos(p.zxy*3.4)))/3.4-.06;
  return max(length(p)-1.05,g);
}
float map(vec3 p){
  vec3 q=p;
  q.xz*=rot(uTime*.18+uMouse.x*1.1);
  q.yz*=rot(.35+uMouse.y*.7+uTime*.07);
  float fa=mod(floor(uMorph),5.);float fb=mod(fa+1.,5.);
  float t=smoothstep(0.,1.,fract(uMorph));
  float d=mix(shape(fa,q),shape(fb,q),t);
  if(uVar<.5){
    d+=.035*sin(q.x*3.+uTime*.9)*sin(q.y*3.3+uTime*.7)*sin(q.z*2.8+uTime*.8);
    for(int k=0;k<3;k++){float fk=float(k);float a=uTime*.35+fk*2.094;
      vec3 c=vec3(cos(a)*1.75,sin(uTime*.5+fk*1.7)*.55,sin(a)*1.75);
      d=smin(d,length(p-c)-.15,.45);}
  }
  return d*.8;
}
vec3 nrm(vec3 p){vec2 e=vec2(.0015,-.0015);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
vec3 envDark(vec3 r){
  vec3 e=mix(vec3(.02,.018,.016),vec3(.13,.115,.1),smoothstep(-.5,.7,r.y));
  e+=vec3(1.,.96,.9)*smoothstep(.72,.95,r.y)*1.4;
  e+=vec3(1.)*smoothstep(.78,.96,r.x)*smoothstep(.7,0.,abs(r.y))*1.1;
  e+=vec3(.9,.82,.7)*smoothstep(.86,.99,-r.x)*.5;
  e+=vec3(.5)*smoothstep(.9,1.,r.z)*.2;
  return e;
}
vec3 envLight(vec3 r){
  vec3 e=mix(vec3(.55,.52,.47),vec3(.95,.93,.88),smoothstep(-.6,.8,r.y));
  e+=vec3(1.)*smoothstep(.8,.97,r.y)*.6;
  e+=vec3(1.)*smoothstep(.85,.98,r.x)*smoothstep(.6,0.,abs(r.y))*.5;
  return e;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;uv-=uOff;
  vec3 ro=vec3(0.,0.,4.4),rd=normalize(vec3(uv,-1.7));
  float t=0.,d;bool hit=false;
  for(int i=0;i<96;i++){d=map(ro+rd*t);if(d<.0015){hit=true;break;}t+=d;if(t>9.)break;}
  if(!hit){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*t,n=nrm(p),r=reflect(rd,n);
  float fre=pow(1.-max(dot(n,-rd),0.),5.);
  float ao=clamp(.45+.55*map(p+n*.2)/.16,0.,1.);
  vec3 col;
  vec3 tint=uTint;
  if(uTint.x<0.) tint=.55+.45*cos(6.2832*(vec3(0.,.33,.67)+dot(n,-rd)*.9+p.y*.25+uTime*.04));
  if(uVar<.5){
    col=envDark(r)*mix(tint,vec3(1.),fre);
    col+=tint*.08*max(dot(n,normalize(vec3(.4,.8,.5))),0.);
    col*=ao;
  }else{
    vec3 L=normalize(vec3(.5,.8,.6));
    float dif=max(dot(n,L),0.);
    col=tint*.5*(.35+.9*dif)+envLight(r)*(.04+.9*fre)*.85+pow(max(dot(r,L),0.),48.)*.9;
    col*=mix(.6,1.,ao);
  }
  col=col/(1.+col*.6);
  col=pow(col,vec3(.92));
  gl_FragColor=vec4(col,1.);
}`;
  const FINISH = { iridescent: [-1, 0, 0], champagne: [0.93, 0.8, 0.58], silver: [0.9, 0.91, 0.93], blue: [0.3, 0.5, 1.0], coral: [1.0, 0.45, 0.35], violet: [0.6, 0.4, 1.0], orange: [1.0, 0.6, 0.2], green: [0.3, 0.85, 0.5], rose: [1.0, 0.4, 0.5] };
  const NAMES = ['Sphere', 'Rounded cube', 'Torus', 'Octahedron', 'Gyroid shell'];
  const smooth = (x) => x * x * (3 - 2 * x);

  class SdfField extends HTMLElement {
    static get observedAttributes() { return ['finish']; }
    attributeChangedCallback() {
      this._tint = FINISH[(this.getAttribute('finish') || 'iridescent').toLowerCase()] || FINISH.iridescent;
    }
    connectedCallback() {
      if (this._gl) { this._start(); return; }
      this.attributeChangedCallback();
      this.variant = this.getAttribute('variant') || 'hero';
      const cs = getComputedStyle(this);
      if (cs.position === 'static') this.style.position = 'relative';
      this.style.display = 'block';
      if (!this.style.height) { this.style.width = '100%'; this.style.height = '100%'; }
      const c = (this._c = document.createElement('canvas'));
      c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
      this.appendChild(c);
      const gl = (this._gl = c.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }));
      if (!gl) return;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(pr); gl.useProgram(pr);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this._u = {};
      ['uRes', 'uTime', 'uMouse', 'uMorph', 'uVar', 'uTint', 'uOff'].forEach((n) => (this._u[n] = gl.getUniformLocation(pr, n)));
      if (this.variant === 'latent') {
        const lab = (this._label = document.createElement('div'));
        lab.style.cssText = "position:absolute;left:20px;bottom:18px;right:20px;display:flex;justify-content:space-between;gap:12px;font:600 11px/1.4 'Geist',-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--ink,#1D1D1F);pointer-events:none";
        this.appendChild(lab);
      }
      this._mouse = [0, 0]; this._m = [0, 0]; this._idx = -1;
      this._reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._onMove = (e) => {
        const r = this.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2, y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        this._mouse = [Math.max(-1.5, Math.min(1.5, x)), Math.max(-1.5, Math.min(1.5, y))];
      };
      window.addEventListener('pointermove', this._onMove, { passive: true });
      this._io = new IntersectionObserver(([e]) => { this._vis = e.isIntersecting; if (this._vis) this._start(); });
      this._io.observe(this);
      this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(this);
      this._t0 = performance.now();
      this._resize();
    }
    disconnectedCallback() { cancelAnimationFrame(this._raf); this._raf = 0; }
    _resize() {
      if (!this._gl) return;
      const dpr = Math.min(devicePixelRatio || 1, this.variant === 'hero' ? 1.25 : 1.75);
      const w = Math.max(1, Math.round(this.clientWidth * dpr)), h = Math.max(1, Math.round(this.clientHeight * dpr));
      this._c.width = w; this._c.height = h; this._gl.viewport(0, 0, w, h);
    }
    _start() { if (!this._raf && this._gl) this._raf = requestAnimationFrame(this._loop); }
    _loop = (now) => {
      this._raf = 0;
      if (!this._vis || !this.isConnected) return;
      const gl = this._gl, u = this._u;
      const t = ((now - this._t0) / 1000) * (this._reduce ? 0.25 : 1);
      this._m[0] += (this._mouse[0] - this._m[0]) * 0.04;
      this._m[1] += (this._mouse[1] - this._m[1]) * 0.04;
      const w = this._c.width, h = this._c.height, asp = w / h;
      let morph, off = [0, 0];
      if (this.variant === 'hero') {
        const r = this.getBoundingClientRect();
        const sc = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
        morph = t * 0.08 + sc * 1.5;
        off = [asp > 1.15 ? Math.min((asp - 1) * 0.45, 0.42) : 0, (asp < 0.9 ? 0.16 : 0) + sc * 0.25];
      } else {
        const P = 3.6, H = 2.4, k = Math.floor(t / P), f = t % P;
        morph = k + (f < H ? 0 : smooth((f - H) / (P - H)));
        const idx = Math.round(morph) % 5;
        if (idx !== this._idx && this._label) {
          this._idx = idx;
          this._label.innerHTML = `<span>Latent code ${String(idx + 1).padStart(2, '0')} / 05</span><span style="font-size:15px;letter-spacing:-0.01em;text-transform:none;font-weight:600">${NAMES[idx]}</span>`;
        }
      }
      gl.uniform2f(u.uRes, w, h);
      gl.uniform1f(u.uTime, t);
      gl.uniform2f(u.uMouse, this._m[0], this._m[1]);
      gl.uniform1f(u.uMorph, morph);
      gl.uniform1f(u.uVar, this.variant === 'hero' ? 0 : 1);
      gl.uniform3fv(u.uTint, this._tint);
      gl.uniform2f(u.uOff, off[0], off[1]);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this._raf = requestAnimationFrame(this._loop);
    };
  }
  customElements.define('sdf-field', SdfField);

  let S = null; const cache = {};
  function still(shape, tint, px, angle) {
    const key = [shape, tint, px, angle].join('|');
    if (cache[key]) return cache[key];
    if (!S) {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl', { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: false });
      if (!gl) return '';
      const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(pr); gl.useProgram(pr);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const u = {}; ['uRes', 'uTime', 'uMouse', 'uMorph', 'uVar', 'uTint', 'uOff'].forEach((n) => (u[n] = gl.getUniformLocation(pr, n)));
      S = { c, gl, u };
    }
    const { c, gl, u } = S;
    c.width = px; c.height = px; gl.viewport(0, 0, px, px);
    gl.uniform2f(u.uRes, px, px); gl.uniform1f(u.uTime, angle); gl.uniform2f(u.uMouse, 0, 0);
    gl.uniform1f(u.uMorph, shape); gl.uniform1f(u.uVar, 1); gl.uniform3fv(u.uTint, tint); gl.uniform2f(u.uOff, 0, 0);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
    return (cache[key] = c.toDataURL('image/png'));
  }

  class SdfStill extends HTMLElement {
    static get observedAttributes() { return ['shape', 'finish']; }
    connectedCallback() {
      if (!this._img) {
        this.style.display = this.style.display || 'block';
        const img = (this._img = document.createElement('img'));
        img.alt = ''; img.style.cssText = 'width:100%;height:100%;display:block;object-fit:contain;pointer-events:none';
        this.appendChild(img);
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this._anim = img.animate([{ transform: 'translate3d(0,0,0) rotate(0deg)' }, { transform: 'translate3d(0,-8px,0) rotate(3deg)' }],
            { duration: 3200 + Math.random() * 1600, delay: -Math.random() * 3000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
        }
      }
      this._draw();
    }
    attributeChangedCallback() { if (this._img) this._draw(); }
    _draw() {
      cancelAnimationFrame(this._r);
      this._r = requestAnimationFrame(() => {
        const shape = +(this.getAttribute('shape') || 0);
        const tint = FINISH[(this.getAttribute('finish') || 'blue').toLowerCase()] || FINISH.blue;
        const w = this.clientWidth || +(this.getAttribute('size') || 160);
        const px = Math.min(640, Math.round(w * Math.min(devicePixelRatio || 1, 2)));
        const src = still(shape, tint, px, 2.2 + shape * 1.7);
        if (src) this._img.src = src;
      });
    }
  }
  customElements.define('sdf-still', SdfStill);
})();
