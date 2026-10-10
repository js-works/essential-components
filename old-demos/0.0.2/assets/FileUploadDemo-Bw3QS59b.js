import{a as e,n as t,t as n}from"./jsx-runtime-D3jfb0Ew.js";import{n as r}from"./index-DdDBWYuA.js";import{i,r as a,t as o}from"./react-DFj0b2l0.js";import{t as s}from"./createFileUploadClass-Fy0SH1SL.js";function c(e){if(e.length===0)return`No files yet`;let t=new Map;for(let{status:n}of e)t.set(n,(t.get(n)??0)+1);return`${e.length} files: ${[...t].map(([e,t])=>`${t} ${e}`).join(`, `)}`}function l(e){let t=e.getAll(`attachments`).map(String);return`Sent: ${t.length===0?`nothing`:t.join(`, `)}`}var u=e(t(),1),d=r(),f=[`works`,`slow`,`flaky`,`fails`],p=100;function m(e){return f.some(t=>t===e)}function h(e){return(t,{signal:n,onProgress:r})=>new Promise((i,a)=>{let o=Math.min(5e3,1500+t.size/500),s=e===`slow`?o*4:o,c=e===`fails`?.6:e===`flaky`&&Math.random()<.5?.2+Math.random()*.7:void 0,l=0,u=()=>clearInterval(d),d=setInterval(()=>{l+=p;let e=l/s;c!==void 0&&e>=c?(u(),a(Error(`The server did not answer`))):e>=1?(u(),i(`srv-${crypto.randomUUID().slice(0,8)}`)):r(e)},p);n.addEventListener(`abort`,()=>{u(),a(n.reason)},{once:!0})})}var g=n(),_=(0,u.createContext)(`en-US`),v=o({i18n:{type:`hook`,useAdapter:()=>{let e=(0,u.useContext)(_);return(0,u.useMemo)(()=>i(e),[e])}}}),y=h(`works`);function b({title:e,initialLocale:t,label:n,prompt:r}){let[i,a]=(0,u.useState)(t),[o,s]=(0,u.useState)(!1),[d,f]=(0,u.useState)(!1),[p,m]=(0,u.useState)([]),[h,b]=(0,u.useState)(``);return(0,g.jsxs)(`section`,{className:`ui-stack`,children:[(0,g.jsx)(`h2`,{className:`ui-heading`,children:e}),(0,g.jsxs)(`div`,{className:`ui-toolbar`,children:[(0,g.jsxs)(`label`,{className:`ui-field`,children:[`Language`,(0,g.jsxs)(`select`,{className:`ui-select`,value:i,onChange:e=>a(e.target.value),children:[(0,g.jsx)(`option`,{value:`en-US`,children:`English`}),(0,g.jsx)(`option`,{value:`de-DE`,children:`Deutsch`})]})]}),(0,g.jsxs)(`label`,{className:`ui-field`,children:[`Required`,(0,g.jsxs)(`select`,{className:`ui-select`,value:o?`on`:`off`,onChange:e=>s(e.target.value===`on`),children:[(0,g.jsx)(`option`,{value:`off`,children:`off`}),(0,g.jsx)(`option`,{value:`on`,children:`on`})]})]}),(0,g.jsxs)(`label`,{className:`ui-field`,children:[`Error (set by the app)`,(0,g.jsxs)(`select`,{className:`ui-select`,value:d?`on`:`off`,onChange:e=>f(e.target.value===`on`),children:[(0,g.jsx)(`option`,{value:`off`,children:`off`}),(0,g.jsx)(`option`,{value:`on`,children:`on`})]})]})]}),(0,g.jsx)(_,{value:i,children:(0,g.jsxs)(`form`,{className:`ui-stack ui-stack--tight`,onSubmit:e=>{e.preventDefault(),b(l(new FormData(e.currentTarget)))},children:[(0,g.jsx)(v,{name:`attachments`,upload:y,multiple:!0,previews:!0,required:o,error:d?(0,g.jsxs)(g.Fragment,{children:[`Please check your `,(0,g.jsx)(`b`,{children:`attachments`}),`.`]}):void 0,label:n,prompt:r,onChange:m}),(0,g.jsx)(`p`,{className:`ui-note`,children:c(p)}),(0,g.jsxs)(`div`,{className:`ui-toolbar`,children:[(0,g.jsx)(`button`,{className:`ui-button`,children:`Submit`}),(0,g.jsx)(`output`,{className:`ui-result`,children:h})]})]})})]})}function x(){return(0,g.jsxs)(`div`,{className:`ui-columns`,children:[(0,g.jsx)(b,{title:`English`,initialLocale:`en-US`,label:`Attachments`}),(0,g.jsx)(b,{title:`German, own prompt (a slot)`,initialLocale:`de-DE`,label:(0,g.jsxs)(g.Fragment,{children:[`Rechnungen `,(0,g.jsx)(`small`,{children:`(PDF, a JSX label)`})]}),prompt:`Rechnungen hierher ziehen oder`})]})}function S(e){let t=(0,d.createRoot)(e);return t.render((0,g.jsx)(u.StrictMode,{children:(0,g.jsx)(x,{})})),()=>t.unmount()}var C=new Set,w=0;function T(e=document){let t=[...e.querySelectorAll(`.ui-tabs`)].filter(e=>![...C].some(t=>t.tablist===e)).map(E);return()=>{for(let e of t)e()}}function E(e){let t=[...e.querySelectorAll(`.ui-tabs__tab`)],n=[...e.parentElement?.children??[]].filter(e=>e instanceof HTMLElement&&e.classList.contains(`ui-tabs__panel`)),r=D(e),i=0;for(let t=e.parentElement;t!==null;t=t.parentElement)i+=t.classList.contains(`ui-tabs__panel`)||t.hasAttribute(`data-hash-segment`)?1:0;let a=e.classList.contains(`ui-tabs--vertical`);e.setAttribute(`role`,`tablist`),a&&e.setAttribute(`aria-orientation`,`vertical`);for(let[e,r]of t.entries()){let t=n[e],i=++w;r.id||=`ui-tab-${i}`,r.setAttribute(`role`,`tab`),r.dataset.label=(r.textContent??``).trim(),t!==void 0&&(t.id||=`ui-tabpanel-${i}`,t.setAttribute(`role`,`tabpanel`),t.setAttribute(`aria-labelledby`,r.id),r.setAttribute(`aria-controls`,t.id))}let o=e=>{for(let[r,i]of t.entries()){let t=i===e;i.setAttribute(`aria-selected`,String(t)),i.tabIndex=t?0:-1;let a=n[r];a!==void 0&&(a.hidden=!t)}},s={tablist:e,tabs:t,level:i,selected:()=>t.find(e=>e.getAttribute(`aria-selected`)===`true`),selectFromHash:()=>{let e=location.hash.slice(1).split(`/`)[i],n=t.find(t=>O(t)===e)??t[0];n!==void 0&&o(n)}};for(let[e,n]of t.entries())n.addEventListener(`click`,()=>{o(n),k()}),n.addEventListener(`keydown`,n=>{let r={[a?`ArrowDown`:`ArrowRight`]:t[(e+1)%t.length],[a?`ArrowUp`:`ArrowLeft`]:t[(e-1+t.length)%t.length],Home:t[0],End:t.at(-1)}[n.key];r!==void 0&&(n.preventDefault(),o(r),r.focus(),k())});let c=new MutationObserver(()=>{e.closest(`[hidden]`)===null&&k()});for(let e of r)c.observe(e,{attributes:!0,attributeFilter:[`hidden`]});return C.add(s),s.selectFromHash(),window.addEventListener(`hashchange`,s.selectFromHash),()=>{C.delete(s),c.disconnect(),window.removeEventListener(`hashchange`,s.selectFromHash)}}function D(e){let t=[];for(let n=e.parentElement;n!==null;n=n.parentElement)n.hasAttribute(`data-hash-segment`)&&t.push(n);return t}function O(e){return(e.textContent??``).trim().toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}function k(){let e=[];for(let{tablist:t,tabs:n,level:r,selected:i}of C){let a=i();if(a!==void 0&&t.isConnected&&t.closest(`[hidden]`)===null){e[r]={segment:O(a),first:a===n[0]};let i=r;for(let n=t.parentElement;n!==null;n=n.parentElement)if(n.classList.contains(`ui-tabs__panel`)||n.hasAttribute(`data-hash-segment`)){--i;let t=n.getAttribute(`data-hash-segment`);t!==null&&i>=0&&(e[i]={segment:t,first:!1})}}}for(;e.length>0&&(e.at(-1)?.first??!0);)e.pop();let t=e.length===0?``:`#${[...e].map(e=>e?.segment??``).join(`/`)}`;location.hash!==t&&history.replaceState(null,``,`${location.pathname}${location.search}${t}`)}var A={images:`image/*`,documents:`.pdf,.doc,.docx,.txt`},j={"100 KB":102400,"5 MB":5242880},M={3:3,5:5},N=0,P=class extends HTMLElement{#e=!1;#t=[];connectedCallback(){this.#e||(this.#e=!0,this.#n());let e=this.querySelector(`[data-react-root]`);this.#t=[T(this),...e===null?[]:[S(e)]]}disconnectedCallback(){for(let e of this.#t)e();this.#t=[]}#n(){V();let e=`file-upload-demo-${++N}`;this.innerHTML=`
  <div class="ui-stack">
    <nav class="ui-tabs" aria-label="File upload">
      <button class="ui-tabs__tab" type="button">Custom element</button>
      <button class="ui-tabs__tab" type="button">React</button>
    </nav>
    <section class="ui-tabs__panel ui-stack">
      <form class="ui-toolbar" data-switches>
        <label class="ui-field">Server
          <select class="ui-select" name="server">
            <option value="works">works</option>
            <option value="slow">slow</option>
            <option value="flaky">flaky</option>
            <option value="fails">fails</option>
          </select>
        </label>
        <label class="ui-field">Accept
          <select class="ui-select" name="accept">
            <option value="any">any</option>
            <option value="images">images</option>
            <option value="documents">documents</option>
          </select>
        </label>
        <label class="ui-field">Max. file size
          <select class="ui-select" name="maxFileSize">
            <option value="none">none</option>
            <option value="100 KB">100 KB</option>
            <option value="5 MB">5 MB</option>
          </select>
        </label>
        <label class="ui-field">Max. files
          <select class="ui-select" name="maxFiles">
            <option value="none">none</option>
            <option value="3">3</option>
            <option value="5">5</option>
          </select>
        </label>
        <label class="ui-field">Parallel uploads
          <select class="ui-select" name="maxParallel">
            <option value="1">1</option>
            <option value="3" selected>3</option>
          </select>
        </label>
        <label class="ui-field">Multiple
          <select class="ui-select" name="multiple">
            <option value="off">off</option>
            <option value="on" selected>on</option>
          </select>
        </label>
        <label class="ui-field">Manual upload
          <select class="ui-select" name="manualUpload">
            <option value="off">off</option>
            <option value="on">on</option>
          </select>
        </label>
        <label class="ui-field">Previews
          <select class="ui-select" name="previews">
            <option value="off">off</option>
            <option value="on" selected>on</option>
          </select>
        </label>
        <label class="ui-field">Density
          <select class="ui-select" name="density">
            <option value="compact">compact</option>
            <option value="normal" selected>normal</option>
            <option value="comfortable">comfortable</option>
          </select>
        </label>
        <label class="ui-field">Required
          <select class="ui-select" name="required">
            <option value="off">off</option>
            <option value="on">on</option>
          </select>
        </label>
        <label class="ui-field">Error (set by the app)
          <select class="ui-select" name="error">
            <option value="off">off</option>
            <option value="on">on</option>
          </select>
        </label>
        <label class="ui-field">Disabled
          <select class="ui-select" name="disabled">
            <option value="off">off</option>
            <option value="on">on</option>
          </select>
        </label>
      </form>
      <div class="ui-columns">
        <section class="ui-stack">
          <h2 class="ui-heading">Default look</h2>
          <form class="upload-form ui-stack ui-stack--tight">
            <label class="ui-label" for="${e}">Attachments (a label of the page)</label>
            <file-upload id="${e}" name="attachments"></file-upload>
            <p class="ui-note" data-state></p>
            <div class="ui-toolbar">
              <button class="ui-button">Submit</button>
              <output class="ui-result"></output>
            </div>
          </form>
        </section>
        <section class="ui-stack">
          <h2 class="ui-heading">Own theme, styles, part and slot</h2>
          <form class="upload-form ui-stack ui-stack--tight">
            <acme-upload name="attachments" label="Invoices (its own label)">
              <span slot="prompt">Drop your invoices here or</span>
            </acme-upload>
            <p class="ui-note" data-state></p>
            <div class="ui-toolbar">
              <button class="ui-button">Submit</button>
              <output class="ui-result"></output>
            </div>
          </form>
        </section>
      </div>
    </section>
    <section class="ui-tabs__panel" hidden>
      <div data-react-root></div>
    </section>
  </div>
    `;let t=this.querySelector(`[data-switches]`),n=[...this.querySelectorAll(`file-upload, acme-upload`)];for(let e of n){let t=e.parentElement?.querySelector(`[data-state]`);t!=null&&(t.textContent=c(e.items),e.addEventListener(`change`,()=>{t.textContent=c(e.items)}))}for(let e of this.querySelectorAll(`.upload-form`)){let t=e.querySelector(`output`);e.addEventListener(`submit`,n=>{n.preventDefault(),t!==null&&(t.value=l(new FormData(e)))})}t!==null&&(t.addEventListener(`change`,()=>I(t,n)),I(t,n))}},F=[`compact`,`normal`,`comfortable`];function I(e,t){let n=new FormData(e),r=e=>String(n.get(e)??``),i=r(`server`),a=h(m(i)?i:`works`);for(let e of t)e.upload=a,e.accept=A[r(`accept`)],e.maxFileSize=j[r(`maxFileSize`)],e.maxFiles=M[r(`maxFiles`)],e.maxParallel=Number(r(`maxParallel`)),e.multiple=r(`multiple`)===`on`,e.manualUpload=r(`manualUpload`)===`on`,e.previews=r(`previews`)===`on`,e.density=F.find(e=>e===r(`density`))??`normal`,e.required=r(`required`)===`on`,e.error=r(`error`)===`on`?`Please check your attachments.`:void 0,e.disabled=r(`disabled`)===`on`}var L=a(),R={type:`factory`,getAdapter:()=>L},z=class extends s({i18n:R}){},B=class extends s({i18n:R,theme:{accentColor:{light:`#0ca678`,dark:`#20c997`},surfaceColor:{light:`#e6fcf5`,dark:`#0b3b2e`},borderRadius:`2px`,buttonBorderRadius:`2px`,fontFamily:`Georgia, serif`,fontSize:`0.9375rem`},styles:`.root { border-style: dashed; }`}){};function V(){customElements.get(`file-upload`)===void 0&&(customElements.define(`file-upload`,z),customElements.define(`acme-upload`,B))}export{P as FileUploadDemo};