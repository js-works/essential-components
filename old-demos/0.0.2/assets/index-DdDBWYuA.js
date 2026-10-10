const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./HumanResourcesDemo-C5rk4nCp.js","./jsx-runtime-D3jfb0Ew.js","./Box-CjRaXhaV.js","./provider-D3TvtCb1.js","./floating-ui.react-dom-DrVqXbfF.js","./Tabs-DRLL2OPh.js","./io-CxYeIjRd.js","./pick-calendar-levels-props-CRWqMwsJ.js","./pick-calendar-levels-props-B3NjXmWV.css","./DatePicker-BLbbmG_3.js","./mantine-DKjZt8MS.js","./Select-CN4EBUDd.js","./ComboboxChevron-5lVA8bNZ.js","./Switch-D-zpEAmr.js","./Checkbox-sEbnWs7u.js","./useQuery-DClocyBy.js","./localizedFormat-CYaUerQn.js","./Progress-BmbP41OJ.js","./src-Cn-GG9K6.js","./react-DFj0b2l0.js","./HumanResourcesDemo-K3RhkAaf.css","./TimeTrackerDemo-BWt-wNDV.js","./NativeSelect-p5tR-5gL.js","./Table-DuO9UdbP.js","./TimeTrackerDemo-C51dgygj.css","./BoardManagerDemo-CzzY_b7L.js","./fast-deep-equal-n-5xwPtz.js","./BoardManagerDemo-BytUk-Nv.css","./FileCenterDemo-DrE2moLQ.js","./Tree-DFiX_99W.js","./FileCenterDemo-4vpgS9Zx.css","./UserManagerDemo-BSG3GULE.js","./UserManagerDemo-DfFaJsRC.css","./DataNavigatorDemo-DiXR2rAj.js","./DataNavigatorDemo-BAkkrWHm.css","./FileUploadDemo-Bw3QS59b.js","./createFileUploadClass-Fy0SH1SL.js","./FileUploadDemo-x8DANu9i.css","./OverlaysDemo-BLKSUpyy.js","./OverlaysDemo-BeZq4iox.css","./FormValidationDemo-WVwUfZjB.js","./FormValidationDemo-BFLb1xb4.css"])))=>i.map(i=>d[i]);
import{a as e,n as t,r as n,t as r}from"./jsx-runtime-D3jfb0Ew.js";import{A as i,B as a,C as o,D as s,E as c,F as l,H as u,I as d,L as f,M as p,N as m,O as h,P as g,R as _,T as v,U as y,V as b,_ as x,a as S,b as C,d as w,f as T,g as ee,h as te,j as ne,k as re,l as ie,n as ae,p as oe,r as E,s as se,t as D,u as O,w as ce,x as le,y as ue,z as de}from"./Box-CjRaXhaV.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var fe=e=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`,pe=e=>()=>console.info(`app-cockpit demo: "${e}" chosen`);function me({schemes:e,scheme:t}){let n=document.documentElement,r=(e,t)=>{try{return localStorage.getItem(`demo-page:${e}`)??t}catch{return t}},i=(e,t)=>{try{localStorage.setItem(`demo-page:${e}`,t)}catch{}};return n.lang=r(`language`,`en-US`),n.dataset.scheme=e.includes(r(`scheme`,t))?r(`scheme`,t):t,[{id:`scheme`,label:`Color scheme`,icon:fe(`<circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 9l4.65-4.65M12 14.3l7.37-7.37M12 19.6l8.85-8.85"/>`),choices:{options:e.map(e=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1)})),value:()=>n.dataset.scheme??t,onChange:e=>{n.dataset.scheme=e,i(`scheme`,e)}}}]}var he=[[`design`,`Design language`,``],[`blue`,`Blue`,`#228be6`],[`indigo`,`Indigo`,`#4c6ef5`],[`violet`,`Violet`,`#7950f2`],[`grape`,`Grape`,`#be4bdb`],[`pink`,`Pink`,`#e64980`],[`red`,`Red`,`#fa5252`],[`orange`,`Orange`,`#fd7e14`],[`teal`,`Teal`,`#12b886`],[`green`,`Green`,`#40c057`],[`cyan`,`Cyan`,`#15aabf`]];function ge(e=`violet`){let t=document.documentElement,n=e,r=r=>{let[i,,a]=he.find(([e])=>e===r)??he.find(([t])=>t===e);n=i,a===``?t.style.removeProperty(`--app-accent-color`):t.style.setProperty(`--app-accent-color`,a)};try{r(localStorage.getItem(`demo-page:accent`)??e)}catch{r(e)}return{id:`accent`,label:`Accent color`,icon:fe(`<path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"/><path d="M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>`),choices:{options:he.map(([e,t])=>({value:e,label:t})),value:()=>n,onChange:e=>{r(e);try{localStorage.setItem(`demo-page:accent`,n)}catch{}}}}}var _e=[{value:`auto`,label:`Automatic`},{value:`side`,label:`Sidebar`},{value:`top`,label:`Topbar`},{value:`top-switcher`,label:`App switcher`},{value:`bottom`,label:`Bottom bar`}],ve=[{value:`compact`,label:`Compact`},{value:`normal`,label:`Normal`},{value:`comfortable`,label:`Comfortable`}];function ye(e=`app-cockpit`,{scheme:t=`page`,nav:n=`auto`,startPage:r}={}){let i=()=>document.querySelector(e),a=e=>{try{return localStorage.getItem(`demo-page:${e}`)}catch{return null}},o=(e,t,n)=>{i()?.setAttribute(t,n);try{localStorage.setItem(`demo-page:${e}`,n)}catch{}},s=_e.find(({value:e})=>e===a(`nav`))?.value??n,c=a(`nav-scheme`),l=c===`dark`||c===`page`?c:t,u=ve.find(({value:e})=>e===a(`density`))?.value??`normal`;i()?.setAttribute(`nav`,s),i()?.setAttribute(`nav-scheme`,l),i()?.setAttribute(`density`,u);let d=a(`start-page`)===null?r:a(`start-page`)===`on`,f=e=>{i()?.toggleAttribute(`start-page`,e);try{localStorage.setItem(`demo-page:start-page`,e?`on`:`off`)}catch{}};d!==void 0&&i()?.toggleAttribute(`start-page`,d);let p=()=>i()?.nav??s,m=()=>i()?.navScheme??l,h=()=>i()?.density??u,g=()=>i()?.startPage??d;return{id:`navigation`,label:`Navigation`,icon:fe(`<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>`),menu:[{label:`Navigation`,items:_e.map(({value:e,label:t})=>({id:`nav:${e}`,label:t,checked:()=>p()===e,onSelect:()=>o(`nav`,`nav`,e)}))},{label:`Colors`,items:[{value:`dark`,label:`Dark`},{value:`page`,label:`Match page`}].map(({value:e,label:t})=>({id:`nav-scheme:${e}`,label:t,checked:()=>m()===e,onSelect:()=>o(`nav-scheme`,`nav-scheme`,e)}))},{label:`Density`,items:ve.map(({value:e,label:t})=>({id:`density:${e}`,label:t,checked:()=>h()===e,onSelect:()=>o(`density`,`density`,e)}))},...r===void 0?[]:[{label:`Start page`,items:[{value:!0,label:`On`},{value:!1,label:`Off`}].map(({value:e,label:t})=>({id:`start-page:${e?`on`:`off`}`,label:t,checked:()=>g()===e,onSelect:()=>f(e)}))}]]}}var k={label:`Language`,items:[{value:`en-US`,label:`English`},{value:`de-DE`,label:`Deutsch`}].map(({value:e,label:t})=>({id:`language:${e}`,label:t,checked:()=>document.documentElement.lang===e,onSelect:()=>{document.documentElement.lang=e;try{localStorage.setItem(`demo-page:language`,e)}catch{}}}))};async function A(){let e=async e=>{try{await e()}catch{}};await e(()=>localStorage.clear()),await e(()=>sessionStorage.clear()),await e(async()=>{for(let{name:e}of await indexedDB.databases())e!==void 0&&indexedDB.deleteDatabase(e)}),await e(async()=>{for(let e of await caches.keys())await caches.delete(e)}),await e(()=>{for(let e of document.cookie.split(`;`)){let t=e.split(`=`)[0]?.trim();t&&(document.cookie=`${t}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`)}}),history.replaceState(null,``,location.pathname),location.reload()}var be=[[{id:`shortcuts`,label:`Keyboard shortcuts`,shortcut:`?`,icon:fe(`<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>`),onSelect:pe(`Keyboard shortcuts`)}],k,[{id:`reset-demo`,label:`Reset demo`,icon:fe(`<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>`),onSelect:()=>void A()}]],xe={name:`Jane Doe`,detail:`jane.doe@acme.example`},Se=(e=pe(`Sign out`))=>[[{id:`profile`,label:`Profile`,icon:fe(`<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>`),onSelect:pe(`Profile`)},{id:`settings`,label:`Settings`,icon:fe(`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>`),onSelect:pe(`Settings`)}],[{id:`sign-out`,label:`Sign out`,icon:fe(`<path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M9 12h12l-3-3M18 15l3-3"/>`),onSelect:e}]],Ce=[`top`,`right`,`bottom`,`left`],we=[`start`,`end`],j=Ce.reduce((e,t)=>e.concat(t,t+`-`+we[0],t+`-`+we[1]),[]),Te=Math.min,Ee=Math.max,De=Math.round,Oe=Math.floor,ke=e=>({x:e,y:e}),Ae={left:`right`,right:`left`,bottom:`top`,top:`bottom`};function je(e,t,n){return Ee(e,Te(t,n))}function Me(e,t){return typeof e==`function`?e(t):e}function Ne(e){return e.split(`-`)[0]}function Pe(e){return e.split(`-`)[1]}function Fe(e){return e===`x`?`y`:`x`}function Ie(e){return e===`y`?`height`:`width`}function Le(e){let t=e[0];return t===`t`||t===`b`?`y`:`x`}function Re(e){return Fe(Le(e))}function ze(e,t,n){n===void 0&&(n=!1);let r=Pe(e),i=Re(e),a=Ie(i),o=i===`x`?r===(n?`end`:`start`)?`right`:`left`:r===`start`?`bottom`:`top`;return t.reference[a]>t.floating[a]&&(o=Je(o)),[o,Je(o)]}function Be(e){let t=Je(e);return[Ve(e),t,Ve(t)]}function Ve(e){return e.includes(`start`)?e.replace(`start`,`end`):e.replace(`end`,`start`)}var He=[`left`,`right`],Ue=[`right`,`left`],We=[`top`,`bottom`],Ge=[`bottom`,`top`];function Ke(e,t,n){switch(e){case`top`:case`bottom`:return n?t?Ue:He:t?He:Ue;case`left`:case`right`:return t?We:Ge;default:return[]}}function qe(e,t,n,r){let i=Pe(e),a=Ke(Ne(e),n===`start`,r);return i&&(a=a.map(e=>e+`-`+i),t&&(a=a.concat(a.map(Ve)))),a}function Je(e){let t=Ne(e);return Ae[t]+e.slice(t.length)}function Ye(e){return{top:e.top??0,right:e.right??0,bottom:e.bottom??0,left:e.left??0}}function Xe(e){return typeof e==`number`?{top:e,right:e,bottom:e,left:e}:Ye(e)}function Ze(e){let{x:t,y:n,width:r,height:i}=e;return{width:r,height:i,top:n,left:t,right:t+r,bottom:n+i,x:t,y:n}}function Qe(e,t,n){let{reference:r,floating:i}=e,a=Le(t),o=Re(t),s=Ie(o),c=Ne(t),l=a===`y`,u=r.x+r.width/2-i.width/2,d=r.y+r.height/2-i.height/2,f=r[s]/2-i[s]/2,p;switch(c){case`top`:p={x:u,y:r.y-i.height};break;case`bottom`:p={x:u,y:r.y+r.height};break;case`right`:p={x:r.x+r.width,y:d};break;case`left`:p={x:r.x-i.width,y:d};break;default:p={x:r.x,y:r.y}}let m=Pe(t);return m&&(p[o]+=f*(m===`end`?1:-1)*(n&&l?-1:1)),p}async function $e(e,t){t===void 0&&(t={});let{x:n,y:r,platform:i,rects:a,elements:o,strategy:s}=e,{boundary:c=`clippingAncestors`,rootBoundary:l=`viewport`,elementContext:u=`floating`,altBoundary:d=!1,padding:f=0}=Me(t,e),p=Xe(f),m=o[d?u===`floating`?`reference`:`floating`:u],h=Ze(await i.getClippingRect({element:await(i.isElement==null?void 0:i.isElement(m))??!0?m:m.contextElement||await(i.getDocumentElement==null?void 0:i.getDocumentElement(o.floating)),boundary:c,rootBoundary:l,strategy:s})),g=u===`floating`?{x:n,y:r,width:a.floating.width,height:a.floating.height}:a.reference,_=await(i.getOffsetParent==null?void 0:i.getOffsetParent(o.floating)),v=await(i.isElement==null?void 0:i.isElement(_))&&await(i.getScale==null?void 0:i.getScale(_))||{x:1,y:1},y=Ze(i.convertOffsetParentRelativeRectToViewportRelativeRect?await i.convertOffsetParentRelativeRectToViewportRelativeRect({elements:o,rect:g,offsetParent:_,strategy:s}):g);return{top:(h.top-y.top+p.top)/v.y,bottom:(y.bottom-h.bottom+p.bottom)/v.y,left:(h.left-y.left+p.left)/v.x,right:(y.right-h.right+p.right)/v.x}}var et=50,tt=async(e,t,n)=>{let{placement:r=`bottom`,strategy:i=`absolute`,middleware:a=[],platform:o}=n,s=o.detectOverflow?o:{...o,detectOverflow:$e},c=await(o.isRTL==null?void 0:o.isRTL(t)),l=await o.getElementRects({reference:e,floating:t,strategy:i}),{x:u,y:d}=Qe(l,r,c),f=r,p=0,m={};for(let n=0;n<a.length;n++){let h=a[n];if(!h)continue;let{name:g,fn:_}=h,{x:v,y,data:b,reset:x}=await _({x:u,y:d,initialPlacement:r,placement:f,strategy:i,middlewareData:m,rects:l,platform:s,elements:{reference:e,floating:t}});u=v??u,d=y??d,m[g]={...m[g],...b},x&&p<et&&(p++,typeof x==`object`&&(x.placement&&(f=x.placement),x.rects&&(l=x.rects===!0?await o.getElementRects({reference:e,floating:t,strategy:i}):x.rects),{x:u,y:d}=Qe(l,f,c)),n=-1)}return{x:u,y:d,placement:f,strategy:i,middlewareData:m}},nt=e=>({name:`arrow`,options:e,async fn(t){let{x:n,y:r,placement:i,rects:a,platform:o,elements:s,middlewareData:c}=t,{element:l,padding:u=0}=Me(e,t)||{};if(l==null)return{};let d=Xe(u),f={x:n,y:r},p=Re(i),m=Ie(p),h=await o.getDimensions(l),g=p===`y`,_=g?`top`:`left`,v=g?`bottom`:`right`,y=g?`clientHeight`:`clientWidth`,b=a.reference[m]+a.reference[p]-f[p]-a.floating[m],x=f[p]-a.reference[p],S=await(o.getOffsetParent==null?void 0:o.getOffsetParent(l)),C=S?S[y]:0;(!C||!await(o.isElement==null?void 0:o.isElement(S)))&&(C=s.floating[y]||a.floating[m]);let w=b/2-x/2,T=C/2-h[m]/2-1,ee=Te(d[_],T),te=Te(d[v],T),ne=C-h[m]-te,re=C/2-h[m]/2+w,ie=je(ee,re,ne),ae=!c.arrow&&Pe(i)!=null&&re!==ie&&a.reference[m]/2-(re<ee?ee:te)-h[m]/2<0,oe=ae?re<ee?re-ee:re-ne:0;return{[p]:f[p]+oe,data:{[p]:ie,centerOffset:re-ie-oe,...ae&&{alignmentOffset:oe}},reset:ae}}});function rt(e,t,n){return(e?[...n.filter(t=>Pe(t)===e),...n.filter(t=>Pe(t)!==e)]:n.filter(e=>Ne(e)===e)).filter(n=>!e||Pe(n)===e||(t?Ve(n)!==n:!1))}var it=function(e){return e===void 0&&(e={}),{name:`autoPlacement`,options:e,async fn(t){let{rects:n,middlewareData:r,placement:i,platform:a,elements:o}=t,{crossAxis:s=!1,alignment:c,allowedPlacements:l=j,autoAlignment:u=!0,...d}=Me(e,t),f=c!==void 0||l===j?rt(c||null,u,l):l,p=r.autoPlacement?.index||0,m=f[p];if(m==null)return{};if(i!==m)return{reset:{placement:f[0]}};let h=await a.detectOverflow(t,d),g=ze(m,n,await(a.isRTL==null?void 0:a.isRTL(o.floating))),_=[h[Ne(m)],h[g[0]],h[g[1]]],v=[...r.autoPlacement?.overflows||[],{placement:m,overflows:_}],y=f[p+1];if(y)return{data:{index:p+1,overflows:v},reset:{placement:y}};let b=v.map(e=>{let t=Pe(e.placement);return[e.placement,t&&s?e.overflows.slice(0,2).reduce((e,t)=>e+t,0):e.overflows[0],e.overflows]}).sort((e,t)=>e[1]-t[1]),x=b.filter(e=>e[2].slice(0,Pe(e[0])?2:3).every(e=>e<=0))[0]?.[0]||b[0][0];return x===i?{}:{data:{index:p+1,overflows:v},reset:{placement:x}}}}},at=function(e){return e===void 0&&(e={}),{name:`flip`,options:e,async fn(t){var n;let{placement:r,middlewareData:i,rects:a,initialPlacement:o,platform:s,elements:c}=t,{mainAxis:l=!0,crossAxis:u=!0,fallbackPlacements:d,fallbackStrategy:f=`bestFit`,fallbackAxisSideDirection:p=`none`,flipAlignment:m=!0,...h}=Me(e,t);if((n=i.arrow)!=null&&n.alignmentOffset)return{};let g=Ne(r),_=Le(o),v=Ne(o)===o,y=await(s.isRTL==null?void 0:s.isRTL(c.floating)),b=d||(v||!m?[Je(o)]:Be(o)),x=p!==`none`;!d&&x&&b.push(...qe(o,m,p,y));let S=[o,...b],C=await s.detectOverflow(t,h),w=[],T=i.flip?.overflows||[];if(l&&w.push(C[g]),u){let e=ze(r,a,y);w.push(C[e[0]],C[e[1]])}if(T=[...T,{placement:r,overflows:w}],!w.every(e=>e<=0)){let e=(i.flip?.index||0)+1,t=S[e];if(t&&(u!==`alignment`||_===Le(t)||T.every(e=>Le(e.placement)!==_||e.overflows[0]>0)))return{data:{index:e,overflows:T},reset:{placement:t}};let n=T.filter(e=>e.overflows[0]<=0).sort((e,t)=>e.overflows[1]-t.overflows[1])[0]?.placement;if(!n)switch(f){case`bestFit`:{let e=T.filter(e=>{if(x){let t=Le(e.placement);return t===_||t===`y`}return!0}).map(e=>[e.placement,e.overflows.filter(e=>e>0).reduce((e,t)=>e+t,0)]).sort((e,t)=>e[1]-t[1])[0]?.[0];e&&(n=e);break}case`initialPlacement`:n=o}if(r!==n)return{reset:{placement:n}}}return{}}}};function ot(e,t){return{top:e.top-t.height,right:e.right-t.width,bottom:e.bottom-t.height,left:e.left-t.width}}function st(e){return Ce.some(t=>e[t]>=0)}var ct=function(e){return e===void 0&&(e={}),{name:`hide`,options:e,async fn(t){let{rects:n,platform:r}=t,{strategy:i=`referenceHidden`,...a}=Me(e,t);switch(i){case`referenceHidden`:{let e=ot(await r.detectOverflow(t,{...a,elementContext:`reference`}),n.reference);return{data:{referenceHiddenOffsets:e,referenceHidden:st(e)}}}case`escaped`:{let e=ot(await r.detectOverflow(t,{...a,altBoundary:!0}),n.floating);return{data:{escapedOffsets:e,escaped:st(e)}}}default:return{}}}}};function lt(e){let t=Te(...e.map(e=>e.left)),n=Te(...e.map(e=>e.top)),r=Ee(...e.map(e=>e.right)),i=Ee(...e.map(e=>e.bottom));return{x:t,y:n,width:r-t,height:i-n}}function ut(e){let t=e.slice().sort((e,t)=>e.y-t.y),n=[],r=null;for(let e=0;e<t.length;e++){let i=t[e];!r||i.y-r.y>r.height/2?n.push([i]):n[n.length-1].push(i),r=i}return n.map(e=>Ze(lt(e)))}var dt=function(e){return e===void 0&&(e={}),{name:`inline`,options:e,async fn(t){let{placement:n,elements:r,rects:i,platform:a,strategy:o}=t,{padding:s=2,x:c,y:l}=Me(e,t),u=Array.from(await(a.getClientRects==null?void 0:a.getClientRects(r.reference))||[]);if(!u.length)return{};let d=ut(u),f=Ze(lt(u)),p=Xe(s);function m(){if(d.length===2&&(d[0].left>d[1].right||d[1].left>d[0].right)&&c!=null&&l!=null)return d.find(e=>c>e.left-p.left&&c<e.right+p.right&&l>e.top-p.top&&l<e.bottom+p.bottom)||f;if(d.length>=2){if(Le(n)===`y`){let e=d[0],t=d[d.length-1],r=Ne(n)===`top`,i=e.top,a=t.bottom,o=r?e.left:t.left;return Ze({x:o,y:i,width:(r?e.right:t.right)-o,height:a-i})}let e=Ne(n)===`left`,t=Ee(...d.map(e=>e.right)),r=Te(...d.map(e=>e.left)),i=d.filter(n=>e?n.left===r:n.right===t),a=i[0].top,o=i[i.length-1].bottom;return Ze({x:r,y:a,width:t-r,height:o-a})}return f}let h=await a.getElementRects({reference:{getBoundingClientRect:m},floating:r.floating,strategy:o});return i.reference.x!==h.reference.x||i.reference.y!==h.reference.y||i.reference.width!==h.reference.width||i.reference.height!==h.reference.height?{reset:{rects:h}}:{}}}},ft=new Set([`left`,`top`]);async function pt(e,t){let{placement:n,platform:r,elements:i}=e,a=await(r.isRTL==null?void 0:r.isRTL(i.floating)),o=Ne(n),s=Pe(n),c=Le(n)===`y`,l=ft.has(o)?-1:1,u=a&&c?-1:1,d=Me(t,e),{mainAxis:f,crossAxis:p,alignmentAxis:m}=typeof d==`number`?{mainAxis:d,crossAxis:0,alignmentAxis:null}:{mainAxis:d.mainAxis||0,crossAxis:d.crossAxis||0,alignmentAxis:d.alignmentAxis};return s&&typeof m==`number`&&(p=s===`end`?m*-1:m),c?{x:p*u,y:f*l}:{x:f*l,y:p*u}}var mt=function(e){return e===void 0&&(e=0),{name:`offset`,options:e,async fn(t){var n;let{x:r,y:i,placement:a,middlewareData:o}=t,s=await pt(t,e);return a===o.offset?.placement&&(n=o.arrow)!=null&&n.alignmentOffset?{}:{x:r+s.x,y:i+s.y,data:{...s,placement:a}}}}},ht=function(e){return e===void 0&&(e={}),{name:`shift`,options:e,async fn(t){let{x:n,y:r,placement:i,platform:a}=t,{mainAxis:o=!0,crossAxis:s=!1,limiter:c={fn:e=>{let{x:t,y:n}=e;return{x:t,y:n}}},...l}=Me(e,t),u={x:n,y:r},d=await a.detectOverflow(t,l),f=Le(i),p=Fe(f),m=u[p],h=u[f],g=(e,t)=>je(t+d[e===`y`?`top`:`left`],t,t-d[e===`y`?`bottom`:`right`]);o&&(m=g(p,m)),s&&(h=g(f,h));let _=c.fn({...t,[p]:m,[f]:h});return{..._,data:{x:_.x-n,y:_.y-r,enabled:{[p]:o,[f]:s}}}}}},gt=function(e){return e===void 0&&(e={}),{options:e,fn(t){let{x:n,y:r,placement:i,rects:a,middlewareData:o}=t,{offset:s=0,mainAxis:c=!0,crossAxis:l=!0}=Me(e,t),u={x:n,y:r},d=Le(i),f=Fe(d),p=u[f],m=u[d],h=Me(s,t),g=typeof h==`number`?{mainAxis:h,crossAxis:0}:{mainAxis:h.mainAxis??0,crossAxis:h.crossAxis??0};if(c){let e=f===`y`?`height`:`width`,t=a.reference[f]-a.floating[e]+g.mainAxis,n=a.reference[f]+a.reference[e]-g.mainAxis;p<t?p=t:p>n&&(p=n)}if(l){let e=f===`y`?`width`:`height`,t=ft.has(Ne(i)),n=a.reference[d]-a.floating[e]+(t&&o.offset?.[d]||0)+(t?0:g.crossAxis),r=a.reference[d]+a.reference[e]+(t?0:o.offset?.[d]||0)-(t?g.crossAxis:0);m<n?m=n:m>r&&(m=r)}return{[f]:p,[d]:m}}}},_t=function(e){return e===void 0&&(e={}),{name:`size`,options:e,async fn(t){let{placement:n,rects:r,platform:i,elements:a}=t,{apply:o=()=>{},...s}=Me(e,t),c=await i.detectOverflow(t,s),l=Ne(n),u=Pe(n),d=Le(n)===`y`,{width:f,height:p}=r.floating,m,h;l===`top`||l===`bottom`?(m=l,h=u===(await(i.isRTL==null?void 0:i.isRTL(a.floating))?`start`:`end`)?`left`:`right`):(h=l,m=u===`end`?`top`:`bottom`);let g=p-c.top-c.bottom,_=f-c.left-c.right,v=Te(p-c[m],g),y=Te(f-c[h],_),b=t.middlewareData.shift,x=!b,S=v,C=y;b!=null&&b.enabled.x&&(C=_),b!=null&&b.enabled.y&&(S=g),x&&!u&&(d?C=f-2*Ee(c.left,c.right):S=p-2*Ee(c.top,c.bottom)),await o({...t,availableWidth:C,availableHeight:S});let w=await i.getDimensions(a.floating);return f!==w.width||p!==w.height?{reset:{rects:!0}}:{}}}};function vt(){return typeof window<`u`}function yt(e){return St(e)?(e.nodeName||``).toLowerCase():`#document`}function bt(e){var t;return(e==null||(t=e.ownerDocument)==null?void 0:t.defaultView)||window}function xt(e){return((St(e)?e.ownerDocument:e.document)||window.document)?.documentElement}function St(e){return vt()?e instanceof Node||e instanceof bt(e).Node:!1}function Ct(e){return vt()?e instanceof Element||e instanceof bt(e).Element:!1}function wt(e){return vt()?e instanceof HTMLElement||e instanceof bt(e).HTMLElement:!1}function Tt(e){return!vt()||typeof ShadowRoot>`u`?!1:e instanceof ShadowRoot||e instanceof bt(e).ShadowRoot}function Et(e){let{overflow:t,overflowX:n,overflowY:r,display:i}=Lt(e);return/auto|scroll|overlay|hidden|clip/.test(t+r+n)&&i!==`inline`&&i!==`contents`}function Dt(e){return/^(table|td|th)$/.test(yt(e))}function Ot(e){try{if(e.matches(`:popover-open`))return!0}catch{}try{return e.matches(`:modal`)}catch{return!1}}var kt=/transform|translate|scale|rotate|perspective|filter/,At=/paint|layout|strict|content/,jt=e=>!!e&&e!==`none`,Mt;function Nt(e){let t=Ct(e)?Lt(e):e;return jt(t.transform)||jt(t.translate)||jt(t.scale)||jt(t.rotate)||jt(t.perspective)||!Ft()&&(jt(t.backdropFilter)||jt(t.filter))||kt.test(t.willChange||``)||At.test(t.contain||``)}function Pt(e){let t=zt(e);for(;wt(t)&&!It(t);){if(Nt(t))return t;if(Ot(t))return null;t=zt(t)}return null}function Ft(){return Mt??=typeof CSS<`u`&&CSS.supports&&CSS.supports(`-webkit-backdrop-filter`,`none`),Mt}function It(e){return/^(html|body|#document)$/.test(yt(e))}function Lt(e){return bt(e).getComputedStyle(e)}function Rt(e){return Ct(e)?{scrollLeft:e.scrollLeft,scrollTop:e.scrollTop}:{scrollLeft:e.scrollX,scrollTop:e.scrollY}}function zt(e){if(yt(e)===`html`)return e;let t=e.assignedSlot||e.parentNode||Tt(e)&&e.host||xt(e);return Tt(t)?t.host:t}function Bt(e){let t=zt(e);return It(t)?(e.ownerDocument||e).body:wt(t)&&Et(t)?t:Bt(t)}function Vt(e,t,n){t===void 0&&(t=[]),n===void 0&&(n=!0);let r=Bt(e),i=r===e.ownerDocument?.body,a=bt(r);if(i){let e=Ht(a);return t.concat(a,a.visualViewport||[],Et(r)?r:[],e&&n?Vt(e):[])}return t.concat(r,Vt(r,[],n))}function Ht(e){return e.parent&&Object.getPrototypeOf(e.parent)?e.frameElement:null}function Ut(e){let t=Lt(e),n=parseFloat(t.width)||0,r=parseFloat(t.height)||0,i=wt(e),a=i?e.offsetWidth:n,o=i?e.offsetHeight:r,s=De(n)!==a||De(r)!==o;return s&&(n=a,r=o),{width:n,height:r,$:s}}function Wt(e){return Ct(e)?e:e.contextElement}function Gt(e){let t=Wt(e);if(!wt(t))return ke(1);let n=t.getBoundingClientRect(),{width:r,height:i,$:a}=Ut(t),o=(a?De(n.width):n.width)/r,s=(a?De(n.height):n.height)/i;return(!o||!Number.isFinite(o))&&(o=1),(!s||!Number.isFinite(s))&&(s=1),{x:o,y:s}}var Kt=ke(0);function qt(e){let t=bt(e);return!Ft()||!t.visualViewport?Kt:{x:t.visualViewport.offsetLeft,y:t.visualViewport.offsetTop}}function Jt(e,t,n){return t===void 0&&(t=!1),!!n&&t&&n===bt(e)}function Yt(e,t,n,r){t===void 0&&(t=!1),n===void 0&&(n=!1);let i=e.getBoundingClientRect(),a=Wt(e),o=ke(1);t&&(r?Ct(r)&&(o=Gt(r)):o=Gt(e));let s=Jt(a,n,r)?qt(a):ke(0),c=(i.left+s.x)/o.x,l=(i.top+s.y)/o.y,u=i.width/o.x,d=i.height/o.y;if(a&&r){let e=bt(a),t=Ct(r)?bt(r):r,n=e,i=Ht(n);for(;i&&t!==n;){let e=Gt(i),t=i.getBoundingClientRect(),r=Lt(i),a=t.left+(i.clientLeft+parseFloat(r.paddingLeft))*e.x,o=t.top+(i.clientTop+parseFloat(r.paddingTop))*e.y;c*=e.x,l*=e.y,u*=e.x,d*=e.y,c+=a,l+=o,n=bt(i),i=Ht(n)}}return Ze({width:u,height:d,x:c,y:l})}function Xt(e,t){let n=Rt(e).scrollLeft;return t?t.left+n:Yt(xt(e)).left+n}function M(e,t){let n=e.getBoundingClientRect();return{x:n.left+t.scrollLeft-Xt(e,n),y:n.top+t.scrollTop}}function Zt(e){let{elements:t,rect:n,offsetParent:r,strategy:i}=e,a=i===`fixed`,o=xt(r),s=t?Ot(t.floating):!1;if(r===o||s&&a)return n;let c={scrollLeft:0,scrollTop:0},l=ke(1),u=ke(0),d=wt(r);if((d||!a)&&((yt(r)!==`body`||Et(o))&&(c=Rt(r)),d)){let e=Yt(r);l=Gt(r),u.x=e.x+r.clientLeft,u.y=e.y+r.clientTop}let f=o&&!d&&!a?M(o,c):ke(0);return{width:n.width*l.x,height:n.height*l.y,x:n.x*l.x-c.scrollLeft*l.x+u.x+f.x,y:n.y*l.y-c.scrollTop*l.y+u.y+f.y}}function Qt(e){return e.getClientRects?Array.from(e.getClientRects()):[]}function $t(e){let t=Rt(e),n=e.ownerDocument.body,r=Ee(e.scrollWidth,e.clientWidth,n.scrollWidth,n.clientWidth),i=Ee(e.scrollHeight,e.clientHeight,n.scrollHeight,n.clientHeight),a=-t.scrollLeft+Xt(e),o=-t.scrollTop;return Lt(n).direction===`rtl`&&(a+=Ee(e.clientWidth,n.clientWidth)-r),{width:r,height:i,x:a,y:o}}var en=25;function tn(e,t,n){n===void 0&&(n=`viewport`);let r=n===`layoutViewport`,i=bt(e),a=xt(e),o=i.visualViewport,s=a.clientWidth,c=a.clientHeight,l=0,u=0;if(o){let e=!Ft()||t===`fixed`;r?e||(l=-o.offsetLeft,u=-o.offsetTop):(s=o.width,c=o.height,e&&(l=o.offsetLeft,u=o.offsetTop))}if(Xt(a)<=0){let e=a.ownerDocument,t=e.body,n=getComputedStyle(t),r=e.compatMode===`CSS1Compat`&&parseFloat(n.marginLeft)+parseFloat(n.marginRight)||0,i=Math.abs(a.clientWidth-t.clientWidth-r),o=getComputedStyle(a).scrollbarGutter===`stable both-edges`?i/2:i;o<=en&&(s-=o)}return{width:s,height:c,x:l,y:u}}function nn(e,t){let n=Yt(e,!0,t===`fixed`),r=n.top+e.clientTop,i=n.left+e.clientLeft,a=Gt(e);return{width:e.clientWidth*a.x,height:e.clientHeight*a.y,x:i*a.x,y:r*a.y}}function rn(e,t,n){let r;if(t===`viewport`||t===`layoutViewport`)r=tn(e,n,t);else if(t===`document`)r=$t(xt(e));else if(Ct(t))r=nn(t,n);else{let n=qt(e);r={x:t.x-n.x,y:t.y-n.y,width:t.width,height:t.height}}return Ze(r)}function an(e,t){let n=t.get(e);if(n)return n;let r=Vt(e,[],!1).filter(e=>Ct(e)&&yt(e)!==`body`),i=null,a=Lt(e).position===`fixed`,o=a?zt(e):e;for(;Ct(o)&&!It(o);){let e=Lt(o),t=Nt(o),n=i?i.position:a?`fixed`:``;!t&&(n===`fixed`||n===`absolute`&&e.position===`static`)?r=r.filter(e=>e!==o):i=e,o=zt(o)}return t.set(e,r),r}function on(e){let{element:t,boundary:n,rootBoundary:r,strategy:i}=e,a=[...n===`clippingAncestors`?Ot(t)?[]:an(t,this._c):[].concat(n),r],o=rn(t,a[0],i),s=o.top,c=o.right,l=o.bottom,u=o.left;for(let e=1;e<a.length;e++){let n=rn(t,a[e],i);s=Ee(n.top,s),c=Te(n.right,c),l=Te(n.bottom,l),u=Ee(n.left,u)}return{width:c-u,height:l-s,x:u,y:s}}function sn(e){let{width:t,height:n}=Ut(e);return{width:t,height:n}}function cn(e,t,n){let r=wt(t),i=xt(t),a=n===`fixed`,o=Yt(e,!0,a,t),s={scrollLeft:0,scrollTop:0},c=ke(0);if((r||!a)&&((yt(t)!==`body`||Et(i))&&(s=Rt(t)),r)){let e=Yt(t,!0,a,t);c.x=e.x+t.clientLeft,c.y=e.y+t.clientTop}!r&&i&&(c.x=Xt(i));let l=i&&!r&&!a?M(i,s):ke(0);return{x:o.left+s.scrollLeft-c.x-l.x,y:o.top+s.scrollTop-c.y-l.y,width:o.width,height:o.height}}function ln(e){return Lt(e).position===`static`}function un(e,t){if(!wt(e)||Lt(e).position===`fixed`)return null;if(t)return t(e);let n=e.offsetParent;return xt(e)===n&&(n=n.ownerDocument.body),n}function dn(e,t){let n=bt(e);if(Ot(e))return n;if(!wt(e)){let t=zt(e);for(;t&&!It(t);){if(Ct(t)&&!ln(t))return t;t=zt(t)}return n}let r=un(e,t);for(;r&&Dt(r)&&ln(r);)r=un(r,t);return r&&It(r)&&ln(r)&&!Nt(r)?n:r||Pt(e)||n}var fn=async function(e){let t=this.getOffsetParent||dn,n=this.getDimensions,r=await n(e.floating);return{reference:cn(e.reference,await t(e.floating),e.strategy),floating:{x:0,y:0,width:r.width,height:r.height}}};function pn(e){return Lt(e).direction===`rtl`}var mn={convertOffsetParentRelativeRectToViewportRelativeRect:Zt,getDocumentElement:xt,getClippingRect:on,getOffsetParent:dn,getElementRects:fn,getClientRects:Qt,getDimensions:sn,getScale:Gt,isElement:Ct,isRTL:pn};function hn(e,t){return e.x===t.x&&e.y===t.y&&e.width===t.width&&e.height===t.height}function gn(e,t,n){let r=null,i,a=xt(e);function o(){var e;clearTimeout(i),(e=r)==null||e.disconnect(),r=null}function s(n,c){n===void 0&&(n=!1),c===void 0&&(c=1),o();let l=e.getBoundingClientRect(),{left:u,top:d,width:f,height:p}=l;if(n||t(),!f||!p)return;let m=Oe(d),h=Oe(a.clientWidth-(u+f)),g=Oe(a.clientHeight-(d+p)),_=Oe(u),v={rootMargin:-m+`px `+-h+`px `+-g+`px `+-_+`px`,threshold:Ee(0,Te(1,c))||1},y=!0;function b(t){let n=t[0].intersectionRatio;if(!hn(l,e.getBoundingClientRect()))return s();if(n!==c){if(!y)return s();n?s(!1,n):i=setTimeout(()=>{s(!1,1e-7)},1e3)}y=!1}try{r=new IntersectionObserver(b,{...v,root:a.ownerDocument})}catch{r=new IntersectionObserver(b,v)}r.observe(e)}let c=bt(e),l=()=>s(n);return c.addEventListener(`resize`,l),s(!0),()=>{c.removeEventListener(`resize`,l),o()}}function _n(e,t,n,r){r===void 0&&(r={});let{ancestorScroll:i=!0,ancestorResize:a=!0,elementResize:o=typeof ResizeObserver==`function`,layoutShift:s=typeof IntersectionObserver==`function`,animationFrame:c=!1}=r,l=Wt(e),u=i||a?[...l?Vt(l):[],...t?Vt(t):[]]:[];u.forEach(e=>{i&&e.addEventListener(`scroll`,n),a&&e.addEventListener(`resize`,n)});let d=l&&s?gn(l,n,a):null,f=-1,p=null;o&&(p=new ResizeObserver(e=>{let[r]=e;r&&r.target===l&&p&&t&&(p.unobserve(t),cancelAnimationFrame(f),f=requestAnimationFrame(()=>{var e;(e=p)==null||e.observe(t)})),n()}),l&&!c&&p.observe(l),t&&p.observe(t));let m,h=c?Yt(e):null;c&&g();function g(){let t=Yt(e);h&&!hn(h,t)&&n(),h=t,m=requestAnimationFrame(g)}return n(),()=>{var e;u.forEach(e=>{i&&e.removeEventListener(`scroll`,n),a&&e.removeEventListener(`resize`,n)}),d?.(),(e=p)==null||e.disconnect(),p=null,c&&cancelAnimationFrame(m)}}var vn=mt,yn=it,bn=ht,xn=at,Sn=_t,Cn=ct,wn=nt,Tn=dt,En=gt,Dn=(e,t,n)=>{let r=new Map,i=n??{},a={...mn,...i.platform,_c:r};return tt(e,t,{...i,platform:a})},On=globalThis,kn=On.ShadowRoot&&(On.ShadyCSS===void 0||On.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,An=Symbol(),jn=new WeakMap,Mn=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==An)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(kn&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=jn.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&jn.set(t,e))}return e}toString(){return this.cssText}},Nn=e=>new Mn(typeof e==`string`?e:e+``,void 0,An),Pn=(e,t)=>{if(kn)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let n of t){let t=document.createElement(`style`),r=On.litNonce;r!==void 0&&t.setAttribute(`nonce`,r),t.textContent=n.cssText,e.appendChild(t)}},Fn=kn?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return Nn(t)})(e):e,{is:In,defineProperty:Ln,getOwnPropertyDescriptor:Rn,getOwnPropertyNames:zn,getOwnPropertySymbols:Bn,getPrototypeOf:Vn}=Object,Hn=globalThis,Un=Hn.trustedTypes,Wn=Un?Un.emptyScript:``,Gn=Hn.reactiveElementPolyfillSupport,Kn=(e,t)=>e,qn={toAttribute(e,t){switch(t){case Boolean:e=e?Wn:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},Jn=(e,t)=>!In(e,t),Yn={attribute:!0,type:String,converter:qn,reflect:!1,useDefault:!1,hasChanged:Jn};Symbol.metadata??=Symbol(`metadata`),Hn.litPropertyMetadata??=new WeakMap;var Xn=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Yn){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&Ln(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=Rn(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Yn}static _$Ei(){if(this.hasOwnProperty(Kn(`elementProperties`)))return;let e=Vn(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Kn(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Kn(`properties`))){let e=this.properties,t=[...zn(e),...Bn(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(Fn(e))}else e!==void 0&&t.push(Fn(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Pn(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?qn:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?qn:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??Jn)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};Xn.elementStyles=[],Xn.shadowRootOptions={mode:`open`},Xn[Kn(`elementProperties`)]=new Map,Xn[Kn(`finalized`)]=new Map,Gn?.({ReactiveElement:Xn}),(Hn.reactiveElementVersions??=[]).push(`2.1.2`);var Zn=globalThis,Qn=e=>e,$n=Zn.trustedTypes,er=$n?$n.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,tr=`$lit$`,nr=`lit$${Math.random().toFixed(9).slice(2)}$`,rr=`?`+nr,ir=`<${rr}>`,ar=document,or=()=>ar.createComment(``),sr=e=>e===null||typeof e!=`object`&&typeof e!=`function`,cr=Array.isArray,lr=e=>cr(e)||typeof e?.[Symbol.iterator]==`function`,ur=`[ 	
\f\r]`,dr=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fr=/-->/g,pr=/>/g,mr=RegExp(`>|${ur}(?:([^\\s"'>=/]+)(${ur}*=${ur}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),hr=/'/g,gr=/"/g,_r=/^(?:script|style|textarea|title)$/i,vr=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),N=vr(1),yr=vr(2),br=vr(3),xr=Symbol.for(`lit-noChange`),P=Symbol.for(`lit-nothing`),Sr=new WeakMap,Cr=ar.createTreeWalker(ar,129);function wr(e,t){if(!cr(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return er===void 0?t:er.createHTML(t)}var Tr=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=dr;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===dr?c[1]===`!--`?o=fr:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=mr):(_r.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=mr):o=pr:o===mr?c[0]===`>`?(o=i??dr,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?mr:c[3]===`"`?gr:hr):o===gr||o===hr?o=mr:o===fr||o===pr?o=dr:(o=mr,i=void 0);let d=o===mr&&e[t+1].startsWith(`/>`)?` `:``;a+=o===dr?n+ir:l>=0?(r.push(s),n.slice(0,l)+tr+n.slice(l)+nr+d):n+nr+(l===-2?t:d)}return[wr(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Er=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Tr(t,n);if(this.el=e.createElement(l,r),Cr.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=Cr.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(tr)){let t=u[o++],n=i.getAttribute(e).split(nr),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?jr:r[1]===`?`?Mr:r[1]===`@`?Nr:Ar}),i.removeAttribute(e)}else e.startsWith(nr)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(_r.test(i.tagName)){let e=i.textContent.split(nr),t=e.length-1;if(t>0){i.textContent=$n?$n.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],or()),Cr.nextNode(),c.push({type:2,index:++a});i.append(e[t],or())}}}else if(i.nodeType===8){if(i.data===rr)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(nr,e+1))!==-1;)c.push({type:7,index:a}),e+=nr.length-1}}a++}}static createElement(e,t){let n=ar.createElement(`template`);return n.innerHTML=e,n}};function Dr(e,t,n=e,r){if(t===xr)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=sr(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=Dr(e,i._$AS(e,t.values),i,r)),t}var Or=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??ar).importNode(t,!0);Cr.currentNode=r;let i=Cr.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new kr(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Pr(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=Cr.nextNode(),a++)}return Cr.currentNode=ar,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},kr=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=P,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Dr(this,e,t),sr(e)?e===P||e==null||e===``?(this._$AH!==P&&this._$AR(),this._$AH=P):e!==this._$AH&&e!==xr&&this._(e):e._$litType$===void 0?e.nodeType===void 0?lr(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==P&&sr(this._$AH)?this._$AA.nextSibling.data=e:this.T(ar.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Er.createElement(wr(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Or(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Sr.get(e.strings);return t===void 0&&Sr.set(e.strings,t=new Er(e)),t}k(t){cr(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(or()),this.O(or()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=Qn(e).nextSibling;Qn(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Ar=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=P,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=P}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=Dr(this,e,t,0),a=!sr(e)||e!==this._$AH&&e!==xr,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=Dr(this,r[n+o],t,o),s===xr&&(s=this._$AH[o]),a||=!sr(s)||s!==this._$AH[o],s===P?e=P:e!==P&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===P?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},jr=class extends Ar{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===P?void 0:e}},Mr=class extends Ar{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==P)}},Nr=class extends Ar{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=Dr(this,e,t,0)??P)===xr)return;let n=this._$AH,r=e===P&&n!==P||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==P&&(n===P||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Pr=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Dr(this,e)}},Fr={M:tr,P:nr,A:rr,C:1,L:Tr,R:Or,D:lr,V:Dr,I:kr,H:Ar,N:Mr,U:Nr,B:jr,F:Pr},Ir=Zn.litHtmlPolyfillSupport;Ir?.(Er,kr),(Zn.litHtmlVersions??=[]).push(`3.3.3`);var Lr=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new kr(t.insertBefore(or(),e),e,void 0,n??{})}return i._$AI(e),i},Rr=globalThis,zr=class extends Xn{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Lr(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return xr}};zr._$litElement$=!0,zr.finalized=!0,Rr.litElementHydrateSupport?.({LitElement:zr});var Br=Rr.litElementPolyfillSupport;Br?.({LitElement:zr}),(Rr.litElementVersions??=[]).push(`4.2.2`);var Vr=e=>e??P,Hr={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ur=e=>(...t)=>({_$litDirective$:e,values:t}),Wr=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},{I:Gr}=Fr,Kr=e=>e,qr=()=>document.createComment(``),Jr=(e,t,n)=>{let r=e._$AA.parentNode,i=t===void 0?e._$AB:t._$AA;if(n===void 0)n=new Gr(r.insertBefore(qr(),i),r.insertBefore(qr(),i),e,e.options);else{let t=n._$AB.nextSibling,a=n._$AM,o=a!==e;if(o){let t;n._$AQ?.(e),n._$AM=e,n._$AP!==void 0&&(t=e._$AU)!==a._$AU&&n._$AP(t)}if(t!==i||o){let e=n._$AA;for(;e!==t;){let t=Kr(e).nextSibling;Kr(r).insertBefore(e,i),e=t}}}return n},Yr=(e,t,n=e)=>(e._$AI(t,n),e),Xr={},Zr=(e,t=Xr)=>e._$AH=t,Qr=e=>e._$AH,$r=e=>{e._$AR(),e._$AA.remove()},ei=(e,t,n)=>{let r=new Map;for(let i=t;i<=n;i++)r.set(e[i],i);return r},ti=Ur(class extends Wr{constructor(e){if(super(e),e.type!==Hr.CHILD)throw Error(`repeat() can only be used in text expressions`)}dt(e,t,n){let r;n===void 0?n=t:t!==void 0&&(r=t);let i=[],a=[],o=0;for(let t of e)i[o]=r?r(t,o):o,a[o]=n(t,o),o++;return{values:a,keys:i}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,r]){let i=Qr(e),{values:a,keys:o}=this.dt(t,n,r);if(!Array.isArray(i))return this.ut=o,a;let s=this.ut??=[],c=[],l,u,d=0,f=i.length-1,p=0,m=a.length-1;for(;d<=f&&p<=m;)if(i[d]===null)d++;else if(i[f]===null)f--;else if(s[d]===o[p])c[p]=Yr(i[d],a[p]),d++,p++;else if(s[f]===o[m])c[m]=Yr(i[f],a[m]),f--,m--;else if(s[d]===o[m])c[m]=Yr(i[d],a[m]),Jr(e,c[m+1],i[d]),d++,m--;else if(s[f]===o[p])c[p]=Yr(i[f],a[p]),Jr(e,i[d],i[f]),f--,p++;else if(l===void 0&&(l=ei(o,p,m),u=ei(s,d,f)),l.has(s[d])){if(l.has(s[f])){let t=u.get(o[p]),n=t===void 0?null:i[t];if(n===null){let t=Jr(e,i[d]);Yr(t,a[p]),c[p]=t}else c[p]=Yr(n,a[p]),Jr(e,i[d],n),i[t]=null;p++}else $r(i[f]),f--}else $r(i[d]),d++;for(;p<=m;){let t=Jr(e,c[m+1]);Yr(t,a[p]),c[p++]=t}for(;d<=f;){let e=i[d++];e!==null&&$r(e)}return this.ut=o,Zr(e,c),xr}}),ni=`important`,ri=` !`+ni,ii=Ur(class extends Wr{constructor(e){if(super(e),e.type!==Hr.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:n}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?n.removeProperty(e):n[e]=null);for(let e in t){let r=t[e];if(r!=null){this.ft.add(e);let t=typeof r==`string`&&r.endsWith(ri);e.includes(`-`)||t?n.setProperty(e,t?r.slice(0,-11):r,t?ni:``):n[e]=r}}return xr}}),ai=class extends Wr{constructor(e){if(super(e),this.it=P,e.type!==Hr.CHILD)throw Error(this.constructor.directiveName+`() can only be used in child bindings`)}render(e){if(e===P||e==null)return this._t=void 0,this.it=e;if(e===xr)return e;if(typeof e!=`string`)throw Error(this.constructor.directiveName+`() called with a non-string value`);if(e===this.it)return this._t;this.it=e;let t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};ai.directiveName=`unsafeHTML`,ai.resultType=1;var oi=Ur(ai);function si(e){let t=new Map([[``,[]]]);for(let n of e){let e=n.group??``,r=t.get(e);r===void 0?t.set(e,[n]):r.push(n)}return[...t].map(([e,t])=>({name:e,items:t})).filter(e=>e.items.length>0)}function ci(e){let[t,...n]=si(e.map(e=>({...e,group:e.subgroup??``}))),r=t=>t.map(t=>e.find(e=>e.id===t.id)??t);if(t===void 0)return{loose:[],subgroups:[]};let i=[t,...n].map(e=>({name:e.name,items:r(e.items)}));return t.name===``?{loose:i[0]?.items??[],subgroups:i.slice(1)}:{loose:[],subgroups:i}}function li(e,t){let n=t.trim().toLowerCase();if(n===``)return e.map(e=>({item:e}));let r=n.split(/\s+/);return e.flatMap(e=>{let t=e.title.toLowerCase(),i=[t,e.description??``,e.group??``,e.subgroup??``].join(` `).toLowerCase();if(!r.every(e=>i.includes(e)))return[];let a=t.indexOf(n);return[{item:e,rank:t.startsWith(n)?0:a>0&&/\s|-/.test(t.charAt(a-1))?1:a>=0?2:3,title:a>=0?{start:a,end:a+n.length}:void 0}]}).sort((e,t)=>e.rank-t.rank||e.item.title.localeCompare(t.item.title)).map(({item:e,title:t})=>t===void 0?{item:e}:{item:e,title:t})}function ui(e,t){try{let n=localStorage.getItem(e);return n===null?t:JSON.parse(n)}catch{return t}}function di(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}var fi={navigation:`Menu`,group:`Group`,search:`Search`,switchItem:`Go to…`,searchPlaceholder:`Search by name, description or group…`,noResults:`Nothing matches your search.`,recent:`Recent`,other:`Other`,general:`General`,collapse:`Collapse sidebar`,resize:`Resize sidebar`,footer:`Sidebar actions`,more:`More`,account:`Account`,expand:`Expand sidebar`,loading:`Loading…`,loadFailed:`It could not be loaded.`,retry:`Try again`,items:e=>e===1?`1 item`:`${e} items`,open:`open`,move:`move`,close:`close`,closeSheet:`Close`,searchShort:`Search`,taskbar:`Open apps`,closeTask:e=>`Close ${e}`,startPage:`Start page`,clearSearch:`Clear search`},pi={navigation:`Menü`,group:`Gruppe`,search:`Suchen`,switchItem:`Gehe zu…`,searchPlaceholder:`Nach Name, Beschreibung oder Gruppe suchen…`,noResults:`Nichts passt zur Suche.`,recent:`Zuletzt verwendet`,other:`Weitere`,general:`Allgemein`,collapse:`Seitenleiste einklappen`,resize:`Breite der Seitenleiste`,footer:`Aktionen der Seitenleiste`,more:`Mehr`,account:`Konto`,expand:`Seitenleiste ausklappen`,loading:`Wird geladen…`,loadFailed:`Es konnte nicht geladen werden.`,retry:`Erneut versuchen`,items:e=>e===1?`1 Eintrag`:`${e} Einträge`,open:`öffnen`,move:`wählen`,close:`schließen`,closeSheet:`Schließen`,searchShort:`Suchen`,taskbar:`Geöffnete Apps`,closeTask:e=>`${e} schließen`,startPage:`Startseite`,clearSearch:`Suche leeren`};function mi(e){return e.toLowerCase().startsWith(`de`)?pi:fi}var hi=(e,t)=>N`<svg class="icon ${e}" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">${t}</svg>`,gi=()=>hi(`icon--bolt`,yr`<path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" />`),_i=()=>hi(`icon--chevron`,yr`<path d="m9 6 6 6-6 6" />`),vi=()=>hi(`icon--panel`,yr`<rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9.5 4.5v15" /><path d="m15.5 10-2 2 2 2" />`),yi=()=>hi(`icon--selector`,yr`<path d="m8 9 4-4 4 4" /><path d="m16 15-4 4-4-4" />`),bi=()=>hi(`icon--check`,yr`<path d="m5 12 5 5L20 7" />`),xi=()=>hi(`icon--close`,yr`<path d="M18 6 6 18" /><path d="m6 6 12 12" />`),Si=()=>hi(`icon--menu`,yr`<rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" />`),Ci=()=>hi(`icon--kebab`,yr`<circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />`),wi=()=>N`<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" opacity="0.6" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" opacity="0.6" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </svg>`;function Ti(e){let[t=``,n]=e.split(/[\s\-_/+&]+/).filter(e=>/\p{L}|\p{N}/u.test(e));return n===void 0?t.slice(0,2):`${t.charAt(0)}${n.charAt(0)}`.toUpperCase()}var Ei=e=>hi(`icon--initials`,yr`<rect x="1.5" y="1.5" width="21" height="21" rx="5" /><text x="12" y="12.6" text-anchor="middle" dominant-baseline="central">${Ti(e)}</text>`);function Di(e,t=!1,n=``){return e.icon===void 0?t===`framed`?N`<span class="tile" aria-hidden="true">${Ei(e.title)}${n}</span>`:t?N`<span class="tile" aria-hidden="true">${Ti(e.title)}${n}</span>`:``:N`<span class="tile" aria-hidden="true">${oi(e.icon)}${n}</span>`}function Oi(e){return N`<span class="group-icon" aria-hidden="true">${e===void 0?``:oi(e)}</span>`}var ki=`
:host {
  display: block;
  min-width: 0;
  color: var(--app-cockpit-text, var(--ui-color-text, CanvasText));
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  font-size: calc(var(--app-cockpit-font-size, 14px) * 13 / 14);
}

:host([hidden]) {
  display: none;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

/* A row of tasks, scrolling sideways when they do not fit (each shrinks to its minimum first). */
.bar {
  position: relative;
  display: flex;
  gap: 2px;
  /* As high as the cockpit's sidebar footer, so their edges line up. */
  height: 44px;
  padding-inline: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  /* No bounce at its ends (Firefox's elastic overscroll), and no back or forward swipe of the browser (2026-10-08). */
  overscroll-behavior-x: none;
  scrollbar-width: none;
  border-top: 1px solid var(--app-cockpit-divider, var(--ui-color-divider, light-dark(#dee2e6, #424242)));
  background: var(--app-cockpit-subtle, var(--ui-color-subtle, light-dark(#f7f7f7, #1a1a1a)));
  -webkit-user-select: none;
  user-select: none;
}

/* A task; the active one like a tab hanging from the open app: its background, an accent line on top, over the bar's
   line. */
.task {
  position: relative;
  display: flex;
  flex: 0 1 200px;
  align-items: center;
  min-width: 96px;
  border-radius: 0 0 var(--app-cockpit-radius, var(--ui-radius-sm, 2px)) var(--app-cockpit-radius, var(--ui-radius-sm, 2px));
  color: var(--app-cockpit-muted, var(--ui-color-muted, light-dark(#666, #bbb)));

  /* The text color at 7% (the hover token is about as light as the bar: invisible). */
  &:hover {
    background: color-mix(in srgb, currentColor 7%, transparent);
    color: inherit;
  }

  &[data-active] {
    margin-top: -1px;
    background: var(--app-cockpit-background, var(--ui-color-background, Canvas));
    box-shadow: inset 0 2px 0 var(--app-cockpit-accent, var(--ui-color-accent, light-dark(#0a5cc2, #78b0ff)));
    color: inherit;
  }
}

/* A thin line between two tasks (2026-10-07, the user's wish): half as high as the bar, in the divider color; not next
   to the active or a hovered task (their background separates them), nor while dragging. */
.task + .task::before {
  content: '';
  position: absolute;
  top: 25%;
  bottom: 25%;
  left: -2px;
  width: 1px;
  background: var(--app-cockpit-divider, var(--ui-color-divider, light-dark(#dee2e6, #424242)));
  pointer-events: none;
}

.task:is([data-active], :hover)::before,
.task:is([data-active], :hover) + .task::before,
.bar[data-dragging] .task::before {
  opacity: 0;
}

/* Dragging (2026-10-07): the touch moves the task, it does not scroll the bar. While a task is dragged, the others
   slide aside; it is on top of them, lifted by a shadow. */
.task {
  touch-action: none;
}

.bar[data-dragging] {
  cursor: grabbing;

  & .task {
    transition: translate 150ms ease;
  }

  & .task-button,
  & .task-close {
    cursor: inherit;
  }

  & .task[data-dragged] {
    z-index: 1;
    background: var(--app-cockpit-background, var(--ui-color-background, Canvas));
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.2);
    color: inherit;
    transition: none;
  }

  & .task[data-dragged][data-active] {
    box-shadow:
      inset 0 2px 0 var(--app-cockpit-accent, var(--ui-color-accent, light-dark(#0a5cc2, #78b0ff))),
      0 1px 4px rgb(0 0 0 / 0.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bar[data-dragging] .task {
    transition: none;
  }
}

.task-button {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
  height: 100%;
  padding: 0 4px 0 10px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}

.task-icon {
  display: inline-flex;
  flex: none;
  color: var(--app-cockpit-accent, var(--ui-color-accent, light-dark(#0a5cc2, #78b0ff)));
  font-size: calc(var(--app-cockpit-font-size, 14px) * 16 / 14);

  & svg {
    width: 1em;
    height: 1em;
  }
}

/* A task without an icon: the first letters of its title in a rounded square (initialsIcon()). The letters are filled,
   not stroked; their size is in the SVG's units (24 = the icon's size). */
.icon--initials text {
  fill: currentColor;
  stroke: none;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: -0.3px;
  font-weight: 700;
}

.task-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  .task[data-active] & {
    font-weight: 500;
  }
}

/* The close button: shown on the active task, on hover and when focused. */
.task-close {
  display: inline-grid;
  flex: none;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-inline-end: 6px;
  padding: 0;
  border: 0;
  border-radius: var(--app-cockpit-radius, var(--ui-radius-sm, 2px));
  background: none;
  color: inherit;
  font-size: var(--app-cockpit-font-size, 14px);
  cursor: pointer;
  opacity: 0;

  .task:is(:hover, [data-active]) &,
  &:focus-visible {
    opacity: 1;
  }

  &:hover {
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
}

.icon {
  width: 1em;
  height: 1em;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

:focus-visible {
  outline: 2px solid var(--app-cockpit-accent, var(--ui-color-accent, light-dark(#0a5cc2, #78b0ff)));
  outline-offset: -2px;
}
`,Ai=class extends zr{static styles=Nn(ki);static properties={tasks:{attribute:!1},active:{}};#e=!1;#t;#n;#r=!1;#i;constructor(){super(),this.tasks=[],this.active=void 0}connectedCallback(){super.connectedCallback(),this.#i=new MutationObserver(()=>this.requestUpdate()),this.#i.observe(document.documentElement,{attributes:!0,attributeFilter:[`lang`]})}disconnectedCallback(){super.disconnectedCallback(),this.#i?.disconnect(),this.#m(!1)}updated(e){e.has(`tasks`)&&this.#t!==void 0&&(this.renderRoot.querySelector(`.task-button[data-id="${CSS.escape(this.#t)}"]`)?.focus(),this.#t=void 0),e.has(`tasks`)&&this.#e&&(this.#e=!1,this.shadowRoot?.activeElement===null&&this.#o().find(e=>e.matches(`.task-button[aria-pressed="true"]`))?.focus()),(e.has(`tasks`)||e.has(`active`))&&this.#a()}#a(){let e=this.renderRoot.querySelector(`.bar`),t=this.renderRoot.querySelector(`.task[data-active]`);e!==null&&t!==null&&(t.offsetLeft<e.scrollLeft?e.scrollLeft=t.offsetLeft-6:t.offsetLeft+t.offsetWidth>e.scrollLeft+e.clientWidth&&(e.scrollLeft=t.offsetLeft+t.offsetWidth-e.clientWidth+6))}#o(){return[...this.renderRoot.querySelectorAll(`.bar button`)]}#s(e,t){this.dispatchEvent(new CustomEvent(e,{detail:{id:t},bubbles:!0}))}#c(e,t){this.dispatchEvent(new CustomEvent(`task-move`,{detail:{id:e,index:t},bubbles:!0}))}#l=(e,t)=>{if(e.button!==0||this.#n!==void 0||e.target.closest(`.task-close`)!==null)return;let n=e.currentTarget;this.#n={id:t,task:n,pointerId:e.pointerId,startX:e.clientX,from:0,to:0,slots:[],gap:0},addEventListener(`pointermove`,this.#u),addEventListener(`pointerup`,this.#d),addEventListener(`pointercancel`,this.#f),addEventListener(`keydown`,this.#p,!0)};#u=e=>{let t=this.#n;if(t===void 0||e.pointerId!==t.pointerId)return;let n=e.clientX-t.startX;if(t.slots.length===0){if(Math.abs(n)<4)return;let e=[...this.renderRoot.querySelectorAll(`.task`)];t.slots=e.map(e=>({element:e,left:e.offsetLeft,width:e.offsetWidth})),t.from=e.indexOf(t.task),t.to=t.from,t.gap=(t.slots[1]?.left??0)-((t.slots[0]?.left??0)+(t.slots[0]?.width??0)),this.renderRoot.querySelector(`.bar`)?.setAttribute(`data-dragging`,``),t.task.setAttribute(`data-dragged`,``)}let r=t.slots[t.from],i=t.slots[0],a=t.slots[t.slots.length-1];if(r===void 0||i===void 0||a===void 0)return;e.preventDefault();let o=Math.max(i.left-r.left,Math.min(a.left+a.width-r.left-r.width,n)),s=r.left+o,c=e=>e.left+e.width/2;t.task.style.translate=`${o}px 0`,t.to=t.from+t.slots.filter((e,n)=>n>t.from&&s+r.width>c(e)).length-t.slots.filter((e,n)=>n<t.from&&s<c(e)).length,t.slots.forEach((e,n)=>{if(n===t.from)return;let i=n>t.from&&n<=t.to?-(r.width+t.gap):n<t.from&&n>=t.to?r.width+t.gap:0;e.element.style.translate=i===0?``:`${i}px 0`})};#d=e=>{e.pointerId===this.#n?.pointerId&&this.#m(!0)};#f=e=>{e.pointerId===this.#n?.pointerId&&this.#m(!1)};#p=e=>{e.key===`Escape`&&this.#n!==void 0&&this.#n.slots.length>0&&(e.preventDefault(),e.stopPropagation(),this.#m(!1))};#m(e){let t=this.#n;if(this.#n=void 0,removeEventListener(`pointermove`,this.#u),removeEventListener(`pointerup`,this.#d),removeEventListener(`pointercancel`,this.#f),removeEventListener(`keydown`,this.#p,!0),t!==void 0&&t.slots.length!==0){this.renderRoot.querySelector(`.bar`)?.removeAttribute(`data-dragging`),t.task.removeAttribute(`data-dragged`);for(let e of t.slots)e.element.style.translate=``;this.#r=!0,setTimeout(()=>this.#r=!1),e&&t.to!==t.from&&this.#c(t.id,t.to)}}#h(e){e.closable!==!1&&(this.#e=this.shadowRoot?.activeElement!==null,this.#s(`task-close`,e.id))}#g=e=>{let t=this.#o(),n=t.indexOf(this.shadowRoot?.activeElement);if(n<0)return;if(e.ctrlKey&&e.shiftKey&&(e.key===`ArrowLeft`||e.key===`ArrowRight`)){let r=t[n]?.dataset.id,i=this.tasks.findIndex(e=>e.id===r),a=i+(e.key===`ArrowLeft`?-1:1);e.preventDefault(),r!==void 0&&i>=0&&a>=0&&a<this.tasks.length&&(this.#t=r,this.#c(r,a));return}let r=e.key===`ArrowRight`?t[(n+1)%t.length]:e.key===`ArrowLeft`?t[(n-1+t.length)%t.length]:e.key===`Home`?t[0]:e.key===`End`?t[t.length-1]:void 0;if(r!==void 0)e.preventDefault(),r.focus();else if(e.key===`Delete`){let r=this.tasks.find(e=>e.id===t[n]?.dataset.id);r!==void 0&&(e.preventDefault(),this.#h(r))}};render(){let e=mi(document.documentElement.lang),t=this.tasks.some(e=>e.id===this.active)?this.active:this.tasks[0]?.id;return N`
      <div class="bar" role="toolbar" aria-label=${e.taskbar} @keydown=${this.#g}>
        ${ti(this.tasks,e=>e.id,n=>{let r=n.id===this.active;return N`
            <div
              class="task"
              ?data-active=${r}
              @pointerdown=${e=>this.#l(e,n.id)}
              @mousedown=${e=>e.button===1&&e.preventDefault()}
              @auxclick=${e=>e.button===1&&this.#h(n)}
            >
              <button
                type="button"
                class="task-button"
                data-id=${n.id}
                aria-pressed=${r?`true`:`false`}
                tabindex=${n.id===t?0:-1}
                title=${n.title}
                @click=${()=>this.#r||this.#s(`task-select`,n.id)}
              >
                ${n.icon===void 0?N`<span class="task-icon" aria-hidden="true">${Ei(n.title)}</span>`:N`<span class="task-icon" aria-hidden="true">${oi(n.icon)}</span>`}
                <span class="task-title">${n.title}</span>
              </button>
              ${n.closable===!1?P:N`<button
                type="button"
                class="task-close"
                data-id=${n.id}
                tabindex="-1"
                aria-label=${e.closeTask(n.title)}
                title=${e.closeTask(n.title)}
                @click=${()=>this.#h(n)}
              >${xi()}</button>`}
            </div>
          `})}
      </div>
    `}};function ji(){return class extends Ai{}}function Mi(){customElements.get(`app-taskbar`)===void 0&&customElements.define(`app-taskbar`,ji())}var Ni=class{open=!1;highlighted;options;triggerId;positionerId;popupId;#e;#t;#n;#r=``;#i=0;constructor(e,t,n){this.#e=e,this.triggerId=`${t}-trigger`,this.positionerId=`${t}-positioner`,this.popupId=`${t}-popup`,this.options=n}itemId(e){return`${this.popupId}-${e.replace(/\s+/g,`-`)}`}show(e){let t=this.#f();this.highlighted=this.options.selected?.()??(e===`first`?t[0]:e===`last`?t.at(-1):void 0),this.open=!0,document.addEventListener(`pointerdown`,this.#a,!0),this.#e.requestUpdate(),this.#e.updateComplete.then(()=>{this.open&&(this.#m()?.focus({preventScroll:!0}),this.#c())})}close(e=!1){this.open&&(this.open=!1,this.highlighted=void 0,this.#n?.(),this.#n=void 0,this.#t=void 0,document.removeEventListener(`pointerdown`,this.#a,!0),this.#e.requestUpdate(),e&&this.#p()?.focus())}choose(e){this.close(!0),this.options.onSelect(e)}rendered(){this.open&&this.#t!==void 0&&this.#p()!==this.#t&&this.close()}toggle=e=>{this.open?this.close():this.show(e.detail===0?`first`:void 0)};onTriggerKeyDown=e=>{let t={ArrowDown:`first`,ArrowUp:`last`}[e.key];t!==void 0&&(e.preventDefault(),this.show(t))};onPopupKeyDown=e=>{let t=this.#f(),n=this.highlighted===void 0?-1:t.indexOf(this.highlighted);switch(e.key){case`ArrowDown`:this.#o(t[(n+1)%t.length]);break;case`ArrowUp`:this.#o(t[n<=0?t.length-1:n-1]);break;case`Home`:this.#o(t[0]);break;case`End`:this.#o(t.at(-1));break;case`Enter`:case` `:this.highlighted!==void 0&&this.choose(this.highlighted);break;case`Escape`:this.close(!0);break;case`Tab`:this.close(!0);return;default:if(e.key.length!==1||e.ctrlKey||e.metaKey||e.altKey)return;this.#s(e.key)}e.preventDefault()};onPopupPointerMove=e=>{this.#o(this.#u(e),!1)};onPopupPointerLeave=()=>{this.#o(void 0,!1)};onPopupClick=e=>{let t=this.#u(e);t!==void 0&&this.choose(t)};#a=e=>{let t=e.composedPath(),n=this.#p(),r=this.#h(this.positionerId);(n===null||!t.includes(n))&&(r===null||!t.includes(r))&&this.close()};#o(e,t=!0){e!==this.highlighted&&(this.highlighted=e,this.#e.requestUpdate(),t&&e!==void 0&&this.#e.updateComplete.then(()=>this.#h(this.itemId(e))?.scrollIntoView({block:`nearest`})))}#s(e){let t=Date.now();this.#r=t-this.#i<500?this.#r+e.toLowerCase():e.toLowerCase(),this.#i=t;let n=this.#d(),r=n.findIndex(e=>e.dataset.value===this.highlighted),i=this.#r.length>1?Math.max(r,0):r+1,a=[...n.slice(i),...n.slice(0,i)].find(e=>(e.textContent??``).trim().toLowerCase().startsWith(this.#r));a!==void 0&&this.#o(a.dataset.value)}#c(){let e=this.#p(),t=this.#h(this.positionerId);if(e===null||t===null){this.close();return}let n=this.options.anchor,r=n===void 0?e:{getBoundingClientRect:()=>n(e),contextElement:e};this.#t=e,this.#n=_n(r,t,()=>void this.#l(r,t))}async#l(e,t){let{placement:n,sameWidth:r=!1,gutter:i=0}=this.options,a=await Dn(e,t,{placement:n,strategy:`fixed`,middleware:[vn(i),xn(),bn(),Sn({apply:({availableHeight:e,rects:n})=>{Object.assign(t.style,{width:r?`${n.reference.width}px`:``,minWidth:r?``:`max-content`,maxHeight:`${Math.max(0,Math.floor(e))}px`})}})]});Object.assign(t.style,{left:`${a.x}px`,top:`${a.y}px`});let o=this.#m();o!==null&&(o.style.transformOrigin=Pi(a.placement))}#u=e=>e.target.closest(`[data-value]`)?.dataset.value;#d(){return[...this.#m()?.querySelectorAll(`[data-value]`)??[]]}#f(){return this.#d().flatMap(e=>e.dataset.value??[])}#p(){return this.#h(this.triggerId)}#m(){return this.#h(this.popupId)}#h(e){return this.#e.renderRoot.querySelector(`#${CSS.escape(e)}`)}};function Pi(e){let[t=`bottom`,n]=e.split(`-`),r={top:`bottom`,bottom:`top`,left:`right`,right:`left`}[t],i=t===`top`||t===`bottom`,a=n===`start`?i?`left`:`top`:n===`end`?i?`right`:`bottom`:`center`;return i?`${a} ${r}`:`${r} ${a}`}var Fi=`
:host {
  /* The base size of the cockpit's text, and of its icons (every font-size here is a multiple of it, 14 being the size of
     the apps' normal text, Mantine's sm). No rem anywhere in this file (2026-10-04, the user's rule): a page's root font
     size must not change the cockpit. */
  --app-cockpit-font-size: 14px;
  --app-cockpit-sidebar-width: 256px;
  --app-cockpit-rail-width: 68px;
  /* The topbar's top line (nav="top"). */
  --app-cockpit-topbar-height: 52px;
  /* Around the open app (2026-10-06, the user's wish: 20px 24px before, then 12px 16px for a moment). */
  --app-cockpit-content-padding: 16px 20px;
  /* The sidebar is dark in both color schemes of the page (nav-scheme="page": it follows the page). */
  --app-cockpit-sidebar-scheme: dark;

  --app-cockpit-background: var(--ui-color-background, Canvas);
  --app-cockpit-text: var(--ui-color-text, CanvasText);
  --app-cockpit-muted: var(--ui-color-muted, light-dark(#666, #bbb));
  --app-cockpit-field: var(--ui-color-field, light-dark(#fff, #111));
  --app-cockpit-border: var(--ui-color-border, light-dark(#b2b8be, #696a6c));
  --app-cockpit-divider: var(--ui-color-divider, light-dark(#dee2e6, #424242));
  --app-cockpit-hover: var(--ui-color-hover, light-dark(#f5f5f5, #1d1d1d));
  --app-cockpit-subtle: var(--ui-color-subtle, light-dark(#f7f7f7, #1a1a1a));
  /* The accent: the host's --app-accent-color (one color; lighter in a dark scheme, e.g. the sidebar), else the design
     language's. Without it, --app-cockpit-host-accent is invalid (an unset var()), so the fallback counts. */
  --app-cockpit-host-accent: light-dark(var(--app-accent-color), color-mix(in oklab, var(--app-accent-color) 60%, white));
  --app-cockpit-accent: var(--app-cockpit-host-accent, var(--ui-color-accent, light-dark(#0a5cc2, #78b0ff)));
  --app-cockpit-shadow: var(--ui-shadow-md, 0 4px 12px light-dark(rgb(0 0 0 / 15%), rgb(0 0 0 / 60%)));
  --app-cockpit-radius: var(--ui-radius-sm, 2px);
  /* Named with the prefix: a plain --button-radius leaked into the mini-apps (light DOM children of this host), where
     Mantine's buttons read that very name for their radius: all of them got 5px (2026-10-04). */
  --app-cockpit-button-radius: var(--ui-radius-md, 5px);
  --app-cockpit-small: var(--app-cockpit-font-size);
  /* The sidebar's text: a bit smaller than the page's small text (the popups keep theirs). */
  --app-cockpit-sidebar-font-size: calc(var(--app-cockpit-font-size) * 13 / 14);
  --app-cockpit-sidebar-font-size-tiny: calc(var(--app-cockpit-font-size) * 10 / 14);
  /* The icons in the sidebar (and its popups): white strokes on the dark sidebar. */
  --app-cockpit-sidebar-icon: light-dark(#1f2328, #fff);
  --app-cockpit-sidebar: light-dark(#f4f5f7, #272a2f);
  --app-cockpit-selected: color-mix(in srgb, var(--app-cockpit-accent) 11%, transparent);
  --app-cockpit-ease: cubic-bezier(0.2, 0, 0, 1);

  display: block;
  height: 100%;
  min-height: 0;
  color: var(--app-cockpit-text);
}

/* nav-scheme="page": the navigation follows the page (light on a light page, dark on a dark one). A host's own
   --app-cockpit-sidebar-scheme still wins (the page's CSS comes before :host). In the topbar, a line below it. */
:host([nav-scheme='page']) {
  /* "initial" makes the property "not set" (guaranteed invalid), so the "inherit" of every var(…, inherit) counts: the
     page's scheme. ("normal" would be light, also on a dark page.) */
  --app-cockpit-sidebar-scheme: initial;

  /* A line below the topbar: a background, not a border (the line keeps its height; a triangle of the two-line topbar,
     removed 2026-10-08, covered it). White on a light page (2026-10-08, the user's wish: the sidebar's light gray looked
     like a toolbar there; like Jira Cloud's header), the sidebar's color on a dark one. */
  .top-line {
    background-color: light-dark(var(--app-cockpit-field), var(--app-cockpit-sidebar));
    background-image: linear-gradient(var(--app-cockpit-divider), var(--app-cockpit-divider));
    background-position: bottom;
    background-repeat: no-repeat;
    background-size: 100% 1px;
  }

  /* The badge's ring in the line's color. */
  .top-actions .footer-badge {
    border-color: light-dark(var(--app-cockpit-field), var(--app-cockpit-sidebar));
  }
}

/* The cockpit's own parts have a font of their own, so a mini-app's global CSS (e.g. a font on body) does not change
   them. The host itself keeps inheriting, so the mini-apps (its light-DOM children) do not get it. */
.frame,
.palette,
.tooltip {
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Closed popups are 'hidden'; their own 'display' must not show them. */
[hidden] {
  display: none !important;
}

.mount {
  position: relative;
  height: 100%;
}

button {
  font: inherit;
  color: inherit;
}

:focus-visible {
  outline: 2px solid var(--app-cockpit-accent);
  outline-offset: 2px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* An item without an icon: its framed initials (initialsIcon(), like the taskbar's), in the rail and the flyouts. The
   letters are filled, not stroked; their size is in the SVG's units (24 = the icon's size). */
.icon--initials text {
  fill: currentColor;
  stroke: none;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: -0.3px;
  font-weight: 700;
}

/* Every icon is 1em wide and high; its size is the font-size (here, or where it is used). */
.icon,
.tile svg,
.group-icon svg,
.menu-icon svg,
.footer-icon svg,
.brand-logo svg {
  width: 1em;
  height: 1em;
}

.icon {
  flex: none;
  font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* The frame: the sidebar, and the main area with the top bar and the content. */

.frame {
  display: grid;
  grid-template-columns: var(--app-cockpit-sidebar-width) minmax(0, 1fr);
  height: 100%;
  background: var(--app-cockpit-background);
  transition: grid-template-columns 320ms var(--app-cockpit-ease);

  &[data-rail] {
    grid-template-columns: var(--app-cockpit-rail-width) minmax(0, 1fr);
  }

  /* The taskbar (taskbar: true, 2026-10-07) below the open item; the sidebar over both rows. (In the topbar's column
     it simply follows the open item.) */
  &:has(> .taskbar) {
    grid-template-rows: minmax(0, 1fr) auto;

    & > .sidebar {
      grid-row: 1 / -1;
    }

    & > .taskbar {
      grid-column: 2;
    }
  }
}

/* Sidebar */

.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
  padding: 14px 12px 12px;
  border-right: 1px solid var(--app-cockpit-divider);
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  /* Every light-dark() color inside resolves to its dark side (also the ui-* tokens and the slotted parts). */
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  -webkit-user-select: none;
  user-select: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  /* The logo's left edge lines up with the app icons below. A subtle line below the header, from edge to edge of the
     sidebar (the margins undo the sidebar's padding). */
  margin: 0 -12px;
  padding: 0 14px 12px 20px;
  border-bottom: 1px solid var(--app-cockpit-divider);
  overflow: hidden;

  ::slotted([slot='logo']) {
    flex: none;
    max-width: 36px;
    max-height: 36px;
  }
}

/* The logo as the sidebar's toggle: a plain button around it. */
.brand-toggle {
  display: grid;
  flex: none;
  place-items: center;
  margin: 0 -4px;
  padding: 0 4px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover {
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }
}

/* The default logo: 22px (22px). */
.brand-logo svg {
  font-size: calc(var(--app-cockpit-font-size) * 22 / 14);
}

.brand-logo {
  display: grid;
  flex: none;
  place-items: center;
  width: 24px;
  height: 36px;
  /* Transparent, in the accent color (its dark-scheme side: the sidebar is dark). */
  color: var(--app-cockpit-accent);
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* With a start page (start-page): the logo is a button that opens it; only the pointer shows it (2026-10-08, the user's
   wish; the title, underlined on hover, for a few hours before). */
.brand-start-page {
  display: grid;
  flex: none;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--app-cockpit-radius);
  background: none;
  color: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--app-cockpit-accent);
    outline-offset: 2px;
  }
}

/* The optional subtitle under the title (the config's subtitle), small and muted. */
.brand-subtitle {
  overflow: hidden;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.15;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* Room for the descenders (the line is tight; overflow is hidden for the ellipsis), without moving anything. */
  padding-bottom: 0.15em;
  margin: -1px 0 -0.15em;
}

.brand-title {
  overflow: hidden;
  font-size: calc(var(--app-cockpit-font-size) * 15 / 14);
  line-height: 1.15;
  font-weight: 650;
  letter-spacing: -0.01em;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-bottom: 0.15em;
  margin-bottom: -0.15em;
}

.search-button {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--app-cockpit-muted);
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover {
    background: var(--app-cockpit-hover);
    color: var(--app-cockpit-text);
  }

  &:focus-visible {
    outline-offset: -2px;
  }
}

.key {
  flex: none;
  padding: 1px 5px;
  border: 1px solid var(--app-cockpit-divider);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--app-cockpit-background);
  color: var(--app-cockpit-muted);
  font-family: inherit;
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  font-weight: 500;
  line-height: 1.4;
}

.nav {
  flex: 1;
  min-height: 0;
  margin: 0 -12px;
  padding: 0 12px 8px;
  overflow: auto;
  /* No bounce at its ends (Firefox's elastic overscroll), and the page does not scroll on (2026-10-08; "contain"
     before, which kept the bounce). The same for every scroll area of the cockpit. */
  overscroll-behavior: none;
  scrollbar-width: thin;
  scrollbar-color: var(--app-cockpit-divider) transparent;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.section + .section,
.section + .group,
.group + .section,
.group + .group {
  margin-top: 12px;
}

.section-label {
  margin: 0 0 4px;
  padding: 0 10px;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.section-rule {
  height: 1px;
  margin: 0 8px 12px;
  border: 0;
  background: var(--app-cockpit-divider);

  .section:first-child > & {
    display: none;
  }
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 36px;
  padding: 4px 8px 4px 6px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  font-size: var(--app-cockpit-sidebar-font-size);
  text-align: left;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover {
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  /* A group of the rail while its flyout is open. */
  &[data-state='open'] {
    background: var(--app-cockpit-hover);
  }

  &[aria-current='page'],
  &[aria-current='true'] {
    background: var(--app-cockpit-selected);
    color: var(--app-cockpit-accent);
    font-weight: 600;

    &::before {
      position: absolute;
      top: 8px;
      bottom: 8px;
      left: -12px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--app-cockpit-accent);
      content: '';
    }
  }
}

.item-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* An open item (with the taskbar, 2026-10-07), like the open one in the search panel: a dot right after its title (also
   in the flyouts). Not at the end of the row: that is kept for badges (later). In the rail, which has no titles, on the
   bottom right corner of its icon (a ring in the sidebar's color around it). */
.running-dot {
  flex: none;
  width: 5px;
  height: 5px;
  margin-inline-start: -5px;
  border-radius: 50%;
  background: var(--app-cockpit-accent);
  /* A bit above the middle of the text, like a superscript (2026-10-07, the user's wish; 6px in the middle before). */
  translate: 0 -4px;

  .tile > & {
    position: absolute;
    right: 2px;
    bottom: 3px;
    width: 7px;
    height: 7px;
    margin: 0;
    box-shadow: 0 0 0 2px var(--app-cockpit-sidebar);
    translate: none;
  }
}

.tile:has(> .running-dot) {
  position: relative;
}

.group-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 28px;
  margin-bottom: 2px;
  padding: 0 8px 0 6px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    background: var(--app-cockpit-hover);
    color: var(--app-cockpit-text);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron {
    font-size: calc(var(--app-cockpit-font-size) * 14 / 14);
    stroke-width: 2.25;
    transition: rotate 150ms var(--app-cockpit-ease);
  }

  &[data-panel-open] .icon--chevron {
    rotate: 90deg;
  }
}

/* The second level: a subgroup in a group, its apps indented along a guide line. */

.subgroup-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 32px;
  padding: 0 8px 0 7px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--app-cockpit-text);
  font-size: var(--app-cockpit-sidebar-font-size);
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron {
    font-size: calc(var(--app-cockpit-font-size) * 14 / 14);
    color: var(--app-cockpit-muted);
    stroke-width: 2.25;
    transition: rotate 150ms var(--app-cockpit-ease);
  }

  &[data-panel-open] .icon--chevron {
    rotate: 90deg;
  }
}

.subgroup-name {
  flex: 1;
  overflow: hidden;
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.subgroup-count {
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  font-weight: 500;
}

.subgroup-list {
  margin: 1px 0 4px 14px;
  padding-left: 6px;
  border-left: 1px solid var(--app-cockpit-divider);

  .item[aria-current='page']::before {
    left: -7px;
    top: 6px;
    bottom: 6px;
  }
}

.group-name {
  flex: 1;
  overflow: hidden;
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.group-count {
  min-width: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--app-cockpit-divider);
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  letter-spacing: 0;
  text-align: center;
}

/* The host's part at the bottom of the sidebar (the slot 'sidebar-end'), e.g. global switches; hidden in the rail. */
.sidebar-end ::slotted(*) {
  display: block;
  margin: 0 2px 12px;
}

/* The group select (groupDisplay: 'select'): the chosen group, its count, and the popup with all groups. */

.group-select {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 40px;
  padding: 0 8px 0 12px;
  /* No line at rest, only on hover and while open (2026-10-05, the user's wish; the divider color at rest before): its
     ground sets it apart. Transparent, not none, so nothing moves. */
  border: 1px solid transparent;
  border-radius: var(--app-cockpit-button-radius);
  /* In a light sidebar a light gray, a step darker than the sidebar (2026-10-05, the user's wish; white before); in a
     dark one the field color as before. */
  background: light-dark(#e3e6ea, var(--app-cockpit-field));
  font-size: var(--app-cockpit-sidebar-font-size);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms;

  &:hover,
  &[data-state='open'] {
    border-color: var(--app-cockpit-border);
  }

  .group-count {
    flex: none;
  }
}

/* The icon of a group or a subgroup, in the accent color. */
.group-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 20px;
  height: 20px;
  color: var(--app-cockpit-accent);

  svg {
    font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
  }

  .select-item & {
    grid-column: 2;
  }

  .subgroup-trigger & {
    width: 18px;
    height: 18px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
    }
  }

  .group-trigger & {
    width: 16px;
    height: 16px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 15 / 14);
    }
  }
}

/* In the sidebar: a bit wider than the apps below it (the negative margins take back part of the sidebar's padding and
   gap), round corners. */
.sidebar > .group-select {
  width: auto;
  margin: -7px -7px 0;
}

.group-select-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.group-select-icon {
  display: flex;
  color: var(--app-cockpit-muted);

  .icon {
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
  }
}

.select-positioner {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  outline: none;
}

.select-popup {
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  /* As wide as its positioner (the trigger's width), and its list scrolls in the room left in the window. */
  display: flex;
  flex-direction: column;
  max-height: inherit;
  padding: 4px;
  border: 1px solid var(--app-cockpit-divider);
  border-radius: 8px;
  background: var(--app-cockpit-field);
  color: var(--app-cockpit-text);
  box-shadow: var(--app-cockpit-shadow);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  transition: opacity 120ms, scale 120ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    scale: 0.98;
  }
}

.select-list {
  min-height: 0;
  max-height: 384px;
  overflow-y: auto;
  overscroll-behavior: none;
  scrollbar-width: thin;
}

.select-item {
  display: grid;
  grid-template-columns: 16px auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: var(--app-cockpit-small);
  cursor: pointer;
  outline: none;
  -webkit-user-select: none;
  user-select: none;

  &[data-highlighted] {
    background: var(--app-cockpit-hover);
  }

  &[aria-selected='true'] {
    color: var(--app-cockpit-accent);
    font-weight: 600;
  }
}

.select-indicator {
  grid-column: 1;
  display: flex;

  .icon {
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
    stroke-width: 2.25;
  }
}

.select-item-text {
  grid-column: 3;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.select-item-count {
  grid-column: 4;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  font-weight: 400;
}

/* The signed-in user, above the footer: from edge to edge of the sidebar, a line on top. */
.user-row {
  flex: none;
  margin: 0 -12px;
  padding: 6px 8px;
  border-top: 1px solid var(--app-cockpit-divider);
}

.user-button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 4px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;

  &:is(button) {
    cursor: pointer;
  }

  &:is(button):hover,
  &[data-state='open'] {
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron-right {
    margin-left: auto;
    color: var(--app-cockpit-muted);
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
  }
}

/* The user's picture, or their initials on the accent color. */
.avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: color-mix(in srgb, var(--app-cockpit-accent) 35%, var(--app-cockpit-sidebar));
  /* White on the dark navigation, the accent on a light one (nav-scheme="page"). */
  color: light-dark(var(--app-cockpit-accent), #fff);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  font-weight: 650;
  letter-spacing: 0.02em;
}

.user-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.user-name,
.user-detail {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-name {
  font-size: var(--app-cockpit-sidebar-font-size);
  font-weight: 600;
}

.user-detail {
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
}

/* The footer: a dark bar of segments (the toggle, the host's actions, the kebab menu), flush with the sidebar's
   edges. */

.footer {
  /* The dark side: the dark navigation (the default); the light side: a light one (nav-scheme="page"), a light gray. */
  --app-cockpit-footer-background: light-dark(#e6e8eb, #31353b);
  --app-cockpit-footer-text: light-dark(#40454c, #c4c7cc);
  --app-cockpit-footer-hover: light-dark(rgb(0 0 0 / 6%), rgb(255 255 255 / 7%));
  --app-cockpit-footer-divider: light-dark(rgb(0 0 0 / 9%), rgb(255 255 255 / 10%));

  display: flex;
  flex: none;
  align-items: stretch;
  min-height: 44px;
  margin: 0 -12px -12px;
  background: var(--app-cockpit-footer-background);
  color: var(--app-cockpit-footer-text);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
}

.footer-actions {
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: center;
  min-width: 0;
}

.footer-button {
  position: relative;
  display: grid;
  flex: none;
  place-items: center;
  width: 46px;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover,
  &[data-state='open'] {
    background: var(--app-cockpit-footer-hover);
    color: light-dark(#111, #fff);
  }

  &:focus-visible {
    outline-color: light-dark(#9ec5ff, var(--app-cockpit-accent));
    outline-offset: -3px;
  }

  .icon {
    font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
  }
}

/* The host's actions share the room between the toggle and the kebab. */
.footer-actions > .footer-button {
  flex: 1 1 0;
  width: auto;
  min-width: 40px;
}

/* The segments: the toggle and the kebab apart from the actions, by a line. */
.footer-toggle {
  box-shadow: 1px 0 0 var(--app-cockpit-footer-divider);
}

.footer-more {
  box-shadow: -1px 0 0 var(--app-cockpit-footer-divider);
}

.footer-icon {
  display: grid;
  place-items: center;

  svg {
    font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
  }
}

.footer-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 8px;
  height: 8px;
  border: 2px solid var(--app-cockpit-footer-background);
  border-radius: 50%;
  background: light-dark(#ff6b5b, #ff7b6b);
  box-sizing: content-box;
}

/* The menu of the kebab button. */

/* Placed by its menu (menu.ts: left, top, width, max-height). */
.menu-positioner {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  outline: none;
}

.menu-popup {
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  min-width: 208px;
  padding: 4px;
  border: 1px solid var(--app-cockpit-divider);
  border-radius: 8px;
  background: var(--app-cockpit-field);
  color: var(--app-cockpit-text);
  box-shadow: var(--app-cockpit-shadow);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  outline: none;
  transition: opacity 120ms, scale 120ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    scale: 0.97;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: var(--app-cockpit-small);
  cursor: pointer;
  outline: none;
  -webkit-user-select: none;
  user-select: none;

  &[data-highlighted] {
    background: var(--app-cockpit-hover);
  }

  .key {
    margin-left: auto;
  }
}

.menu-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 16px;
  height: 16px;
  color: var(--app-cockpit-muted);

  svg {
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
  }
}

/* An item's icon in a dropdown of the topbar's line (a folder, "More"): the accent, like the other popups. */
.menu-icon--item {
  color: var(--app-cockpit-accent);
}

.menu-label {
  flex: 1;
  white-space: nowrap;
}

/* A menu of the footer in the rail: a plain panel that touches the sidebar, like the groups' flyouts (square corners,
   a line between them, the sidebar's colors), but only as high as its entries. */
.menu-popup[data-flush] {
  padding: 6px;
  border: 0;
  border-left: 1px solid var(--app-cockpit-divider);
  border-radius: 0;
  background: var(--app-cockpit-sidebar);
  box-shadow: 8px 0 24px rgb(0 0 0 / 18%);

  .menu-item {
    font-size: var(--app-cockpit-sidebar-font-size);
  }

  /* The highlight from the text color: the hover token is about the panel's color. */
  .menu-item[data-highlighted] {
    background: color-mix(in srgb, var(--app-cockpit-text) 9%, transparent);
  }

  @starting-style {
    opacity: 0;
    scale: 1;
    translate: -6px 0;
  }
}

/* With the sidebar expanded: a sheet on top of the footer, as wide as the sidebar (the line on top, the shadow upwards). */
.menu-popup[data-sheet] {
  border-top: 1px solid var(--app-cockpit-divider);
  border-left: 0;
  box-shadow: 0 -8px 24px rgb(0 0 0 / 18%);

  .menu-item[data-highlighted] {
    background: color-mix(in srgb, var(--app-cockpit-text) 9%, transparent);
  }

  @starting-style {
    translate: 0 6px;
  }
}

/* A menu of the topbar: a plain panel like the sidebar's (square corners, the sidebar's colors and text size), its top
   touching its line (a line between them), the shadow downwards. */
.menu-popup[data-drop] {
  padding: 6px;
  border: 0;
  border-top: 1px solid var(--app-cockpit-divider);
  border-radius: 0;
  background: var(--app-cockpit-sidebar);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);

  .menu-item {
    font-size: var(--app-cockpit-sidebar-font-size);
  }

  /* The highlight (hover, arrow keys) from the text color: the hover token is about the panel's color in the light
     scheme (with nav-scheme="page"). */
  .menu-item[data-highlighted] {
    background: color-mix(in srgb, var(--app-cockpit-text) 9%, transparent);
  }

  @starting-style {
    opacity: 0;
    scale: 1;
    translate: 0 -6px;
  }
}

/* The app switcher (nav="top-switcher"): the open app as a dropdown button in the top line; its panel is the search
   panel, below the line at the button, a plain panel like the topbar's menus. */
.top-line .switcher {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  max-width: 320px;
  height: 32px;
  margin-left: 4px;
  padding: 0 6px 0 8px;
  border: 1px solid var(--app-cockpit-divider);
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--app-cockpit-sidebar-font-size);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 120ms, border-color 120ms;

  &:hover,
  &[aria-expanded='true'] {
    border-color: var(--app-cockpit-border);
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 17 / 14);
    }
  }

  .icon--selector {
    flex: none;
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
    color: var(--app-cockpit-muted);
  }
}

.switcher-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mount[data-layout='topbar'][data-nav-style='switcher'] .palette {
  right: auto;
  left: var(--app-cockpit-switcher-left, 0px);
  width: min(416px, 100% - var(--app-cockpit-switcher-left, 0px));
  margin-inline: 0;
  border-radius: 0;
}

.menu-popup--choices {
  min-width: 176px;
}

.menu-group-label {
  padding: 6px 8px 4px;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* The check of a choice: only on the chosen one (the space stays, so the labels stay aligned). */
.menu-check {
  color: var(--app-cockpit-accent);

  &:not([data-checked]) svg {
    visibility: hidden;
  }

  .icon {
    stroke-width: 2.25;
  }
}

.menu-item[data-checked] {
  color: var(--app-cockpit-accent);
  font-weight: 600;
}

/* The flyout of a group in the rail: a panel at its button, touching the sidebar (square corners, a line between them),
   in its colors, only as high as its content; its apps by subgroup; long ones scroll. */
.flyout {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 240px;
  /* The room left in the window (its positioner's). */
  max-height: inherit;
  padding: 12px 8px;
  overflow-y: auto;
  overscroll-behavior: none;
  border-left: 1px solid var(--app-cockpit-divider);
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  box-shadow: 8px 0 24px rgb(0 0 0 / 18%);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  font-size: var(--app-cockpit-sidebar-font-size);
  outline: none;
  scrollbar-width: thin;
  -webkit-user-select: none;
  user-select: none;
  transition: opacity 120ms, translate 150ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    translate: -6px 0;
  }
}

.flyout-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 10px;
  font-size: calc(var(--app-cockpit-font-size) * 15 / 14);
  font-weight: 650;
}

.flyout-label {
  padding: 12px 8px 4px;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.flyout-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  cursor: pointer;
  outline: none;

  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 17 / 14);
    }
  }

  &[data-highlighted] {
    background: color-mix(in srgb, var(--app-cockpit-text) 9%, transparent);
  }

  &[data-current] {
    background: var(--app-cockpit-selected);
    color: var(--app-cockpit-accent);
    font-weight: 600;
  }
}

.menu-separator {
  height: 1px;
  margin: 4px 6px;
  background: var(--app-cockpit-divider);
}

/* The highlighted item of a menu, from the keyboard (2026-10-08, the user's wish): the focus ring of the other buttons
   (e.g. the two-pane menus' items). The popup has the focus (the item only aria-activedescendant); it matches
   :focus-visible only after keyboard input, so the mouse keeps the plain highlight. */
:is(.menu-popup, .flyout, .select-popup):focus-visible [data-highlighted] {
  outline: 2px solid var(--app-cockpit-accent);
  outline-offset: -2px;
}

/* The icons of the sidebar (apps, groups, subgroups): white strokes, in place of the accent color. Its popups (the
   rail's flyouts, the group select) keep the accent, like the search palette (2026-10-06, the user's wish); they are
   in the sidebar's DOM, so they set it back. */
.sidebar {
  .tile,
  .group-icon {
    color: var(--app-cockpit-sidebar-icon);
  }

  :is(.flyout, .select-popup) :is(.tile, .group-icon) {
    color: var(--app-cockpit-accent);
  }
}

/* The handle on the sidebar's right edge (not in the rail): a thin line in the accent color while hovered, dragged
   or focused. While dragging, the width follows the pointer at once (no transition). */
.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  bottom: 0;
  z-index: 2;
  width: 6px;
  cursor: col-resize;
  touch-action: none;

  &::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 2px;
    width: 2px;
    background: transparent;
    content: '';
    transition: background-color 120ms;
  }

  &:hover::after,
  &:focus-visible::after,
  .frame[data-resizing] &::after {
    background: var(--app-cockpit-accent);
  }

  &:focus-visible {
    outline: none;
  }
}

.frame[data-resizing] {
  transition: none;
  cursor: col-resize;
  user-select: none;
}

/* The rail: icons only, centered. */

.frame[data-rail] {
  .sidebar {
    padding-inline: 10px;
  }

  .brand {
    justify-content: center;
    margin-inline: -10px;
    padding: 0 0 12px;
  }

  .brand-text,
  .sidebar-end,
  .item-title,
  .section-label {
    display: none;
  }

  .search-button {
    width: 100%;
    height: 36px;
    margin-left: 0;
  }

  .item {
    justify-content: center;
    padding-inline: 0;
  }

  .item[aria-current='page']::before {
    left: -10px;
  }

  .user-row {
    margin-inline: -10px;
    padding-inline: 10px;
  }

  .user-button {
    justify-content: center;
    padding-inline: 0;
  }

  .user-text,
  .icon--chevron-right {
    display: none;
  }

  .footer,
  .footer-actions {
    flex-direction: column;
  }

  .footer {
    margin-inline: -10px;
  }

  .footer-button {
    width: 100%;
  }

  .footer-toggle {
    order: 3;
    box-shadow: 0 -1px 0 var(--app-cockpit-footer-divider);
  }

  .footer-more {
    box-shadow: 0 -1px 0 var(--app-cockpit-footer-divider);
  }

  .footer-toggle .icon--panel {
    scale: -1 1;
  }

  .nav {
    margin-inline: -10px;
    padding-inline: 10px;
  }
}

/* The icon of an app (or its initials): no background, drawn in the accent color. */

.tile {
  display: grid;
  flex: none;
  place-items: center;
  width: 28px;
  height: 28px;
  color: var(--app-cockpit-accent);
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;

  svg {
    font-size: calc(var(--app-cockpit-font-size) * 20 / 14);
  }
}

/* Main: the open app, nothing else. */

.main {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: var(--app-cockpit-content-padding);
  overflow: auto;
  overscroll-behavior: none;

  /* Less in the topbars and beside the rail (2026-10-08, the user's wish): the app has more room there. A plain value
     (no property of its own): the host's --app-cockpit-content-padding counts only beside the expanded sidebar and the
     bottom bar. */
  .mount[data-layout='topbar'] &,
  .frame[data-rail] & {
    padding: 12px 16px;
  }
}

/* An app that is not open is hidden, even if its own CSS sets a display (an outer rule would win over a normal one). */
::slotted([hidden]) {
  display: none !important;
}

/* The start page (startPage, 2026-10-08): while no app is open. In the page's scheme: the title, the filter as a large
   field, and the apps as cards, by folder, in a grid. */
.start-page {
  padding: 40px 0 56px;
}

.start-page-inner {
  display: flex;
  flex-direction: column;
  gap: 36px;
  max-width: 1080px;
  margin: 0 auto;
}

.start-page-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.start-page-title {
  margin: 0;
  font-size: calc(var(--app-cockpit-font-size) * 28 / 14);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.start-page-subtitle {
  margin: 0;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 15 / 14);
}

/* The filter (2026-10-08; a field-like button that opened the search panel before): the icon, the input, a clear
   button while there is text. The frame is the field's; the accent while hovered or focused. */
.start-page-search {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(100%, 36rem);
  height: 44px;
  margin-top: 20px;
  padding: 0 6px 0 14px;
  border: 1px solid var(--app-cockpit-border);
  border-radius: var(--app-cockpit-button-radius);
  background: var(--app-cockpit-field);
  color: var(--app-cockpit-muted);
  transition: border-color 120ms;

  &:hover {
    border-color: var(--app-cockpit-accent);
  }

  &:focus-within {
    border-color: var(--app-cockpit-accent);
    outline: 2px solid color-mix(in srgb, var(--app-cockpit-accent) 25%, transparent);
  }

  > svg {
    flex: none;
    font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
  }
}

.start-page-search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background: none;
  color: var(--app-cockpit-text);
  font: inherit;
  font-size: calc(var(--app-cockpit-font-size) * 15 / 14);

  &::placeholder {
    color: var(--app-cockpit-muted);
  }

  /* The browser's own clear button: ours is there. */
  &::-webkit-search-cancel-button {
    appearance: none;
  }
}

.start-page-search-clear {
  display: grid;
  flex: none;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: var(--app-cockpit-button-radius);
  background: none;
  color: var(--app-cockpit-muted);
  cursor: pointer;

  &:hover {
    background: var(--app-cockpit-hover);
    color: var(--app-cockpit-text);
  }

  &:focus-visible {
    outline: 2px solid var(--app-cockpit-accent);
    outline-offset: -2px;
  }
}

/* No card matches the filter. */
.start-page-empty {
  margin: 0;
  color: var(--app-cockpit-muted);
  text-align: center;
}

.start-page-section {
  min-width: 0;
}

/* A folder's name: small, uppercase, muted, with its icon. */
.start-page-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.start-page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* An app: its icon on a light ground of the accent, its title, its description (two lines at most). */
.start-page-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  height: 100%;
  padding: 14px;
  border: 1px solid var(--app-cockpit-divider);
  border-radius: var(--ui-radius-lg, 6px);
  background: var(--app-cockpit-background);
  color: var(--app-cockpit-text);
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: border-color 120ms, box-shadow 120ms;

  &:hover {
    border-color: color-mix(in srgb, var(--app-cockpit-accent) 45%, var(--app-cockpit-divider));
    box-shadow: var(--app-cockpit-shadow);
  }

  &:focus-visible {
    outline: 2px solid var(--app-cockpit-accent);
    outline-offset: 2px;
  }

  .tile {
    width: 38px;
    height: 38px;
    border-radius: var(--app-cockpit-button-radius);
    background: var(--app-cockpit-selected);
  }
}

.start-page-card-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding-top: 1px;
}

.start-page-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;

  .running-dot {
    margin: 0;
    translate: none;
  }
}

.start-page-card-description {
  display: -webkit-box;
  overflow: hidden;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 13 / 14);
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (prefers-reduced-motion: reduce) {
  .start-page-search,
  .start-page-card {
    transition: none;
  }
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 192px;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-small);

  p {
    margin: 0;
  }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--app-cockpit-divider);
  border-top-color: var(--app-cockpit-accent);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to {
    rotate: 1turn;
  }
}

.retry-button {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--app-cockpit-border);
  border-radius: var(--app-cockpit-button-radius);
  background: var(--app-cockpit-field);
  cursor: pointer;

  &:hover {
    background: var(--app-cockpit-hover);
  }
}

/* Tooltips (the labels of the rail): a popover, in the top layer (also above an open dialog). */

.tooltip {
  position: fixed;
  inset: auto;
  top: 0;
  left: 0;
  z-index: 1100;
  margin: 0;
  overflow: visible;
  border: 0;
  pointer-events: none;
  padding: 5px 8px;
  border-radius: 6px;
  background: light-dark(#1f2328, #e8eaed);
  color: light-dark(#fff, #111);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  font-weight: 500;
  box-shadow: var(--app-cockpit-shadow);
  transition: opacity 120ms, translate 120ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    translate: -4px 0;
  }

  &[data-side='top'] {
    @starting-style {
      translate: 0 4px;
    }
  }
}

/* Not shown until Floating UI has placed it. */
.tooltip:not([data-open]) {
  visibility: hidden;
}

/* The search and the bottom bar's sheet are modal <dialog>s (2026-10-08; Zag.js before), in the top layer: the element
   sets each to the cockpit's rectangle (left, top, width, height), so their parts lie in the cockpit as before. */
.dialog {
  position: fixed;
  inset: auto;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  overflow: visible;
  border: 0;
  background: transparent;
  color: inherit;

  &::backdrop {
    background: transparent;
  }
}

/* The search (command palette) */

.backdrop {
  position: absolute;
  inset: 0;
  z-index: 1000;
  /* Only darker, no blur; only the open app (it starts where the rail ends: the sidebar is a rail while the search is
     open). */
  left: var(--app-cockpit-rail-width);
  background: light-dark(rgb(0 0 0 / 45%), rgb(0 0 0 / 60%));
  transition: opacity 150ms;

  @starting-style {
    opacity: 0;
  }
}

.palette {
  position: absolute;
  top: 0;
  bottom: 0;
  /* Right next to the rail (the sidebar is a rail while the search is open). */
  left: var(--app-cockpit-rail-width);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  width: min(416px, 100%);
  overflow: hidden;
  border-left: 1px solid var(--app-cockpit-divider);
  /* Dark like the sidebar, in both schemes of the page (it belongs to the cockpit's frame). */
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  box-shadow: 8px 0 24px rgb(0 0 0 / 22%);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  transition: opacity 150ms, translate 180ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    translate: -8px 0;
  }

  &:focus-visible {
    outline: none;
  }
}

/* Opened with the sidebar expanded: the sidebar collapses first, then the search slides in. The search's
   layer and the backdrop start at the sidebar's edge and move along with it (the frame's transition). */
.mount[data-layout='sidebar'][data-palette-from-expanded] {
  .palette-layer,
  .backdrop {
    transition: left 320ms var(--app-cockpit-ease), opacity 150ms;

    @starting-style {
      left: var(--app-cockpit-sidebar-width);
    }
  }

  .backdrop {
    @starting-style {
      opacity: 0;
    }
  }

  /* First the sidebar collapses, then the search slides in (hidden until then). */
  .palette {
    animation-delay: 320ms;
    animation-fill-mode: backwards;
  }
}

/* Closing (sidebar layout): the search slides back out to the left and the backdrop fades, while the sidebar expands
   again (if it was expanded): the layer and the backdrop move back to its edge with it. */
.mount[data-layout='sidebar'][data-palette-closing] {
  .palette {
    pointer-events: none;
    animation: palette-out 240ms cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  .backdrop {
    animation: backdrop-out 240ms forwards;
  }

  /* The sidebar expands as fast as the search slides out. */
  .frame {
    transition-duration: 240ms;
  }

  &:has(.frame:not([data-rail])) {
    .palette-layer,
    .backdrop {
      left: var(--app-cockpit-sidebar-width);
      transition: left 240ms var(--app-cockpit-ease);
    }
  }
}

@keyframes palette-out {
  to {
    translate: -100% 0;
  }
}

@keyframes backdrop-out {
  to {
    opacity: 0;
  }
}

/* The sidebar layout: the search slides in from behind the rail, left to right. Its layer starts where the rail ends
   and clips it, so it does not pass over the rail. */
.mount[data-layout='sidebar'] {
  .palette-layer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: var(--app-cockpit-rail-width);
    z-index: 1001;
    overflow: hidden;
    pointer-events: none;
  }

  /* A keyframe animation, not a transition from @starting-style: that did not run again after the slide out. */
  .palette {
    left: 0;
    pointer-events: auto;
    transition: none;
    animation: palette-in 320ms var(--app-cockpit-ease);
  }
}

@keyframes palette-in {
  from {
    translate: -100% 0;
  }
}

.palette-field {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid var(--app-cockpit-divider);
  color: var(--app-cockpit-muted);

  .icon {
    font-size: calc(var(--app-cockpit-font-size) * 20 / 14);
  }

  /* The close button: the highlight from the text color (the hover token is about the panel's color). */
  .search-button:hover {
    background: color-mix(in srgb, var(--app-cockpit-text) 9%, transparent);
  }
}

.palette-input {
  flex: 1;
  min-width: 0;
  height: 52px;
  border: 0;
  background: transparent;
  color: var(--app-cockpit-text);
  font: inherit;
  font-size: calc(var(--app-cockpit-font-size) * 16 / 14);

  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: var(--app-cockpit-muted);
  }
}

.palette-list {
  flex: 1;
  min-height: 0;
  padding: 6px;
  overflow: auto;
  overscroll-behavior: none;
  scroll-padding: 6px;
  scrollbar-width: thin;
}

.palette-section {
  padding: 10px 10px 4px;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.palette-option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;

  &[data-current] {
    background: var(--app-cockpit-selected);
  }
}

.palette-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.palette-title {
  overflow: hidden;
  font-size: var(--app-cockpit-small);
  font-weight: 550;
  white-space: nowrap;
  text-overflow: ellipsis;

  mark {
    border-radius: 2px;
    background: color-mix(in srgb, var(--app-cockpit-accent) 22%, transparent);
    color: inherit;
  }
}

.palette-description {
  overflow: hidden;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.palette-group {
  flex: none;
  max-width: 224px;
  padding: 1px 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--app-cockpit-subtle);
  box-shadow: inset 0 0 0 1px var(--app-cockpit-divider);
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.palette-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--app-cockpit-accent);
}

.palette-empty {
  margin: 0;
  padding: 40px 16px;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-small);
  text-align: center;
}

.palette-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--app-cockpit-divider);
  /* As light as the panel in a light one (nav-scheme="page" on a light page; white was tried), a darker strip in a dark
     one. */
  background: light-dark(transparent, rgb(0 0 0 / 14%));
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

.palette-count {
  margin-left: auto;
}

/* The topbar (nav="top"): a dark top line (logo, title, groups, search, actions, user), and a light line with
   the apps of the chosen group. Entries that do not fit wrap into a hidden second row (counted, and shown in "More"). */

.mount[data-layout='topbar'] {
  .frame {
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
  }

  /* The search: a panel below the top line, centered, only as high as its content. */
  .backdrop {
    top: var(--app-cockpit-topbar-height);
    left: 0;
  }

  .palette {
    top: var(--app-cockpit-topbar-height);
    right: 0;
    bottom: auto;
    left: 0;
    width: min(576px, 100% - 32px);
    max-height: min(544px, 100% - var(--app-cockpit-topbar-height) - 32px);
    margin-inline: auto;
    border: 1px solid var(--app-cockpit-divider);
    border-top: 0;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 12px 32px rgb(0 0 0 / 28%);

    @starting-style {
      opacity: 0;
      translate: 0 -8px;
    }
  }
}

.topbar {
  flex: none;
  -webkit-user-select: none;
  user-select: none;
}

/* The bottom bar (nav="bottom", or "auto" when narrow; 2026-10-06): the open app over the whole height, a bar below it
   in the sidebar's colors (Apps, the three apps used last, the search), above the device's home indicator. */
.mount[data-layout='bottom'] {
  .frame {
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
  }

  /* The search over the whole cockpit, sliding up. */
  .backdrop {
    left: 0;
  }

  .palette {
    top: auto;
    left: 0;
    width: 100%;
    height: 100%;
    border-left: 0;
    box-shadow: none;

    @starting-style {
      opacity: 0;
      translate: 0 24px;
    }
  }
}

.bottombar {
  display: flex;
  flex: none;
  align-items: stretch;
  padding: 0 4px env(safe-area-inset-bottom);
  border-top: 1px solid var(--app-cockpit-divider);
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  -webkit-user-select: none;
  user-select: none;
}

/* An entry: its icon above a short label, all equally wide. */
.bottom-item {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  height: 56px;
  padding: 4px 2px;
  border: 0;
  background: transparent;
  color: var(--app-cockpit-muted);
  cursor: pointer;
  transition: color 120ms;

  .icon,
  .tile svg {
    font-size: calc(var(--app-cockpit-font-size) * 20 / 14);
  }

  .tile {
    width: auto;
    height: auto;
    color: inherit;
  }

  &:hover {
    color: var(--app-cockpit-text);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  /* The open app, and "Apps" while its sheet is open. */
  &[aria-current='page'],
  &[aria-expanded='true'] {
    color: var(--app-cockpit-accent);
  }
}

.bottom-label {
  max-width: 100%;
  overflow: hidden;
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* The sheet of "Apps": the whole sidebar in a panel from the bottom, over most of the height, rounded at the top. */
.sheet-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1000;
  background: light-dark(rgb(0 0 0 / 45%), rgb(0 0 0 / 60%));
  transition: opacity 150ms;

  @starting-style {
    opacity: 0;
  }
}

.sheet-layer {
  position: absolute;
  inset: 0;
  z-index: 1001;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
}

.sheet {
  display: flex;
  width: 100%;
  height: min(85%, 720px);
  overflow: hidden;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -8px 32px rgb(0 0 0 / 28%);
  pointer-events: auto;
  transition: translate 240ms var(--app-cockpit-ease);

  @starting-style {
    translate: 0 100%;
  }

  &:focus-visible {
    outline: none;
  }

  .sidebar {
    flex: 1;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    border-right: 0;
  }
}

/* Its close button, in place of the search (the bottom bar has it). */
.sheet-close {
  margin-left: auto;
}

.top-line {
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--app-cockpit-topbar-height);
  padding: 0 10px 0 16px;
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  font-size: var(--app-cockpit-sidebar-font-size);

  .brand {
    flex: 0 1 auto;
    min-height: 0;
    max-width: 360px;
    /* With the first entry's padding about 40px to its text (2026-10-08, the user's wish; 12px before): clearly more
       than between the entries, so the brand is a block of its own; the divider (below) in the middle of it. */
    margin: 0 8px 0 0;
    padding: 0;
    border: 0;
  }

  /* Title and subtitle side by side on one baseline (2026-10-08, the user's wish; stacked before, as in the sidebar):
     the title bold, the subtitle smaller and muted, then a thin divider before the entries ("Back Office Acme
     Corporate |"; 2026-10-08, the user's wish: between the two before); the subtitle is cut first when there is no
     room. The divider: its right border (as high as its line), half as strong as the muted text. */
  .brand-text {
    flex-direction: row;
    align-items: baseline;
    gap: 10px;
    padding-right: 20px;
    border-right: 1px solid color-mix(in srgb, var(--app-cockpit-muted) 50%, transparent);
  }

  .brand-title {
    flex: 0 1 auto;
    min-width: 0;
    font-weight: 600;
  }

  .brand-subtitle {
    flex: 0 1000 auto;
    min-width: 0;
    margin: 0 0 -0.15em;
    font-size: calc(var(--app-cockpit-font-size) * 13 / 14);
    font-weight: 400;
    letter-spacing: 0;
  }

  .search-button {
    margin-left: 4px;
  }

  /* The icons on the dark line: white strokes (its menus are outside it: the accent, like the sidebar's popups). */
  .tile,
  .group-icon {
    color: var(--app-cockpit-sidebar-icon);
  }

  /* The icons of its items (the pinned ones, or those of a single group) and of its folders (the pinned ones, or those
     of a single group) in the accent color (2026-10-08, the user's wish; white before): its dark side, on the dark
     line. */
  .tab .tile,
  .tab .group-icon {
    color: var(--app-cockpit-accent);
  }
}

.line {
  display: flex;
  flex: 1;
  align-self: stretch;
  min-width: 0;
}

.line-list {
  position: relative;
  display: flex;
  flex: 0 1 auto;
  flex-wrap: wrap;
  min-width: 0;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  list-style: none;

  > li {
    display: flex;
    flex: none;
    height: 100%;
  }
}

.tab {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 12px;
  border: 0;
  background: transparent;
  color: var(--app-cockpit-muted);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover,
  &[data-state='open'] {
    background: var(--app-cockpit-hover);
    color: var(--app-cockpit-text);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  /* The line under the chosen entry. */
  &::after {
    position: absolute;
    right: 8px;
    bottom: 0;
    left: 8px;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: transparent;
    content: '';
  }

  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 17 / 14);
    }
  }

  .icon--chevron {
    font-size: calc(var(--app-cockpit-font-size) * 14 / 14);
    rotate: 90deg;
    stroke-width: 2.25;
  }
}

/* The line: the open app (a pinned one, or one of a single group) and the group that has it are bright and bold; the
   open app is underlined in the accent color. */
.top-line .tab {
  &[aria-current] {
    color: var(--app-cockpit-text);
    font-weight: 600;
  }

  &[aria-current='page']::after {
    background: var(--app-cockpit-accent);
  }
}

/* The two-pane menus (nav="top", 2026-10-08; nav="top-compact" until then): the groups are the entries; the topbar is
   the menus' containing block. */
.topbar[data-panes] {
  position: relative;

  /* The entry whose menu is open, like a hovered one; its chevron turned up. */
  .top-line .tab[aria-expanded='true'] {
    background: var(--app-cockpit-hover);
    color: var(--app-cockpit-text);

    .icon--chevron {
      rotate: -90deg;
    }
  }

  .top-line .tab .icon--chevron {
    transition: rotate 150ms var(--app-cockpit-ease);
  }

  /* The entry of the open item: underlined in the accent. */
  .top-line .tab[aria-current]::after {
    background: var(--app-cockpit-accent);
  }
}

/* A subgroup's heading (a menu of one pane), like the sidebar's section labels, with its icon. */
.panel-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  padding: 0 8px;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  .group-icon svg {
    font-size: calc(var(--app-cockpit-font-size) * 15 / 14);
  }
}

.panel-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* An item: its icon, its title and its description below it (at most two lines). The open one in the accent, like in
   the sidebar. */
.panel-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover {
    background: color-mix(in srgb, var(--app-cockpit-text) 9%, transparent);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  &[aria-current='page'] {
    background: var(--app-cockpit-selected);

    .panel-title {
      color: var(--app-cockpit-accent);
      font-weight: 600;
    }
  }

  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
    }
  }
}

.panel-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.panel-title {
  font-weight: 500;
  line-height: 20px;

  .running-dot {
    display: inline-block;
    margin-inline-start: 4px;
    vertical-align: middle;
  }
}

.panel-description {
  display: -webkit-box;
  overflow: hidden;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* The two-pane menus (nav="top", 2026-10-08): below the group's entry (its left set by the element), in the
   look of the topbar's menus (the sidebar's colors, a line on top, square corners, the shadow downwards): the
   subgroups on the left, the items of the shown one on the right (all panes in one grid cell, so the menu keeps the
   height of the tallest). */
.pane-menu {
  position: absolute;
  top: 100%;
  z-index: 1000;
  display: flex;
  max-width: calc(100% - 16px);
  max-height: calc(100dvh - var(--app-cockpit-topbar-height) - 48px);
  border-top: 1px solid var(--app-cockpit-divider);
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  box-shadow: 0 12px 32px rgb(0 0 0 / 24%);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  font-size: var(--app-cockpit-sidebar-font-size);
  transition: opacity 150ms, translate 150ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    translate: 0 -4px;
  }

  .tile,
  .group-icon {
    color: var(--app-cockpit-accent);
  }
}

.pane-tabs {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 2px;
  width: 208px;
  padding: 6px;
  overflow: auto;
  overscroll-behavior: none;
  border-right: 1px solid var(--app-cockpit-divider);
}

/* A subgroup: its icon, its name, a chevron to the right; the shown one in the hover's tint, the open item's in the
   accent. */
.pane-tab {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  padding: 4px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 500;
  text-align: start;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover,
  &[aria-selected='true'] {
    background: color-mix(in srgb, var(--app-cockpit-text) 9%, transparent);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  &[data-current] {
    color: var(--app-cockpit-accent);
    font-weight: 600;
  }

  .group-icon svg {
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
  }

  .icon--chevron {
    margin-left: auto;
    color: var(--app-cockpit-muted);
    font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  }
}

.pane-tab-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.pane-stack {
  display: grid;
  width: 320px;
  overflow: auto;
  overscroll-behavior: none;
}

.pane {
  grid-area: 1 / 1;
  padding: 6px;

  &:not([data-shown]) {
    visibility: hidden;
  }

  .panel-heading {
    margin-top: 6px;
  }
}

/* The footer's actions and menu in the top line: plain icon buttons. */
.top-actions {
  display: flex;
  flex: none;
  align-items: center;

  .footer-button {
    width: 32px;
    min-height: 32px;
    height: 32px;
    border-radius: 7px;
    color: var(--app-cockpit-muted);

    &:hover,
    &[data-state='open'] {
      background: var(--app-cockpit-hover);
      color: var(--app-cockpit-text);
    }

    &:focus-visible {
      outline-color: var(--app-cockpit-accent);
      outline-offset: -2px;
    }
  }

  .footer-badge {
    top: 5px;
    right: 5px;
    border-color: var(--app-cockpit-sidebar);
  }
}

.top-user {
  display: grid;
  flex: none;
  place-items: center;
  margin-left: 6px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;

  &:is(button) {
    cursor: pointer;
  }

  &:focus-visible {
    outline-offset: 1px;
  }

  .avatar {
    width: 30px;
    height: 30px;
  }
}

/* The user's name on top of their menu (topbar). */
.menu-user {
  display: flex;
  flex-direction: column;
  padding: 6px 8px 4px;

  .user-name {
    font-size: var(--app-cockpit-small);
  }
}

.menu-item[data-current] {
  color: var(--app-cockpit-accent);
  font-weight: 600;
}

/* The density (the attribute 'density'; 'normal' is the rules above): the rows of the sidebar and the gaps between its
   sections and groups, a bit closer or a bit wider; the rows of the popups (menus, the group select's list, the
   flyouts) one step with them. The font sizes, the topbar's lines, the brand, the user row and the footer stay. */
:host([density='compact']) {
  .item {
    min-height: 32px;
    padding-block: 2px;
  }

  .group-trigger {
    height: 26px;
  }

  .subgroup-trigger {
    min-height: 30px;
  }

  .section + .section,
  .section + .group,
  .group + .section,
  .group + .group {
    margin-top: 8px;
  }

  .section-rule {
    margin-bottom: 8px;
  }

  .menu-item,
  .select-item,
  .flyout-item {
    min-height: 30px;
  }
}

:host([density='comfortable']) {
  .item {
    min-height: 40px;
    padding-block: 6px;
  }

  .group-trigger {
    height: 30px;
  }

  .subgroup-trigger {
    min-height: 34px;
  }

  .section + .section,
  .section + .group,
  .group + .section,
  .group + .group {
    margin-top: 16px;
  }

  .section-rule {
    margin-bottom: 16px;
  }

  .menu-item,
  .select-item,
  .flyout-item {
    min-height: 34px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
}
`,Ii=8,Li=30,Ri=768,zi=5,Bi=200,Vi=420,Hi=e=>e.map(e=>`items`in e?e:{label:void 0,items:e}).filter(e=>e.items.length>0),Ui=e=>e.some(e=>e.icon!==void 0),Wi=e=>Math.round(Math.min(Vi,Math.max(Bi,e))),Gi=()=>/mac|iphone|ipad/i.test(navigator.platform||navigator.userAgent),Ki=0,qi=class extends zr{static styles=Nn(Fi);static properties={nav:{reflect:!0},navScheme:{attribute:`nav-scheme`,reflect:!0},density:{reflect:!0},startPage:{attribute:`start-page`,type:Boolean,reflect:!0}};#e;#t=`cockpit${++Ki}`;#n=new Map;#r=new Map;#i=new Map;#a;#o;#s=[];#c=[];#l;#u;#d;#f;#p=!1;#m=!1;#h=!1;#g=!1;#_=!1;#v;#y;#b=``;#x=0;#S=``;#C;#w;#T;#E;#D;#O;#k=new Map;#A;#j;#M;constructor(e){super(),this.nav=`side`,this.navScheme=`dark`,this.density=`normal`,this.startPage=e.startPage===!0,this.#e=e,this.#a=e.storageKey??`app-cockpit`,this.#l=ui(`${this.#a}:recent`,[]),this.#u=ui(`${this.#a}:collapsed`,!1),this.#d=ui(`${this.#a}:width`,void 0),this.#f=ui(`${this.#a}:groups`,{}),e.taskbar===!0&&Mi()}get activeItem(){return this.#V(this.#o)}open(e){this.#V(e)!==void 0&&(this.#z()!==e&&history.pushState(null,``,`${location.pathname}${location.search}#${e}`),this.#H(e))}close(e){!this.#s.includes(e)||this.#s.length<2&&!this.startPage||(this.#s=this.#s.filter(t=>t!==e),this.#c=this.#c.filter(t=>t!==e),this.#r.get(e)?.remove(),this.#r.delete(e),this.#i.delete(e),this.#o===e&&this.#s[0]!==void 0?this.open(this.#s[0]):this.#o===e?this.#N():this.requestUpdate())}#N(){this.startPage&&(location.hash!==``&&history.pushState(null,``,`${location.pathname}${location.search}`),this.#H(void 0),this.updateComplete.then(()=>this.#pe(`.start-page-search-input`)?.focus()))}connectedCallback(){super.connectedCallback(),this.#O=new MutationObserver(()=>this.requestUpdate()),this.#O.observe(document.documentElement,{attributes:!0,attributeFilter:[`lang`]}),window.addEventListener(`hashchange`,this.#R),document.addEventListener(`keydown`,this.#fe),document.addEventListener(`pointerdown`,this.#He,!0),window.addEventListener(`resize`,this.#I),window.addEventListener(`scroll`,this.#I,{capture:!0,passive:!0}),this.#H(this.#V(this.#z())?.id??this.#B)}disconnectedCallback(){super.disconnectedCallback(),this.#de(),window.removeEventListener(`hashchange`,this.#R),document.removeEventListener(`keydown`,this.#fe),document.removeEventListener(`pointerdown`,this.#He,!0),window.removeEventListener(`resize`,this.#I),window.removeEventListener(`scroll`,this.#I,{capture:!0}),this.#O?.disconnect(),this.#D?.disconnect(),this.#st()}firstUpdated(e){let t=this.renderRoot.querySelector(`.frame`);t!==null&&(this.#D=new ResizeObserver(()=>{let e=t.offsetWidth<Ri;e!==this.#p&&(this.#p=e,this.requestUpdate()),this.#P(),this.#I()}),this.#D.observe(t))}willUpdate(e){if(e.has(`startPage`)&&!this.startPage&&this.hasUpdated&&this.#o===void 0){let e=this.#B;e!==void 0&&this.open(e)}}updated(){this.#F(`.sheet-dialog`,this.#te&&this.#g,()=>this.#pe(`.sheet .item[aria-current]`)??this.#pe(`.sheet-close`)),this.#F(`.palette-dialog`,this.#h||this.#y!==void 0,()=>this.#pe(`.palette-input`)),this.#ye(),this.#P();for(let e of this.#n.values())e.rendered()}#P(){let e=!1;for(let t of this.renderRoot.querySelectorAll(`[data-overflow]`)){let n=[...t.children],r=n[0]?.offsetTop??0,i=n.filter(e=>e.offsetTop>r+1).length,a=t.dataset.overflow??``;(this.#k.get(a)??0)!==i&&(this.#k.set(a,i),e=!0)}e&&this.requestUpdate()}#F(e,t,n){let r=this.renderRoot.querySelector(e);r!==null&&r.open!==t&&(t?(r.showModal(),this.#I(),n()?.focus()):r.close())}#I=()=>{let e=this.#pe(`.mount`)?.getBoundingClientRect();if(e!==void 0)for(let t of this.renderRoot.querySelectorAll(`dialog[open]`))Object.assign(t.style,{left:`${e.left}px`,top:`${e.top}px`,width:`${e.width}px`,height:`${e.height}px`})};#L(e,t,n){return{cancel:e=>{e.preventDefault(),n()},close:()=>{t()&&n()},pointerdown:t=>{t.target.closest(e)===null&&n()}}}#R=()=>{let e=this.#V(this.#z());e===void 0?location.hash===``&&this.#H(this.#B):this.#H(e.id)};#z(){return decodeURIComponent(location.hash.slice(1).split(`/`)[0]??``)}get#B(){return this.#V(this.#e.defaultItem)?.id??(this.startPage?void 0:this.#K[0]?.id)}#V(e){return e===void 0?void 0:this.#e.items.find(t=>t.id===e)}#H(e){let t=this.#V(e);if(t===void 0){if(this.startPage){this.#o=void 0,this.#g=!1,this.#A=void 0;for(let e of this.#r.values())e.hidden=!0}this.requestUpdate();return}this.#o=t.id,this.#C=t.group??``,this.#S=``,this.#g=!1,this.#A=void 0,this.#l=[t.id,...this.#l.filter(e=>e!==t.id)].slice(0,zi),di(`${this.#a}:recent`,this.#l),this.#s=[t.id,...this.#s.filter(e=>e!==t.id)],this.#c.includes(t.id)||(this.#c=[...this.#c,t.id]);for(let[e,n]of this.#r)n.hidden=e!==t.id;this.#r.has(t.id)||this.#U(t),this.requestUpdate()}async#U(e){if(this.#i.get(e.id)!==`loading`){this.#i.set(e.id,`loading`),this.requestUpdate();try{if(await e.load?.(),this.#i.get(e.id)!==`loading`||this.#r.has(e.id))return;let t=document.createElement(e.element);for(let[n,r]of Object.entries(e.attributes??{}))t.setAttribute(n,r);t.setAttribute(`data-hash-segment`,e.id),t.hidden=this.#o!==e.id,this.#r.set(e.id,t),this.append(t),this.#i.set(e.id,`ready`)}catch(t){console.error(`app-cockpit: the item "${e.id}" could not be loaded.`,t),this.#i.set(e.id,`failed`)}this.requestUpdate()}}get#W(){return mi(document.documentElement.lang)}get#G(){return this.#K.length>Ii}get#K(){return this.#e.items.filter(e=>e.placement!==`hidden`)}get#q(){return this.#e.items.filter(e=>e.placement===`pinned`)}get#J(){return this.#e.items.filter(e=>e.placement===void 0)}get#Y(){return this.#J.filter(e=>e.subgroup===void 0||this.#ie(e.group??``,e.subgroup)?.placement!==`pinned`)}get#X(){return si(this.#J).flatMap(e=>ci(e.items).subgroups.filter(t=>this.#ie(e.name,t.name)?.placement===`pinned`).map(t=>({parent:e.name,group:t})))}get#Z(){return this.#Q||(this.#e.search??this.#G)}get#Q(){return this.#$&&this.nav===`top-switcher`}get#$(){return(this.nav===`top`||this.nav===`top-switcher`)&&!this.#p}get#ee(){return this.#$&&this.nav===`top`}get#te(){return this.nav===`bottom`||this.nav===`auto`&&this.#p}get#ne(){return!this.#$&&!this.#te&&(this.#u||this.#p||this.#h)}get#re(){return this.#l.flatMap(e=>this.#V(e)??[]).filter(e=>e.placement!==`hidden`)}#ie(e,t){return this.#e.groups?.find(t=>t.name===e)?.subgroups?.find(e=>e.name===t)}#ae(e,t){return this.#ie(e,t)?.icon}#oe(e){return e.name===``?this.#W.other:e.name}#se(e,t){this.#f={...this.#f,[e]:t},di(`${this.#a}:groups`,this.#f),this.requestUpdate()}#ce=()=>{this.#u=!this.#u,di(`${this.#a}:collapsed`,this.#u),this.requestUpdate()};#le=()=>{this.#h||(this.#v=this.#Q?Math.max(0,(this.#pe(`.switcher`)?.getBoundingClientRect().left??0)-(this.#pe(`.frame`)?.getBoundingClientRect().left??0)):void 0,this.#_=!this.#ne&&!this.#$&&!this.#te,this.#de(),this.#st(),this.#g=!1,this.#A=void 0,this.#h=!0,this.#b=``,this.#x=Math.max(0,this.#re.findIndex(e=>e.id===this.#o)),this.requestUpdate())};#ue=()=>{this.#h=!1,!this.#$&&!this.#te&&(clearTimeout(this.#y),this.#y=setTimeout(this.#de,600)),this.requestUpdate()};#de=()=>{this.#y!==void 0&&(clearTimeout(this.#y),this.#y=void 0,this.requestUpdate())};#fe=e=>{if(e.key===`Escape`&&this.#A!==void 0){e.preventDefault(),this.#Ve(this.matches(`:focus-within`));return}this.#Z&&(e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()===`k`&&(e.preventDefault(),this.#le())};#pe(e){return this.renderRoot.querySelector(e)}#me=e=>{let t=e.getBoundingClientRect(),n=this.#pe(`.sidebar`)?.getBoundingClientRect().right??t.right;return new DOMRect(n,t.top,0,t.height)};#he=e=>{let t=e.getBoundingClientRect(),n=e.closest(`.top-line`)?.getBoundingClientRect().bottom??t.bottom;return new DOMRect(t.left,n,t.width,0)};#ge=e=>{let t=e.target.closest?.(`[data-tip]`)??null;t!==this.#T&&(this.#ve(),t!==null&&t.getAttribute(`data-state`)!==`open`&&(this.#T=t,this.#E=setTimeout(()=>{this.#w={text:t.getAttribute(`data-tip`)??``,target:t,side:t.getAttribute(`data-tip-side`)??`right`},this.requestUpdate()},e.type===`focusin`?0:300)))};#_e=e=>{let t=e.relatedTarget;this.#T!==void 0&&t!==null&&this.#T.contains(t)||this.#ve()};#ve=()=>{clearTimeout(this.#E),this.#T=void 0,this.#w!==void 0&&(this.#w=void 0,this.requestUpdate())};#ye(){let e=this.#pe(`.tooltip`);this.#w!==void 0&&e!==null&&this.#w.target.isConnected&&(e.matches(`:popover-open`)||e.showPopover(),Dn(this.#w.target,e,{placement:this.#w.side,strategy:`fixed`,middleware:[vn(this.#w.side===`right`?10:8),xn(),bn({padding:4})]}).then(({x:t,y:n})=>{Object.assign(e.style,{left:`${t}px`,top:`${n}px`}),e.setAttribute(`data-open`,``)}))}render(){let e=this.#W,t=this.#$,n=this.#te,r=this.#ne,i=this.#V(this.#o),a=i===void 0?`ready`:this.#i.get(i.id)??`loading`,o={...this.#d===void 0?{}:{"--app-cockpit-sidebar-width":`${this.#d}px`},...this.#v===void 0?{}:{"--app-cockpit-switcher-left":`${this.#v}px`}};return N`
      <div
        class="mount"
        data-layout=${t?`topbar`:n?`bottom`:`sidebar`}
        data-nav-style=${this.#Q?`switcher`:`tabs`}
        ?data-palette-from-expanded=${this.#_}
        ?data-palette-closing=${this.#y!==void 0}
        style=${ii(o)}
        @pointerover=${this.#ge}
        @pointerout=${this.#_e}
        @focusin=${this.#ge}
        @focusout=${this.#_e}
        @pointerdown=${{handleEvent:this.#ve,capture:!0}}
      >
        <div
          class="frame"
          ?data-rail=${r}
          ?data-resizing=${this.#m}
        >
          ${t?this.#Re(e):n?P:this.#Se(e,r)}
          <main class="main">
            <slot></slot>
            ${i===void 0&&this.startPage?this.#Ce(e):P}
            ${a===`loading`?N`<div class="state" role="status"><span class="spinner" aria-hidden="true"></span>${e.loading}</div>`:a===`failed`?N`<div class="state" role="alert">
          <p>${e.loadFailed}</p>
          <button type="button" class="retry-button" @click=${()=>{i!==void 0&&(this.#i.delete(i.id),this.#U(i))}}>${e.retry}</button>
        </div>`:P}
          </main>
          ${this.#e.taskbar===!0&&!n?this.#be():P}
          ${n?this.#De(e):P}
        </div>
        ${n?this.#Oe(e):P}
        ${this.#Z?this.#gt(e):P}
        ${this.#w===void 0?P:N`<div class="tooltip" role="tooltip" popover="manual" data-side=${this.#w.side}>${this.#w.text}</div>`}
      </div>
    `}#be(){if(this.#c.length===0)return P;let e=this.#c.length>1||this.startPage;return N`<app-taskbar
      class="taskbar"
      .tasks=${this.#c.flatMap(t=>{let n=this.#V(t);return n===void 0?[]:[{id:n.id,title:n.title,...n.icon===void 0?{}:{icon:n.icon},closable:e}]})}
      .active=${this.#o}
      @task-select=${e=>this.open(e.detail.id)}
      @task-close=${e=>this.close(e.detail.id)}
      @task-move=${e=>this.#xe(e.detail.id,e.detail.index)}
    ></app-taskbar>`}#xe(e,t){if(!this.#c.includes(e))return;let n=this.#c.filter(t=>t!==e);this.#c=[...n.slice(0,t),e,...n.slice(t)],this.requestUpdate()}#Se(e,t,n=!1){return N`<aside class="sidebar">
            ${t||n?P:this.#je(e)}
            <div class="brand">
              ${this.#ke(e,n?void 0:t)}
              ${n?N`<button
              type="button"
              class="search-button sheet-close"
              aria-label=${e.closeSheet}
              @click=${this.#Ee}
            >${xi()}</button>`:this.#Z&&!t?this.#Ae(e,t):P}
            </div>
            ${this.#Z&&t?this.#Ae(e,t):P} ${this.#Le(e,t)}
            <div class="sidebar-end"><slot name="sidebar-end"></slot></div>
            ${this.#e.user===void 0?P:this.#pt(e,t,this.#e.user)}
            ${this.#mt(e,t)}
          </aside>`}#Ce(e){let t=this.#S,n=new Set(li(this.#K,t).map(({item:e})=>e.id)),r=[...this.#q.length>0?[{label:void 0,icon:void 0,items:this.#q}]:[],...this.#we(e)].map(e=>({...e,items:e.items.filter(e=>n.has(e.id))})).filter(e=>e.items.length>0),i=e=>{this.#S=e,this.requestUpdate()};return N`<section class="start-page" aria-label=${e.startPage}>
      <div class="start-page-inner">
        <header class="start-page-header">
          <h1 class="start-page-title">${this.#e.title??e.navigation}</h1>
          ${this.#e.subtitle===void 0?P:N`<p class="start-page-subtitle">${this.#e.subtitle}</p>`}
          ${this.#Z?N`<div class="start-page-search">
            ${gi()}
            <input
              type="search"
              class="start-page-search-input"
              placeholder=${e.searchPlaceholder}
              aria-label=${e.search}
              autocomplete="off"
              spellcheck="false"
              .value=${t}
              @input=${e=>i(e.target.value)}
              @keydown=${e=>{let n=r[0]?.items[0];e.key===`Enter`&&n!==void 0?(e.preventDefault(),this.open(n.id)):e.key===`Escape`&&t!==``?(e.preventDefault(),e.stopPropagation(),i(``)):e.key===`ArrowDown`&&(e.preventDefault(),this.#pe(`.start-page-card`)?.focus())}}
            />
            ${t===``?P:N`<button
                type="button"
                class="start-page-search-clear"
                aria-label=${e.clearSearch}
                data-tip=${e.clearSearch}
                data-tip-side="bottom"
                @click=${()=>{i(``),this.#pe(`.start-page-search-input`)?.focus()}}
              >${xi()}</button>`}
          </div>`:P}
        </header>
        ${r.length===0?N`<p class="start-page-empty" role="status">${e.noResults}</p>`:P}
        ${r.map(({label:e,icon:t,items:n})=>N`<section class="start-page-section">
            ${e===void 0?P:N`<h2 class="start-page-heading">${Oi(t)}<span>${e}</span></h2>`}
            <ul class="start-page-grid">${n.map(e=>N`<li><button type="button" class="start-page-card" @click=${()=>this.open(e.id)}>
                ${Di(e,`framed`)}
                <span class="start-page-card-text">
                  <span class="start-page-card-title">${e.title}${this.#e.taskbar===!0&&this.#c.includes(e.id)?N`<span class="running-dot" aria-hidden="true"></span>`:P}</span>
                  ${e.description===void 0?P:N`<span class="start-page-card-description">${e.description}</span>`}
                </span>
              </button></li>`)}</ul>
          </section>`)}
      </div>
    </section>`}#we(e){return si(this.#J).flatMap(t=>{let{loose:n,subgroups:r}=ci(t.items);return[...n.length>0?[{name:``,items:n}]:[],...r].map(n=>({label:n.name===``?e.general:n.name,icon:n.name===``?void 0:this.#ae(t.name,n.name),items:n.items}))})}#Te=()=>{this.#g=!0,this.requestUpdate()};#Ee=()=>{this.#g=!1,this.requestUpdate()};#De(e){let t=e=>this.#e.items.indexOf(e),n=this.#re.slice(0,3).sort((e,n)=>t(e)-t(n));return N`<nav class="bottombar" aria-label=${e.navigation}>
      <button
        type="button"
        class="bottom-item"
        aria-haspopup="dialog"
        aria-expanded=${this.#g}
        @click=${this.#Te}
      >${Si()}<span class="bottom-label">${e.navigation}</span></button>
      ${ti(n,e=>e.id,e=>N`<button
          type="button"
          class="bottom-item"
          aria-current=${Vr(e.id===this.#o?`page`:void 0)}
          @click=${()=>this.open(e.id)}
        >${Di(e,!0)}<span class="bottom-label">${e.title}</span></button>`)}
      ${this.#Z?N`<button type="button" class="bottom-item" @click=${this.#le}>
          ${gi()}<span class="bottom-label">${e.searchShort}</span>
        </button>`:P}
    </nav>`}#Oe(e){let t=this.#g,n=this.#L(`.sheet`,()=>this.#g,this.#Ee);return N`<dialog
      class="dialog sheet-dialog"
      aria-labelledby=${`${this.#t}-sheet-title`}
      @cancel=${n.cancel}
      @close=${n.close}
      @pointerdown=${n.pointerdown}
    >
      <div class="sheet-backdrop"></div>
      <div class="sheet-layer">
        <div class="sheet">
          <h2 class="visually-hidden" id=${`${this.#t}-sheet-title`}>${e.navigation}</h2>
          ${t?this.#Se(e,!1,!0):P}
        </div>
      </div>
    </dialog>`}#ke(e,t){let n=N`<slot name="logo"><span class="brand-logo" aria-hidden="true">${wi()}</span></slot>`,r=t?e.expand:e.collapse;return N`${this.startPage?N`<button type="button" class="brand-start-page" aria-label=${e.startPage} @click=${()=>this.#N()}>${n}</button>`:t===void 0||this.#p?n:N`<button
          type="button"
          class="brand-toggle"
          aria-label=${r}
          aria-expanded=${!t}
          data-tip=${r}
          data-tip-side=${t?`right`:`bottom`}
          @click=${this.#ce}
        >${n}</button>`}
      <span class="brand-text">
        <span class="brand-title">${this.#e.title??e.navigation}</span>
        ${this.#e.subtitle===void 0?P:N`<span class="brand-subtitle">${this.#e.subtitle}</span>`}
      </span>`}#Ae(e,t){return N`<button
      type="button"
      class="search-button"
      aria-label=${e.search}
      data-tip="${e.search} (${Gi()?`⌘K`:`Ctrl K`})"
      data-tip-side=${t?`right`:`bottom`}
      @click=${this.#le}
    >${gi()}</button>`}#je(e){let t=()=>this.#pe(`.sidebar`)?.getBoundingClientRect().width??Bi,n=(e,t)=>{this.#d=e,t&&di(`${this.#a}:width`,e),this.requestUpdate()};return N`<div
      class="resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label=${e.resize}
      aria-valuemin=${Bi}
      aria-valuemax=${Vi}
      aria-valuenow=${Vr(this.#d)}
      tabindex="0"
      @pointerdown=${e=>{if(e.button!==0)return;e.preventDefault();let r=e.currentTarget,i=e.clientX,a=t(),o=a;r.setPointerCapture(e.pointerId),this.#m=!0;let s=e=>{o=Wi(a+e.clientX-i),n(o,!1)},c=()=>{r.removeEventListener(`pointermove`,s),r.removeEventListener(`pointerup`,c),r.removeEventListener(`pointercancel`,c),this.#m=!1,n(o,!0)};r.addEventListener(`pointermove`,s),r.addEventListener(`pointerup`,c),r.addEventListener(`pointercancel`,c)}}
      @keydown=${e=>{let r=e.shiftKey?48:16,i={ArrowLeft:-r,ArrowRight:r}[e.key];i!==void 0&&(e.preventDefault(),n(Wi(t()+i),!0))}}
      @dblclick=${()=>n(void 0,!0)}
    ></div>`}#Me=e=>{let t=[...e.currentTarget.querySelectorAll(`button`)].filter(e=>e.offsetParent!==null),n=t.indexOf(e.composedPath()[0]),r={ArrowDown:t[n+1],ArrowUp:t[n-1],Home:t[0],End:t.at(-1)}[e.key];n>=0&&r!==void 0&&(e.preventDefault(),r.focus())};#Ne(e,t){return N`<button
      type="button"
      class="item"
      aria-current=${Vr(e.id===this.#o?`page`:void 0)}
      aria-label=${Vr(t?e.title:void 0)}
      title=${Vr(t?void 0:e.description)}
      data-tip=${Vr(t?e.title:void 0)}
      @click=${()=>this.open(e.id)}
    >${this.#Pe(e,t,N`<span class="item-title">${e.title}</span>`)}</button>`}#Pe(e,t,n,r=!1){let i=this.#e.taskbar===!0&&this.#c.includes(e.id)?N`<span class="running-dot" aria-hidden="true"></span>`:P;return t?N`${Di(e,`framed`,i)}${n}`:N`${Di(e,r?`framed`:!1)}${n}${i}`}#Fe(e,t){return N`<section class="section">
      ${e===``?N`<hr class="section-rule" />`:N`<h2 class="section-label">${e}</h2>`}
      <ul class="list">${t}</ul>
    </section>`}#Ie(e,t){let{loose:n,subgroups:r}=ci(e.items),i=n.map(e=>N`<li>${this.#Ne(e,t)}</li>`);return t?[...i,...r.map(t=>N`<li>${this.#dt(`sub:${e.name}/${t.name}`,{name:t.name,items:t.items.map(({subgroup:e,...t})=>t)},t.name,this.#ae(e.name,t.name))}</li>`)]:[...i,...r.map(n=>{let r=`${e.name}/${n.name}`,i=this.#f[r]??!0,a=this.#ae(e.name,n.name);return N`<li>
          <div class="subgroup">
            <button
              type="button"
              class="subgroup-trigger"
              aria-expanded=${i}
              ?data-panel-open=${i}
              @click=${()=>this.#se(r,!i)}
            >
              ${_i()} ${a===void 0?P:Oi(a)}
              <span class="subgroup-name">${n.name}</span>
              <span class="subgroup-count">${n.items.length}</span>
            </button>
            <div class="group-panel" ?hidden=${!i}>
              <ul class="list subgroup-list">${n.items.map(e=>N`<li>${this.#Ne(e,t)}</li>`)}</ul>
            </div>
          </div>
        </li>`})]}#Le(e,t){let n=this.#K,r=this.#G,i=si(t?this.#Y:n),a=t?[...this.#q.map(e=>N`<li>${this.#Ne(e,t)}</li>`),...this.#X.map(({parent:e,group:t})=>N`<li>${this.#dt(`sub:${e}/${t.name}`,{name:t.name,items:t.items.map(({subgroup:e,...t})=>t)},t.name,this.#ae(e,t.name))}</li>`)]:[],o=t=>N`<nav class="nav" aria-label=${e.navigation} @keydown=${this.#Me}>${a.length>0?this.#Fe(``,a):P}${t}</nav>`;if(t&&r){if(n.length<=Li)return o(N`<ul class="list">${i.map((e,n)=>N`${n===0?P:N`<li><hr class="section-rule" /></li>`}${this.#Ie(e,t)}`)}</ul>`);let e=this.#re.filter(e=>e.placement!==`pinned`),r=this.#V(this.#o);return r!==void 0&&!e.some(e=>e.id===r.id)&&e.unshift(r),o(N`<ul class="list">${e.map(e=>N`<li>${this.#Ne(e,t)}</li>`)}</ul>`)}if(this.#e.groupDisplay===`select`&&!t&&i.length>1){let n=i.find(e=>e.name===this.#C)??i[0];return N`${this.#ft(e,i,n?.name??``)}
      ${o(n===void 0?P:N`<ul class="list">${this.#Ie(n,t)}</ul>`)}`}let s=this.#e.recent===!1?[]:this.#re;return o(N`
      ${r&&s.length>0?this.#Fe(e.recent,s.map(e=>N`<li>${this.#Ne(e,t)}</li>`)):P}
      ${i.map(a=>{let o=a.name===``?i.length>1&&r?e.other:``:a.name,s=this.#Ie(a,t);if(t||!r||o===``||this.#e.collapsibleGroups===!1)return this.#Fe(t?``:o,s);let c=this.#f[a.name]??(n.length<=Li||a.name===(this.#V(this.#o)?.group??``)||a.name===``);return N`<div class="group">
          <button
            type="button"
            class="group-trigger"
            aria-expanded=${c}
            ?data-panel-open=${c}
            @click=${()=>this.#se(a.name,!c)}
          >
            ${_i()}
            <span class="group-name">${o}</span>
            <span class="group-count">${a.items.length}</span>
          </button>
          <div class="group-panel" ?hidden=${!c}><ul class="list">${s}</ul></div>
        </div>`})}
    `)}#Re(e){let t=si(this.#Y),n=[...this.#q.map(e=>({kind:`item`,item:e})),...this.#X.map(({parent:e,group:t})=>({kind:`subgroup`,parent:e,group:t}))],r=t.length>1||n.length>0&&t.length>0,i=t[0],a=this.#Q,o=this.#ee&&r,s=[...n,...r?t.map(e=>({kind:`group`,group:e})):i===void 0?[]:this.#Qe(i)],c=this.#e.user;return N`<header class="topbar" ?data-panes=${o}>
      <div class="top-line">
        <div class="brand">${this.#ke(e)}</div>
        ${a?this.#Ze(e):P}
        ${a?N`<div class="line"></div>`:N`<nav class="line" aria-label=${e.navigation} @keydown=${this.#tt}>${this.#$e(`top`,s,e)}</nav>`}
        ${this.#Z&&!a?this.#Ae(e,!1):P} ${this.#mt(e,!1,!0)}
        ${c===void 0?P:this.#at(e,c)}
      </div>
      ${o?this.#Je(s,e):P}
    </header>`}#ze(e){let t=this.#et({kind:`group`,group:e}),n=this.#A===t,r=e.items.some(e=>e.id===this.#o);return N`<button
      type="button"
      class="tab tab--menu"
      data-panel-entry=${t}
      aria-expanded=${n}
      aria-controls=${`${this.#t}-panel`}
      aria-current=${Vr(r?`true`:void 0)}
      @click=${()=>this.#Be(t)}
      @pointerenter=${e=>{e.pointerType===`mouse`&&this.#A!==void 0&&this.#A!==t&&this.#Be(t)}}
      @keydown=${e=>{e.key===`ArrowDown`&&(e.preventDefault(),this.#Be(t,!0),this.updateComplete.then(()=>this.#pe(`[data-panel] .pane-tab[aria-selected="true"], [data-panel] .panel-item`)?.focus()))}}
    ><span class="tab-title">${this.#oe(e)}</span>${_i()}</button>`}#Be(e,t=this.#A!==e){this.#A=t?e:void 0,this.#j=void 0,clearTimeout(this.#M),this.requestUpdate()}#Ve(e=!1){let t=this.#A;t!==void 0&&(this.#A=void 0,this.requestUpdate(),e&&this.#pe(`[data-panel-entry="${CSS.escape(t)}"]`)?.focus())}#He=e=>{this.#A!==void 0&&(e.composedPath().some(e=>e instanceof Element&&(e.hasAttribute(`data-panel`)||e.hasAttribute(`data-panel-entry`)))||this.#Ve())};#Ue(e){let t=e.find(e=>e.kind===`group`&&this.#et(e)===this.#A);return t?.kind===`group`?t.group:void 0}#We(e){let{loose:t,subgroups:n}=ci(e.items);return[...t.length>0?[{key:``,items:t}]:[],...n.map(t=>({key:t.name,heading:t.name,icon:this.#ae(e.name,t.name),items:t.items}))]}#Ge=e=>{let t=e.relatedTarget,n=this.#pe(`.topbar`);t!==null&&n!==null&&!n.contains(t)&&this.#Ve()};#Ke(e){return N`<li><button
      type="button"
      class="panel-item"
      aria-current=${Vr(e.id===this.#o?`page`:void 0)}
      @click=${()=>this.open(e.id)}
    >${Di(e)}<span class="panel-text"><span class="panel-title">${e.title}${this.#e.taskbar===!0&&this.#c.includes(e.id)?N`<span class="running-dot" aria-hidden="true"></span>`:P}</span>${e.description===void 0?P:N`<span class="panel-description">${e.description}</span>`}</span></button></li>`}#qe(e){return e.heading===void 0?P:N`<h3 class="panel-heading">${Oi(e.icon)}<span>${e.heading}</span></h3>`}#Je(e,t){let n=this.#Ue(e),r=`${this.#t}-panel`;if(n===void 0)return N`<div class="pane-menu" id=${r} data-panel hidden></div>`;let i=this.#We(n),a=i.find(e=>e.items.some(e=>e.id===this.#o)),o=i.find(e=>e.key===this.#j)??a??i[0],s=i.length===1,c=(this.#pe(`[data-panel-entry="${CSS.escape(this.#A??``)}"]`)?.getBoundingClientRect().left??0)-(this.#pe(`.topbar`)?.getBoundingClientRect().left??0);return N`<div
      class="pane-menu"
      id=${r}
      data-panel
      role="group"
      aria-label=${this.#oe(n)}
      ?data-single=${s}
      style=${ii({left:`${c}px`})}
      @keydown=${this.#Xe}
      @focusout=${this.#Ge}
    >
      ${s?P:N`<div class="pane-tabs" role="tablist" aria-orientation="vertical">${i.map(e=>{let n=e===o,i=e===a;return N`<button
              type="button"
              class="pane-tab"
              role="tab"
              id=${`${r}-tab-${e.key.replace(/[^a-z0-9]+/gi,`-`)}`}
              aria-selected=${n}
              aria-controls=${`${r}-pane`}
              tabindex=${n?0:-1}
              ?data-current=${i}
              @click=${()=>this.#Ye(e.key)}
              @focus=${()=>this.#Ye(e.key)}
              @pointerenter=${t=>{t.pointerType===`mouse`&&(clearTimeout(this.#M),this.#M=setTimeout(()=>this.#Ye(e.key),120))}}
              @pointerleave=${()=>clearTimeout(this.#M)}
            >${Oi(e.icon)}<span class="pane-tab-title">${e.heading??t.general}</span>${_i()}</button>`})}</div>`}
      <div class="pane-stack">${i.map(e=>N`<div
            class="pane"
            id=${Vr(e===o?`${r}-pane`:void 0)}
            role=${Vr(s?void 0:`tabpanel`)}
            aria-labelledby=${Vr(s?void 0:`${r}-tab-${e.key.replace(/[^a-z0-9]+/gi,`-`)}`)}
            ?data-shown=${e===o}
            ?inert=${e!==o}
          >
            ${s?this.#qe(e):P}
            <ul class="panel-list">${e.items.map(e=>this.#Ke(e))}</ul>
          </div>`)}</div>
    </div>`}#Ye(e){clearTimeout(this.#M),this.#j!==e&&(this.#j=e,this.requestUpdate())}#Xe=e=>{let t=e.composedPath()[0],n=[...this.renderRoot.querySelectorAll(`.pane-tab`)],r=[...this.renderRoot.querySelectorAll(`.pane[data-shown] .panel-item`)],i=t.classList.contains(`pane-tab`),a=i?n:r,o=a.indexOf(t);if(o<0)return;let s=n.find(e=>e.getAttribute(`aria-selected`)===`true`),c={ArrowDown:a[o+1],ArrowUp:a[o-1],Home:a[0],End:a.at(-1),ArrowRight:i?r[0]:void 0,ArrowLeft:i?void 0:s}[e.key];c!==void 0&&(e.preventDefault(),c.focus())};#Ze(e){let t=this.#V(this.#o),n=`${e.switchItem} (${Gi()?`⌘K`:`Ctrl K`})`;return N`<button
      type="button"
      class="switcher"
      aria-haspopup="dialog"
      aria-expanded=${this.#h}
      aria-label=${t===void 0?n:`${t.title}: ${n}`}
      data-tip=${n}
      data-tip-side="bottom"
      @click=${this.#le}
    >
      ${t===void 0?P:Di(t)}
      <span class="switcher-title">${t?.title??e.switchItem}</span>
      ${yi()}
    </button>`}#Qe(e){let{loose:t,subgroups:n}=ci(e.items);return[...t.map(e=>({kind:`item`,item:e})),...n.map(t=>({kind:`subgroup`,parent:e.name,group:t}))]}#$e(e,t,n){let r=Math.min(this.#k.get(e)??0,t.length);return N`<ul class="line-list" data-overflow=${e}>${ti(t,e=>this.#et(e),e=>N`<li>${this.#nt(e)}</li>`)}</ul>
      ${r>0?this.#it(e,t.slice(t.length-r),n):P}`}#et(e){return e.kind===`item`?`item:${e.item.id}`:e.kind===`group`?`group:${e.group.name}`:`sub:${e.parent}/${e.group.name}`}#tt=e=>{let t=e.currentTarget,n=t.querySelector(`:scope > .line-list`);if(n===null)return;let r=n.firstElementChild?.offsetTop??0,i=[...[...n.querySelectorAll(`:scope > li`)].filter(e=>e.offsetTop<=r+1).map(e=>e.querySelector(`.tab`)),t.querySelector(`:scope > .tab--more`)].filter(e=>e!=null),a=i.indexOf(e.composedPath()[0]),o={ArrowRight:i[a+1],ArrowLeft:i[a-1],Home:i[0],End:i.at(-1)}[e.key];a>=0&&o!==void 0&&(e.preventDefault(),o.focus())};#nt(e){if(e.kind===`item`){let{item:t}=e;return N`<button
        type="button"
        class="tab"
        aria-current=${Vr(t.id===this.#o?`page`:void 0)}
        title=${Vr(t.description)}
        @click=${()=>this.open(t.id)}
      >${Di(t)}<span class="tab-title">${t.title}</span></button>`}if(e.kind===`group`)return this.#ze(e.group);let{parent:t,group:n}=e,r=this.#ot(`tab:${t}/${n.name}`,{placement:`bottom-start`,anchor:this.#he,onSelect:e=>this.open(e)});return N`<button
        type="button"
        class="tab tab--menu"
        aria-current=${Vr(n.items.some(e=>e.id===this.#o)?`true`:void 0)}
        id=${r.triggerId}
        aria-haspopup="menu"
        aria-expanded=${r.open}
        aria-controls=${r.popupId}
        data-state=${r.open?`open`:`closed`}
        @click=${r.toggle}
        @keydown=${r.onTriggerKeyDown}
      ><span class="tab-title">${n.name}</span>${_i()}</button>
      ${this.#ct(r,{class:`menu-popup`,drop:!0},n.items.map(e=>this.#rt(r,e,Ui(n.items))))}`}#rt(e,t,n){return N`<div
      class="menu-item"
      role="menuitem"
      id=${e.itemId(t.id)}
      data-value=${t.id}
      ?data-highlighted=${e.highlighted===t.id}
      ?data-current=${t.id===this.#o}
    >${n?N`<span class="menu-icon menu-icon--item" aria-hidden="true">${t.icon===void 0?P:oi(t.icon)}</span>`:P}<span class="menu-label">${t.title}</span></div>`}#it(e,t,n){let r=this.#ot(`more:${e}`,{placement:`bottom-end`,anchor:this.#he,onSelect:e=>this.open(e)}),i=t.some(e=>e.kind===`item`?e.item.id===this.#o:e.group.items.some(e=>e.id===this.#o)),a=Ui(t.flatMap(e=>e.kind===`item`?[e.item]:e.group.items));return N`<button
        type="button"
        class="tab tab--more"
        aria-current=${Vr(i?`true`:void 0)}
        id=${r.triggerId}
        aria-haspopup="menu"
        aria-expanded=${r.open}
        aria-controls=${r.popupId}
        data-state=${r.open?`open`:`closed`}
        @click=${r.toggle}
        @keydown=${r.onTriggerKeyDown}
      ><span class="tab-title">${n.more}</span>${_i()}</button>
      ${this.#ct(r,{class:`menu-popup`,drop:!0},t.map(e=>e.kind===`item`?this.#rt(r,e.item,a):N`<div class="menu-group-label">${e.kind===`group`?this.#oe(e.group):e.group.name}</div>
              ${e.group.items.map(e=>this.#rt(r,e,a))}`))}`}#at(e,t){let n=this.#e.userMenu??[],r=t.avatar===void 0?N`<span class="avatar" aria-hidden="true">${Ti(t.name).toUpperCase()}</span>`:N`<img class="avatar" src=${t.avatar} alt="" />`;if(Hi(n).length===0)return N`<div class="top-user" aria-label=${t.name} data-tip=${t.name} data-tip-side="bottom">${r}</div>`;let i=this.#ot(`user`,{placement:`bottom-end`,anchor:this.#he,onSelect:e=>this.#ut(n,e)});return N`<button
        type="button"
        class="top-user"
        aria-label="${e.account}: ${t.name}"
        data-tip=${t.name}
        data-tip-side="bottom"
        id=${i.triggerId}
        aria-haspopup="menu"
        aria-expanded=${i.open}
        aria-controls=${i.popupId}
        data-state=${i.open?`open`:`closed`}
        @click=${i.toggle}
        @keydown=${i.onTriggerKeyDown}
      >${r}</button>
      ${this.#ct(i,{class:`menu-popup`,drop:!0},N`<div class="menu-user">
            <span class="user-name">${t.name}</span>
            ${t.detail===void 0?P:N`<span class="user-detail">${t.detail}</span>`}
          </div>
          <div class="menu-separator" role="separator"></div>
          ${this.#lt(i,n)}`)}`}#ot(e,t){let n=this.#n.get(e);return n===void 0&&(n=new Ni(this,`${this.#t}-${e.replace(/[^a-z0-9]+/gi,`-`)}`,t),this.#n.set(e,n)),n.options=t,n}#st(){for(let e of this.#n.values())e.close()}#ct(e,t,n){return N`<div
      class=${t.listbox===!0?`select-positioner`:`menu-positioner`}
      id=${e.positionerId}
      ?hidden=${!e.open}
    >
      <div
        class=${t.class}
        id=${e.popupId}
        role=${t.listbox===!0?`listbox`:`menu`}
        tabindex="-1"
        aria-labelledby=${e.triggerId}
        aria-activedescendant=${Vr(e.highlighted===void 0?void 0:e.itemId(e.highlighted))}
        ?data-drop=${t.drop===!0}
        ?data-flush=${t.flush===!0}
        ?data-sheet=${t.sheet===!0}
        @keydown=${e.onPopupKeyDown}
        @pointermove=${e.onPopupPointerMove}
        @pointerleave=${e.onPopupPointerLeave}
        @click=${e.onPopupClick}
      >${n}</div>
    </div>`}#lt(e,t){return Hi(t).flatMap((t,n)=>[...n>0?[N`<div class="menu-separator" role="separator"></div>`]:[],...t.label===void 0?[]:[N`<div class="menu-group-label">${t.label}</div>`],...t.items.map(t=>{if(t.checked!==void 0){let n=t.checked();return N`<div
            class="menu-item"
            role="menuitemradio"
            aria-checked=${n}
            id=${e.itemId(t.id)}
            data-value=${t.id}
            ?data-highlighted=${e.highlighted===t.id}
            ?data-checked=${n}
          >
            <span class="menu-icon menu-check" ?data-checked=${n}>${bi()}</span>
            <span class="menu-label">${t.label}</span>
          </div>`}return N`<div
          class="menu-item"
          role="menuitem"
          id=${e.itemId(t.id)}
          data-value=${t.id}
          ?data-highlighted=${e.highlighted===t.id}
        >
          <span class="menu-icon" aria-hidden="true">${t.icon===void 0?P:oi(t.icon)}</span>
          <span class="menu-label">${t.label}</span>
          ${t.shortcut===void 0?P:N`<kbd class="key">${t.shortcut}</kbd>`}
        </div>`})])}#ut(e,t){for(let n of Hi(e))n.items.find(e=>e.id===t)?.onSelect?.();this.requestUpdate()}#dt(e,t,n,r){let i=this.#ot(e,{placement:`right-start`,anchor:this.#me,onSelect:e=>this.open(e)}),{loose:a,subgroups:o}=ci(t.items),s=t.items.some(e=>e.id===this.#o),c=e=>N`<div
        class="flyout-item"
        role="menuitem"
        id=${i.itemId(e.id)}
        data-value=${e.id}
        ?data-highlighted=${i.highlighted===e.id}
        ?data-current=${e.id===this.#o}
      >${this.#Pe(e,!1,e.title,!0)}</div>`;return N`
      <button
        type="button"
        class="item"
        aria-label=${n}
        aria-current=${Vr(s?`true`:void 0)}
        data-tip=${n}
        id=${i.triggerId}
        aria-haspopup="menu"
        aria-expanded=${i.open}
        aria-controls=${i.popupId}
        data-state=${i.open?`open`:`closed`}
        @click=${i.toggle}
        @keydown=${i.onTriggerKeyDown}
      >${r===void 0?N`<span class="tile" aria-hidden="true">${Ei(n)}</span>`:Oi(r)}</button>
      ${this.#ct(i,{class:`flyout`},N`<div class="flyout-title">${n}</div>
          ${a.map(c)}
          ${o.map((e,t)=>{let n=`${i.popupId}-group-${t}`;return N`<div role="group" aria-labelledby=${n}>
              <div class="flyout-label" id=${n}>${e.name}</div>
              ${e.items.map(c)}
            </div>`})}`)}
    `}#ft(e,t,n){let r=this.#ot(`group-select`,{placement:`bottom-start`,gutter:4,sameWidth:!0,selected:()=>n,onSelect:e=>{this.#C=e,this.requestUpdate()}}),i=t.find(e=>e.name===n);return N`
      <button
        type="button"
        class="group-select"
        aria-label=${e.group}
        id=${r.triggerId}
        aria-haspopup="listbox"
        aria-expanded=${r.open}
        aria-controls=${r.popupId}
        data-state=${r.open?`open`:`closed`}
        @click=${r.toggle}
        @keydown=${r.onTriggerKeyDown}
      >
        <span class="group-select-value">${i===void 0?``:this.#oe(i)}</span>
        ${i===void 0?P:N`<span class="group-count">${i.items.length}</span>`}
        <span class="group-select-icon">${yi()}</span>
      </button>
      ${this.#ct(r,{class:`select-popup`,listbox:!0},N`<div class="select-list">${t.map(e=>{let t=e.name===n;return N`<div
              class="select-item"
              role="option"
              aria-selected=${t}
              id=${r.itemId(e.name)}
              data-value=${e.name}
              ?data-highlighted=${r.highlighted===e.name}
            >
              <span class="select-indicator" ?hidden=${!t}>${bi()}</span>
              <span class="select-item-text">${this.#oe(e)}</span>
              <span class="select-item-count">${e.items.length}</span>
            </div>`})}</div>`)}
    `}#pt(e,t,n){let r=this.#e.userMenu??[],i=N`
      ${n.avatar===void 0?N`<span class="avatar" aria-hidden="true">${Ti(n.name).toUpperCase()}</span>`:N`<img class="avatar" src=${n.avatar} alt="" />`}
      <span class="user-text">
        <span class="user-name">${n.name}</span>
        ${n.detail===void 0?P:N`<span class="user-detail">${n.detail}</span>`}
      </span>
    `;if(Hi(r).length===0)return N`<div class="user-row">
        <div class="user-button" aria-label=${Vr(t?n.name:void 0)} data-tip=${Vr(t?n.name:void 0)}>${i}</div>
      </div>`;let a=this.#ot(`user`,{...this.#te?{placement:`top-start`,sameWidth:!0}:{placement:`right-end`,anchor:this.#me},onSelect:e=>this.#ut(r,e)});return N`<div class="user-row">
      <button
        type="button"
        class="user-button"
        aria-label="${e.account}: ${n.name}"
        data-tip=${Vr(t?n.name:void 0)}
        id=${a.triggerId}
        aria-haspopup="menu"
        aria-expanded=${a.open}
        aria-controls=${a.popupId}
        data-state=${a.open?`open`:`closed`}
        @click=${a.toggle}
        @keydown=${a.onTriggerKeyDown}
      >
        ${i}
        <svg class="icon icon--chevron-right" viewBox="0 0 24 24" aria-hidden="true"><path d="m10 7 5 5-5 5" /></svg>
      </button>
      ${this.#ct(a,{class:`menu-popup`,flush:!0},this.#lt(a,r))}
    </div>`}#mt(e,t,n=!1){let r=this.#e.footer??{},i=r.actions??[],a=r.menu??[],o=n?`bottom`:t?`right`:`top`,s=n?{placement:`bottom-end`,anchor:this.#he}:t?{placement:`right-end`,anchor:this.#me}:{placement:`top-start`,anchor:e=>e.closest(`.footer`)?.getBoundingClientRect()??new DOMRect,sameWidth:!0},c={drop:n,flush:!n,sheet:!t&&!n},l=(e,t,n,r=!1)=>N`<button
        type="button"
        class=${r?`footer-button footer-more`:`footer-button`}
        aria-label=${t}
        data-tip=${t}
        data-tip-side=${o}
        id=${e.triggerId}
        aria-haspopup="menu"
        aria-expanded=${e.open}
        aria-controls=${e.popupId}
        data-state=${e.open?`open`:`closed`}
        @click=${e.toggle}
        @keydown=${e.onTriggerKeyDown}
      >${n}</button>`,u=(e,t)=>{let n=this.#ot(`action:${e.id}`,{...s,onSelect:e=>this.#ut(t,e)});return N`${l(n,e.label,this.#ht(e))}${this.#ct(n,{class:`menu-popup menu-popup--choices`,...c},this.#lt(n,t))}`},d=(e,t)=>{let n=this.#ot(`choice:${e.id}`,{...s,onSelect:e=>{t.onChange(e),this.requestUpdate()}}),r=t.options.find(e=>e.value===t.value()),i=r===void 0?e.label:`${e.label}: ${r.label}`;return N`${l(n,i,this.#ht(e))}${this.#ct(n,{class:`menu-popup menu-popup--choices`,...c},N`<div class="menu-group-label">${e.label}</div>
            ${t.options.map(e=>{let r=e.value===t.value();return N`<div
                class="menu-item"
                role="menuitemradio"
                aria-checked=${r}
                id=${n.itemId(e.value)}
                data-value=${e.value}
                ?data-highlighted=${n.highlighted===e.value}
                ?data-checked=${r}
              >
                <span class="menu-icon menu-check" ?data-checked=${r}>${bi()}</span>
                <span class="menu-label">${e.label}</span>
              </div>`})}`)}`},f=Hi(a).length===0?void 0:this.#ot(`more`,{...s,onSelect:e=>this.#ut(a,e)});return N`<div class=${n?`top-actions`:`footer`} role="toolbar" aria-label=${e.footer} aria-orientation=${t?`vertical`:`horizontal`}>
      ${this.#p||n?P:N`<button
          type="button"
          class="footer-button footer-toggle"
          aria-label=${t?e.expand:e.collapse}
          aria-expanded=${!t}
          data-tip=${t?e.expand:e.collapse}
          data-tip-side=${o}
          @click=${this.#ce}
        >${vi()}</button>`}
      <div class="footer-actions">
        ${i.map(e=>e.menu===void 0?e.choices===void 0?N`<button
            type="button"
            class="footer-button"
            aria-label=${e.label}
            data-tip=${e.label}
            data-tip-side=${o}
            @click=${()=>e.onSelect?.()}
          >${this.#ht(e)}</button>`:d(e,e.choices):u(e,e.menu))}
      </div>
      ${f===void 0?P:N`${l(f,e.more,Ci(),!0)}${this.#ct(f,{class:`menu-popup`,...c},this.#lt(f,a))}`}
    </div>`}#ht(e){return N`<span class="footer-icon" aria-hidden="true">${oi(e.icon)}</span>${e.badge===!0?N`<span class="footer-badge" aria-hidden="true"></span>`:P}`}#gt(e){let t=this.#K,n=this.#e.recent===!1?[]:this.#re,r=this.#L(`.palette`,()=>this.#h,this.#ue),i=this.#b.trim()===``?[...n.length>0?[{label:e.recent,matches:n.map(e=>({item:e}))}]:[],...si(t).flatMap(t=>{let n=t.name===``?e.other:t.name;if(!this.#Q)return[{label:n,matches:t.items.map(e=>({item:e}))}];let{loose:r,subgroups:i}=ci(t.items);return[...r.length>0?[{label:n,matches:r.map(e=>({item:e}))}]:[],...i.map(e=>({label:`${n} › ${e.name}`,matches:e.items.map(e=>({item:e}))}))]})]:[{label:``,matches:li(t,this.#b)}],a=i.flatMap(e=>e.matches),o=a[Math.min(this.#x,a.length-1)],s=`${this.#t}-results`,c=e=>{this.#ue(),this.open(e)},l=e=>{let t={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8}[e.key];t!==void 0&&a.length>0?(e.preventDefault(),this.#x=Math.max(0,Math.min(a.length-1,this.#x+t)),this.requestUpdate(),this.updateComplete.then(()=>this.#pe(`.palette-option[data-current]`)?.scrollIntoView({block:`nearest`}))):e.key===`Enter`&&o!==void 0&&(e.preventDefault(),c(o.item.id))},u=-1;return N`<dialog
      class="dialog palette-dialog"
      aria-labelledby=${`${this.#t}-search-title`}
      @cancel=${r.cancel}
      @close=${r.close}
      @pointerdown=${r.pointerdown}
    >
      <div class="backdrop"></div>
      <div class="palette-layer">
        <div
          class="palette"
          @animationend=${e=>{e.target===e.currentTarget&&this.#de()}}
        >
          <h2 class="visually-hidden" id=${`${this.#t}-search-title`}>${e.search}</h2>
          <div class="palette-field">
            ${gi()}
            <input
              class="palette-input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls=${s}
              aria-activedescendant=${Vr(o===void 0?void 0:`${s}-${o.item.id}`)}
              aria-autocomplete="list"
              autocomplete="off"
              spellcheck="false"
              placeholder=${e.searchPlaceholder}
              .value=${this.#b}
              @input=${e=>{this.#b=e.target.value,this.#x=0,this.requestUpdate()}}
              @keydown=${l}
            />
            <button
              type="button"
              class="search-button"
              aria-label=${e.closeSheet}
              @click=${this.#ue}
            >${xi()}</button>
          </div>
          <div id=${s} class="palette-list" role="listbox" aria-label=${e.search}>
            ${a.length===0?N`<p class="palette-empty">${e.noResults}</p>`:P}
            ${i.map(e=>e.matches.length===0?P:N`<div role="group" aria-label=${Vr(e.label||void 0)}>
          ${e.label===``?P:N`<div class="palette-section">${e.label}</div>`}
          ${e.matches.map(t=>{u+=1;let n=u,r=t===o,{title:i,group:a,subgroup:l}=t.item;return N`<div
              id=${Vr(r?`${s}-${t.item.id}`:void 0)}
              class="palette-option"
              role="option"
              aria-selected=${r}
              ?data-current=${r}
              @mousemove=${()=>{this.#x!==n&&(this.#x=n,this.requestUpdate())}}
              @click=${()=>c(t.item.id)}
            >
              ${Di(t.item)}
              <span class="palette-text">
                <span class="palette-title">${t.title===void 0?i:N`${i.slice(0,t.title.start)}<mark>${i.slice(t.title.start,t.title.end)}</mark>${i.slice(t.title.end)}`}</span>
                ${t.item.description===void 0?P:N`<span class="palette-description">${t.item.description}</span>`}
              </span>
              ${a!==void 0&&e.label===``?N`<span class="palette-group">${l===void 0?a:`${a} › ${l}`}</span>`:P}
              ${t.item.id===this.#o?N`<span class="palette-dot" aria-hidden="true"></span>`:P}
            </div>`})}
        </div>`)}
          </div>
          <footer class="palette-footer">
            <span><kbd class="key">↑</kbd><kbd class="key">↓</kbd> ${e.move}</span>
            <span><kbd class="key">↵</kbd> ${e.open}</span>
            <span><kbd class="key">Esc</kbd> ${e.close}</span>
            <span class="palette-count">${e.items(this.#b.trim()===``?t.length:a.length)}</span>
          </footer>
        </div>
      </div>
    </dialog>`}};function Ji(e){return class extends qi{constructor(){super(e)}}}function Yi(e){return typeof e!=`string`||!e.includes(`var(--mantine-scale)`)?e:e.match(/^calc\((.*?)\)$/)?.[1].split(`*`)[0].trim()}function Xi(e){let t=Yi(e);return typeof t==`number`?t:typeof t==`string`?t.includes(`calc`)||t.includes(`var`)?t:t.includes(`px`)?Number(t.replace(`px`,``)):t.includes(`rem`)?Number(t.replace(`rem`,``))*16:t.includes(`em`)?Number(t.replace(`em`,``))*16:Number(t):NaN}function Zi(e,t){return e in t?Xi(t[e]):Xi(e)}function Qi(e,t){let n=e.map(e=>({value:e,px:Zi(e,t)}));return n.sort((e,t)=>e.px-t.px),n}function $i(e){return typeof e==`object`&&e?`base`in e?e.base:void 0:e}function ea(e=`mantine-`){return`${e}${Math.random().toString(36).slice(2,11)}`}var F=e(t(),1);function ta(e,t){return typeof t==`boolean`?t:typeof window<`u`&&`matchMedia`in window&&window.matchMedia(e).matches}function na(e,t,{getInitialValueInEffect:n}={getInitialValueInEffect:!0}){let[r,i]=(0,F.useState)(n?t:ta(e));return(0,F.useEffect)(()=>{try{if(`matchMedia`in window){let t=window.matchMedia(e);i(t.matches);let n=e=>i(e.matches);return t.addEventListener(`change`,n),()=>{t.removeEventListener(`change`,n)}}}catch{return}},[e]),r||!1}var ra=typeof document<`u`?F.useLayoutEffect:F.useEffect;function ia(e,t){let n=(0,F.useRef)(!1);(0,F.useEffect)(()=>()=>{n.current=!1},[]),(0,F.useEffect)(()=>{if(n.current)return e();n.current=!0},t)}function aa(e){let[t,n]=(0,F.useState)(`mantine-${(0,F.useId)().replace(/:/g,``)}`),r=(0,F.useRef)(!1);return ra(()=>{r.current||(r.current=!0,n(ea()))},[]),typeof e==`string`?e:t}function I({value:e,defaultValue:t,finalValue:n,onChange:r=()=>{}}){let[i,a]=(0,F.useState)(t===void 0?n:t);return e===void 0?[i,(e,...t)=>{a(e),r?.(e,...t)},!1]:[e,r,!0]}function L(e,t){return na(`(prefers-reduced-motion: reduce)`,e,t)}var oa=n((e=>{var n=t();function r(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function i(){}var a={d:{f:i,r:function(){throw Error(r(522))},D:i,C:i,L:i,m:i,X:i,S:i,M:i},p:0,findDOMNode:null},o=Symbol.for(`react.portal`),s=Symbol.for(`react.recoverable`),c=Symbol.for(`react.optimistic_key`);function l(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:o,key:r==null?null:r===c?c:``+r,children:e,containerInfo:t,implementation:n}}var u=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function d(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=a,e.browser=function(e){return{$$typeof:s,_reason:e}},e.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(r(299));return l(e,t,null,n)},e.flushSync=function(e){var t=u.T,n=a.p;try{if(u.T=null,a.p=2,e)return e()}finally{u.T=t,a.p=n,a.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,a.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&a.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=d(n,t.crossOrigin),i=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?a.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:i,fetchPriority:o}):n===`script`&&a.d.X(e,{crossOrigin:r,integrity:i,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`){if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=d(t.as,t.crossOrigin);a.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0})}}else t??a.d.M(e)}},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=d(n,t.crossOrigin);a.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`){if(t){var n=d(t.as,t.crossOrigin);a.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0})}else a.d.m(e)}},e.requestFormReset=function(e){a.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return u.H.useFormState(e,t,n)},e.useFormStatus=function(){return u.H.useHostTransitionStatus()},e.version=`19.3.0`})),sa=n(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=oa()}));function ca(e){return e===`auto`||e===`dark`||e===`light`}function la({key:e=`mantine-color-scheme-value`}={}){let t;return{get:t=>{if(typeof window>`u`)return t;try{let n=window.localStorage.getItem(e);return ca(n)?n:t}catch{return t}},set:t=>{try{window.localStorage.setItem(e,t)}catch(e){console.warn(`[@mantine/core] Local storage color scheme manager was unable to save color scheme.`,e)}},subscribe:n=>{t=t=>{t.storageArea===window.localStorage&&t.key===e&&ca(t.newValue)&&n(t.newValue)},window.addEventListener(`storage`,t)},unsubscribe:()=>{window.removeEventListener(`storage`,t)},clear:()=>{window.localStorage.removeItem(e)}}}function ua({color:e,theme:t,autoContrast:n,colorScheme:r}){return(typeof n==`boolean`?n:t.autoContrast)&&s({color:e||t.primaryColor,theme:t,colorScheme:r}).isLight?`var(--mantine-color-black)`:`var(--mantine-color-white)`}function da(e,t,n){return ua({color:n===`dark`?e.dark:e.light,theme:t,colorScheme:n,autoContrast:!0})}function fa(e,t){let n=e.colors[e.primaryColor];return v(n)?e.autoContrast?da(n,e,t):`var(--mantine-color-white)`:ua({color:n[h(e,t)],theme:e,autoContrast:null})}function pa(e,t){let n=typeof window<`u`&&`matchMedia`in window&&window.matchMedia(`(prefers-color-scheme: dark)`)?.matches,r=e===`auto`?n?`dark`:`light`:e;t()?.setAttribute(`data-mantine-color-scheme`,r)}function ma({manager:e,defaultColorScheme:t,getRootElement:n,forceColorScheme:r}){let i=(0,F.useRef)(null),[a,o]=(0,F.useState)(()=>e.get(t)),s=r||a,c=(0,F.useCallback)(t=>{r||(pa(t,n),o(t),e.set(t))},[e.set,s,r]),l=(0,F.useCallback)(()=>{o(t),pa(t,n),e.clear()},[e.clear,t]);return(0,F.useEffect)(()=>(e.subscribe(c),e.unsubscribe),[e.subscribe,e.unsubscribe]),ra(()=>{pa(e.get(t),n)},[]),(0,F.useEffect)(()=>{if(r)return pa(r,n),()=>{};r===void 0&&pa(a,n),typeof window<`u`&&`matchMedia`in window&&(i.current=window.matchMedia(`(prefers-color-scheme: dark)`));let e=e=>{a===`auto`&&pa(e.matches?`dark`:`light`,n)};return i.current?.addEventListener(`change`,e),()=>i.current?.removeEventListener(`change`,e)},[a,r]),{colorScheme:s,setColorScheme:c,clearColorScheme:l}}function ha(e){return Object.entries(e).map(([e,t])=>`${e}: ${t};`).join(``)}function ga(e,t){let n=t?[t]:[`:root`,`:host`],r=ha(e.variables),i=r?`${n.join(`, `)}{${r}}`:``,a=ha(e.dark),o=ha(e.light),s=e=>n.map(t=>t===`:host`?`${t}([data-mantine-color-scheme="${e}"])`:`${t}[data-mantine-color-scheme="${e}"]`).join(`, `);return`${i}\n\n${a?`${s(`dark`)}{${a}}`:``}\n\n${o?`${s(`light`)}{${o}}`:``}`}function _a({theme:e,color:t,colorScheme:n,name:r=t,withColorValues:i=!0}){if(!e.colors[t])return{};if(n===`light`){let n=h(e,`light`),a={[`--mantine-color-${r}-text`]:`var(--mantine-color-${r}-filled)`,[`--mantine-color-${r}-filled`]:`var(--mantine-color-${r}-${n})`,[`--mantine-color-${r}-filled-hover`]:`var(--mantine-color-${r}-${n===9?8:n+1})`,[`--mantine-color-${r}-light`]:`var(--mantine-color-${r}-1)`,[`--mantine-color-${r}-light-hover`]:`var(--mantine-color-${r}-2)`,[`--mantine-color-${r}-light-color`]:`var(--mantine-color-${r}-9)`,[`--mantine-color-${r}-outline`]:`var(--mantine-color-${r}-${n})`,[`--mantine-color-${r}-outline-hover`]:le(e.colors[t][n],.05)};return i?{[`--mantine-color-${r}-0`]:e.colors[t][0],[`--mantine-color-${r}-1`]:e.colors[t][1],[`--mantine-color-${r}-2`]:e.colors[t][2],[`--mantine-color-${r}-3`]:e.colors[t][3],[`--mantine-color-${r}-4`]:e.colors[t][4],[`--mantine-color-${r}-5`]:e.colors[t][5],[`--mantine-color-${r}-6`]:e.colors[t][6],[`--mantine-color-${r}-7`]:e.colors[t][7],[`--mantine-color-${r}-8`]:e.colors[t][8],[`--mantine-color-${r}-9`]:e.colors[t][9],...a}:a}let a=h(e,`dark`),o={[`--mantine-color-${r}-text`]:`var(--mantine-color-${r}-4)`,[`--mantine-color-${r}-filled`]:`var(--mantine-color-${r}-${a})`,[`--mantine-color-${r}-filled-hover`]:`var(--mantine-color-${r}-${a===9?8:a+1})`,[`--mantine-color-${r}-light`]:ce(e.colors[t][9],.5),[`--mantine-color-${r}-light-hover`]:ce(e.colors[t][9],.3),[`--mantine-color-${r}-light-color`]:`var(--mantine-color-${r}-0)`,[`--mantine-color-${r}-outline`]:`var(--mantine-color-${r}-${Math.max(a-4,0)})`,[`--mantine-color-${r}-outline-hover`]:le(e.colors[t][Math.max(a-4,0)],.05)};return i?{[`--mantine-color-${r}-0`]:e.colors[t][0],[`--mantine-color-${r}-1`]:e.colors[t][1],[`--mantine-color-${r}-2`]:e.colors[t][2],[`--mantine-color-${r}-3`]:e.colors[t][3],[`--mantine-color-${r}-4`]:e.colors[t][4],[`--mantine-color-${r}-5`]:e.colors[t][5],[`--mantine-color-${r}-6`]:e.colors[t][6],[`--mantine-color-${r}-7`]:e.colors[t][7],[`--mantine-color-${r}-8`]:e.colors[t][8],[`--mantine-color-${r}-9`]:e.colors[t][9],...o}:o}function va(e,t,n){y(t).forEach(r=>Object.assign(e,{[`--mantine-${n}-${r}`]:t[r]}))}var ya=e=>{let t=h(e,`light`),n=e.defaultRadius in e.radius?e.radius[e.defaultRadius]:b(e.defaultRadius),r={variables:{"--mantine-z-index-app":`100`,"--mantine-z-index-modal":`200`,"--mantine-z-index-popover":`300`,"--mantine-z-index-overlay":`400`,"--mantine-z-index-max":`9999`,"--mantine-scale":e.scale.toString(),"--mantine-cursor-type":e.cursorType,"--mantine-webkit-font-smoothing":e.fontSmoothing?`antialiased`:`unset`,"--mantine-moz-font-smoothing":e.fontSmoothing?`grayscale`:`unset`,"--mantine-color-white":e.white,"--mantine-color-black":e.black,"--mantine-line-height":e.lineHeights.md,"--mantine-font-family":e.fontFamily,"--mantine-font-family-monospace":e.fontFamilyMonospace,"--mantine-font-family-headings":e.headings.fontFamily,"--mantine-heading-font-weight":e.headings.fontWeight,"--mantine-heading-text-wrap":e.headings.textWrap,"--mantine-radius-default":n,"--mantine-primary-color-filled":`var(--mantine-color-${e.primaryColor}-filled)`,"--mantine-primary-color-filled-hover":`var(--mantine-color-${e.primaryColor}-filled-hover)`,"--mantine-primary-color-light":`var(--mantine-color-${e.primaryColor}-light)`,"--mantine-primary-color-light-hover":`var(--mantine-color-${e.primaryColor}-light-hover)`,"--mantine-primary-color-light-color":`var(--mantine-color-${e.primaryColor}-light-color)`},light:{"--mantine-color-scheme":`light`,"--mantine-primary-color-contrast":fa(e,`light`),"--mantine-color-bright":`var(--mantine-color-black)`,"--mantine-color-text":e.black,"--mantine-color-body":e.white,"--mantine-color-error":`var(--mantine-color-red-6)`,"--mantine-color-success":`var(--mantine-color-teal-8)`,"--mantine-color-placeholder":`var(--mantine-color-gray-5)`,"--mantine-color-anchor":`var(--mantine-color-${e.primaryColor}-${t})`,"--mantine-color-default":`var(--mantine-color-white)`,"--mantine-color-default-hover":`var(--mantine-color-gray-0)`,"--mantine-color-default-color":`var(--mantine-color-black)`,"--mantine-color-default-border":`var(--mantine-color-gray-4)`,"--mantine-color-dimmed":`var(--mantine-color-gray-6)`,"--mantine-color-disabled":`var(--mantine-color-gray-2)`,"--mantine-color-disabled-color":`var(--mantine-color-gray-5)`,"--mantine-color-disabled-border":`var(--mantine-color-gray-3)`},dark:{"--mantine-color-scheme":`dark`,"--mantine-primary-color-contrast":fa(e,`dark`),"--mantine-color-bright":`var(--mantine-color-white)`,"--mantine-color-text":`var(--mantine-color-dark-0)`,"--mantine-color-body":`var(--mantine-color-dark-7)`,"--mantine-color-error":`var(--mantine-color-red-8)`,"--mantine-color-success":`var(--mantine-color-teal-8)`,"--mantine-color-placeholder":`var(--mantine-color-dark-3)`,"--mantine-color-anchor":`var(--mantine-color-${e.primaryColor}-4)`,"--mantine-color-default":`var(--mantine-color-dark-6)`,"--mantine-color-default-hover":`var(--mantine-color-dark-5)`,"--mantine-color-default-color":`var(--mantine-color-white)`,"--mantine-color-default-border":`var(--mantine-color-dark-4)`,"--mantine-color-dimmed":`var(--mantine-color-dark-2)`,"--mantine-color-disabled":`var(--mantine-color-dark-6)`,"--mantine-color-disabled-color":`var(--mantine-color-dark-3)`,"--mantine-color-disabled-border":`var(--mantine-color-dark-4)`}};va(r.variables,e.breakpoints,`breakpoint`),va(r.variables,e.spacing,`spacing`),va(r.variables,e.fontSizes,`font-size`),va(r.variables,e.lineHeights,`line-height`),va(r.variables,e.shadows,`shadow`),va(r.variables,e.radius,`radius`),va(r.variables,e.fontWeights,`font-weight`),e.colors[e.primaryColor].forEach((t,n)=>{r.variables[`--mantine-primary-color-${n}`]=`var(--mantine-color-${e.primaryColor}-${n})`}),y(e.colors).forEach(t=>{let n=e.colors[t];if(v(n)){Object.assign(r.light,_a({theme:e,name:n.name,color:n.light,colorScheme:`light`,withColorValues:!0})),Object.assign(r.dark,_a({theme:e,name:n.name,color:n.dark,colorScheme:`dark`,withColorValues:!0})),r.light[`--mantine-color-${n.name}-contrast`]=da(n,e,`light`),r.dark[`--mantine-color-${n.name}-contrast`]=da(n,e,`dark`);return}n.forEach((e,n)=>{r.variables[`--mantine-color-${t}-${n}`]=e}),Object.assign(r.light,_a({theme:e,color:t,colorScheme:`light`,withColorValues:!1})),Object.assign(r.dark,_a({theme:e,color:t,colorScheme:`dark`,withColorValues:!1}))});let i=e.headings.sizes;return y(i).forEach(t=>{r.variables[`--mantine-${t}-font-size`]=i[t].fontSize,r.variables[`--mantine-${t}-line-height`]=i[t].lineHeight,r.variables[`--mantine-${t}-font-weight`]=i[t].fontWeight||e.headings.fontWeight}),r},R=r();function ba(){let e=oe(),t=C(),n=y(e.breakpoints).reduce((t,n)=>{let r=e.breakpoints[n].includes(`px`),i=Xi(e.breakpoints[n]);return`${t}@media (max-width: ${r?`${i-.1}px`:a(i-.1)}) {.mantine-visible-from-${n} {display: none !important;}}@media (min-width: ${r?`${i}px`:a(i)}) {.mantine-hidden-from-${n} {display: none !important;}}`},``);return(0,R.jsx)(`style`,{"data-mantine-styles":`classes`,nonce:t?.(),dangerouslySetInnerHTML:{__html:n}})}function xa({theme:e,generator:t}){let n=ya(e),r=t?.(e);return r?u(n,r):n}var Sa=ya(te);function Ca(e){let t={variables:{},light:{},dark:{}};return y(e.variables).forEach(n=>{Sa.variables[n]!==e.variables[n]&&(t.variables[n]=e.variables[n])}),y(e.light).forEach(n=>{Sa.light[n]!==e.light[n]&&(t.light[n]=e.light[n])}),y(e.dark).forEach(n=>{Sa.dark[n]!==e.dark[n]&&(t.dark[n]=e.dark[n])}),t}function wa(e){return ga({variables:{},dark:{"--mantine-color-scheme":`dark`},light:{"--mantine-color-scheme":`light`}},e)}function Ta({cssVariablesSelector:e,deduplicateCssVariables:t}){let n=oe(),r=C(),i=xa({theme:n,generator:x()}),a=(e===void 0||e===`:root`||e===`:host`)&&t,o=ga(a?Ca(i):i,e);return o?(0,R.jsx)(`style`,{"data-mantine-styles":!0,nonce:r?.(),dangerouslySetInnerHTML:{__html:`${o}${a?``:wa(e)}`}}):null}Ta.displayName=`@mantine/CssVariables`;function Ea({respectReducedMotion:e,getRootElement:t}){ra(()=>{e&&t()?.setAttribute(`data-respect-reduced-motion`,`true`)},[e])}function Da({theme:e,children:t,getStyleNonce:n,withStaticClasses:r=!0,withGlobalClasses:i=!0,deduplicateCssVariables:a=!0,withCssVariables:o=!0,cssVariablesSelector:s,classNamesPrefix:c=`mantine`,colorSchemeManager:l=la(),defaultColorScheme:u=`light`,getRootElement:d=()=>document.documentElement,cssVariablesResolver:f,forceColorScheme:p,stylesTransform:m,env:h,deduplicateInlineStyles:g=!1}){let{colorScheme:_,setColorScheme:v,clearColorScheme:y}=ma({defaultColorScheme:u,forceColorScheme:p,manager:l,getRootElement:d});return Ea({respectReducedMotion:e?.respectReducedMotion||!1,getRootElement:d}),(0,R.jsx)(ee,{value:{colorScheme:_,setColorScheme:v,clearColorScheme:y,getRootElement:d,classNamesPrefix:c,getStyleNonce:n,cssVariablesResolver:f,cssVariablesSelector:s??`:root`,withStaticClasses:r,stylesTransform:m,env:h,deduplicateInlineStyles:g},children:(0,R.jsxs)(T,{theme:e,children:[o&&(0,R.jsx)(Ta,{cssVariablesSelector:s,deduplicateCssVariables:a}),i&&(0,R.jsx)(ba,{}),t]})})}Da.displayName=`@mantine/core/MantineProvider`;function Oa(e){return e}function ka({classNames:e,styles:t,props:n,stylesCtx:r}){let a=oe();return{resolvedClassNames:e===void 0?void 0:i({theme:a,classNames:e,props:n,stylesCtx:r||void 0}),resolvedStyles:t===void 0?void 0:re({theme:a,styles:t,props:n,stylesCtx:r||void 0})}}var Aa={root:`m_87cf2631`},ja={__staticSelector:`UnstyledButton`},z=ae(e=>{let t=w(`UnstyledButton`,ja,e),{className:n,component:r=`button`,__staticSelector:i,unstyled:a,classNames:o,styles:s,style:c,attributes:l,...u}=t;return(0,R.jsx)(D,{...O({name:i,props:t,classes:Aa,className:n,style:c,classNames:o,styles:s,unstyled:a,attributes:l})(`root`,{focusable:!0}),component:r,type:r===`button`?`button`:void 0,...u})});z.classes=Aa,z.displayName=`@mantine/core/UnstyledButton`;var Ma={root:`m_1b7284a3`},Na=p((e,{radius:t,shadow:n})=>({root:{"--paper-radius":t===void 0?void 0:l(t),"--paper-shadow":d(n)}})),Pa=ae(e=>{let t=w(`Paper`,null,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,withBorder:s,vars:c,radius:l,shadow:u,variant:d,mod:f,attributes:p,...m}=t,h=O({name:`Paper`,props:t,classes:Ma,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:p,vars:c,varsResolver:Na});return(0,R.jsx)(D,{mod:[{"data-with-border":s},f],...h(`root`),variant:d,...m})});Pa.classes=Ma,Pa.varsResolver=Na,Pa.displayName=`@mantine/core/Paper`;var Fa=e=>({in:{opacity:1,transform:`scale(1)`},out:{opacity:0,transform:`scale(.9) translateY(${e===`bottom`?10:-10}px)`},transitionProperty:`transform, opacity`}),Ia={fade:{in:{opacity:1},out:{opacity:0},transitionProperty:`opacity`},"fade-up":{in:{opacity:1,transform:`translateY(0)`},out:{opacity:0,transform:`translateY(30px)`},transitionProperty:`opacity, transform`},"fade-down":{in:{opacity:1,transform:`translateY(0)`},out:{opacity:0,transform:`translateY(-30px)`},transitionProperty:`opacity, transform`},"fade-left":{in:{opacity:1,transform:`translateX(0)`},out:{opacity:0,transform:`translateX(30px)`},transitionProperty:`opacity, transform`},"fade-right":{in:{opacity:1,transform:`translateX(0)`},out:{opacity:0,transform:`translateX(-30px)`},transitionProperty:`opacity, transform`},scale:{in:{opacity:1,transform:`scale(1)`},out:{opacity:0,transform:`scale(0)`},common:{transformOrigin:`top`},transitionProperty:`transform, opacity`},"scale-y":{in:{opacity:1,transform:`scaleY(1)`},out:{opacity:0,transform:`scaleY(0)`},common:{transformOrigin:`top`},transitionProperty:`transform, opacity`},"scale-x":{in:{opacity:1,transform:`scaleX(1)`},out:{opacity:0,transform:`scaleX(0)`},common:{transformOrigin:`left`},transitionProperty:`transform, opacity`},"skew-up":{in:{opacity:1,transform:`translateY(0) skew(0deg, 0deg)`},out:{opacity:0,transform:`translateY(-20px) skew(-10deg, -5deg)`},common:{transformOrigin:`top`},transitionProperty:`transform, opacity`},"skew-down":{in:{opacity:1,transform:`translateY(0) skew(0deg, 0deg)`},out:{opacity:0,transform:`translateY(20px) skew(-10deg, -5deg)`},common:{transformOrigin:`bottom`},transitionProperty:`transform, opacity`},"rotate-left":{in:{opacity:1,transform:`translateY(0) rotate(0deg)`},out:{opacity:0,transform:`translateY(20px) rotate(-5deg)`},common:{transformOrigin:`bottom`},transitionProperty:`transform, opacity`},"rotate-right":{in:{opacity:1,transform:`translateY(0) rotate(0deg)`},out:{opacity:0,transform:`translateY(20px) rotate(5deg)`},common:{transformOrigin:`top`},transitionProperty:`transform, opacity`},"slide-down":{in:{opacity:1,transform:`translateY(0)`},out:{opacity:0,transform:`translateY(-100%)`},common:{transformOrigin:`top`},transitionProperty:`transform, opacity`},"slide-up":{in:{opacity:1,transform:`translateY(0)`},out:{opacity:0,transform:`translateY(100%)`},common:{transformOrigin:`bottom`},transitionProperty:`transform, opacity`},"slide-left":{in:{opacity:1,transform:`translateX(0)`},out:{opacity:0,transform:`translateX(100%)`},common:{transformOrigin:`left`},transitionProperty:`transform, opacity`},"slide-right":{in:{opacity:1,transform:`translateX(0)`},out:{opacity:0,transform:`translateX(-100%)`},common:{transformOrigin:`right`},transitionProperty:`transform, opacity`},pop:{...Fa(`bottom`),common:{transformOrigin:`center center`}},"pop-bottom-left":{...Fa(`bottom`),common:{transformOrigin:`bottom left`}},"pop-bottom-right":{...Fa(`bottom`),common:{transformOrigin:`bottom right`}},"pop-top-left":{...Fa(`top`),common:{transformOrigin:`top left`}},"pop-top-right":{...Fa(`top`),common:{transformOrigin:`top right`}}},La={entering:`in`,entered:`in`,exiting:`out`,exited:`out`,"pre-exiting":`out`,"pre-entering":`out`};function Ra({transition:e,state:t,duration:n,timingFunction:r}){let i={WebkitBackfaceVisibility:`hidden`,transitionDuration:`${n}ms`,transitionTimingFunction:r};return typeof e==`string`?e in Ia?{transitionProperty:Ia[e].transitionProperty,...i,...Ia[e].common,...Ia[e][La[t]]}:{}:{transitionProperty:e.transitionProperty,...i,...e.common,...e[La[t]]}}var za=e(sa(),1);function Ba({duration:e,exitDuration:t,timingFunction:n,mounted:r,onEnter:i,onExit:a,onEntered:o,onExited:s,enterDelay:c,exitDelay:l}){let u=oe(),d=L(),f=u.respectReducedMotion?d:!1,[p,m]=(0,F.useState)(f?0:e),[h,g]=(0,F.useState)(r?`entered`:`exited`),_=(0,F.useRef)(-1),v=(0,F.useRef)(-1),y=(0,F.useRef)(-1);function b(){window.clearTimeout(_.current),window.clearTimeout(v.current),cancelAnimationFrame(y.current)}let x=n=>{b();let r=n?i:a,c=n?o:s,l=f?0:n?e:t;m(l),l===0?(typeof r==`function`&&r(),typeof c==`function`&&c(),g(n?`entered`:`exited`)):y.current=requestAnimationFrame(()=>{za.flushSync(()=>{g(n?`pre-entering`:`pre-exiting`)}),y.current=requestAnimationFrame(()=>{typeof r==`function`&&r(),g(n?`entering`:`exiting`),_.current=window.setTimeout(()=>{typeof c==`function`&&c(),g(n?`entered`:`exited`)},l)})})},S=e=>{if(b(),typeof(e?c:l)!=`number`){x(e);return}v.current=window.setTimeout(()=>{x(e)},e?c:l)};return ia(()=>{S(r)},[r]),(0,F.useEffect)(()=>()=>{b()},[]),{transitionDuration:p,transitionStatus:h,transitionTimingFunction:n||`ease`}}function Va({keepMounted:e,keepMountedMode:t=`activity`,transition:n=`fade`,duration:r=250,exitDuration:i=r,mounted:a,children:o,timingFunction:s=`ease`,onExit:c,onEntered:l,onEnter:u,onExited:d,enterDelay:f,exitDelay:p}){let m=ue(),{transitionDuration:h,transitionStatus:g,transitionTimingFunction:_}=Ba({mounted:a,exitDuration:i,duration:r,timingFunction:s,onExit:c,onEntered:l,onEnter:u,onExited:d,enterDelay:f,exitDelay:p});if(m===`test`)return a?(0,R.jsx)(R.Fragment,{children:o({})}):e?o({display:`none`}):null;if(h===0)return e?t===`display-none`?a?(0,R.jsx)(R.Fragment,{children:o({})}):o({display:`none`}):(0,R.jsx)(F.Activity,{mode:a?`visible`:`hidden`,children:o({})}):a?(0,R.jsx)(R.Fragment,{children:o({})}):null;let v=g===`exited`;if(e){let e=o(v?t===`display-none`?{display:`none`}:{}:Ra({transition:n,duration:h,state:g,timingFunction:_}));return t===`display-none`?e:(0,R.jsx)(F.Activity,{mode:v?`hidden`:`visible`,children:e})}return v?null:(0,R.jsx)(R.Fragment,{children:o(Ra({transition:n,duration:h,state:g,timingFunction:_}))})}Va.displayName=`@mantine/core/Transition`;var Ha={root:`m_5ae2e3c`,barsLoader:`m_7a2bd4cd`,bar:`m_870bb79`,"bars-loader-animation":`m_5d2b3b9d`,dotsLoader:`m_4e3f22d7`,dot:`m_870c4af`,"loader-dots-animation":`m_aac34a1`,ovalLoader:`m_b34414df`,"oval-loader-animation":`m_f8e89c4b`},Ua=({className:e,...t})=>(0,R.jsxs)(D,{component:`span`,className:ne(Ha.barsLoader,e),...t,children:[(0,R.jsx)(`span`,{className:Ha.bar}),(0,R.jsx)(`span`,{className:Ha.bar}),(0,R.jsx)(`span`,{className:Ha.bar})]});Ua.displayName=`@mantine/core/Bars`;var Wa=({className:e,...t})=>(0,R.jsxs)(D,{component:`span`,className:ne(Ha.dotsLoader,e),...t,children:[(0,R.jsx)(`span`,{className:Ha.dot}),(0,R.jsx)(`span`,{className:Ha.dot}),(0,R.jsx)(`span`,{className:Ha.dot})]});Wa.displayName=`@mantine/core/Dots`;var Ga=({className:e,...t})=>(0,R.jsx)(D,{component:`span`,className:ne(Ha.ovalLoader,e),...t});Ga.displayName=`@mantine/core/Oval`;var Ka={bars:Ua,oval:Ga,dots:Wa},qa={loaders:Ka,type:`oval`},Ja=p((e,{size:t,color:n})=>({root:{"--loader-size":f(t,`loader-size`),"--loader-color":n?c(n,e):void 0}})),Ya=E(e=>{let t=w(`Loader`,qa,e),{size:n,color:r,type:i,vars:a,className:o,style:s,classNames:c,styles:l,unstyled:u,loaders:d,variant:f,children:p,attributes:m,...h}=t,g=O({name:`Loader`,props:t,classes:Ha,className:o,style:s,classNames:c,styles:l,unstyled:u,attributes:m,vars:a,varsResolver:Ja});return p?(0,R.jsx)(D,{...g(`root`),...h,children:p}):(0,R.jsx)(D,{...g(`root`),component:d[i],variant:f,size:n,...h})});Ya.defaultLoaders=Ka,Ya.classes=Ha,Ya.varsResolver=Ja,Ya.displayName=`@mantine/core/Loader`;var Xa={root:`m_8d3f4000`,icon:`m_8d3afb97`,loader:`m_302b9fb1`,group:`m_1a0f1b21`,groupSection:`m_437b6484`},Za={orientation:`horizontal`},Qa=p((e,{borderWidth:t})=>({group:{"--ai-border-width":b(t)}})),$a=E(e=>{let t=w(`ActionIconGroup`,Za,e),{className:n,style:r,classNames:i,styles:a,unstyled:o,orientation:s,vars:c,borderWidth:l,variant:u,mod:d,attributes:f,...p}=t;return(0,R.jsx)(D,{...O({name:`ActionIconGroup`,props:t,classes:Xa,className:n,style:r,classNames:i,styles:a,unstyled:o,attributes:f,vars:c,varsResolver:Qa,rootSelector:`group`})(`group`),variant:u,mod:[{"data-orientation":s},d],role:`group`,...p})});$a.classes=Xa,$a.varsResolver=Qa,$a.displayName=`@mantine/core/ActionIconGroup`;var eo=p((e,{radius:t,color:n,gradient:r,variant:i,autoContrast:a,size:o})=>{let s=e.variantColorResolver({color:n||e.primaryColor,theme:e,gradient:r,variant:i||`filled`,autoContrast:a});return{groupSection:{"--section-height":f(o,`section-height`),"--section-padding-x":f(o,`section-padding-x`),"--section-fz":m(o),"--section-radius":t===void 0?void 0:l(t),"--section-bg":n||i?s.background:void 0,"--section-color":s.color,"--section-bd":n||i?s.border:void 0}}}),to=E(e=>{let t=w(`ActionIconGroupSection`,null,e),{className:n,style:r,classNames:i,styles:a,unstyled:o,vars:s,variant:c,gradient:l,radius:u,autoContrast:d,attributes:f,...p}=t;return(0,R.jsx)(D,{...O({name:`ActionIconGroupSection`,props:t,classes:Xa,className:n,style:r,classNames:i,styles:a,unstyled:o,attributes:f,vars:s,varsResolver:eo,rootSelector:`groupSection`})(`groupSection`),variant:c,...p})});to.classes=Xa,to.varsResolver=eo,to.displayName=`@mantine/core/ActionIconGroupSection`;var no=p((e,{size:t,radius:n,variant:r,gradient:i,color:a,autoContrast:o})=>{let s=e.variantColorResolver({color:a||e.primaryColor,theme:e,gradient:i,variant:r||`filled`,autoContrast:o});return{root:{"--ai-size":f(t,`ai-size`),"--ai-radius":n===void 0?void 0:l(n),"--ai-bg":a||r?s.background:void 0,"--ai-hover":a||r?s.hover:void 0,"--ai-hover-color":a||r?s.hoverColor:void 0,"--ai-color":s.color,"--ai-bd":a||r?s.border:void 0}}}),ro=ae(e=>{let t=w(`ActionIcon`,null,e),{className:n,unstyled:r,variant:i,classNames:a,styles:o,style:s,loading:c,loaderProps:l,size:u,color:d,radius:f,__staticSelector:p,gradient:m,vars:h,children:g,disabled:_,"data-disabled":v,autoContrast:y,mod:b,attributes:x,...S}=t,C=O({name:[`ActionIcon`,p],props:t,className:n,style:s,classes:Xa,classNames:a,styles:o,unstyled:r,attributes:x,vars:h,varsResolver:no});return(0,R.jsxs)(z,{...C(`root`,{active:!_&&!c&&!v}),"aria-busy":c||void 0,...S,unstyled:r,variant:i,size:u,disabled:_||c,mod:[{loading:c,disabled:_||v},b],children:[typeof c==`boolean`&&(0,R.jsx)(Va,{mounted:c,transition:`slide-down`,duration:150,children:e=>(0,R.jsx)(D,{component:`span`,...C(`loader`,{style:e}),"aria-hidden":!0,children:(0,R.jsx)(Ya,{color:`var(--ai-color)`,size:`calc(var(--ai-size) * 0.55)`,...l})})}),(0,R.jsx)(D,{component:`span`,mod:{loading:c},...C(`icon`),children:g})]})});ro.classes=Xa,ro.varsResolver=no,ro.displayName=`@mantine/core/ActionIcon`,ro.Group=$a,ro.GroupSection=to;function io({size:e=`var(--cb-icon-size, 70%)`,style:t,...n}){return(0,R.jsx)(`svg`,{viewBox:`0 0 15 15`,fill:`none`,xmlns:`http://www.w3.org/2000/svg`,style:{...t,width:e,height:e},...n,children:(0,R.jsx)(`path`,{d:`M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z`,fill:`currentColor`,fillRule:`evenodd`,clipRule:`evenodd`})})}io.displayName=`@mantine/core/CloseIcon`;var ao={root:`m_86a44da5`,"root--subtle":`m_220c80f2`},oo={variant:`subtle`},so=p((e,{size:t,radius:n,iconSize:r})=>({root:{"--cb-size":f(t,`cb-size`),"--cb-radius":n===void 0?void 0:l(n),"--cb-icon-size":b(r)}})),co=ae(e=>{let t=w(`CloseButton`,oo,e),{iconSize:n,children:r,vars:i,radius:a,className:o,classNames:s,style:c,styles:l,unstyled:u,"data-disabled":d,disabled:f,variant:p,icon:m,mod:h,attributes:g,__staticSelector:_,...v}=t,y=O({name:_||`CloseButton`,props:t,className:o,style:c,classes:ao,classNames:s,styles:l,unstyled:u,attributes:g,vars:i,varsResolver:so});return(0,R.jsxs)(z,{...v,unstyled:u,variant:p,disabled:f,mod:[{disabled:f||d},h],...y(`root`,{variant:p,active:!f&&!d}),children:[m||(0,R.jsx)(io,{}),r]})});co.classes=ao,co.varsResolver=so,co.displayName=`@mantine/core/CloseButton`;var lo=(0,F.createContext)({size:`sm`}),uo=E(e=>{let t=w(`InputClearButton`,null,e),{size:n,variant:r,vars:i,classNames:a,styles:o,...s}=t,c=(0,F.use)(lo),{resolvedClassNames:l,resolvedStyles:u}=ka({classNames:a,styles:o,props:t});return(0,R.jsx)(co,{variant:r||`transparent`,size:n||c?.size||`sm`,classNames:l,styles:u,__staticSelector:`InputClearButton`,style:{pointerEvents:`all`,background:`var(--input-bg)`,...s.style},...s})});uo.displayName=`@mantine/core/InputClearButton`;var fo={xs:7,sm:8,md:10,lg:12,xl:15};function po({__clearable:e,__clearSection:t,rightSection:n,__defaultRightSection:r,size:i=`sm`,__clearSectionMode:a=`both`}){let o=e&&t;return a===`rightSection`?n===null?null:n||r:a===`clear`?n===null?null:o||r:o&&(n||r)?(0,R.jsxs)(`div`,{"data-combined-clear-section":!0,style:{display:`flex`,gap:2,alignItems:`center`,paddingInlineEnd:fo[i]},children:[o,n||r]}):n===null?null:n||o||r}var mo=(0,F.createContext)({offsetBottom:!1,offsetTop:!1,describedBy:void 0,getStyles:null,inputId:void 0,labelId:void 0}),ho={wrapper:`m_6c018570`,input:`m_8fb7ebe7`,bottomSection:`m_93f4ed57`,section:`m_82577fc2`,placeholder:`m_88bacfd0`,root:`m_46b77525`,label:`m_8fdc1311`,required:`m_78a94662`,error:`m_8f816625`,success:`m_9d9d40e0`,description:`m_fe47ce59`},go=p((e,{size:t})=>({description:{"--input-description-size":t===void 0?void 0:`calc(${m(t)} - ${b(2)})`}})),_o=E(e=>{let t=w(`InputDescription`,null,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,__staticSelector:c,__inheritStyles:l=!0,attributes:u,...d}=w(`InputDescription`,null,t),f=(0,F.use)(mo),p=O({name:[`InputWrapper`,c],props:t,classes:ho,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:u,rootSelector:`description`,vars:s,varsResolver:go});return(0,R.jsx)(D,{component:`p`,...(l&&f?.getStyles||p)(`description`,f?.getStyles?{className:r,style:i}:void 0),...d})});_o.classes=ho,_o.varsResolver=go,_o.displayName=`@mantine/core/InputDescription`;var vo=p((e,{size:t})=>({error:{"--input-error-size":t===void 0?void 0:`calc(${m(t)} - ${b(2)})`}})),yo=E(e=>{let t=w(`InputError`,null,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,attributes:c,__staticSelector:l,__inheritStyles:u=!0,...d}=t,f=O({name:[`InputWrapper`,l],props:t,classes:ho,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:c,rootSelector:`error`,vars:s,varsResolver:vo}),p=(0,F.use)(mo);return(0,R.jsx)(D,{component:`p`,...(u&&p?.getStyles||f)(`error`,p?.getStyles?{className:r,style:i}:void 0),...d})});yo.classes=ho,yo.varsResolver=vo,yo.displayName=`@mantine/core/InputError`;var bo={labelElement:`label`},xo=p((e,{size:t})=>({label:{"--input-label-size":m(t),"--input-asterisk-color":void 0}})),So=E(e=>{let t=w(`InputLabel`,bo,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,labelElement:c,required:l,htmlFor:u,onMouseDown:d,children:f,__staticSelector:p,mod:m,attributes:h,...g}=t,_=O({name:[`InputWrapper`,p],props:t,classes:ho,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:h,rootSelector:`label`,vars:s,varsResolver:xo}),v=(0,F.use)(mo),y=v?.getStyles||_,b=g.component||c,x=typeof b!=`string`||b===`label`;return(0,R.jsxs)(D,{...y(`label`,v?.getStyles?{className:r,style:i}:void 0),component:c,htmlFor:x?u:void 0,mod:[{required:l},m],onMouseDown:e=>{d?.(e),!e.defaultPrevented&&e.detail>1&&e.preventDefault()},...g,children:[f,l&&(0,R.jsx)(`span`,{...y(`required`),"aria-hidden":!0,children:` *`})]})});So.classes=ho,So.varsResolver=xo,So.displayName=`@mantine/core/InputLabel`;var Co=E(e=>{let t=w(`InputPlaceholder`,null,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,__staticSelector:c,error:l,mod:u,attributes:d,...f}=t;return(0,R.jsx)(D,{...O({name:[`InputPlaceholder`,c],props:t,classes:ho,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:d,rootSelector:`placeholder`})(`placeholder`),mod:[{error:!!l},u],component:`span`,...f})});Co.classes=ho,Co.displayName=`@mantine/core/InputPlaceholder`;var wo=p((e,{size:t})=>({success:{"--input-success-size":t===void 0?void 0:`calc(${m(t)} - ${b(2)})`}})),To=E(e=>{let t=w(`InputSuccess`,null,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,attributes:c,__staticSelector:l,__inheritStyles:u=!0,...d}=t,f=O({name:[`InputWrapper`,l],props:t,classes:ho,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:c,rootSelector:`success`,vars:s,varsResolver:wo}),p=(0,F.use)(mo);return(0,R.jsx)(D,{component:`p`,...(u&&p?.getStyles||f)(`success`,p?.getStyles?{className:r,style:i}:void 0),...d})});To.classes=ho,To.varsResolver=wo,To.displayName=`@mantine/core/InputSuccess`;function Eo(e,{hasDescription:t,hasError:n}){let r=e.findIndex(e=>e===`input`),i=e.slice(0,r),a=e.slice(r+1),o=t&&i.includes(`description`)||n&&i.includes(`error`);return{offsetBottom:t&&a.includes(`description`)||n&&a.includes(`error`),offsetTop:o}}var Do={labelElement:`label`,inputContainer:e=>e,inputWrapperOrder:[`label`,`description`,`input`,`error`]},Oo=p((e,{size:t})=>({label:{"--input-label-size":m(t),"--input-asterisk-color":void 0},error:{"--input-error-size":t===void 0?void 0:`calc(${m(t)} - ${b(2)})`},success:{"--input-success-size":t===void 0?void 0:`calc(${m(t)} - ${b(2)})`},description:{"--input-description-size":t===void 0?void 0:`calc(${m(t)} - ${b(2)})`}})),ko=E(e=>{let t=w(`InputWrapper`,Do,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,size:c,variant:l,__staticSelector:u,inputContainer:d,inputWrapperOrder:f,label:p,error:m,success:h,description:g,labelProps:_,descriptionProps:v,errorProps:y,successProps:b,labelElement:x,children:S,withAsterisk:C,id:T,required:ee,__stylesApiProps:te,mod:ne,attributes:re,...ie}=t,ae=O({name:[`InputWrapper`,u],props:te||t,classes:ho,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:re,vars:s,varsResolver:Oo}),oe={size:c,variant:l,__staticSelector:u},E=aa(T),se=typeof C==`boolean`?C:ee,ce=y?.id||`${E}-error`,le=b?.id||`${E}-success`,ue=v?.id||`${E}-description`,de=E,fe=!!m&&typeof m!=`boolean`,pe=!!h&&typeof h!=`boolean`&&!m,me=!!g,he=fe&&f.includes(`error`),ge=pe&&f.includes(`error`),_e=me&&f.includes(`description`),ve=`${he?ce:``} ${ge?le:``} ${_e?ue:``}`,ye=ve.trim().length>0?ve.trim():void 0,k=_?.id||`${E}-label`,A=p&&(0,R.jsx)(So,{labelElement:x,id:k,htmlFor:de,required:se,...oe,..._,children:p},`label`),be=me&&(0,R.jsx)(_o,{...v,...oe,size:v?.size||oe.size,id:v?.id||ue,children:g},`description`),xe=(0,R.jsx)(F.Fragment,{children:d(S)},`input`),Se=fe&&(0,F.createElement)(yo,{...y,...oe,size:y?.size||oe.size,key:`error`,id:y?.id||ce},m),Ce=pe&&(0,F.createElement)(To,{...b,...oe,size:b?.size||oe.size,key:`success`,id:b?.id||le},h),we=f.map(e=>{switch(e){case`label`:return A;case`input`:return xe;case`description`:return be;case`error`:return Se||Ce;default:return null}});return(0,R.jsx)(mo,{value:{getStyles:ae,describedBy:ye,inputId:de,labelId:k,...Eo(f,{hasDescription:me,hasError:fe||pe})},children:(0,R.jsx)(D,{variant:l,size:c,mod:[{error:!!m,success:!!h&&!m},ne],id:x===`label`?void 0:T,...ae(`root`),...ie,children:we})})});ko.classes=ho,ko.varsResolver=Oo,ko.displayName=`@mantine/core/InputWrapper`;var Ao={variant:`default`,leftSectionPointerEvents:`none`,rightSectionPointerEvents:`none`,withAria:!0,withErrorStyles:!0,withSuccessStyles:!0,size:`sm`,loading:!1,loadingPosition:`right`},jo=p((e,t,n)=>({wrapper:{"--input-margin-top":n.offsetTop?`calc(var(--mantine-spacing-xs) / 2)`:void 0,"--input-margin-bottom":n.offsetBottom?`calc(var(--mantine-spacing-xs) / 2)`:void 0,"--input-height":f(t.size,`input-height`),"--input-fz":m(t.size),"--input-radius":t.radius===void 0?void 0:l(t.radius),"--input-left-section-width":t.leftSectionWidth===void 0?void 0:b(t.leftSectionWidth),"--input-right-section-width":t.rightSectionWidth===void 0?void 0:b(t.rightSectionWidth),"--input-padding-y":t.multiline?f(t.size,`input-padding-y`):void 0,"--input-left-section-pointer-events":t.leftSectionPointerEvents,"--input-right-section-pointer-events":t.rightSectionPointerEvents}})),B=ae(e=>{let t=w(`Input`,Ao,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,required:s,__staticSelector:c,__stylesApiProps:l,size:u,wrapperProps:d,error:f,success:p,disabled:m,leftSection:h,leftSectionProps:g,leftSectionWidth:_,rightSection:v,rightSectionProps:y,rightSectionWidth:b,rightSectionPointerEvents:x,leftSectionPointerEvents:S,variant:C,vars:T,pointer:ee,multiline:te,radius:ne,id:re,withAria:ie,withErrorStyles:ae,withSuccessStyles:oe,mod:E,inputSize:ce,attributes:le,__clearSection:ue,__clearable:de,__clearSectionMode:fe,__defaultRightSection:pe,loading:me,loadingPosition:he,__bottomSection:ge,__bottomSectionProps:_e,rootRef:ve,dir:ye,...k}=t,{styleProps:A,rest:be}=se(k),xe=(0,F.use)(mo),Se={offsetBottom:xe?.offsetBottom,offsetTop:xe?.offsetTop},Ce=O({name:[`Input`,c],props:l||t,classes:ho,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:le,stylesCtx:Se,rootSelector:`wrapper`,vars:T,varsResolver:jo}),we=ie?{required:s,disabled:m,"aria-invalid":f?!0:void 0,"aria-describedby":xe?.describedBy,id:xe?.inputId||re}:{},j=me?(0,R.jsx)(Ya,{size:he===`left`?`calc(var(--input-left-section-size) / 2)`:`calc(var(--input-right-section-size) / 2)`}):null,Te=me&&he===`left`?j:h,Ee=po({__clearable:de,__clearSection:ue,rightSection:me&&he===`right`?j:v,__defaultRightSection:pe,size:u,__clearSectionMode:fe});return(0,R.jsx)(lo,{value:{size:u||`sm`},children:(0,R.jsxs)(D,{ref:ve,dir:ye,...Ce(`wrapper`),...A,...d,mod:[{error:!!f&&ae,success:!!p&&!f&&oe,pointer:ee,disabled:m,multiline:te,"data-with-right-section":!!Ee,"data-with-left-section":!!Te,"data-with-bottom-section":!!ge},E],variant:C,size:u,children:[Te&&(0,R.jsx)(`div`,{...g,"data-position":`left`,...Ce(`section`,{className:g?.className,style:g?.style}),children:Te}),(0,R.jsx)(D,{component:`input`,...be,...we,required:s,mod:{disabled:m,error:!!f&&ae,success:!!p&&!f&&oe},variant:C,__size:ce,...Ce(`input`)}),ge&&(0,R.jsx)(`div`,{..._e,...Ce(`bottomSection`,{className:_e?.className,style:_e?.style}),children:ge}),Ee&&(0,R.jsx)(`div`,{...y,"data-position":`right`,...Ce(`section`,{className:y?.className,style:y?.style}),children:Ee})]})})});B.classes=ho,B.varsResolver=jo,B.Wrapper=ko,B.Label=So,B.Error=yo,B.Success=To,B.Description=_o,B.Placeholder=Co,B.ClearButton=uo,B.displayName=`@mantine/core/Input`;function Mo(e,t,n){let r=w([`Input`,`InputWrapper`,e],t,n),{label:i,description:a,error:o,success:s,required:c,classNames:l,styles:u,className:d,unstyled:f,__staticSelector:p,__stylesApiProps:m,errorProps:h,successProps:g,labelProps:_,descriptionProps:v,wrapperProps:y,id:b,size:x,style:S,inputContainer:C,inputWrapperOrder:T,withAsterisk:ee,variant:te,vars:ne,mod:re,attributes:ie,...ae}=r,{styleProps:oe,rest:E}=se(ae),D={label:i,description:a,error:o,success:s,required:c,classNames:l,className:d,__staticSelector:p,__stylesApiProps:m||r,errorProps:h,successProps:g,labelProps:_,descriptionProps:v,unstyled:f,styles:u,size:x,style:S,inputContainer:C,inputWrapperOrder:T,withAsterisk:ee,variant:te,id:b,mod:re,attributes:ie,...y};return{...E,classNames:l,styles:u,unstyled:f,wrapperProps:{...D,...oe},inputProps:{required:c,classNames:l,styles:u,unstyled:f,size:x,__staticSelector:p,__stylesApiProps:m||r,error:o,success:s,variant:te,id:b,attributes:ie}}}var No={__staticSelector:`InputBase`,withAria:!0,size:`sm`},Po=ae(e=>{let{inputProps:t,wrapperProps:n,...r}=Mo(`InputBase`,No,e);return(0,R.jsx)(B.Wrapper,{...n,children:(0,R.jsx)(B,{...t,...r})})});Po.classes={...B.classes,...B.Wrapper.classes},Po.displayName=`@mantine/core/InputBase`;var Fo={root:`m_66836ed3`,wrapper:`m_a5d60502`,body:`m_667c2793`,title:`m_6a03f287`,label:`m_698f4f23`,icon:`m_667f2a6a`,message:`m_7fa78076`,closeButton:`m_87f54839`},Io=p((e,{radius:t,color:n,variant:r,autoContrast:i})=>{let a=e.variantColorResolver({color:n||e.primaryColor,theme:e,variant:r||`light`,autoContrast:i});return{root:{"--alert-radius":t===void 0?void 0:l(t),"--alert-bg":n||r?a.background:void 0,"--alert-color":a.color,"--alert-bd":n||r?a.border:void 0}}}),V=E(e=>{let t=w(`Alert`,null,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,radius:c,color:l,title:u,children:d,id:f,icon:p,withCloseButton:m,onClose:h,closeButtonLabel:g,variant:_,autoContrast:v,role:y,attributes:b,...x}=t,S=O({name:`Alert`,classes:Fo,props:t,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:b,vars:s,varsResolver:Io}),C=aa(f),T=u&&`${C}-title`||void 0,ee=`${C}-body`;return(0,R.jsx)(D,{id:C,...S(`root`,{variant:_}),variant:_,...x,role:y||`alert`,"aria-describedby":d?ee:void 0,"aria-labelledby":u?T:void 0,children:(0,R.jsxs)(`div`,{...S(`wrapper`),children:[p&&(0,R.jsx)(`div`,{...S(`icon`),children:p}),(0,R.jsxs)(`div`,{...S(`body`),children:[u&&(0,R.jsx)(`div`,{...S(`title`),"data-with-close-button":m||void 0,children:(0,R.jsx)(`span`,{id:T,...S(`label`),children:u})}),d&&(0,R.jsx)(`div`,{id:ee,...S(`message`),"data-variant":_,children:d})]}),m&&(0,R.jsx)(co,{...S(`closeButton`),onClick:h,variant:`transparent`,size:16,iconSize:16,"aria-label":g,unstyled:o})]})})});V.classes=Fo,V.varsResolver=Io,V.displayName=`@mantine/core/Alert`;var Lo={root:`m_b6d8b162`};function Ro(e){if(e===`start`)return`start`;if(e===`end`||e)return`end`}var zo={inherit:!1},Bo=p((e,{variant:t,lineClamp:n,gradient:r,size:i,textWrap:a})=>({root:{"--text-fz":m(i),"--text-lh":g(i),"--text-gradient":t===`gradient`?o(r,e):void 0,"--text-line-clamp":typeof n==`number`?n.toString():void 0,"--text-text-wrap":a}})),H=ae(e=>{let t=w(`Text`,zo,e),{lineClamp:n,truncate:r,inline:i,inherit:a,gradient:o,span:s,textWrap:c,__staticSelector:l,vars:u,className:d,style:f,classNames:p,styles:m,unstyled:h,variant:g,mod:_,size:v,attributes:y,...b}=t;return(0,R.jsx)(D,{...O({name:[`Text`,l],props:t,classes:Lo,className:d,style:f,classNames:p,styles:m,unstyled:h,attributes:y,vars:u,varsResolver:Bo})(`root`,{focusable:!0}),component:s?`span`:`p`,variant:g,mod:[{"data-truncate":Ro(r),"data-line-clamp":typeof n==`number`,"data-inline":i,"data-inherit":a},_],size:v,...b})});H.classes=Lo,H.varsResolver=Bo,H.displayName=`@mantine/core/Text`;var U={root:`m_849cf0da`},Vo={underline:`hover`},Ho=ae(e=>{let{underline:t,className:n,unstyled:r,mod:i,...a}=w(`Anchor`,Vo,e);return(0,R.jsx)(H,{component:`a`,className:ne({[U.root]:!r},n),...a,mod:[{underline:t},i],__staticSelector:`Anchor`,unstyled:r})});Ho.classes=U,Ho.displayName=`@mantine/core/Anchor`;var Uo={root:`m_77c9d27d`,inner:`m_80f1301b`,label:`m_811560b9`,section:`m_a74036a`,loader:`m_a25b86ee`,group:`m_80d6d844`,groupSection:`m_70be2a01`},Wo={orientation:`horizontal`},Go=p((e,{borderWidth:t})=>({group:{"--button-border-width":b(t)}})),Ko=E(e=>{let t=w(`ButtonGroup`,Wo,e),{className:n,style:r,classNames:i,styles:a,unstyled:o,orientation:s,vars:c,borderWidth:l,mod:u,attributes:d,...f}=w(`ButtonGroup`,Wo,e);return(0,R.jsx)(D,{...O({name:`ButtonGroup`,props:t,classes:Uo,className:n,style:r,classNames:i,styles:a,unstyled:o,attributes:d,vars:c,varsResolver:Go,rootSelector:`group`})(`group`),mod:[{"data-orientation":s},u],role:`group`,...f})});Ko.classes=Uo,Ko.varsResolver=Go,Ko.displayName=`@mantine/core/ButtonGroup`;var qo=p((e,{radius:t,color:n,gradient:r,variant:i,autoContrast:a,size:o})=>{let s=e.variantColorResolver({color:n||e.primaryColor,theme:e,gradient:r,variant:i||`filled`,autoContrast:a});return{groupSection:{"--section-height":f(o,`section-height`),"--section-padding-x":f(o,`section-padding-x`),"--section-fz":o?.includes(`compact`)?m(o.replace(`compact-`,``)):m(o),"--section-radius":t===void 0?void 0:l(t),"--section-bg":n||i?s.background:void 0,"--section-color":s.color,"--section-bd":n||i?s.border:void 0}}}),Jo=E(e=>{let t=w(`ButtonGroupSection`,null,e),{className:n,style:r,classNames:i,styles:a,unstyled:o,vars:s,gradient:c,radius:l,autoContrast:u,attributes:d,...f}=t;return(0,R.jsx)(D,{...O({name:`ButtonGroupSection`,props:t,classes:Uo,className:n,style:r,classNames:i,styles:a,unstyled:o,attributes:d,vars:s,varsResolver:qo,rootSelector:`groupSection`})(`groupSection`),...f})});Jo.classes=Uo,Jo.varsResolver=qo,Jo.displayName=`@mantine/core/ButtonGroupSection`;var Yo={in:{opacity:1,transform:`translate(-50%, calc(-50% + ${b(1)}))`},out:{opacity:0,transform:`translate(-50%, -200%)`},common:{transformOrigin:`center`},transitionProperty:`transform, opacity`},Xo=p((e,{radius:t,color:n,gradient:r,variant:i,size:a,justify:o,autoContrast:s})=>{let c=e.variantColorResolver({color:n||e.primaryColor,theme:e,gradient:r,variant:i||`filled`,autoContrast:s});return{root:{"--button-justify":o,"--button-height":f(a,`button-height`),"--button-padding-x":f(a,`button-padding-x`),"--button-fz":a?.includes(`compact`)?m(a.replace(`compact-`,``)):m(a),"--button-radius":t===void 0?void 0:l(t),"--button-bg":n||i?c.background:void 0,"--button-hover":n||i?c.hover:void 0,"--button-color":c.color,"--button-bd":n||i?c.border:void 0,"--button-hover-color":n||i?c.hoverColor:void 0}}}),Zo=ae(e=>{let t=w(`Button`,null,e),{style:n,vars:r,className:i,color:a,disabled:o,children:s,leftSection:c,rightSection:l,fullWidth:u,variant:d,radius:f,loading:p,loaderProps:m,gradient:h,classNames:g,styles:_,unstyled:v,"data-disabled":y,autoContrast:b,mod:x,attributes:S,...C}=t,T=O({name:`Button`,props:t,classes:Uo,className:i,style:n,classNames:g,styles:_,unstyled:v,attributes:S,vars:r,varsResolver:Xo}),ee=!!c,te=!!l;return(0,R.jsxs)(z,{...T(`root`,{active:!o&&!p&&!y}),unstyled:v,variant:d,disabled:o||p,mod:[{disabled:o||y,loading:p,block:u,"with-left-section":ee,"with-right-section":te},x],...C,children:[typeof p==`boolean`&&(0,R.jsx)(Va,{mounted:p,transition:Yo,duration:150,children:e=>(0,R.jsx)(D,{component:`span`,...T(`loader`,{style:e}),"aria-hidden":!0,children:(0,R.jsx)(Ya,{color:`var(--button-color)`,size:`calc(var(--button-height) / 1.8)`,...m})})}),(0,R.jsxs)(`span`,{...T(`inner`),children:[c&&(0,R.jsx)(D,{component:`span`,...T(`section`),mod:{position:`left`},children:c}),(0,R.jsx)(D,{component:`span`,mod:{loading:p},...T(`label`),children:s}),l&&(0,R.jsx)(D,{component:`span`,...T(`section`),mod:{position:`right`},children:l})]})]})});Zo.classes=Uo,Zo.varsResolver=Xo,Zo.displayName=`@mantine/core/Button`,Zo.Group=Ko,Zo.GroupSection=Jo;var Qo={root:`m_3eebeb36`,label:`m_9e365f20`},$o={orientation:`horizontal`},es=p((e,{color:t,variant:n,size:r})=>({root:{"--divider-color":t?c(t,e):void 0,"--divider-border-style":n,"--divider-size":f(r,`divider-size`)}})),ts=E(e=>{let t=w(`Divider`,$o,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,color:c,orientation:l,label:u,labelPosition:d,mod:f,attributes:p,...m}=t,h=O({name:`Divider`,classes:Qo,props:t,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:p,vars:s,varsResolver:es});return(0,R.jsx)(D,{mod:[{orientation:l,withLabel:!!u},f],role:`separator`,...h(`root`),...m,children:u&&(0,R.jsx)(D,{component:`span`,mod:{position:d},...h(`label`),children:u})})});ts.classes=Qo,ts.varsResolver=es,ts.displayName=`@mantine/core/Divider`;function ns({reveal:e}){return(0,R.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 256 256`,style:{width:`var(--psi-icon-size)`,height:`var(--psi-icon-size)`},children:e?(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(`path`,{fill:`none`,d:`M0 0h256v256H0z`}),(0,R.jsx)(`path`,{fill:`none`,stroke:`currentColor`,strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:`16`,d:`M48 40l160 176M154.91 157.6a40 40 0 01-53.82-59.2M135.53 88.71a40 40 0 0132.3 35.53`}),(0,R.jsx)(`path`,{fill:`none`,stroke:`currentColor`,strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:`16`,d:`M208.61 169.1C230.41 149.58 240 128 240 128s-32-72-112-72a126 126 0 00-20.68 1.68M74 68.6C33.23 89.24 16 128 16 128s32 72 112 72a118.05 118.05 0 0054-12.6`})]}):(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(`path`,{fill:`none`,d:`M0 0h256v256H0z`}),(0,R.jsx)(`path`,{fill:`none`,stroke:`currentColor`,strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:`16`,d:`M128 56c-80 0-112 72-112 72s32 72 112 72 112-72 112-72-32-72-112-72z`}),(0,R.jsx)(`circle`,{cx:`128`,cy:`128`,r:`40`,fill:`none`,stroke:`currentColor`,strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:`16`})]})})}var rs={root:`m_f61ca620`,input:`m_ccf8da4c`,innerInput:`m_f2d85dd2`,visibilityToggle:`m_b1072d44`},is={visibilityToggleIcon:ns,visibilityToggleFocusable:!1,size:`sm`},as=p((e,{size:t})=>({root:{"--psi-icon-size":f(t,`psi-icon-size`),"--psi-button-size":f(t,`psi-button-size`)}})),os=E(e=>{let t=w([`Input`,`InputWrapper`,`PasswordInput`],is,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,required:c,error:l,success:u,leftSection:d,disabled:f,id:p,variant:m,inputContainer:h,description:g,label:_,size:v,errorProps:y,successProps:b,descriptionProps:x,labelProps:S,withAsterisk:C,inputWrapperOrder:T,wrapperProps:ee,radius:te,rightSection:re,rightSectionWidth:ie,rightSectionPointerEvents:ae,leftSectionWidth:oe,visible:E,defaultVisible:D,onVisibilityChange:ce,visibilityToggleIcon:le,visibilityToggleButtonProps:ue,visibilityToggleFocusable:de,rightSectionProps:fe,leftSectionProps:pe,leftSectionPointerEvents:me,withErrorStyles:he,withSuccessStyles:ge,mod:_e,attributes:ve,dir:ye,...k}=t,A=aa(p),[be,xe]=I({value:E,defaultValue:D,finalValue:!1,onChange:ce}),Se=()=>xe(!be),Ce=O({name:`PasswordInput`,classes:rs,props:t,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:ve,vars:s,varsResolver:as}),{resolvedClassNames:we,resolvedStyles:j}=ka({classNames:n,styles:a,props:t}),{styleProps:Te,rest:Ee}=se(k),De=y?.id||`${A}-error`,Oe=b?.id||`${A}-success`,ke=x?.id||`${A}-description`,Ae=!!l&&typeof l!=`boolean`,je=`${Ae?De:``} ${u&&typeof u!=`boolean`&&!Ae?Oe:``} ${g?ke:``}`,Me=je.trim().length>0?je.trim():void 0,Ne=(0,R.jsx)(ro,{...Ce(`visibilityToggle`),disabled:f,radius:te,"aria-pressed":be,tabIndex:de?0:-1,"aria-label":`Toggle password visibility`,...ue,variant:ue?.variant??`subtle`,color:`gray`,unstyled:o,onTouchEnd:e=>{e.preventDefault(),ue?.onTouchEnd?.(e),Se()},onMouseDown:e=>{e.preventDefault(),ue?.onMouseDown?.(e),Se()},onKeyDown:e=>{ue?.onKeyDown?.(e),(e.key===` `||e.key===`Enter`)&&(e.preventDefault(),Se())},children:(0,R.jsx)(le,{reveal:be})});return(0,R.jsx)(B.Wrapper,{required:c,id:A,label:_,error:l,success:u,description:g,size:v,classNames:we,styles:j,__staticSelector:`PasswordInput`,__stylesApiProps:t,unstyled:o,withAsterisk:C,inputWrapperOrder:T,inputContainer:h,variant:m,labelProps:{...S,htmlFor:A},descriptionProps:{...x,id:ke},errorProps:{...y,id:De},successProps:{...b,id:Oe},mod:_e,attributes:ve,...Ce(`root`),...Te,...ee,children:(0,R.jsx)(B,{component:`div`,dir:ye,error:l,success:u,leftSection:d,size:v,classNames:{...we,input:ne(rs.input,we?.input)},styles:j,radius:te,disabled:f,__staticSelector:`PasswordInput`,__stylesApiProps:t,rightSectionWidth:ie,rightSection:re??Ne,variant:m,unstyled:o,leftSectionWidth:oe,rightSectionPointerEvents:ae||`all`,rightSectionProps:fe,leftSectionProps:pe,leftSectionPointerEvents:me,withAria:!1,withErrorStyles:he,withSuccessStyles:ge,attributes:ve,children:(0,R.jsx)(`input`,{required:c,"data-invalid":!!l||void 0,"data-with-left-section":!!d||void 0,...Ce(`innerInput`),disabled:f,id:A,dir:ye,...Ee,"aria-describedby":Me,autoComplete:Ee.autoComplete||`off`,type:be?`text`:`password`})})})});os.classes={...Po.classes,...rs},os.varsResolver=as,os.displayName=`@mantine/core/PasswordInput`;function ss(e){if(e!==void 0)return typeof e==`number`?b(e):e}function cs({spacing:e,verticalSpacing:t,cols:n,minColWidth:r,autoRows:i,selector:a}){let o=oe(),s=t===void 0?e:t,c=r!==void 0,l=de({"--sg-spacing-x":_($i(e)),"--sg-spacing-y":_($i(s)),"--sg-auto-rows":i,...c?{"--sg-min-col-width":ss(r)}:{"--sg-cols":$i(n)?.toString()}}),u=y(o.breakpoints).reduce((t,r)=>(t[r]||(t[r]={}),typeof e==`object`&&e[r]!==void 0&&(t[r][`--sg-spacing-x`]=_(e[r])),typeof s==`object`&&s[r]!==void 0&&(t[r][`--sg-spacing-y`]=_(s[r])),!c&&typeof n==`object`&&n[r]!==void 0&&(t[r][`--sg-cols`]=n[r]),t),{});return(0,R.jsx)(ie,{styles:l,media:Qi(y(u),o.breakpoints).filter(e=>y(u[e.value]).length>0).map(e=>({query:`(min-width: ${o.breakpoints[e.value]})`,styles:u[e.value]})),selector:a})}function ls(e){return typeof e==`object`&&e?y(e):[]}function us(e){return e.sort((e,t)=>Xi(e)-Xi(t))}function ds({spacing:e,verticalSpacing:t,cols:n,minColWidth:r}){return us(Array.from(new Set([...ls(e),...ls(t),...r===void 0?ls(n):[]])))}function fs({spacing:e,verticalSpacing:t,cols:n,minColWidth:r,autoRows:i,selector:a}){let o=t===void 0?e:t,s=r!==void 0,c=de({"--sg-spacing-x":_($i(e)),"--sg-spacing-y":_($i(o)),"--sg-auto-rows":i,...s?{"--sg-min-col-width":ss(r)}:{"--sg-cols":$i(n)?.toString()}}),l=ds({spacing:e,verticalSpacing:t,cols:n,minColWidth:r}),u=l.reduce((t,r)=>(t[r]||(t[r]={}),typeof e==`object`&&e[r]!==void 0&&(t[r][`--sg-spacing-x`]=_(e[r])),typeof o==`object`&&o[r]!==void 0&&(t[r][`--sg-spacing-y`]=_(o[r])),!s&&typeof n==`object`&&n[r]!==void 0&&(t[r][`--sg-cols`]=n[r]),t),{});return(0,R.jsx)(ie,{styles:c,container:l.map(e=>({query:`simple-grid (min-width: ${e})`,styles:u[e]})),selector:a})}var ps={container:`m_925c2d2c`,root:`m_2415a157`},ms={cols:1,spacing:`md`,type:`media`},hs=E(e=>{let t=w(`SimpleGrid`,ms,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,cols:c,verticalSpacing:l,spacing:u,type:d,minColWidth:f,autoFlow:p,autoRows:m,attributes:h,...g}=t,_=O({name:`SimpleGrid`,classes:ps,props:t,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:h,vars:s}),v=S(),y=f===void 0?void 0:p||`auto-fill`;return d===`container`?(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(fs,{...t,selector:`.${v}`}),(0,R.jsx)(`div`,{..._(`container`),children:(0,R.jsx)(D,{..._(`root`,{className:v}),...g,"data-auto-cols":y})})]}):(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(cs,{...t,selector:`.${v}`}),(0,R.jsx)(D,{..._(`root`,{className:v}),...g,"data-auto-cols":y})]})});hs.classes=ps,hs.displayName=`@mantine/core/SimpleGrid`;var gs={root:`m_6d731127`},_s={gap:`md`,align:`stretch`,justify:`flex-start`},vs=p((e,{gap:t,align:n,justify:r})=>({root:{"--stack-gap":_(t),"--stack-align":n,"--stack-justify":r}})),ys=E(e=>{let t=w(`Stack`,_s,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,align:c,justify:l,gap:u,variant:d,attributes:f,...p}=t;return(0,R.jsx)(D,{...O({name:`Stack`,props:t,classes:gs,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:f,vars:s,varsResolver:vs})(`root`),variant:d,...p})});ys.classes=gs,ys.varsResolver=vs,ys.displayName=`@mantine/core/Stack`;var bs=E(e=>(0,R.jsx)(Po,{component:`input`,...w([`Input`,`InputWrapper`,`TextInput`],null,e),__staticSelector:`TextInput`}));bs.classes=Po.classes,bs.displayName=`@mantine/core/TextInput`;var xs=[`h1`,`h2`,`h3`,`h4`,`h5`,`h6`],Ss=[`xs`,`sm`,`md`,`lg`,`xl`];function Cs(e,t){let n=t===void 0?`h${e}`:t;return xs.includes(n)?{fontSize:`var(--mantine-${n}-font-size)`,fontWeight:`var(--mantine-${n}-font-weight)`,lineHeight:`var(--mantine-${n}-line-height)`}:Ss.includes(n)?{fontSize:`var(--mantine-font-size-${n})`,fontWeight:`var(--mantine-h${e}-font-weight)`,lineHeight:`var(--mantine-h${e}-line-height)`}:{fontSize:b(n),fontWeight:`var(--mantine-h${e}-font-weight)`,lineHeight:`var(--mantine-h${e}-line-height)`}}var ws={root:`m_8a5d1357`},Ts={order:1},Es=p((e,{order:t,size:n,lineClamp:r,textWrap:i})=>{let a=Cs(t||1,n);return{root:{"--title-fw":a.fontWeight,"--title-lh":a.lineHeight,"--title-fz":a.fontSize,"--title-line-clamp":typeof r==`number`?r.toString():void 0,"--title-text-wrap":i}}}),Ds=E(e=>{let t=w(`Title`,Ts,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,order:s,vars:c,size:l,variant:u,lineClamp:d,textWrap:f,mod:p,attributes:m,...h}=t,g=O({name:`Title`,props:t,classes:ws,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:m,vars:c,varsResolver:Es});return[1,2,3,4,5,6].includes(s)?(0,R.jsx)(D,{...g(`root`),component:`h${s}`,variant:u,mod:[{order:s,"data-line-clamp":typeof d==`number`},p],size:l,...h}):null});Ds.classes=ws,Ds.varsResolver=Es,Ds.displayName=`@mantine/core/Title`;function Os(e){let t=new MutationObserver(e),n=matchMedia(`(prefers-color-scheme: dark)`);return t.observe(document.documentElement,{attributes:!0}),n.addEventListener(`change`,e),()=>{t.disconnect(),n.removeEventListener(`change`,e)}}function ks(){let e=getComputedStyle(document.documentElement).colorScheme.split(/\s+/),t=e.includes(`light`),n=e.includes(`dark`);return t===n?matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`:n?`dark`:`light`}function As(){return(0,F.useSyncExternalStore)(Os,ks)}function js(){return(0,F.useSyncExternalStore)(Os,()=>document.documentElement.lang)}var Ms={heading:`Sign in`,username:`Username`,password:`Password`,submit:`Sign in`,required:`Required`,failed:`Invalid username or password.`,forgotLink:`Forgot password?`,forgotHeading:`Reset password`,forgotIntro:`Enter your username or email address. We will send you instructions to reset your password.`,account:`Username or email`,forgotSubmit:`Send instructions`,forgotDone:`If an account exists for this entry, instructions to reset the password have been sent.`,registerPrompt:`Not yet registered?`,registerLink:`Create an account`,registerHeading:`Create account`,registerSubmit:`Register`,registerDone:`Your account has been created. You can sign in now.`,email:`Email`,passwordRepeat:`Repeat password`,invalidEmail:`Enter a valid email address.`,mismatch:`The passwords do not match.`,back:`Back to sign in`,continueWith:`Continue with {provider}`,or:`or`,providerFailed:`The sign in failed. Please try again.`},Ns={heading:`Anmelden`,username:`Benutzername`,password:`Passwort`,submit:`Anmelden`,required:`Erforderlich`,failed:`Benutzername oder Passwort ist falsch.`,forgotLink:`Passwort vergessen?`,forgotHeading:`Passwort zurücksetzen`,forgotIntro:`Geben Sie Ihren Benutzernamen oder Ihre E-Mail-Adresse ein. Wir senden Ihnen eine Anleitung zum Zurücksetzen des Passworts.`,account:`Benutzername oder E-Mail`,forgotSubmit:`Anleitung senden`,forgotDone:`Falls es zu dieser Eingabe ein Konto gibt, wurde eine Anleitung zum Zurücksetzen des Passworts gesendet.`,registerPrompt:`Noch nicht registriert?`,registerLink:`Konto erstellen`,registerHeading:`Konto erstellen`,registerSubmit:`Registrieren`,registerDone:`Ihr Konto wurde erstellt. Sie können sich jetzt anmelden.`,email:`E-Mail`,passwordRepeat:`Passwort wiederholen`,invalidEmail:`Geben Sie eine gültige E-Mail-Adresse ein.`,mismatch:`Die Passwörter stimmen nicht überein.`,back:`Zurück zur Anmeldung`,continueWith:`Weiter mit {provider}`,or:`oder`,providerFailed:`Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut.`};function Ps(e){return e.toLowerCase().startsWith(`de`)?Ns:Ms}function Fs(e){let{title:t,subtitle:n,logo:r,hint:i,texts:a}=e,o={...Ps(js()),...a},[s,c]=(0,F.useState)(`login`),[l,u]=(0,F.useState)(),d=(e,t)=>{u(t),c(e)},f=e.passwordLogin!==!1,p=e.onProvider===void 0?[]:e.providers??[],[m,h]=(0,F.useState)(!1),g=s===`login`?o.heading:s===`forgot`?o.forgotHeading:o.registerHeading,_=s===`login`?e.onRegister===void 0||!f?null:(0,R.jsxs)(H,{size:`sm`,children:[o.registerPrompt,` `,(0,R.jsx)(Ho,{component:`button`,type:`button`,size:`sm`,onClick:()=>d(`register`),children:o.registerLink})]}):(0,R.jsx)(Ho,{component:`button`,type:`button`,size:`sm`,onClick:()=>d(`login`),children:o.back});return(0,R.jsx)(`div`,{className:`app-login__screen`,children:(0,R.jsxs)(`div`,{className:`app-login__column`,children:[(0,R.jsx)(Pa,{component:`main`,className:`app-login__card`,children:(0,R.jsxs)(ys,{gap:`md`,children:[(0,R.jsxs)(`div`,{className:`app-login__brand`,children:[r===void 0?null:(0,R.jsx)(`span`,{className:`app-login__logo`,"aria-hidden":!0,children:Is(r)}),(0,R.jsxs)(`div`,{children:[(0,R.jsx)(Ds,{order:1,className:`app-login__title`,children:t}),n===void 0?null:(0,R.jsx)(H,{size:`xs`,c:`dimmed`,children:n})]})]}),(0,R.jsx)(Ds,{order:2,className:`app-login__heading`,children:g}),l===void 0?null:(0,R.jsx)(V,{color:`green`,variant:`light`,role:`status`,children:l}),s===`login`&&f&&(0,R.jsx)(Rs,{texts:o,locked:m,onLogin:e.onLogin,onForgot:e.onForgotPassword===void 0?void 0:()=>d(`forgot`)}),s===`login`&&p.length>0&&f&&(0,R.jsx)(ts,{label:o.or,labelPosition:`center`}),s===`login`&&p.length>0&&e.onProvider!==void 0&&(0,R.jsx)(zs,{texts:o,providers:p,onProvider:e.onProvider,onBusy:h}),s===`forgot`&&e.onForgotPassword!==void 0&&(0,R.jsx)(Bs,{texts:o,onForgotPassword:e.onForgotPassword}),s===`register`&&e.onRegister!==void 0&&(0,R.jsx)(Vs,{texts:o,onRegister:e.onRegister,onDone:()=>d(`login`,o.registerDone)}),_===null?null:(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)(ts,{}),(0,R.jsx)(`div`,{className:`app-login__footer`,children:_})]})]})}),i===void 0?null:(0,R.jsx)(H,{size:`xs`,c:`dimmed`,className:`app-login__hint`,children:i})]})})}function Is(e){return typeof e==`string`?(0,R.jsx)(`span`,{dangerouslySetInnerHTML:{__html:e}}):e}function Ls(e){let[t,n]=(0,F.useState)(!1),[r,i]=(0,F.useState)(),a=(0,F.useRef)(!0);return(0,F.useEffect)(()=>(a.current=!0,()=>{a.current=!1}),[]),{busy:t,error:r,run:async r=>{if(t)return!1;n(!0),i(void 0);try{return await r(),!0}catch(t){return a.current&&i(t instanceof Error&&t.message!==``?t.message:e),!1}finally{a.current&&n(!1)}}}}function Rs({texts:e,locked:t,onLogin:n,onForgot:r}){let[i,a]=(0,F.useState)(``),[o,s]=(0,F.useState)(``),[c,l]=(0,F.useState)({}),{busy:u,error:d,run:f}=Ls(e.failed),p=(0,F.useRef)(null),m=async e=>{e.preventDefault();let t={username:i.trim()===``,password:o===``};l(t),!(t.username||t.password)&&(await f(()=>n({username:i.trim(),password:o}))||requestAnimationFrame(()=>p.current?.select()))};return(0,R.jsx)(`form`,{onSubmit:e=>void m(e),noValidate:!0,children:(0,R.jsxs)(ys,{gap:`md`,children:[(0,R.jsx)(bs,{label:e.username,name:`username`,autoComplete:`username`,autoFocus:!0,readOnly:u||t,value:i,error:c.username?e.required:void 0,onChange:e=>a(e.currentTarget.value)}),(0,R.jsxs)(`div`,{children:[(0,R.jsx)(os,{ref:p,label:e.password,name:`password`,autoComplete:`current-password`,readOnly:u||t,value:o,error:c.password?e.required:void 0,onChange:e=>s(e.currentTarget.value)}),r===void 0?null:(0,R.jsx)(Ho,{component:`button`,type:`button`,size:`sm`,className:`app-login__forgot`,onClick:r,children:e.forgotLink})]}),d===void 0?null:(0,R.jsx)(V,{color:`red`,variant:`light`,role:`alert`,children:d}),(0,R.jsx)(Zo,{type:`submit`,fullWidth:!0,loading:u,disabled:t,children:e.submit})]})})}function zs({texts:e,providers:t,onProvider:n,onBusy:r}){let{busy:i,error:a,run:o}=Ls(e.providerFailed),[s,c]=(0,F.useState)(),l=async e=>{c(e),r(!0),await o(()=>n(e)),r(!1)};return(0,R.jsxs)(ys,{gap:`xs`,children:[t.map(t=>(0,R.jsx)(Zo,{variant:`default`,fullWidth:!0,loading:i&&s===t.id,disabled:i&&s!==t.id,leftSection:t.icon===void 0?void 0:(0,R.jsx)(`span`,{className:`app-login__provider-icon`,"aria-hidden":!0,children:Is(t.icon)}),onClick:()=>void l(t.id),children:e.continueWith.replace(`{provider}`,t.label)},t.id)),a===void 0?null:(0,R.jsx)(V,{color:`red`,variant:`light`,role:`alert`,children:a})]})}function Bs({texts:e,onForgotPassword:t}){let[n,r]=(0,F.useState)(``),[i,a]=(0,F.useState)(!1),[o,s]=(0,F.useState)(!1),{busy:c,error:l,run:u}=Ls(e.failed),d=async e=>{e.preventDefault(),a(n.trim()===``),n.trim()!==``&&await u(()=>t({account:n.trim()}))&&s(!0)};return(0,R.jsx)(ys,{gap:`md`,children:o?(0,R.jsx)(V,{color:`green`,variant:`light`,role:`status`,children:e.forgotDone}):(0,R.jsx)(`form`,{onSubmit:e=>void d(e),noValidate:!0,children:(0,R.jsxs)(ys,{gap:`md`,children:[(0,R.jsx)(H,{size:`sm`,c:`dimmed`,children:e.forgotIntro}),(0,R.jsx)(bs,{label:e.account,name:`account`,autoComplete:`username`,autoFocus:!0,readOnly:c,value:n,error:i?e.required:void 0,onChange:e=>r(e.currentTarget.value)}),l===void 0?null:(0,R.jsx)(V,{color:`red`,variant:`light`,role:`alert`,children:l}),(0,R.jsx)(Zo,{type:`submit`,fullWidth:!0,loading:c,children:e.forgotSubmit})]})})})}function Vs({texts:e,onRegister:t,onDone:n}){let[r,i]=(0,F.useState)(``),[a,o]=(0,F.useState)(``),[s,c]=(0,F.useState)(``),[l,u]=(0,F.useState)(``),[d,f]=(0,F.useState)({}),{busy:p,error:m,run:h}=Ls(e.failed),g=async e=>{e.preventDefault();let i={};r.trim()===``&&(i.username=`required`),a.trim()===``?i.email=`required`:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.trim())||(i.email=`invalidEmail`),s===``&&(i.password=`required`),l===``?i.repeat=`required`:l!==s&&(i.repeat=`mismatch`),f(i),Object.keys(i).length===0&&await h(()=>t({username:r.trim(),email:a.trim(),password:s}))&&n()};return(0,R.jsx)(`form`,{onSubmit:e=>void g(e),noValidate:!0,children:(0,R.jsxs)(ys,{gap:`md`,children:[(0,R.jsx)(bs,{label:e.username,name:`username`,autoComplete:`username`,autoFocus:!0,readOnly:p,value:r,error:d.username&&e[d.username],onChange:e=>i(e.currentTarget.value)}),(0,R.jsx)(bs,{label:e.email,name:`email`,type:`email`,autoComplete:`email`,readOnly:p,value:a,error:d.email&&e[d.email],onChange:e=>o(e.currentTarget.value)}),(0,R.jsxs)(hs,{cols:2,spacing:`sm`,children:[(0,R.jsx)(os,{label:e.password,name:`new-password`,autoComplete:`new-password`,readOnly:p,value:s,error:d.password&&e[d.password],onChange:e=>c(e.currentTarget.value)}),(0,R.jsx)(os,{label:e.passwordRepeat,name:`new-password-repeat`,autoComplete:`new-password`,readOnly:p,value:l,error:d.repeat&&e[d.repeat],onChange:e=>u(e.currentTarget.value)})]}),m===void 0?null:(0,R.jsx)(V,{color:`red`,variant:`light`,role:`alert`,children:m}),(0,R.jsx)(Zo,{type:`submit`,fullWidth:!0,loading:p,children:e.registerSubmit})]})})}var Hs=n((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m){if(n(c)!==null)m=!0,S||(S=!0,ne());else{var t=n(l);t!==null&&ae(x,t.startTime-e)}}}var S=!1,C=-1,w=5,T=-1;function ee(){return g?!0:!(e.unstable_now()-T<w)}function te(){if(g=!1,S){var t=e.unstable_now();T=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(C),C=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&ee());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&ae(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?ne():S=!1}}}var ne;if(typeof y==`function`)ne=function(){y(te)};else if(typeof MessageChannel<`u`){var re=new MessageChannel,ie=re.port2;re.port1.onmessage=te,ne=function(){ie.postMessage(null)}}else ne=function(){_(te,0)};function ae(t,n){C=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):w=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(C),C=-1):h=!0,ae(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,S||(S=!0,ne()))),r},e.unstable_shouldYield=ee,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),Us=n(((e,t)=>{t.exports=Hs()})),Ws=n((e=>{var n=Us(),r=t(),i=sa();function a(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function o(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function s(e){for(var t=e,n=t;n&&!n.alternate;)t=n,t.flags&4098&&(e=t.return),n=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function c(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function l(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function u(e){if(s(e)!==e)throw Error(a(188))}function d(e){var t=e.alternate;if(!t){if(t=s(e),t===null)throw Error(a(188));return t===e?e:null}for(var n=e,r=t;;){var i=n.return;if(i===null)break;var o=i.alternate;if(o===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===o.child){for(o=i.child;o;){if(o===n)return u(i),e;if(o===r)return u(i),t;o=o.sibling}throw Error(a(188))}if(n.return!==r.return)n=i,r=o;else{for(var c=!1,l=i.child;l;){if(l===n){c=!0,n=i,r=o;break}if(l===r){c=!0,r=i,n=o;break}l=l.sibling}if(!c){for(l=o.child;l;){if(l===n){c=!0,n=o,r=i;break}if(l===r){c=!0,r=o,n=i;break}l=l.sibling}if(!c)throw Error(a(189))}}if(n.alternate!==r)throw Error(a(190))}if(n.tag!==3)throw Error(a(188));return n.stateNode.current===n?e:t}function f(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=f(e),t!==null)return t;e=e.sibling}return null}function p(e,t,n,r,i,a){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&n(e,r,i,a)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&p(e.child,t,n,r,i,a))return!0;e=e.sibling}return!1}function m(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function h(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),e.tag!==3&&e.tag!==5&&e.tag!==27);)e=e.return;return t}function g(e){var t=[null,null],n=m(e);return n===null||_(t,e,n.child,{foundSelf:!1}),t}function _(e,t,n,r){for(;n!==null;){if(n===t)r.foundSelf=!0;else if(n.tag===5||n.tag===27||n.tag===6){if(r.foundSelf)return e[1]=n,!0;e[0]=n}else if((n.tag!==22||n.memoizedState===null)&&_(e,t,n.child,r))return!0;n=n.sibling}return!1}function v(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(a(559))}}var y=null,b=null;function x(e,t,n){return e===n||e===t&&(y=e,!0)}function S(e,t,n){return e===n?(b=e,!1):e===t&&(b!==null&&(y=e),!0)}function C(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function w(e,t,n){for(var r=0,i=e;i;i=n(i))r++;i=0;for(var a=t;a;a=n(a))i++;for(;0<r-i;)e=n(e),r--;for(;0<i-r;)t=n(t),i--;for(;r--;){if(e===t||t!==null&&e===t.alternate)return e;e=n(e),t=n(t)}return null}var T=Object.assign,ee=Symbol.for(`react.element`),te=Symbol.for(`react.transitional.element`),ne=Symbol.for(`react.portal`),re=Symbol.for(`react.fragment`),ie=Symbol.for(`react.strict_mode`),ae=Symbol.for(`react.profiler`),oe=Symbol.for(`react.consumer`),E=Symbol.for(`react.context`),se=Symbol.for(`react.forward_ref`),D=Symbol.for(`react.suspense`),O=Symbol.for(`react.suspense_list`),ce=Symbol.for(`react.memo`),le=Symbol.for(`react.lazy`),ue=Symbol.for(`react.activity`),de=Symbol.for(`react.legacy_hidden`),fe=Symbol.for(`react.memo_cache_sentinel`),pe=Symbol.for(`react.view_transition`),me=Symbol.for(`react.recoverable`),he=Symbol.iterator;function ge(e){return typeof e!=`object`||!e?null:(e=he&&e[he]||e[`@@iterator`],typeof e==`function`?e:null)}var _e=Symbol.for(`react.client.reference`);function ve(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===_e?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case re:return`Fragment`;case ae:return`Profiler`;case ie:return`StrictMode`;case D:return`Suspense`;case O:return`SuspenseList`;case ue:return`Activity`;case pe:return`ViewTransition`}if(typeof e==`object`)switch(e.$$typeof){case ne:return`Portal`;case E:return e.displayName||`Context`;case oe:return(e._context.displayName||`Context`)+`.Consumer`;case se:var t=e.render;return e=e.displayName,e||=(e=t.displayName||t.name||``,e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case ce:return t=e.displayName||null,t===null?ve(e.type)||`Memo`:t;case le:t=e._payload,e=e._init;try{return ve(e(t))}catch{}}return null}var ye=Array.isArray,k=r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,A=i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,be={pending:!1,data:null,method:null,action:null},xe=[],Se=-1;function Ce(e){return{current:e}}function we(e){0>Se||(e.current=xe[Se],xe[Se]=null,Se--)}function j(e,t){Se++,xe[Se]=e.current,e.current=t}var Te=Ce(null),Ee=Ce(null),De=Ce(null),Oe=Ce(null);function ke(e,t){switch(j(De,t),j(Ee,e),j(Te,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?up(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=up(t),e=dp(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}we(Te),j(Te,e)}function Ae(){we(Te),we(Ee),we(De)}function je(e){var t=e.memoizedState;t!==null&&(sh._currentValue=t.memoizedState,j(Oe,e)),t=Te.current;var n=dp(t,e.type);t!==n&&(j(Ee,e),j(Te,n))}function Me(e){Ee.current===e&&(we(Te),we(Ee)),Oe.current===e&&(we(Oe),sh._currentValue=be)}var Ne,Pe;function Fe(e){if(Ne===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);Ne=t&&t[1]||``,Pe=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+Ne+e+Pe}var Ie=!1;function Le(e,t){if(!e||Ie)return``;Ie=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}n=!1;try{var i=Object.getOwnPropertyDescriptor(e.prototype,`props`);Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),n=!0,new e}finally{n&&(i===void 0?delete e.prototype.props:Object.defineProperty(e.prototype,"props",i))}}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{Ie=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?Fe(n):``}function Re(e,t){switch(e.tag){case 26:case 27:case 5:return Fe(e.type);case 16:return Fe(`Lazy`);case 13:return e.child!==t&&t!==null?Fe(`Suspense Fallback`):Fe(`Suspense`);case 19:return Fe(`SuspenseList`);case 0:case 15:return Le(e.type,!1);case 11:return Le(e.type.render,!1);case 1:return Le(e.type,!0);case 31:return Fe(`Activity`);case 30:return Fe(`ViewTransition`);default:return``}}function ze(e){try{var t=``,n=null;do t+=Re(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var Be=Object.prototype.hasOwnProperty,Ve=n.unstable_scheduleCallback,He=n.unstable_cancelCallback,Ue=n.unstable_shouldYield,We=n.unstable_requestPaint,Ge=n.unstable_now,Ke=n.unstable_getCurrentPriorityLevel,qe=n.unstable_ImmediatePriority,Je=n.unstable_UserBlockingPriority,Ye=n.unstable_NormalPriority,Xe=n.unstable_LowPriority,Ze=n.unstable_IdlePriority,Qe=n.log,$e=n.unstable_setDisableYieldValue,et=null,tt=null;function nt(e){if(typeof Qe==`function`&&$e(e),tt&&typeof tt.setStrictMode==`function`)try{tt.setStrictMode(et,e)}catch{}}var rt=Math.clz32?Math.clz32:ot,it=Math.log,at=Math.LN2;function ot(e){return e>>>=0,e===0?32:31-(it(e)/at|0)|0}var st=256,ct=262144,lt=4194304;function ut(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function dt(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=ut(n))):i=ut(o):i=ut(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=ut(n))):i=ut(o)):i=ut(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function ft(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function pt(e,t){t&8&&(t|=t&32);var n=e.entangledLanes;if(n!==0)for(e=e.entanglements,n&=t;0<n;){var r=31-rt(n),i=1<<r;t|=e[r],n&=~i}return t}function mt(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function ht(){var e=lt;return lt<<=1,!(lt&62914560)&&(lt=4194304),e}function gt(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function _t(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function vt(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-rt(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&yt(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function yt(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-rt(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function bt(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-rt(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function xt(e,t){var n=t&-t;return n=n&42?1:St(n),(n&(e.suspendedLanes|t))===0?n:0}function St(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Ct(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function wt(){var e=A.p;return e===0?(e=window.event,e===void 0?32:Ch(e.type)):e}function Tt(e,t){var n=A.p;try{return A.p=e,t()}finally{A.p=n}}var Et=Math.random().toString(36).slice(2),Dt=`__reactFiber$`+Et,Ot=`__reactProps$`+Et,kt=`__reactContainer$`+Et,At=`__reactEvents$`+Et,jt=`__reactListeners$`+Et,Mt=`__reactHandles$`+Et,Nt=`__reactResources$`+Et,Pt=`__reactMarker$`+Et,Ft=`__reactLoad$`+Et;function It(e){delete e[Dt],delete e[Ot],delete e[jt],delete e[Mt]}function Lt(e){var t;if(t=e[Dt])return t;for(var n=e.parentNode;n;){if(t=n[kt]||n[Dt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=fm(e);e!==null;){if(n=e[Dt])return n;e=fm(e)}return t}e=n,n=e.parentNode}return null}function Rt(e){if(e=e[Dt]||e[kt]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function zt(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(a(33))}function Bt(e){var t=e[Nt];return t||=e[Nt]={hoistableStyles:new Map,hoistableScripts:new Map},t}function Vt(e){e[Pt]=!0}function Ht(e){e[Ft]=void 0}var Ut=new Set,Wt={};function Gt(e,t){Kt(e,t),Kt(e+`Capture`,t)}function Kt(e,t){for(Wt[e]=t,e=0;e<t.length;e++)Ut.add(t[e])}var qt=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),Jt={},Yt={};function Xt(e){return Be.call(Yt,e)?!0:Be.call(Jt,e)?!1:qt.test(e)?Yt[e]=!0:(Jt[e]=!0,!1)}var M=!1;function Zt(){var e=M;return M=!1,e}function Qt(e,t,n){if(Xt(t)){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,n)}}}function $t(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,n)}}function en(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,r)}}function tn(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function nn(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function rn(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function an(e){if(!e._valueTracker){var t=nn(e)?`checked`:`value`;e._valueTracker=rn(e,t,``+e[t])}}function on(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=nn(e)?e.checked?`true`:`false`:e.value),e=r,e!==n&&(t.setValue(e),!0)}var sn=/[\n"\\]/g;function cn(e){return e.replace(sn,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function ln(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+tn(t)):e.value!==``+tn(t)&&(e.value=``+tn(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):dn(e,tn(n)):o===`number`&&e.value==t?dn(e,tn(e.value)):dn(e,tn(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+tn(s):e.removeAttribute(`name`)}function un(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){an(e);return}n=n==null?``:``+tn(n),t=t==null?n:``+tn(t),s||t===e.value||(e.value=t),e.defaultValue=t}r??=i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),an(e)}function dn(e,t){e.defaultValue!==``+t&&(e.defaultValue=``+t)}function fn(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+tn(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function pn(e,t,n){if(t!=null&&(t=``+tn(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n==null?``:``+tn(n)}function mn(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(a(92));if(ye(r)){if(1<r.length)throw Error(a(93));r=r[0]}n=r}n??=``,t=n}n=tn(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),an(e)}function hn(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var gn=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function _n(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||gn.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function vn(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(a(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``,M=!0);for(var i in t)r=t[i],t.hasOwnProperty(i)&&n[i]!==r&&(_n(e,i,r),M=!0)}else for(var o in t)t.hasOwnProperty(o)&&_n(e,o,t[o])}function yn(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var bn=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`maskType`,`mask-type`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),xn=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Sn(e){return xn.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function Cn(){}var wn=null;function Tn(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var En=null,Dn=null;function On(e){var t=Rt(e);if(t&&(e=t.stateNode)){var n=e[Ot]||null;a:switch(e=t.stateNode,t.type){case`input`:if(ln(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+cn(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var i=r[Ot]||null;if(!i)throw Error(a(90));ln(r,i.value,i.defaultValue,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&on(r)}break a;case`textarea`:pn(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&fn(e,!!n.multiple,t,!1)}}}var kn=!1;function An(e,t,n){if(kn)return e(t,n);kn=!0;try{return e(t)}finally{if(kn=!1,(En!==null||Dn!==null)&&(zd(),En&&(t=En,e=Dn,Dn=En=null,On(t),e)))for(t=0;t<e.length;t++)On(e[t])}}function jn(e,t){var n=e.stateNode;if(n===null)return null;var r=n[Ot]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=e!==`button`&&e!==`input`&&e!==`select`&&e!==`textarea`),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(a(231,t,typeof n));return n}var Mn=typeof window<`u`&&window.document!==void 0&&window.document.createElement!==void 0,Nn=!1;if(Mn)try{var Pn={};Object.defineProperty(Pn,"passive",{get:function(){Nn=!0}}),window.addEventListener(`test`,Pn,Pn),window.removeEventListener(`test`,Pn,Pn)}catch{Nn=!1}var Fn=null,In=null,Ln=null;function Rn(){if(Ln)return Ln;var e,t=In,n=t.length,r,i=`value`in Fn?Fn.value:Fn.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return Ln=i.slice(e,1<r?1-r:void 0)}function zn(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Bn(){return!0}function Vn(){return!1}function Hn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?Bn:Vn,this.isPropagationStopped=Vn,this}return T(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=Bn)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=Bn)},persist:function(){},isPersistent:Bn}),t}var Un={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Wn=Hn(Un),Gn=T({},Un,{view:0,detail:0}),Kn=Hn(Gn),qn,Jn,Yn,Xn=T({},Gn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:sr,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==Yn&&(Yn&&e.type===`mousemove`?(qn=e.screenX-Yn.screenX,Jn=e.screenY-Yn.screenY):Jn=qn=0,Yn=e),qn)},movementY:function(e){return`movementY`in e?e.movementY:Jn}}),Zn=Hn(Xn),Qn=Hn(T({},Xn,{dataTransfer:0})),$n=Hn(T({},Gn,{relatedTarget:0})),er=Hn(T({},Un,{animationName:0,elapsedTime:0,pseudoElement:0})),tr=Hn(T({},Un,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),nr=Hn(T({},Un,{data:0})),rr={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},ir={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},ar={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function or(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=ar[e])?!!t[e]:!1}function sr(){return or}var cr=Hn(T({},Gn,{key:function(e){if(e.key){var t=rr[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=zn(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?ir[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:sr,charCode:function(e){return e.type===`keypress`?zn(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?zn(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),lr=Hn(T({},Xn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),ur=Hn(T({},Un,{submitter:0})),dr=Hn(T({},Gn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:sr})),fr=Hn(T({},Un,{propertyName:0,elapsedTime:0,pseudoElement:0})),pr=Hn(T({},Xn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),mr=Hn(T({},Un,{newState:0,oldState:0,source:0})),hr=[9,13,27,32],gr=Mn&&`CompositionEvent`in window,_r=null;Mn&&`documentMode`in document&&(_r=document.documentMode);var vr=Mn&&`TextEvent`in window&&!_r,N=Mn&&(!gr||_r&&8<_r&&11>=_r),yr=` `,br=!1;function xr(e,t){switch(e){case`keyup`:return hr.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function P(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var Sr=!1;function Cr(e,t){switch(e){case`compositionend`:return P(t);case`keypress`:return t.which===32?(br=!0,yr):null;case`textInput`:return e=t.data,e===yr&&br?null:e;default:return null}}function wr(e,t){if(Sr)return e===`compositionend`||!gr&&xr(e,t)?(e=Rn(),Ln=In=Fn=null,Sr=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return N&&t.locale!==`ko`?null:t.data;default:return null}}var Tr={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Er(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!Tr[e.type]:t===`textarea`}function Dr(e,t,n,r){En?Dn?Dn.push(r):Dn=[r]:En=r,t=Jf(t,`onChange`),0<t.length&&(n=new Wn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var Or=null,kr=null;function Ar(e){Vf(e,0)}function jr(e){if(on(zt(e)))return e}function Mr(e,t){if(e===`change`)return t}var Nr=!1;if(Mn){var Pr;if(Mn){var Fr=`oninput`in document;if(!Fr){var Ir=document.createElement(`div`);Ir.setAttribute(`oninput`,`return;`),Fr=typeof Ir.oninput==`function`}Pr=Fr}else Pr=!1;Nr=Pr&&(!document.documentMode||9<document.documentMode)}function Lr(){Or&&(Or.detachEvent(`onpropertychange`,Rr),kr=Or=null)}function Rr(e){if(e.propertyName===`value`&&jr(kr)){var t=[];Dr(t,kr,e,Tn(e)),An(Ar,t)}}function zr(e,t,n){e===`focusin`?(Lr(),Or=t,kr=n,Or.attachEvent(`onpropertychange`,Rr)):e===`focusout`&&Lr()}function Br(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return jr(kr)}function Vr(e,t){if(e===`click`)return jr(t)}function Hr(e,t){if(e===`input`||e===`change`)return jr(t)}function Ur(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var Wr=typeof Object.is==`function`?Object.is:Ur;function Gr(e,t){if(Wr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!Be.call(t,i)||!Wr(e[i],t[i]))return!1}return!0}function Kr(e){if(e||=typeof document<`u`?document:void 0,e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}function qr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Jr(e,t){var n=qr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=qr(n)}}function Yr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Yr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Xr(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Kr(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=Kr(e.document)}return t}function Zr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var Qr=Mn&&`documentMode`in document&&11>=document.documentMode,$r=null,ei=null,ti=null,ni=!1;function ri(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;ni||$r==null||$r!==Kr(r)||(r=$r,`selectionStart`in r&&Zr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),ti&&Gr(ti,r)||(ti=r,r=Jf(ei,`onSelect`),0<r.length&&(t=new Wn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=$r)))}function ii(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var ai={animationend:ii(`Animation`,`AnimationEnd`),animationiteration:ii(`Animation`,`AnimationIteration`),animationstart:ii(`Animation`,`AnimationStart`),transitionrun:ii(`Transition`,`TransitionRun`),transitionstart:ii(`Transition`,`TransitionStart`),transitioncancel:ii(`Transition`,`TransitionCancel`),transitionend:ii(`Transition`,`TransitionEnd`)},oi={},si={};Mn&&(si=document.createElement(`div`).style,`AnimationEvent`in window||(delete ai.animationend.animation,delete ai.animationiteration.animation,delete ai.animationstart.animation),`TransitionEvent`in window||delete ai.transitionend.transition);function ci(e){if(oi[e])return oi[e];if(!ai[e])return e;var t=ai[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in si)return oi[e]=t[n];return e}var li=ci(`animationend`),ui=ci(`animationiteration`),di=ci(`animationstart`),fi=ci(`transitionrun`),pi=ci(`transitionstart`),mi=ci(`transitioncancel`),hi=ci(`transitionend`),gi=new Map,_i=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);_i.push(`scrollEnd`);function vi(e,t){gi.set(e,t),Gt(t,[e])}var yi=0;function bi(e,t){if(e.name!=null&&e.name!==`auto`)return e.name;if(t.autoName!==null)return t.autoName;e=bd.identifierPrefix;var n=yi++;return e=`_`+e+`t_`+n.toString(32)+`_`,t.autoName=e}function xi(e){if(e==null||typeof e==`string`)return e;var t=null,n=Od;if(n!==null)for(var r=0;r<n.length;r++){var i=e[n[r]];if(i!=null){if(i===`none`)return`none`;t=t==null?i:t+(` `+i)}}return t??e.default}function Si(e,t){return e=xi(e),t=xi(t),t==null?e===`auto`?null:e:t===`auto`?null:t}var Ci=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},wi=[],Ti=0,Ei=0;function Di(){for(var e=Ti,t=Ei=Ti=0;t<e;){var n=wi[t];wi[t++]=null;var r=wi[t];wi[t++]=null;var i=wi[t];wi[t++]=null;var a=wi[t];if(wi[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&ji(n,i,a)}}function Oi(e,t,n,r){wi[Ti++]=e,wi[Ti++]=t,wi[Ti++]=n,wi[Ti++]=r,Ei|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function ki(e,t,n,r){return Oi(e,t,n,r),Mi(e)}function Ai(e,t){return Oi(e,null,null,t),Mi(e)}function ji(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-rt(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function Mi(e){if(50<kd)throw kd=0,Ad=null,Error(a(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Ni={};function Pi(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Fi(e,t,n,r){return new Pi(e,t,n,r)}function Ii(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Li(e,t){var n=e.alternate;return n===null?(n=Fi(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&1206910976,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function Ri(e,t){e.flags&=1206910978;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function zi(e,t,n,r,i,o){var s=0;if(r=e,typeof r==`function`)Ii(r)&&(s=1);else if(typeof r==`string`)s=qm(e,n,Te.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(r){case ue:return e=Fi(31,n,t,i),e.elementType=ue,e.lanes=o,e;case re:return Bi(n.children,i,o,t);case ie:s=8,i|=24;break;case ae:return e=Fi(12,n,t,i|2),e.elementType=ae,e.lanes=o,e;case D:return e=Fi(13,n,t,i),e.elementType=D,e.lanes=o,e;case O:return e=Fi(19,n,t,i),e.elementType=O,e.lanes=o,e;case de:case pe:return e=i|32,e=Fi(30,n,t,e),e.elementType=pe,e.lanes=o,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof r==`object`&&r)switch(r.$$typeof){case E:s=10;break a;case oe:s=9;break a;case se:s=11;break a;case ce:s=14;break a;case le:s=16,r=null;break a}s=29,n=Error(a(130,e===null?`null`:typeof e,``)),r=null}return t=Fi(s,n,t,i),t.elementType=e,t.type=r,t.lanes=o,t}function Bi(e,t,n,r){return e=Fi(7,e,r,t),e.lanes=n,e}function Vi(e,t,n){return e=Fi(6,e,null,t),e.lanes=n,e}function Hi(e){var t=Fi(18,null,null,0);return t.stateNode=e,t}function Ui(e,t,n){return t=Fi(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Wi=new WeakMap;function Gi(e,t){if(typeof e==`object`&&e){var n=Wi.get(e);return n===void 0?(t={value:e,source:t,stack:ze(t)},Wi.set(e,t),t):n}return{value:e,source:t,stack:ze(t)}}var Ki=[],qi=0,Ji=null,Yi=0,Xi=[],Zi=0,Qi=null,$i=1,ea=``;function F(e,t){Ki[qi++]=Yi,Ki[qi++]=Ji,Ji=e,Yi=t}function ta(e,t,n){Xi[Zi++]=$i,Xi[Zi++]=ea,Xi[Zi++]=Qi,Qi=e;var r=$i;e=ea;var i=32-rt(r)-1;r&=~(1<<i),n+=1;var a=32-rt(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,$i=1<<32-rt(t)+i|n<<i|r,ea=a+e}else $i=1<<a|n<<i|r,ea=e}function na(e){e.return!==null&&(F(e,1),ta(e,1,0))}function ra(e){for(;e===Ji;)Ji=Ki[--qi],Ki[qi]=null,Yi=Ki[--qi],Ki[qi]=null;for(;e===Qi;)Qi=Xi[--Zi],Xi[Zi]=null,ea=Xi[--Zi],Xi[Zi]=null,$i=Xi[--Zi],Xi[Zi]=null}function ia(e,t){Xi[Zi++]=$i,Xi[Zi++]=ea,Xi[Zi++]=Qi,$i=t.id,ea=t.overflow,Qi=e}var aa=null,I=null,L=!1,oa=null,ca=!1,la=Error(a(519));function ua(e){throw ga(Gi(Error(a(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),la}function da(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[Dt]=e,t[Ot]=r,n){case`dialog`:Q(`cancel`,t),Q(`close`,t);break;case`iframe`:case`object`:case`embed`:Q(`load`,t);break;case`video`:case`audio`:for(n=0;n<zf.length;n++)Q(zf[n],t);break;case`source`:Q(`error`,t);break;case`img`:case`image`:case`link`:Q(`error`,t),Q(`load`,t);break;case`details`:Q(`toggle`,t);break;case`input`:Q(`invalid`,t),un(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:Q(`invalid`,t);break;case`textarea`:Q(`invalid`,t),mn(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||ep(t.textContent,n)?(r.popover!=null&&(Q(`beforetoggle`,t),Q(`toggle`,t)),r.onScroll!=null&&Q(`scroll`,t),r.onScrollEnd!=null&&Q(`scrollend`,t),r.onClick!=null&&(t.onclick=Cn),t=!0):t=!1,t||ua(e,!0)}function fa(e){for(aa=e.return;aa;)switch(aa.tag){case 5:case 31:case 13:ca=!1;return;case 27:case 3:ca=!0;return;default:aa=aa.return}}function pa(e){if(e!==aa)return!1;if(!L)return fa(e),L=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=n===`form`||n===`button`||pp(e.type,e.memoizedProps)),n=!n),n&&I&&ua(e),fa(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(a(317));I=dm(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(a(317));I=dm(e)}else t===27?(t=I,Sp(e.type)?(e=um,um=null,I=e):I=t):I=aa?lm(e.stateNode.nextSibling):null;return!0}function ma(){I=aa=null,L=!1}function ha(){var e=oa;return e!==null&&(fd===null?fd=e:fd.push.apply(fd,e),oa=null),e}function ga(e){oa===null?oa=[e]:oa.push(e)}var _a=Ce(null),va=null,ya=null;function R(e,t,n){j(_a,t._currentValue),t._currentValue=n}function ba(e){e._currentValue=_a.current,we(_a)}function xa(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function Sa(e,t,n,r){var i=e.child;for(i!==null&&(i.return=e);i!==null;){var o=i.dependencies;if(o!==null){var s=i.child;o=o.firstContext;a:for(;o!==null;){var c=o;o=i;for(var l=0;l<t.length;l++)if(c.context===t[l]){o.lanes|=n,c=o.alternate,c!==null&&(c.lanes|=n),xa(o.return,n,e),r||(s=null);break a}o=c.next}}else if(i.tag===18){if(s=i.return,s===null)throw Error(a(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),xa(s,n,e),s=null}else i.tag===13&&i.memoizedState!==null&&i.memoizedState.dehydrated===null?(i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),xa(i.return,n,e),s=i.child,s=s===null?null:s.sibling):s=i.child;if(s!==null)s.return=i;else for(s=i;s!==null;){if(s===e){s=null;break}if(i=s.sibling,i!==null){i.return=s.return,s=i;break}s=s.return}i=s}}function Ca(e,t,n,r){e=null;for(var i=t,o=!1;i!==null;){if(!o){if(i.flags&524288)o=!0;else if(i.flags&262144)break}if(i.tag===10){var s=i.alternate;if(s===null)throw Error(a(387));if(s=s.memoizedProps,s!==null){var c=i.type;Wr(i.pendingProps.value,s.value)||(e===null?e=[c]:e.push(c))}}else if(i===Oe.current){if(s=i.alternate,s===null)throw Error(a(387));s.memoizedState.memoizedState!==i.memoizedState.memoizedState&&(e===null?e=[sh]:e.push(sh))}i=i.return}return e!==null&&Sa(t,e,n,r),t.flags|=262144,e!==null}function wa(e){for(e=e.firstContext;e!==null;){if(!Wr(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Ta(e){va=e,ya=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Ea(e){return Oa(va,e)}function Da(e,t){return va===null&&Ta(e),Oa(e,t)}function Oa(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},ya===null){if(e===null)throw Error(a(308));ya=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else ya=ya.next=t;return n}var ka=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},Aa=n.unstable_scheduleCallback,ja=n.unstable_NormalPriority,z={$$typeof:E,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Ma(){return{controller:new ka,data:new Map,refCount:0}}function Na(e){e.refCount--,e.refCount===0&&Aa(ja,function(){e.controller.abort()})}function Pa(e,t){if(e.pendingLanes&4194048){var n=e.transitionTypes;for(n===null&&(n=e.transitionTypes=[]),e=0;e<t.length;e++){var r=t[e];n.indexOf(r)===-1&&n.push(r)}}}var Fa=null;function Ia(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var La=null,Ra=0,za=0,Ba=null;function Va(e,t){if(La===null){var n=La=[];Ra=0,za=Pf(),Ba={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return Ra++,t.then(Ha,Ha),t}function Ha(){if(--Ra===0&&(Fa=null,La!==null)){Ba!==null&&(Ba.status=`fulfilled`);var e=La;La=null,za=0,Ba=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function Ua(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var Wa=k.S;k.S=function(e,t){if(hd=Ge(),typeof t==`object`&&t&&typeof t.then==`function`&&Va(e,t),Fa!==null)for(var n=bf;n!==null;)Pa(n,Fa),n=n.next;if(n=e.types,n!==null){for(var r=bf;r!==null;)Pa(r,n),r=r.next;if(za!==0){r=Fa,r===null&&(r=Fa=[]);for(var i=0;i<n.length;i++){var a=n[i];r.indexOf(a)===-1&&r.push(a)}}}Wa!==null&&Wa(e,t)};var Ga=Ce(null);function Ka(){var e=Ga.current;return e===null?q.pooledCache:e}function qa(e,t){t===null?j(Ga,Ga.current):j(Ga,t.pool)}function Ja(){var e=Ka();return e===null?null:{parent:z._currentValue,pool:e}}var Ya=Error(a(460)),Xa=Error(a(474)),Za=Error(a(542)),Qa={then:function(){}};function $a(e){return e=e.status,e===`fulfilled`||e===`rejected`}function eo(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(Cn,Cn),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,io(e),e===void 0&&!(`reason`in t)?Error(a(600)):e;default:if(typeof t.status==`string`)t.then(Cn,Cn);else{if(e=q,e!==null&&100<e.shellSuspendCounter)throw Error(a(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,io(e),e}throw no=t,Ya}}function to(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(no=e,Ya):e}}var no=null;function ro(){if(no===null)throw Error(a(459));var e=no;return no=null,e}function io(e){if(e===Ya||e===Za)throw Error(a(483))}var ao=null,oo=0;function so(e){var t=oo;return oo+=1,ao===null&&(ao=[]),eo(ao,e,t)}function co(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function lo(e,t){throw t.$$typeof===ee?Error(a(525)):(e=Object.prototype.toString.call(t),Error(a(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function uo(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function i(e,t){return e=Li(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=134217730,n):(r=r.index,r<n?(t.flags|=2,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=134217730),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=Vi(n,e.mode,r),t.return=e,t):(t=i(t,n),t.return=e,t)}function l(e,t,n,r){var a=n.type;return a===re?(e=d(e,t,n.props.children,r,n.key),co(e,n),e):t!==null&&(t.elementType===a||typeof a==`object`&&a&&a.$$typeof===le&&to(a)===t.type)?(t=i(t,n.props),co(t,n),t.return=e,t):(t=zi(n.type,n.key,n.props,null,e.mode,r),co(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=Ui(n,e.mode,r),t.return=e,t):(t=i(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,a){return t===null||t.tag!==7?(t=Bi(n,e.mode,r,a),t.return=e,t):(t=i(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=Vi(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case te:return n=zi(t.type,t.key,t.props,null,e.mode,n),co(n,t),n.return=e,n;case ne:return t=Ui(t,e.mode,n),t.return=e,t;case le:return t=to(t),f(e,t,n)}if(ye(t)||ge(t))return t=Bi(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,so(t),n);if(t.$$typeof===E)return f(e,Da(e,t),n);lo(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case te:return n.key===i?l(e,t,n,r):null;case ne:return n.key===i?u(e,t,n,r):null;case le:return n=to(n),p(e,t,n,r)}if(ye(n)||ge(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,so(n),r);if(n.$$typeof===E)return p(e,t,Da(e,n),r);lo(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case te:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case ne:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case le:return r=to(r),m(e,t,n,r,i)}if(ye(r)||ge(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,so(r),i);if(r.$$typeof===E)return m(e,t,n,Da(t,r),i);lo(t,r)}return null}function h(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),L&&F(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return L&&F(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&(_=g.alternate,_!==null&&d.delete(_.key===null?h:_.key)),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),L&&F(i,h),l}function g(i,s,c,l){if(c==null)throw Error(a(151));for(var u=null,d=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(i,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(i,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(i,h),L&&F(i,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(i,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return L&&F(i,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,i,g,v.value,l),v!==null&&(e&&(_=v.alternate,_!==null&&h.delete(_.key===null?g:_.key)),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(i,e)}),L&&F(i,g),u}function _(e,r,o,c){if(typeof o==`object`&&o&&o.type===re&&o.key===null&&o.props.ref===void 0&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case te:a:{for(var l=o.key;r!==null;){if(r.key===l){if(l=o.type,l===re){if(r.tag===7){n(e,r.sibling),c=i(r,o.props.children),co(c,o),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===le&&to(l)===r.type){n(e,r.sibling),c=i(r,o.props),co(c,o),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}o.type===re?(c=Bi(o.props.children,e.mode,c,o.key),co(c,o),c.return=e,e=c):(c=zi(o.type,o.key,o.props,null,e.mode,c),co(c,o),c.return=e,e=c)}return s(e);case ne:a:{for(l=o.key;r!==null;){if(r.key===l){if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),c=i(r,o.children||[]),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}c=Ui(o,e.mode,c),c.return=e,e=c}return s(e);case le:return o=to(o),_(e,r,o,c)}if(ye(o))return h(e,r,o,c);if(ge(o)){if(l=ge(o),typeof l!=`function`)throw Error(a(150));return o=l.call(o),g(e,r,o,c)}if(typeof o.then==`function`)return _(e,r,so(o),c);if(o.$$typeof===E)return _(e,r,Da(e,o),c);lo(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),c=i(r,o),c.return=e,e=c):(n(e,r),c=Vi(o,e.mode,c),c.return=e,e=c),s(e)):n(e,r)}return function(e,t,n,r){try{oo=0;var i=_(e,t,n,r);return ao=null,i}catch(t){if(t===Ya||t===Za)throw t;var a=Fi(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var fo=uo(!0),po=uo(!1),mo=!1;function ho(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function go(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function _o(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function vo(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,K&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=Mi(e),ji(e,null,n),t}return Oi(e,r,t,n),Mi(e)}function yo(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,bt(e,n)}}function bo(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var xo=!1;function So(){if(xo){var e=Ba;if(e!==null)throw e}}function Co(e,t,n,r){xo=!1;var i=e.updateQueue;mo=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane&-536870913,p=f!==s.lane;if(p?(Y&f)===f:(r&f)===f){f!==0&&f===za&&(xo=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var m=e,h=s;f=t;var g=n;switch(h.tag){case 1:if(m=h.payload,typeof m==`function`){d=m.call(g,d,f);break a}d=m;break a;case 3:m.flags=m.flags&-65537|128;case 0:if(m=h.payload,f=typeof m==`function`?m.call(g,d,f):m,f==null)break a;d=T({},d,f);break a;case 2:mo=!0}}f=s.callback,f!==null&&(e.flags|=64,p&&(e.flags|=8192),p=i.callbacks,p===null?i.callbacks=[f]:p.push(f))}else p={lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=p,c=d):u=u.next=p,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;p=s,s=p.next,p.next=null,i.lastBaseUpdate=p,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),od|=o,e.lanes=o,e.memoizedState=d}}function wo(e,t){if(typeof e!=`function`)throw Error(a(191,e));e.call(t)}function To(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)wo(n[e],t)}var Eo=Ce(null),Do=Ce(0);function Oo(e,t){e=id,j(Do,e),j(Eo,t),id=e|t.baseLanes}function ko(){j(Do,id),j(Eo,Eo.current)}function Ao(){id=Do.current,we(Eo),we(Do)}var jo=Ce(null),B=null;function Mo(e){var t=e.alternate;j(V,V.current&1),j(jo,e),B===null&&(t===null||Eo.current!==null||t.memoizedState!==null)&&(B=e)}function No(e){j(V,V.current),j(jo,e),B===null&&(B=e)}function Po(e){e.tag===22?(j(V,V.current),j(jo,e),B===null&&(B=e)):Fo()}function Fo(){j(V,V.current),j(jo,jo.current)}function Io(e){we(jo),B===e&&(B=null),we(V)}var V=Ce(0);function Lo(e,t){j(jo,jo.current),j(V,t)}function Ro(e){we(V),we(jo),B===e&&(B=null)}function zo(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||om(n)||sm(n)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==`independent`){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Bo=0,H=null,U=null,Vo=null,Ho=!1,Uo=!1,Wo=!1,Go=0,Ko=0,qo=null,Jo=0;function Yo(){throw Error(a(321))}function Xo(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Wr(e[n],t[n]))return!1;return!0}function Zo(e,t,n,r,i,a){return Bo=a,H=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,k.H=e===null||e.memoizedState===null?hc:gc,Wo=!1,a=n(r,i),Wo=!1,Uo&&(a=$o(t,n,r,i)),Qo(e),a}function Qo(e){k.H=mc;var t=U!==null&&U.next!==null;if(Bo=0,Vo=U=H=null,Ho=!1,Ko=0,qo=null,t)throw Error(a(300));e===null||Nc||(e=e.dependencies,e!==null&&wa(e)&&(Nc=!0))}function $o(e,t,n,r){H=e;var i=0;do{if(Uo&&(qo=null),Ko=0,Uo=!1,25<=i)throw Error(a(301));if(i+=1,Vo=U=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}k.H=_c,o=t(n,r)}while(Uo);return o}function es(){var e=k.H,t=e.useState()[0];return t=typeof t.then==`function`?ss(t):t,e=e.useState()[0],(U===null?null:U.memoizedState)!==e&&(H.flags|=1024),t}function ts(){var e=Go!==0;return Go=0,e}function ns(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function rs(e){if(Ho){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Ho=!1}Bo=0,Vo=U=H=null,Uo=!1,Ko=Go=0,qo=null}function is(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Vo===null?H.memoizedState=Vo=e:Vo=Vo.next=e,Vo}function as(){if(U===null){var e=H.alternate;e=e===null?null:e.memoizedState}else e=U.next;var t=Vo===null?H.memoizedState:Vo.next;if(t!==null)Vo=t,U=e;else{if(e===null)throw H.alternate===null?Error(a(467)):Error(a(310));U=e,e={memoizedState:U.memoizedState,baseState:U.baseState,baseQueue:U.baseQueue,queue:U.queue,next:null},Vo===null?H.memoizedState=Vo=e:Vo=Vo.next=e}return Vo}function os(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function ss(e){var t=Ko;return Ko+=1,qo===null&&(qo=[]),e=eo(qo,e,t),t=H,(Vo===null?t.memoizedState:Vo.next)===null&&(t=t.alternate,k.H=t===null||t.memoizedState===null?hc:gc),e}function cs(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return ss(e);if(e.$$typeof===me)return;if(e.$$typeof===E)return Ea(e)}throw Error(a(438,String(e)))}function ls(e){var t=null,n=H.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=H.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??={data:[],index:0},n===null&&(n=os(),H.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=fe;return t.index++,n}function us(e,t){return typeof t==`function`?t(e):t}function ds(e){return fs(as(),U,e)}function fs(e,t,n){var r=e.queue;if(r===null)throw Error(a(311));r.lastRenderedReducer=n;var i=e.baseQueue,o=r.pending;if(o!==null){if(i!==null){var s=i.next;i.next=o.next,o.next=s}t.baseQueue=i=o,r.pending=null}if(o=e.baseState,i===null)e.memoizedState=o;else{t=i.next;var c=s=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(Bo&f)===f:(Y&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===za&&(d=!0);else if((Bo&p)===p){u=u.next,p===za&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,s=o):l=l.next=f,H.lanes|=p,od|=p;f=u.action,Wo&&n(o,f),o=u.hasEagerState?u.eagerState:n(o,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,s=o):l=l.next=p,H.lanes|=f,od|=f;u=u.next}while(u!==null&&u!==t);if(l===null?s=o:l.next=c,!Wr(o,e.memoizedState)&&(Nc=!0,d&&(n=Ba,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=l,r.lastRenderedState=o}return i===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function ps(e){var t=as(),n=t.queue;if(n===null)throw Error(a(311));n.lastRenderedReducer=e;var r=n.dispatch,i=n.pending,o=t.memoizedState;if(i!==null){n.pending=null;var s=i=i.next;do o=e(o,s.action),s=s.next;while(s!==i);Wr(o,t.memoizedState)||(Nc=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function ms(e,t,n){var r=H,i=as(),o=L;if(o){if(n===void 0)throw Error(a(407));n=n()}else n=t();var s=!Wr((U||i).memoizedState,n);if(s&&(i.memoizedState=n,Nc=!0),i=i.queue,zs(_s.bind(null,r,i,e),[e]),e=i.getSnapshot!==t||s||Vo!==null&&!!(Vo.memoizedState.tag&1),Ps(e?9:8,{destroy:void 0},gs.bind(null,r,i,n,t),null),e){if(r.flags|=2048,q===null)throw Error(a(349));o||Bo&127||hs(r,t,n)}return n}function hs(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=H.updateQueue,t===null?(t=os(),H.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function gs(e,t,n,r){t.value=n,t.getSnapshot=r,vs(t)&&ys(e)}function _s(e,t,n){return n(function(){vs(t)&&ys(e)})}function vs(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Wr(e,n)}catch{return!0}}function ys(e){var t=Ai(e,2);t!==null&&Pd(t,e,2)}function bs(e){var t=is();if(typeof e==`function`){var n=e;if(e=n(),Wo){nt(!0);try{n()}finally{nt(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:us,lastRenderedState:e},t}function xs(e,t,n,r){return e.baseState=n,fs(e,U,typeof r==`function`?r:us)}function Ss(e,t,n,r,i){if(dc(e))throw Error(a(485));if(e=t.action,e!==null){var o={payload:i,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};k.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,Cs(t,o)):(o.next=n.next,t.pending=n.next=o)}}function Cs(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=k.T,o={};o.types=a===null?null:a.types,k.T=o;try{var s=n(i,r),c=k.S;c!==null&&c(o,s),ws(e,t,s)}catch(n){Es(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),k.T=a}}else try{a=n(i,r),ws(e,t,a)}catch(n){Es(e,t,n)}}function ws(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){Ts(e,t,n)},function(n){return Es(e,t,n)}):Ts(e,t,n)}function Ts(e,t,n){t.status=`fulfilled`,t.value=n,Ds(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Cs(e,n)))}function Es(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,Ds(t),t=t.next;while(t!==r)}e.action=null}function Ds(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Os(e,t){return t}function ks(e,t){if(L){var n=q.formState;if(n!==null){a:{var r=H;if(L){if(I){b:{for(var i=I,a=ca;i.nodeType!==8;){if(!a){i=null;break b}if(i=lm(i.nextSibling),i===null){i=null;break b}}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){I=lm(i.nextSibling),r=i.data===`F!`;break a}}ua(r)}r=!1}r&&(t=n[0])}}return n=is(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Os,lastRenderedState:t},n.queue=r,n=cc.bind(null,H,r),r.dispatch=n,r=bs(!1),a=uc.bind(null,H,!1,r.queue),r=is(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=Ss.bind(null,H,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function As(e){return js(as(),U,e)}function js(e,t,n){if(t=fs(e,t,Os)[0],e=ds(us)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=ss(t)}catch(e){throw e===Ya?Za:e}else r=t;t=as();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(H.flags|=2048,Ps(9,{destroy:void 0},Ms.bind(null,i,n),null)),[r,a,e]}function Ms(e,t){e.action=t}function Ns(e){var t=as(),n=U;if(n!==null)return js(t,n,e);as(),t=t.memoizedState,n=as();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function Ps(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=H.updateQueue,t===null&&(t=os(),H.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function Fs(){return as().memoizedState}function Is(e,t,n,r){var i=is();H.flags|=e,i.memoizedState=Ps(1|t,{destroy:void 0},n,r===void 0?null:r)}function Ls(e,t,n,r){var i=as();r=r===void 0?null:r;var a=i.memoizedState.inst;U!==null&&r!==null&&Xo(r,U.memoizedState.deps)?i.memoizedState=Ps(t,a,n,r):(H.flags|=e,i.memoizedState=Ps(1|t,a,n,r))}function Rs(e,t){Is(8390656,8,e,t)}function zs(e,t){Ls(2048,8,e,t)}function Bs(e){H.flags|=4;var t=H.updateQueue;if(t===null)t=os(),H.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function Vs(e){var t=as().memoizedState;return Bs({ref:t,nextImpl:e}),function(){if(K&2)throw Error(a(440));return t.impl.apply(void 0,arguments)}}function Hs(e,t){return Ls(4,2,e,t)}function Ws(e,t){return Ls(4,4,e,t)}function Gs(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Ks(e,t,n){n=n==null?null:n.concat([e]),Ls(4,4,Gs.bind(null,t,e),n)}function qs(){}function Js(e,t){var n=as();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&Xo(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Ys(e,t){var n=as();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&Xo(t,r[1]))return r[0];if(r=e(),Wo){nt(!0);try{e()}finally{nt(!1)}}return n.memoizedState=[r,t],r}function Xs(e,t,n){return n===void 0||Bo&1073741824&&!(Y&261930)?e.memoizedState=t:(e.memoizedState=n,e=Md(),H.lanes|=e,od|=e,n)}function Zs(e,t,n,r){return Wr(n,t)?n:Eo.current===null?!(Bo&106)||Bo&1073741824&&!(Y&261930)?(Nc=!0,e.memoizedState=n):(e=Md(),H.lanes|=e,od|=e,t):(e=Xs(e,n,r),Wr(e,t)||(Nc=!0),e)}function Qs(e,t,n,r,i){var a=A.p;A.p=a!==0&&8>a?a:8;var o=k.T,s={};s.types=o===null?null:o.types,k.T=s,uc(e,!1,t,n);try{var c=i(),l=k.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?lc(e,t,Ua(c,r),jd(e)):lc(e,t,r,jd(e))}catch(n){lc(e,t,{then:function(){},status:`rejected`,reason:n},jd())}finally{A.p=a,o!==null&&s.types!==null&&(o.types=s.types),k.T=o}}function $s(){}function ec(e,t,n,r){if(e.tag!==5)throw Error(a(476));var i=tc(e).queue;Qs(e,i,t,be,n===null?$s:function(){return nc(e),n(r)})}function tc(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:be,baseState:be,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:us,lastRenderedState:be},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:us,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function nc(e){var t=tc(e);t.next===null&&(t=e.alternate.memoizedState),lc(e,t.next.queue,{},jd())}function rc(){return Ea(sh)}function ic(){return as().memoizedState}function ac(){return as().memoizedState}function oc(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=jd();e=_o(n);var r=vo(t,e,n);r!==null&&(Pd(r,t,n),yo(r,t,n)),t={cache:Ma()},e.payload=t;return}t=t.return}}function sc(e,t,n){var r=jd();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},dc(e)?fc(t,n):(n=ki(e,t,n,r),n!==null&&(Pd(n,e,r),pc(n,t,r)))}function cc(e,t,n){lc(e,t,n,jd())}function lc(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(dc(e))fc(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,Wr(s,o))return Oi(e,t,i,0),q===null&&Di(),!1}catch{}if(n=ki(e,t,i,r),n!==null)return Pd(n,e,r),pc(n,t,r),!0}return!1}function uc(e,t,n,r){if(r={lane:2,revertLane:Pf(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},dc(e)){if(t)throw Error(a(479))}else t=ki(e,n,r,2),t!==null&&Pd(t,e,2)}function dc(e){var t=e.alternate;return e===H||t!==null&&t===H}function fc(e,t){Uo=Ho=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function pc(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,bt(e,n)}}var mc={readContext:Ea,use:cs,useCallback:Yo,useContext:Yo,useEffect:Yo,useImperativeHandle:Yo,useLayoutEffect:Yo,useInsertionEffect:Yo,useMemo:Yo,useReducer:Yo,useRef:Yo,useState:Yo,useDebugValue:Yo,useDeferredValue:Yo,useTransition:Yo,useSyncExternalStore:Yo,useId:Yo,useHostTransitionStatus:Yo,useFormState:Yo,useActionState:Yo,useOptimistic:Yo,useMemoCache:Yo,useCacheRefresh:Yo,useEffectEvent:Yo},hc={readContext:Ea,use:cs,useCallback:function(e,t){return is().memoizedState=[e,t===void 0?null:t],e},useContext:Ea,useEffect:Rs,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),Is(4194308,4,Gs.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Is(4194308,4,e,t)},useInsertionEffect:function(e,t){Is(4,2,e,t)},useMemo:function(e,t){var n=is();t=t===void 0?null:t;var r=e();if(Wo){nt(!0);try{e()}finally{nt(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=is();if(n!==void 0){var i=n(t);if(Wo){nt(!0);try{n(t)}finally{nt(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=sc.bind(null,H,e),[r.memoizedState,e]},useRef:function(e){var t=is();return e={current:e},t.memoizedState=e},useState:function(e){e=bs(e);var t=e.queue,n=cc.bind(null,H,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:qs,useDeferredValue:function(e,t){return Xs(is(),e,t)},useTransition:function(){var e=bs(!1);return e=Qs.bind(null,H,e.queue,!0,!1),is().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=H,i=is();if(L){if(n===void 0)throw Error(a(407));n=n()}else{if(n=t(),q===null)throw Error(a(349));Y&127||hs(r,t,n)}i.memoizedState=n;var o={value:n,getSnapshot:t};return i.queue=o,Rs(_s.bind(null,r,o,e),[e]),r.flags|=2048,Ps(9,{destroy:void 0},gs.bind(null,r,o,n,t),null),n},useId:function(){var e=is(),t=q.identifierPrefix;if(L){var n=ea,r=$i;n=(r&~(1<<32-rt(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=Go++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=Jo++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:rc,useFormState:ks,useActionState:ks,useOptimistic:function(e){var t=is();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=uc.bind(null,H,!0,n),n.dispatch=t,[e,t]},useMemoCache:ls,useCacheRefresh:function(){return is().memoizedState=oc.bind(null,H)},useEffectEvent:function(e){var t=is(),n={impl:e};return t.memoizedState=n,function(){if(K&2)throw Error(a(440));return n.impl.apply(void 0,arguments)}}},gc={readContext:Ea,use:cs,useCallback:Js,useContext:Ea,useEffect:zs,useImperativeHandle:Ks,useInsertionEffect:Hs,useLayoutEffect:Ws,useMemo:Ys,useReducer:ds,useRef:Fs,useState:function(){return ds(us)},useDebugValue:qs,useDeferredValue:function(e,t){return Zs(as(),U.memoizedState,e,t)},useTransition:function(){var e=ds(us)[0],t=as().memoizedState;return[typeof e==`boolean`?e:ss(e),t]},useSyncExternalStore:ms,useId:ic,useHostTransitionStatus:rc,useFormState:As,useActionState:As,useOptimistic:function(e,t){return xs(as(),U,e,t)},useMemoCache:ls,useCacheRefresh:ac,useEffectEvent:Vs},_c={readContext:Ea,use:cs,useCallback:Js,useContext:Ea,useEffect:zs,useImperativeHandle:Ks,useInsertionEffect:Hs,useLayoutEffect:Ws,useMemo:Ys,useReducer:ps,useRef:Fs,useState:function(){return ps(us)},useDebugValue:qs,useDeferredValue:function(e,t){var n=as();return U===null?Xs(n,e,t):Zs(n,U.memoizedState,e,t)},useTransition:function(){var e=ps(us)[0],t=as().memoizedState;return[typeof e==`boolean`?e:ss(e),t]},useSyncExternalStore:ms,useId:ic,useHostTransitionStatus:rc,useFormState:Ns,useActionState:Ns,useOptimistic:function(e,t){var n=as();return U===null?(n.baseState=e,[e,n.queue.dispatch]):xs(n,U,e,t)},useMemoCache:ls,useCacheRefresh:ac,useEffectEvent:Vs};function vc(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:T({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var yc={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=jd(),i=_o(r);i.payload=t,n!=null&&(i.callback=n),t=vo(e,i,r),t!==null&&(Pd(t,e,r),yo(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=jd(),i=_o(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=vo(e,i,r),t!==null&&(Pd(t,e,r),yo(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=jd(),r=_o(n);r.tag=2,t!=null&&(r.callback=t),t=vo(e,r,n),t!==null&&(Pd(t,e,n),yo(t,e,n))}};function bc(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!Gr(n,r)||!Gr(i,a):!0}function xc(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&yc.enqueueReplaceState(t,t.state,null)}function Sc(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=T({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Cc(e){Ci(e)}function wc(e){console.error(e)}function Tc(e){Ci(e)}function Ec(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function Dc(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function Oc(e,t,n){return n=_o(n),n.tag=3,n.payload={element:null},n.callback=function(){Ec(e,t)},n}function kc(e){return e=_o(e),e.tag=3,e}function Ac(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){Dc(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){Dc(t,n,r),typeof i!=`function`&&(vd===null?vd=new Set([this]):vd.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function jc(e,t,n,r,i){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&Ca(t,n,i,!0),n=jo.current,n!==null){switch(n.tag){case 31:case 13:case 19:return B===null?Kd():n.alternate===null&&ad===0&&(ad=3),n.flags&=-257,n.flags|=65536,n.lanes=i,r===Qa?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),mf(e,r,i)),!1;case 22:return n.flags|=65536,r===Qa?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),mf(e,r,i)),!1}throw Error(a(435,n.tag))}return mf(e,r,i),Kd(),!1}if(L)return t=jo.current,t===null?(r!==la&&(t=Error(a(423),{cause:r}),ga(Gi(t,n))),e=e.current.alternate,e.flags|=65536,i&=-i,e.lanes|=i,r=Gi(r,n),i=Oc(e.stateNode,r,i),bo(e,i),ad!==4&&(ad=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=i,r!==la&&(e=Error(a(422),{cause:r}),ga(Gi(e,n)))),!1;var o=Error(a(520),{cause:r});if(o=Gi(o,n),dd===null?dd=[o]:dd.push(o),ad!==4&&(ad=2),t===null)return!0;r=Gi(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=i&-i,n.lanes|=e,e=Oc(n.stateNode,r,e),bo(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(vd===null||!vd.has(o))))return n.flags|=65536,i&=-i,n.lanes|=i,i=kc(i),Ac(i,e,n,r),bo(n,i),!1;break;case 22:if(n.memoizedState!==null)return n.flags|=65536,!1}n=n.return}while(n!==null);return!1}var Mc=Error(a(461)),Nc=!1;function Pc(e,t,n,r){t.child=e===null?po(t,null,n,r):fo(t,e.child,n,r)}function Fc(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return Ta(t),r=Zo(e,t,n,o,a,i),s=ts(),e!==null&&!Nc?(ns(e,t,i),ll(e,t,i)):(L&&s&&na(t),t.flags|=1,Pc(e,t,r,i),t.child)}function Ic(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!Ii(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,Lc(e,t,a,r,i)):(e=zi(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!ul(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?Gr:n,n(o,r)&&e.ref===t.ref)return ll(e,t,i)}return t.flags|=1,e=Li(a,r),e.ref=t.ref,e.return=t,t.child=e}function Lc(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(Gr(a,r)&&e.ref===t.ref){if(Nc=!1,t.pendingProps=r=a,ul(e,i))e.flags&131072&&(Nc=!0);else return t.lanes=e.lanes,ll(e,t,i)}}return Gc(e,t,n,r,i)}function Rc(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return Bc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&qa(t,a===null?null:a.cachePool),a===null?ko():Oo(t,a),Po(t);else return r=t.lanes=536870912,Bc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&qa(t,null),ko(),Fo()):(qa(t,a.cachePool),Oo(t,a),Fo(),t.memoizedState=null);return Pc(e,t,i,n),t.child}function zc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Bc(e,t,n,r,i){var a=Ka();return a=a===null?null:{parent:z._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&qa(t,null),ko(),Po(t),e!==null&&Ca(e,t,r,!0),t.childLanes=i,null}function Vc(e,t){return t=el({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Hc(e,t,n){return fo(t,e.child,null,n),e=Vc(t,t.pendingProps),e.flags|=2,Io(t),t.memoizedState=null,e}function Uc(e,t,n){var r=t.pendingProps,i=!!(t.flags&128);if(t.flags&=-129,e===null){if(L){if(r.mode===`hidden`)return e=Vc(t,r),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},zc(null,e);if(No(t),(e=I)?(e=am(e,ca),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Qi===null?null:{id:$i,overflow:ea},retryLane:536870912,hydrationErrors:null},n=Hi(e),n.return=t,t.child=n,aa=t,I=null)):e=null,e===null)throw ua(t);return t.lanes=536870912,null}return Vc(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if(No(t),i){if(t.flags&256)t.flags&=-257,t=Hc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(a(558))}else if(Nc||Ca(e,t,n,!1),i=(n&e.childLanes)!==0,Nc||i){if(Eo.current===null){if(r=q,r!==null&&(s=xt(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,Ai(e,s),Pd(r,e,s),Mc;Kd()}t=Hc(e,t,n)}else e=o.treeContext,I=lm(s.nextSibling),aa=t,L=!0,oa=null,ca=!1,e!==null&&ia(t,e),t=Vc(t,r),t.flags|=134221824;return t}return e=Li(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Wc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(a(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function Gc(e,t,n,r,i){return Ta(t),n=Zo(e,t,n,r,void 0,i),r=ts(),e!==null&&!Nc?(ns(e,t,i),ll(e,t,i)):(L&&r&&na(t),t.flags|=1,Pc(e,t,n,i),t.child)}function Kc(e,t,n,r,i,a){return Ta(t),t.updateQueue=null,n=$o(t,r,n,i),Qo(e),r=ts(),e!==null&&!Nc?(ns(e,t,a),ll(e,t,a)):(L&&r&&na(t),t.flags|=1,Pc(e,t,n,a),t.child)}function qc(e,t,n,r,i){if(Ta(t),t.stateNode===null){var a=Ni,o=n.contextType;typeof o==`object`&&o&&(a=Ea(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=yc,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},ho(t),o=n.contextType,a.context=typeof o==`object`&&o?Ea(o):Ni,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(vc(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&yc.enqueueReplaceState(a,a.state,null),Co(t,r,a,i),So(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=Sc(n,s);a.props=c;var l=a.context,u=n.contextType;o=Ni,typeof u==`object`&&u&&(o=Ea(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&xc(t,a,r,o),mo=!1;var f=t.memoizedState;a.state=f,Co(t,r,a,i),So(),l=t.memoizedState,s||f!==l||mo?(typeof d==`function`&&(vc(t,n,d,r),l=t.memoizedState),(c=mo||bc(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,go(e,t),o=t.memoizedProps,u=Sc(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=Ni,typeof l==`object`&&l&&(c=Ea(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&xc(t,a,r,c),mo=!1,f=t.memoizedState,a.state=f,Co(t,r,a,i),So();var p=t.memoizedState;o!==d||f!==p||mo||e!==null&&e.dependencies!==null&&wa(e.dependencies)?(typeof s==`function`&&(vc(t,n,s,r),p=t.memoizedState),(u=mo||bc(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&wa(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,Wc(e,t),r=!!(t.flags&128),a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=fo(t,e.child,null,i),t.child=fo(t,null,n,i)):Pc(e,t,n,i),t.memoizedState=a.state,e=t.child):e=ll(e,t,i),e}function Jc(e,t,n,r){return ma(),t.flags|=256,Pc(e,t,n,r),t.child}var Yc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Xc(e){return{baseLanes:e,cachePool:Ja()}}function Zc(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=ld),e}function Qc(e,t,n){var r=t.pendingProps,i=!1,a=!!(t.flags&128),o;if((o=a)||(o=e!==null&&e.memoizedState===null?!1:!!(V.current&2)),o&&(i=!0,t.flags&=-129),o=!!(t.flags&32),t.flags&=-33,e===null){if(L){if(i?Mo(t):Fo(),(e=I)?(e=am(e,ca),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Qi===null?null:{id:$i,overflow:ea},retryLane:536870912,hydrationErrors:null},n=Hi(e),n.return=t,t.child=n,aa=t,I=null)):e=null,e===null)throw ua(t);return t.lanes=sm(e)?32:536870912,null}return a=r.children,r=r.fallback,i?(Fo(),i=t.mode,a=el({mode:`hidden`,children:a},i),r=Bi(r,i,n,null),a.return=t,r.return=t,a.sibling=r,t.child=a,r=t.child,r.memoizedState=Xc(n),r.childLanes=Zc(e,o,n),t.memoizedState=Yc,zc(null,r)):(Mo(t),$c(t,a))}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(c!==null)return nl(e,t,a,o,r,c,s,n)}return i?(Fo(),i=r.fallback,a=t.mode,s=e.child,c=s.sibling,r=Li(s,{mode:`hidden`,children:r.children}),r.subtreeFlags=s.subtreeFlags&1206910976,c===null?(i=Bi(i,a,n,null),i.flags|=2):i=Li(c,i),i.return=t,r.return=t,r.sibling=i,t.child=r,zc(null,r),r=t.child,i=e.child.memoizedState,i===null?i=Xc(n):(a=i.cachePool,a===null?a=Ja():(s=z._currentValue,a=a.parent===s?a:{parent:s,pool:s}),i={baseLanes:i.baseLanes|n,cachePool:a}),r.memoizedState=i,r.childLanes=Zc(e,o,n),t.memoizedState=Yc,zc(e.child,r)):(Mo(t),n=e.child,e=n.sibling,n=Li(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(o=t.deletions,o===null?(t.deletions=[e],t.flags|=16):o.push(e)),t.child=n,t.memoizedState=null,n)}function $c(e,t){return t=el({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function el(e,t){return e=Fi(22,e,null,t),e.lanes=0,e}function tl(e,t,n){return fo(t,e.child,null,n),e=$c(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function nl(e,t,n,r,i,o,s,c){if(n)return t.flags&256?(Mo(t),t.flags&=-257,tl(e,t,c)):t.memoizedState===null?(Fo(),o=i.fallback,s=t.mode,i=el({mode:`visible`,children:i.children},s),o=Bi(o,s,c,null),o.flags|=2,i.return=t,o.return=t,i.sibling=o,t.child=i,fo(t,e.child,null,c),i=t.child,i.memoizedState=Xc(c),i.childLanes=Zc(e,r,c),t.memoizedState=Yc,zc(null,i)):(Fo(),t.child=e.child,t.flags|=128,null);if(Mo(t),sm(o)){if(r=o.nextSibling&&o.nextSibling.dataset,r)var l=r.dgst;return r=l,r!==``&&(i=Error(a(419)),i.stack=``,i.digest=r,ga({value:i,source:null,stack:null})),tl(e,t,c)}if(Nc||Ca(e,t,c,!1),r=(c&e.childLanes)!==0,Nc||r){if(Eo.current!==null)return tl(e,t,c);if(r=q,r!==null&&(i=xt(r,c),i!==0&&i!==s.retryLane))throw s.retryLane=i,Ai(e,i),Pd(r,e,i),Mc;return om(o)||Kd(),tl(e,t,c)}return om(o)?(t.flags|=192,t.child=e.child,null):(e=s.treeContext,I=lm(o.nextSibling),aa=t,L=!0,oa=null,ca=!1,e!==null&&ia(t,e),t=$c(t,i.children),t.flags|=134221824,t)}function rl(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),xa(e.return,t,n)}function il(e){for(var t=null;e!==null;){var n=e.alternate;n!==null&&zo(n)===null&&(t=e),e=e.sibling}return t}function al(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function ol(e){var t=e.child;for(e.child=null;t!==null;){var n=t.sibling;t.sibling=e.child,e.child=t,t=n}}function sl(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=V.current;if(t.flags&128)return Lo(t,o),null;var s=!!(o&2);if(s?(o=o&1|2,t.flags|=128):o&=1,Lo(t,o),i===`backwards`&&e!==null?(ol(e),Pc(e,t,r,n),ol(e)):Pc(e,t,r,n),r=L?Yi:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&rl(e,n,t);else if(e.tag===19)rl(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`backwards`:n=il(t.child),n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null,ol(t)),al(t,!0,i,null,a,r);break;case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&zo(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}al(t,!0,n,null,a,r);break;case`together`:al(t,!1,null,null,void 0,r);break;case`independent`:t.memoizedState=null;break;default:n=il(t.child),n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),al(t,!1,i,n,a,r)}return t.child}function cl(e,t,n){var r=t.pendingProps;return R(t,t.type,r.value),Pc(e,t,r.children,n),t.child}function ll(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),od|=t.lanes,(n&t.childLanes)===0){if(e!==null){if(Ca(e,t,n,!1),(n&t.childLanes)===0)return null}else return null}if(e!==null&&t.child!==e.child)throw Error(a(153));if(t.child!==null){for(e=t.child,n=Li(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Li(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function ul(e,t){return(e.lanes&t)!==0||(e=e.dependencies,!!(e!==null&&wa(e)))}function dl(e,t,n){switch(t.tag){case 3:ke(t,t.stateNode.containerInfo),R(t,z,e.memoizedState.cache),ma();break;case 27:case 5:je(t);break;case 4:ke(t,t.stateNode.containerInfo);break;case 10:R(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,No(t),null;break;case 13:var r=t.memoizedState;if(r!==null){if(r.dehydrated!==null)return Mo(t),t.flags|=128,null;r=Ca(e,t,n,!1);var i=t.child.childLanes;return r||(n&i)!==0?Qc(e,t,n):(Mo(t),e=ll(e,t,n),e===null?null:e.sibling)}Mo(t);break;case 19:if(t.flags&128)return sl(e,t,n);if(i=!!(e.flags&128),r=(n&t.childLanes)!==0,r||=(Ca(e,t,n,!1),(n&t.childLanes)!==0),i){if(r)return sl(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),Lo(t,V.current),r)break;return null;case 22:return t.lanes=0,Rc(e,t,n,t.pendingProps);case 24:R(t,z,e.memoizedState.cache)}return ll(e,t,n)}function fl(e,t,n){if(e!==null){if(e.memoizedProps!==t.pendingProps)Nc=!0;else{if(!ul(e,n)&&!(t.flags&128))return Nc=!1,dl(e,t,n);Nc=!!(e.flags&131072)}}else Nc=!1,L&&t.flags&1048576&&ta(t,Yi,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=to(t.elementType),t.type=e,typeof e==`function`)Ii(e)?(r=Sc(e,r),t.tag=1,t=qc(null,t,e,r,n)):(t.tag=0,t=Gc(null,t,e,r,n));else{if(e!=null){var i=e.$$typeof;if(i===se){t.tag=11,t=Fc(null,t,e,r,n);break a}if(i===ce){t.tag=14,t=Ic(null,t,e,r,n);break a}if(i===E){t.tag=10,t.type=e,t=cl(null,t,n);break a}}throw t=ve(e)||e,Error(a(306,t,``))}}return t;case 0:return Gc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,i=Sc(r,t.pendingProps),qc(e,t,r,i,n);case 3:a:{if(ke(t,t.stateNode.containerInfo),e===null)throw Error(a(387));r=t.pendingProps;var o=t.memoizedState;i=o.element,go(e,t),Co(t,r,null,n);var s=t.memoizedState;if(r=s.cache,R(t,z,r),r!==o.cache&&Sa(t,[z],n,!0),So(),r=s.element,o.isDehydrated){if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=Jc(e,t,r,n);break a}if(r!==i){i=Gi(Error(a(424)),t),ga(i),t=Jc(e,t,r,n);break a}switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(I=lm(e.firstChild),aa=t,L=!0,oa=null,ca=!0,n=po(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|134221824,n=n.sibling}else{if(ma(),r===i){t=ll(e,t,n);break a}Pc(e,t,r,n)}t=t.child}return t;case 26:return Wc(e,t),e===null?(n=Nm(t.type,null,t.pendingProps,null))?t.memoizedState=n:L||(t.stateNode=fp(t.type,t.pendingProps,De.current,t)):t.memoizedState=Nm(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return je(t),e===null&&L&&(r=t.stateNode=hm(t.type,t.pendingProps,De.current),aa=t,ca=!0,i=I,Sp(t.type)?(um=i,I=lm(r.firstChild)):I=i),Pc(e,t,t.pendingProps.children,n),Wc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&L&&((i=r=I)&&(r=rm(r,t.type,t.pendingProps,ca),r===null?i=!1:(t.stateNode=r,aa=t,I=lm(r.firstChild),ca=!1,i=!0)),i||ua(t)),je(t),i=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,pp(i,o)?r=null:s!==null&&pp(i,s)&&(t.flags|=32),t.memoizedState!==null&&(i=Zo(e,t,es,null,null,n),sh._currentValue=i),Wc(e,t),Pc(e,t,r,n),t.child;case 6:return e===null&&L&&((e=n=I)&&(n=im(n,t.pendingProps,ca),n===null?e=!1:(t.stateNode=n,aa=t,I=null,e=!0)),e||ua(t)),null;case 13:return Qc(e,t,n);case 4:return ke(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=fo(t,null,r,n):Pc(e,t,r,n),t.child;case 11:return Fc(e,t,t.type,t.pendingProps,n);case 7:return r=t.pendingProps,Wc(e,t),Pc(e,t,r,n),t.child;case 8:return Pc(e,t,t.pendingProps.children,n),t.child;case 12:return Pc(e,t,t.pendingProps.children,n),t.child;case 10:return cl(e,t,n);case 9:return i=t.type._context,r=t.pendingProps.children,Ta(t),i=Ea(i),r=r(i),t.flags|=1,Pc(e,t,r,n),t.child;case 14:return Ic(e,t,t.type,t.pendingProps,n);case 15:return Lc(e,t,t.type,t.pendingProps,n);case 19:return sl(e,t,n);case 31:return Uc(e,t,n);case 22:return Rc(e,t,n,t.pendingProps);case 24:return Ta(t),r=Ea(z),e===null?(i=Ka(),i===null&&(i=q,o=Ma(),i.pooledCache=o,o.refCount++,o!==null&&(i.pooledCacheLanes|=n),i=o),t.memoizedState={parent:r,cache:i},ho(t),R(t,z,i)):((e.lanes&n)!==0&&(go(e,t),Co(t,null,null,n),So()),i=e.memoizedState,o=t.memoizedState,i.parent===r?(r=o.cache,R(t,z,r),r!==i.cache&&Sa(t,[z],n,!0)):(i={parent:r,cache:r},t.memoizedState=i,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=i),R(t,z,r))),Pc(e,t,t.pendingProps.children,n),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),r=t.pendingProps,r.name!=null&&r.name!==`auto`?t.flags|=e===null?18882560:18874368:L&&na(t),e!==null&&e.memoizedProps.name!==r.name?t.flags|=4194816:Wc(e,t),Pc(e,t,r.children,n),t.child;case 29:throw t.pendingProps}throw Error(a(156,t.tag))}function pl(e){e.flags|=4}function ml(e,t,n,r,i){var a;if((a=!!(e.mode&32))&&(a=n===null?Jm(t,r):Jm(t,r)&&(r.src!==n.src||r.srcSet!==n.srcSet)),a){if(e.flags|=16777216,(i&335544128)===i){if(e.stateNode.complete)e.flags|=8192;else if(Ud())e.flags|=8192;else throw no=Qa,Xa}}else e.flags&=-16777217}function hl(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Ym(t)){if(Ud())e.flags|=8192;else throw no=Qa,Xa}}function gl(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:ht(),e.lanes|=t,ud|=t)}function _l(e,t){if(!L)switch(e.tailMode){case`visible`:break;case`collapsed`:for(var n=e.tail,r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null;break;default:for(t=e.tail,n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null}}function W(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&1206910976,r|=i.flags&1206910976,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function vl(e,t,n){var r=t.pendingProps;switch(ra(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return W(t),null;case 1:return W(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),ba(z),Ae(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(pa(t)?pl(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,ha())),W(t),null;case 26:var i=t.type,o=t.memoizedState;return e===null?(pl(t),o===null?(W(t),ml(t,i,null,r,n)):(W(t),hl(t,o))):o?o===e.memoizedState?(W(t),t.flags&=-16777217):(pl(t),W(t),hl(t,o)):(e=e.memoizedProps,e!==r&&pl(t),W(t),ml(t,i,e,r,n)),null;case 27:if(Me(t),n=De.current,i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&pl(t);else{if(!r){if(t.stateNode===null)throw Error(a(166));return W(t),t.subtreeFlags&=-33554433,null}e=Te.current,pa(t)?da(t,e):(e=hm(i,r,n),t.stateNode=e,pl(t))}return W(t),t.subtreeFlags&=-33554433,null;case 5:if(Me(t),i=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&pl(t);else{if(!r){if(t.stateNode===null)throw Error(a(166));return W(t),t.subtreeFlags&=-33554433,null}if(o=Te.current,pa(t))da(t,o);else{var s=lp(De.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,i);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,i);break;default:switch(i){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,i);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,i);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(i,{is:r.is}):s.createElement(i)}}o[Dt]=t,o[Ot]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(np(o,i,r),i){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&pl(t)}}return W(t),t.subtreeFlags&=-33554433,ml(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&pl(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(a(166));if(e=De.current,pa(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,i=aa,i!==null)switch(i.tag){case 27:case 5:r=i.memoizedProps}e[Dt]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||ep(e.nodeValue,n)),e||ua(t,!0)}else e=lp(e).createTextNode(r),e[Dt]=t,t.stateNode=e}return W(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=pa(t),n!==null){if(e===null){if(!r)throw Error(a(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(a(557));e[Dt]=t}else ma(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;W(t),e=!1}else n=ha(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(Io(t),t):(Io(t),null);if(t.flags&128)throw Error(a(558))}return W(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(i=pa(t),r!==null&&r.dehydrated!==null){if(e===null){if(!i)throw Error(a(318));if(i=t.memoizedState,i=i===null?null:i.dehydrated,!i)throw Error(a(317));i[Dt]=t}else ma(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;W(t),i=!1}else i=ha(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=i),i=!0;if(!i)return t.flags&256?(Io(t),t):(Io(t),null)}return Io(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,i=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(i=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==i&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),gl(t,t.updateQueue),W(t),null);case 4:return Ae(),e===null&&Wf(t.stateNode.containerInfo),t.flags|=67108864,W(t),null;case 10:return ba(t.type),W(t),null;case 19:if(Ro(t),r=t.memoizedState,r===null)return W(t),null;if(i=!!(t.flags&128),o=r.rendering,o===null){if(i)_l(r,!1);else{if(ad!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=zo(e),o!==null){for(t.flags|=128,_l(r,!1),e=o.updateQueue,t.updateQueue=e,gl(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)Ri(n,e),n=n.sibling;return Lo(t,V.current&1|2),L&&F(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&Ge()>gd&&(t.flags|=128,i=!0,_l(r,!1),t.lanes=4194304)}}else{if(!i){if(e=zo(o),e!==null){if(t.flags|=128,i=!0,e=e.updateQueue,t.updateQueue=e,gl(t,e),_l(r,!0),r.tail===null&&r.tailMode!==`collapsed`&&r.tailMode!==`visible`&&!o.alternate&&!L)return W(t),null}else 2*Ge()-r.renderingStartTime>gd&&n!==536870912&&(t.flags|=128,i=!0,_l(r,!1),t.lanes=4194304)}r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}if(r.tail!==null){e=r.tail;a:{for(n=e;n!==null;){if(n.alternate!==null){n=!1;break a}n=n.sibling}n=!0}return r.rendering=e,r.tail=e.sibling,r.renderingStartTime=Ge(),e.sibling=null,o=V.current,o=i?o&1|2:o&1,r.tailMode===`visible`||r.tailMode===`collapsed`||!n||L?Lo(t,o):(n=o,j(jo,t),j(V,n),B===null&&(B=t)),L&&F(t,r.treeForkCount),e}return W(t),null;case 22:case 23:return Io(t),Ao(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(W(t),t.subtreeFlags&6&&(t.flags|=8192)):W(t),n=t.updateQueue,n!==null&&gl(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&we(Ga),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),ba(z),W(t),null;case 25:return null;case 30:return t.flags|=33554432,W(t),null}throw Error(a(156,t.tag))}function yl(e,t){switch(ra(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return ba(z),Ae(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Me(t),null;case 31:if(t.memoizedState!==null){if(Io(t),t.alternate===null)throw Error(a(340));ma()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Io(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(a(340));ma()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Ro(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Ae(),null;case 10:return ba(t.type),null;case 22:case 23:return Io(t),Ao(),e!==null&&we(Ga),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return ba(z),null;case 25:return null;default:return null}}function bl(e,t){switch(ra(t),t.tag){case 3:ba(z),Ae();break;case 26:case 27:case 5:Me(t);break;case 4:Ae();break;case 31:t.memoizedState!==null&&Io(t);break;case 13:Io(t);break;case 19:Ro(t);break;case 10:ba(t.type);break;case 22:case 23:Io(t),Ao(),e!==null&&we(Ga);break;case 24:ba(z)}}function xl(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){Z(t,t.return,e)}}function Sl(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){Z(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){Z(t,t.return,e)}}function Cl(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{To(t,n)}catch(t){Z(e,e.return,t)}}}function wl(e,t,n){n.props=Sc(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Z(e,t,n)}}function Tl(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:var i=e.stateNode,a=bi(e.memoizedProps,i);(i.ref===null||i.ref.name!==a)&&(i.ref=Pp(a)),r=i.ref;break;case 7:if(e.stateNode===null){var o=new Fp(e);p(e.child,!1,Qp,o,void 0,void 0),e.stateNode=o}r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Z(e,t,n)}}function El(e,t){var n=e.ref,r=e.refCleanup;if(n!==null){if(typeof r==`function`)try{r()}catch(n){Z(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Z(e,t,n)}else n.current=null}}function Dl(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var n=0;n<t.length;n++)em(e.stateNode,t[n])}function Ol(e){for(var t=e.return;t!==null&&(jl(t)&&em(e.stateNode,t.stateNode),!Al(t));)t=t.return}function kl(e){for(var t=e.return;t!==null&&(jl(t)&&tm(e.stateNode,t.stateNode),!Al(t));)t=t.return}function Al(e){return e.tag===5||e.tag===3||e.tag===27}function jl(e){return e&&e.tag===7&&e.stateNode!==null}function Ml(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Z(e,e.return,t)}}function Nl(e,t,n){try{var r=e.stateNode;ip(r,e.type,n,t),r[Ot]=t}catch(t){Z(e,e.return,t)}}function Pl(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Sp(e.type)||e.tag===4}function Fl(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Pl(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Sp(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Il(e,t,n,r){var i=e.tag;if(i===5||i===6)i=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(i,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(i),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=Cn)),Dl(e,r),M=!0;else if(i!==4&&(i===27&&(Dl(e,r),r=null,Sp(e.type)&&(n=e.stateNode,t=null)),e=e.child,e!==null))for(Il(e,t,n,r),e=e.sibling;e!==null;)Il(e,t,n,r),e=e.sibling}function Ll(e,t,n,r){var i=e.tag;if(i===5||i===6)i=e.stateNode,t?n.insertBefore(i,t):n.appendChild(i),Dl(e,r),M=!0;else if(i!==4&&(i===27&&(Dl(e,r),r=null,Sp(e.type)&&(n=e.stateNode)),e=e.child,e!==null))for(Ll(e,t,n,r),e=e.sibling;e!==null;)Ll(e,t,n,r),e=e.sibling}function Rl(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);np(t,r,n),t[Dt]=e,t[Ot]=n}catch(t){Z(e,e.return,t)}}var zl=!1,Bl=null;function Vl(e){(e.tag===30||e.subtreeFlags&33554432)&&(zl=!0)}var Hl=null;function Ul(){var e=Hl;return Hl=null,e}var Wl=0;function Gl(e,t,n,r,i){return Wl=0,Kl(e.child,t,n,r,i)}function Kl(e,t,n,r,i){for(var a=!1;e!==null;){if(e.tag===5){var o=e.stateNode;if(r!==null){var s=Op(o);r.push(s),s.view&&(a=!0)}else a||Op(o).view&&(a=!0);zl=!0,Tp(o,Wl===0?t:t+`_`+Wl,n),Wl++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&i||Kl(e.child,t,n,r,i)&&(a=!0));e=e.sibling}return a}function ql(e,t){for(;e!==null;)e.tag===5?Ep(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||ql(e.child,t)),e=e.sibling}function Jl(e){if(e.subtreeFlags&18874368)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Jl(e),e.tag===30&&e.flags&18874368&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name===`auto`)throw Error(a(544));var n=t.name;t=Si(t.default,t.share),t!==`none`&&(Gl(e,n,t,null,!1)||ql(e.child,!1))}e=e.sibling}}function Yl(e,t){if(e.tag===30){var n=e.stateNode,r=e.memoizedProps,i=bi(r,n),a=Si(r.default,n.paired?r.share:r.enter);a===`none`?Jl(e):Gl(e,i,a,null,!1)?(Jl(e),n.paired||t||Nd(e,r.onEnter)):ql(e.child,!1)}else if(e.subtreeFlags&33554432)for(e=e.child;e!==null;)Yl(e,t),e=e.sibling;else Jl(e)}function Xl(e){if(Bl!==null&&Bl.size!==0){var t=Bl;if(e.subtreeFlags&18874368)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&e.flags&18874368){var n=e.memoizedProps,r=n.name;if(r!=null&&r!==`auto`){var i=t.get(r);if(i!==void 0){var a=Si(n.default,n.share);if(a!==`none`&&(Gl(e,r,a,null,!1)?(a=e.stateNode,i.paired=a,a.paired=i,Nd(e,n.onShare)):ql(e.child,!1)),t.delete(r),t.size===0)break}}}Xl(e)}e=e.sibling}}}function Zl(e){if(e.tag===30){var t=e.memoizedProps,n=bi(t,e.stateNode),r=Bl===null?void 0:Bl.get(n),i=Si(t.default,r===void 0?t.exit:t.share);i!==`none`&&(Gl(e,n,i,null,!1)?r===void 0?Nd(e,t.onExit):(i=e.stateNode,r.paired=i,i.paired=r,Bl.delete(n),Nd(e,t.onShare)):ql(e.child,!1)),Bl!==null&&Xl(e)}else if(e.subtreeFlags&33554432)for(e=e.child;e!==null;)Zl(e),e=e.sibling;else Bl!==null&&Xl(e)}function Ql(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,n=bi(t,e.stateNode);t=Si(t.default,t.update),e.flags&=-5,t!==`none`&&Gl(e,n,t,e.memoizedState=[],!1)}else e.subtreeFlags&33554432&&Ql(e);e=e.sibling}}function $l(e){if(e.subtreeFlags&18874368)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&e.flags&18874368){var t=e.stateNode;t.paired!==null&&(t.paired=null,ql(e.child,!1))}$l(e)}e=e.sibling}}function eu(e){if(e.tag===30)e.stateNode.paired=null,ql(e.child,!1),$l(e);else if(e.subtreeFlags&33554432)for(e=e.child;e!==null;)eu(e),e=e.sibling;else $l(e)}function tu(e){for(e=e.child;e!==null;)e.tag===30?ql(e.child,!1):e.subtreeFlags&33554432&&tu(e),e=e.sibling}function nu(e,t,n,r,i,a,o){for(var s=!1;t!==null;){if(t.tag===5){var c=t.stateNode;if(a!==null&&Wl<a.length){var l=a[Wl],u=Op(c);(l.view||u.view)&&(s=!0);var d;if(d=!(e.flags&4)){if(u.clip)d=!0;else{d=l.rect;var f=u.rect;d=d.y!==f.y||d.x!==f.x||d.height!==f.height||d.width!==f.width}}d&&(e.flags|=4),u.abs?u=!l.abs:(l=l.rect,u=u.rect,u=l.height!==u.height||l.width!==u.width),u&&(e.flags|=32)}else e.flags|=32;e.flags&4&&Tp(c,Wl===0?n:n+`_`+Wl,i),s&&e.flags&4||(Hl===null&&(Hl=[]),Hl.push(c,Wl===0?r:r+`_`+Wl,t.memoizedProps)),Wl++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&o?e.flags|=t.flags&32:nu(e,t.child,n,r,i,a,o)&&(s=!0));t=t.sibling}return s}function ru(e,t){for(e=e.child;e!==null;){if(e.tag===30){var n=e.memoizedProps,r=e.stateNode,i=bi(n,r),a=Si(n.default,n.update);if(t){r=r.clones;var o=r===null?null:r.map(kp)}else o=e.memoizedState,e.memoizedState=null;r=e;var s=e.child;Wl=0,i=nu(r,s,i,i,a,o,!1),e.flags&4&&i&&(t||Nd(e,n.onUpdate))}else e.subtreeFlags&33554432&&ru(e,t);e=e.sibling}}var iu=!1,G=!1,au=!1,ou=!1,su=typeof WeakSet==`function`?WeakSet:Set,cu=null,lu=!1,uu=!1,du=!1,fu=!1;function pu(e,t,n){if(e=e.containerInfo,sp=gh,e=Xr(e),Zr(e)){if(`selectionStart`in e)var r={start:e.selectionStart,end:e.selectionEnd};else a:{r=(r=e.ownerDocument)&&r.defaultView||window;var i=r.getSelection&&r.getSelection();if(i&&i.rangeCount!==0){r=i.anchorNode;var a=i.anchorOffset,o=i.focusNode;i=i.focusOffset;try{r.nodeType,o.nodeType}catch{r=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==r||a!==0&&f.nodeType!==3||(c=s+a),f!==o||i!==0&&f.nodeType!==3||(l=s+i),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===r&&++u===a&&(c=s),p===o&&++d===i&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}r=c===-1||l===-1?null:{start:c,end:l}}else r=null}r||={start:0,end:0}}else r=null;for(cp={focusedElem:e,selectionRange:r},gh=!1,n=(n&335544064)===n,cu=t,t=n?9270:1024;cu!==null;){if(e=cu,n&&(r=e.deletions,r!==null))for(a=0;a<r.length;a++)n&&Zl(r[a]);if(e.alternate===null&&e.flags&2)n&&Vl(e),mu(n);else{if(e.tag===22){if(r=e.alternate,e.memoizedState!==null){r!==null&&r.memoizedState===null&&n&&Zl(r),mu(n);continue}if(r!==null&&r.memoizedState!==null){n&&Vl(e),mu(n);continue}}r=e.child,(e.subtreeFlags&t)!==0&&r!==null?(r.return=e,cu=r):(n&&Ql(e),mu(n))}}Bl=null}function mu(e){for(;cu!==null;){var t=cu,n=e,r=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if(i&1024&&r!==null){n=void 0,i=r.memoizedProps,r=r.memoizedState;var o=t.stateNode;try{var s=Sc(t.type,i);n=o.getSnapshotBeforeUpdate(s,r),o.__reactInternalSnapshotBeforeUpdate=n}catch(e){Z(t,t.return,e)}}break;case 3:if(i&1024){if(r=t.stateNode.containerInfo,n=r.nodeType,n===9)nm(r);else if(n===1)switch(r.nodeName){case`HEAD`:case`HTML`:case`BODY`:nm(r);break;default:r.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:n&&r!==null&&(n=bi(r.memoizedProps,r.stateNode),i=t.memoizedProps,i=Si(i.default,i.update),i!==`none`&&Gl(r,n,i,r.memoizedState=[],!0));break;default:if(i&1024)throw Error(a(163))}if(r=t.sibling,r!==null){r.return=t.return,cu=r;break}cu=t.return}}function hu(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:Fu(e,n),r&4&&xl(5,n);break;case 1:if(Fu(e,n),r&4){if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Z(n,n.return,e)}else{var i=Sc(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Z(n,n.return,e)}}}r&64&&Cl(n),r&512&&Tl(n,n.return);break;case 3:if(Fu(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{To(e,t)}catch(e){Z(n,n.return,e)}}break;case 27:t===null&&r&4&&Rl(n);case 26:case 5:Fu(e,n),t===null&&r&4&&Ml(n),r&512&&Tl(n,n.return);break;case 12:Fu(e,n);break;case 31:Fu(e,n),r&4&&wu(e,n);break;case 13:Fu(e,n),r&4&&Tu(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=_f.bind(null,n),cm(e,n))));break;case 22:if(r=n.memoizedState!==null||iu,!r){var a=t!==null&&t.memoizedState!==null||G;t=iu,i=G,iu=r,(G=a)&&!i?(r=2,n.subtreeFlags&8772&&(r|=1),Lu(e,n,r)):Fu(e,n),iu=t,G=i}break;case 30:Fu(e,n),r&512&&Tl(n,n.return);break;case 7:r&512&&Tl(n,n.return);default:Fu(e,n)}}function gu(e,t){for(e=e.child;e!==null;)_u(e,t),e=e.sibling}function _u(e,t){switch(e.tag){case 5:case 26:try{var n=e.stateNode;if(t){var r=n.style;typeof r.setProperty==`function`?r.setProperty(`display`,`none`,`important`):r.display=`none`}else{var i=e.stateNode,a=e.memoizedProps.style,o=a!=null&&a.hasOwnProperty(`display`)?a.display:null;i.style.display=o==null||typeof o==`boolean`?``:(``+o).trim()}}catch(t){Z(e,e.return,t)}vu(e,t);break;case 6:try{e.stateNode.nodeValue=t?``:e.memoizedProps,M=!0}catch(t){Z(e,e.return,t)}break;case 18:try{var s=e.stateNode;t?wp(s,!0):wp(e.stateNode,!1)}catch(t){Z(e,e.return,t)}break;case 22:case 23:e.memoizedState===null&&gu(e,t);break;default:gu(e,t)}}function vu(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){a:{var n=e,r=t;switch(n.tag){case 4:_u(n,r);break a;case 22:n.memoizedState===null&&vu(n,r);break a;default:vu(n,r)}}e=e.sibling}}function yu(e){var t=e.alternate;t!==null&&(e.alternate=null,yu(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&It(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var bu=null,xu=!1;function Su(e,t,n){for(n=n.child;n!==null;)Cu(e,t,n),n=n.sibling}function Cu(e,t,n){if(tt&&typeof tt.onCommitFiberUnmount==`function`)try{tt.onCommitFiberUnmount(et,n)}catch{}switch(n.tag){case 26:G||El(n,t),Su(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&!G&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:G||El(n,t),kl(n);var r=bu,i=xu;Sp(n.type)&&(bu=n.stateNode,xu=!1),Su(e,t,n),gm(n.stateNode,n.type,n.memoizedProps),bu=r,xu=i;break;case 5:G||El(n,t),kl(n);case 6:if(n.tag===6&&kl(n),r=bu,i=xu,bu=null,Su(e,t,n),bu=r,xu=i,bu!==null){if(xu)try{(bu.nodeType===9?bu.body:bu.nodeName===`HTML`?bu.ownerDocument.body:bu).removeChild(n.stateNode),M=!0}catch(e){Z(n,t,e)}else try{bu.removeChild(n.stateNode),M=!0}catch(e){Z(n,t,e)}}break;case 18:bu!==null&&(xu?(e=bu,Cp(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Hh(e)):Cp(bu,n.stateNode));break;case 4:r=bu,i=xu,bu=n.stateNode.containerInfo,xu=!0,Su(e,t,n),bu=r,xu=i;break;case 0:case 11:case 14:case 15:Sl(2,n,t),G||Sl(4,n,t),Su(e,t,n);break;case 1:G||(El(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&wl(n,t,r)),Su(e,t,n);break;case 21:Su(e,t,n);break;case 22:G=(r=G)||n.memoizedState!==null,Su(e,t,n),G=r;break;case 30:El(n,t),Su(e,t,n);break;case 7:G||El(n,t),Su(e,t,n);break;default:Su(e,t,n)}}function wu(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Hh(e)}catch(e){Z(t,t.return,e)}}}function Tu(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Hh(e)}catch(e){Z(t,t.return,e)}}function Eu(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new su),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new su),t;default:throw Error(a(435,e.tag))}}function Du(e,t){var n=Eu(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=vf.bind(null,e,t);t.then(r,r)}})}function Ou(e,t,n){var r=t.deletions;if(r!==null)for(var i=0;i<r.length;i++){var o=r[i],s=e,c=t,l=c;a:for(;l!==null;){switch(l.tag){case 27:if(Sp(l.type)){bu=l.stateNode,xu=!1;break a}break;case 5:bu=l.stateNode,xu=!1;break a;case 3:case 4:bu=l.stateNode.containerInfo,xu=!0;break a}l=l.return}if(bu===null)throw Error(a(160));Cu(s,c,o),bu=null,xu=!1,s=o.alternate,s!==null&&(s.return=null),o.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Au(t,e,n),t=t.sibling}var ku=null;function Au(e,t,n){var r=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(i&4&&(r=e.updateQueue,r=r===null?null:r.events,r!==null))for(var o=0;o<r.length;o++){var s=r[o];s.ref.impl=s.nextImpl}Ou(t,e,n),ju(e),i&4&&(Sl(3,e,e.return),xl(3,e),Sl(5,e,e.return));break;case 1:Ou(t,e,n),ju(e),i&512&&(G||r===null||El(r,r.return)),i&64&&iu&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?t:n.concat(t))));break;case 26:if(o=ku,Ou(t,e,n),ju(e),i&512&&(G||r===null||El(r,r.return)),i&4){if(i=r===null?null:r.memoizedState,n=e.memoizedState,r===null){if(n===null){if(e.stateNode===null){if(iu)e.stateNode=fp(e.type,e.memoizedProps,t.containerInfo,e);else{a:{t=e.type,n=e.memoizedProps,i=o.ownerDocument||o;b:switch(t){case`title`:r=i.getElementsByTagName(`title`)[0],(!r||r[Pt]||r[Dt]||r.namespaceURI===`http://www.w3.org/2000/svg`||r.hasAttribute(`itemprop`))&&(r=i.createElement(t),i.head.insertBefore(r,i.querySelector(`head > title`))),np(r,t,n),r[Dt]=e,Vt(r),t=r;break a;case`link`:if(o=Gm(`link`,`href`,i).get(t+(n.href||``))){for(s=0;s<o.length;s++)if(r=o[s],r.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&r.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&r.getAttribute(`title`)===(n.title==null?null:n.title)&&r.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){o.splice(s,1);break b}}r=i.createElement(t),np(r,t,n),i.head.appendChild(r);break;case`meta`:if(o=Gm(`meta`,`content`,i).get(t+(n.content||``))){for(s=0;s<o.length;s++)if(r=o[s],r.getAttribute(`content`)===(n.content==null?null:``+n.content)&&r.getAttribute(`name`)===(n.name==null?null:n.name)&&r.getAttribute(`property`)===(n.property==null?null:n.property)&&r.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&r.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){o.splice(s,1);break b}}r=i.createElement(t),np(r,t,n),i.head.appendChild(r);break;default:throw Error(a(468,t))}r[Dt]=e,Vt(r),t=r}e.stateNode=t}}else iu||Km(o,e.type,e.stateNode)}else e.stateNode=Bm(o,n,e.memoizedProps)}else i===n?n===null&&e.stateNode!==null&&Nl(e,e.memoizedProps,r.memoizedProps):(i===null?(t=r.stateNode,t===null||G||t.parentNode.removeChild(t)):i.count--,n===null?iu||Km(o,e.type,e.stateNode):Bm(o,n,e.memoizedProps))}break;case 27:Ou(t,e,n),ju(e),i&512&&(G||r===null||El(r,r.return)),r!==null&&i&4&&Nl(e,e.memoizedProps,r.memoizedProps);break;case 5:if(o=au,au=!1,Ou(t,e,n),au=o,ju(e),i&512&&(G||r===null||El(r,r.return)),e.flags&32){t=e.stateNode;try{hn(t,``),M=!0}catch(t){Z(e,e.return,t)}}i&4&&e.stateNode!=null&&(t=e.memoizedProps,Nl(e,t,r===null?t:r.memoizedProps)),i&1024&&(ou=!0);break;case 6:if(Ou(t,e,n),ju(e),i&4){if(e.stateNode===null)throw Error(a(162));t=e.memoizedProps,n=e.stateNode;try{n.nodeValue=t,M=!0}catch(t){Z(e,e.return,t)}}break;case 3:if(M=!1,Wm=null,o=ku,ku=bm(t.containerInfo),Ou(t,e,n),ku=o,ju(e),i&4&&r!==null&&r.memoizedState.isDehydrated)try{Hh(t.containerInfo)}catch(t){Z(e,e.return,t)}ou&&(ou=!1,Mu(e)),M=!1;break;case 4:i=au,au=iu,r=Zt(),o=ku,ku=bm(e.stateNode.containerInfo),Ou(t,e,n),ju(e),ku=o,M&&uu&&(du=!0),M=r,au=i;break;case 12:Ou(t,e,n),ju(e);break;case 31:Ou(t,e,n),ju(e),i&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Du(e,t)));break;case 13:Ou(t,e,n),ju(e),e.child.flags&8192&&e.memoizedState!==null!=(r!==null&&r.memoizedState!==null)&&(md=Ge()),i&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Du(e,t)));break;case 22:o=e.memoizedState!==null,s=r!==null&&r.memoizedState!==null;var c=iu,l=G,u=au;iu=c||o,au=u||o,G=l||s,Ou(t,e,n),G=l,au=u,iu=c,ju(e),i&8192&&(t=e.stateNode,t._visibility=o?t._visibility&-2:t._visibility|1,!o||r===null||s||iu||G||(t=s||G,n=iu,r=G,iu=o||iu,G=t,Iu(e,2),iu=n,G=r),!o&&au||gu(e,o)),i&4&&(t=e.updateQueue,t!==null&&(n=t.retryQueue,n!==null&&(t.retryQueue=null,Du(e,n))));break;case 19:Ou(t,e,n),ju(e),i&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Du(e,t)));break;case 30:i&512&&(G||r===null||El(r,r.return)),i=Zt(),o=uu,s=(n&335544064)===n,c=e.memoizedProps,uu=s&&Si(c.default,c.update)!==`none`,Ou(t,e,n),ju(e),s&&r!==null&&M&&(e.flags|=4),uu=o,M=i;break;case 21:break;case 7:i&512&&(G||r===null||El(r,r.return)),r&&r.stateNode!==null&&(r.stateNode._fragmentFiber=e);default:Ou(t,e,n),ju(e)}}function ju(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Pl(r)){n=r;break}r=r.return}r=null;for(var i=e.return;i!==null;){if(jl(i)){var o=i.stateNode;r===null?r=[o]:r.push(o)}if(Al(i))break;i=i.return}var s=r;if(n==null)throw Error(a(160));switch(n.tag){case 27:var c=n.stateNode;Ll(e,Fl(e),c,s);break;case 5:var l=n.stateNode;n.flags&32&&(hn(l,``),n.flags&=-33),Ll(e,Fl(e),l,s);break;case 3:case 4:var u=n.stateNode.containerInfo;Il(e,Fl(e),u,s);break;default:throw Error(a(161))}}catch(t){Z(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Mu(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Mu(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,gh=!0,t.reset(),gh=!1),e=e.sibling}}function Nu(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)Pu(t,e),t=t.sibling;else ru(t,!1)}function Pu(e,t){var n=e.alternate;if(n===null)Yl(e,!1);else switch(e.tag){case 3:if(fu=lu=!1,Ul(),Nu(t,e),!lu&&!du){if(e=Hl,e!==null)for(var r=0;r<e.length;r+=3){n=e[r];var i=e[r+1];Ep(n,e[r+2]),n=n.ownerDocument.documentElement,n!==null&&n.animate({opacity:[0,0],pointerEvents:[`none`,`none`]},{duration:0,fill:`forwards`,pseudoElement:`::view-transition-group(`+i+`)`})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===``&&(e.style.viewTransitionName=`none`,e.animate({opacity:[0,0],pointerEvents:[`none`,`none`]},{duration:0,fill:`forwards`,pseudoElement:`::view-transition-group(root)`}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:`forwards`,pseudoElement:`::view-transition`})),fu=!0}Hl=null;break;case 5:Nu(t,e);break;case 4:r=lu,lu=!1,Nu(t,e),lu&&(du=!0),lu=r;break;case 22:e.memoizedState===null&&(n.memoizedState===null?Nu(t,e):Yl(e,!1));break;case 30:r=lu,i=Ul(),lu=!1,Nu(t,e),lu&&(e.flags|=4);var a=e.memoizedProps,o=e.stateNode;t=bi(a,o),o=bi(n.memoizedProps,o);var s=Si(a.default,a.update);s===`none`?t=!1:(a=n.memoizedState,n.memoizedState=null,n=e.child,Wl=0,t=nu(e,n,t,o,s,a,!0),Wl!==(a===null?0:a.length)&&(e.flags|=32)),e.flags&4&&t?(Nd(e,e.memoizedProps.onUpdate),Hl=i):i!==null&&(i.push.apply(i,Hl),Hl=i),lu=e.flags&32?!0:r;break;default:Nu(t,e)}}function Fu(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)hu(e,t.alternate,t),t=t.sibling}function Iu(e,t){for(e=e.child;e!==null;){var n=e,r=t;switch(n.tag){case 0:case 11:case 14:case 15:Sl(4,n,n.return),Iu(n,r);break;case 1:El(n,n.return);var i=n.stateNode;typeof i.componentWillUnmount==`function`&&wl(n,n.return,i),Iu(n,r);break;case 27:r&2&&gm(n.stateNode,n.type,n.memoizedProps);case 5:El(n,n.return),n.tag!==5&&n.tag!==27||kl(n),Iu(n,r);break;case 6:kl(n);break;case 26:El(n,n.return),i=n.stateNode,n.memoizedState!==null||i===null||G||i.parentNode.removeChild(i),Iu(n,r);break;case 22:n.memoizedState===null&&Iu(n,r);break;case 30:El(n,n.return),Iu(n,r);break;case 7:El(n,n.return);default:Iu(n,r)}e=e.sibling}}function Lu(e,t,n){for(n=t.subtreeFlags&8772?n:n&-2,t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags,s=!!(n&1);switch(a.tag){case 0:case 11:case 15:Lu(i,a,n),xl(4,a);break;case 1:if(Lu(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){Z(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var c=r.stateNode;try{var l=i.shared.hiddenCallbacks;if(l!==null)for(i.shared.hiddenCallbacks=null,i=0;i<l.length;i++)wo(l[i],c)}catch(e){Z(r,r.return,e)}}s&&o&64&&Cl(a),Tl(a,a.return);break;case 27:n&2&&Rl(a);case 5:a.tag!==5&&a.tag!==27||Ol(a),Lu(i,a,n),s&&r===null&&o&4&&Ml(a),Tl(a,a.return);break;case 6:Ol(a);break;case 26:c=a.stateNode,a.memoizedState!==null||c===null||iu||Km(bm(c.ownerDocument),a.type,c),Lu(i,a,n),s&&r===null&&o&4&&Ml(a),Tl(a,a.return);break;case 12:Lu(i,a,n);break;case 31:Lu(i,a,n),s&&o&4&&wu(i,a);break;case 13:Lu(i,a,n),s&&o&4&&Tu(i,a);break;case 22:a.memoizedState===null&&Lu(i,a,n),Tl(a,a.return);break;case 30:Lu(i,a,n),Tl(a,a.return);break;case 7:Tl(a,a.return);default:Lu(i,a,n)}t=t.sibling}}function Ru(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&Na(n))}function zu(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Na(e))}function Bu(e,t,n,r){var i=(n&335544064)===n;if(t.subtreeFlags&(i?10262:10256))for(t=t.child;t!==null;)Vu(e,t,n,r),t=t.sibling;else i&&tu(t)}function Vu(e,t,n,r){var i=(n&335544064)===n;i&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&eu(t);var a=t.flags;switch(t.tag){case 0:case 11:case 15:Bu(e,t,n,r),a&2048&&xl(9,t);break;case 1:Bu(e,t,n,r);break;case 3:Bu(e,t,n,r),i&&fu&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,e.style.viewTransitionName===`root`&&(e.style.viewTransitionName=``),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===`none`&&(e.style.viewTransitionName=``)),a&2048&&(a=null,t.alternate!==null&&(a=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==a&&(t.refCount++,a!=null&&Na(a)));break;case 12:if(a&2048){Bu(e,t,n,r),a=t.stateNode;try{var o=t.memoizedProps,s=o.id,c=o.onPostCommit;typeof c==`function`&&c(s,t.alternate===null?`mount`:`update`,a.passiveEffectDuration,-0)}catch(e){Z(t,t.return,e)}}else Bu(e,t,n,r);break;case 31:Bu(e,t,n,r);break;case 13:Bu(e,t,n,r);break;case 23:break;case 22:o=t.stateNode,s=t.alternate,t.memoizedState===null?(i&&s!==null&&s.memoizedState!==null&&eu(t),o._visibility&2?Bu(e,t,n,r):(o._visibility|=2,Hu(e,t,n,r,!!(t.subtreeFlags&10256)||!1))):(i&&s!==null&&s.memoizedState===null&&eu(s),o._visibility&2?Bu(e,t,n,r):Uu(e,t)),a&2048&&Ru(s,t);break;case 24:Bu(e,t,n,r),a&2048&&zu(t.alternate,t);break;case 30:i&&(a=t.alternate,a!==null&&(ql(a.child,!0),ql(t.child,!0))),Bu(e,t,n,r);break;default:Bu(e,t,n,r)}}function Hu(e,t,n,r,i){for(i&&=!!(t.subtreeFlags&10256)||!1,t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:Hu(a,o,s,c,i),xl(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,Hu(a,o,s,c,i)):u._visibility&2?Hu(a,o,s,c,i):Uu(a,o),i&&l&2048&&Ru(o.alternate,o);break;case 24:Hu(a,o,s,c,i),i&&l&2048&&zu(o.alternate,o);break;default:Hu(a,o,s,c,i)}t=t.sibling}}function Uu(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:Uu(n,r),i&2048&&Ru(r.alternate,r);break;case 24:Uu(n,r),i&2048&&zu(r.alternate,r);break;default:Uu(n,r)}t=t.sibling}}var Wu=8192;function Gu(e,t,n){if(e.subtreeFlags&Wu)for(e=e.child;e!==null;)Ku(e,t,n),e=e.sibling}function Ku(e,t,n){switch(e.tag){case 26:Gu(e,t,n),e.flags&Wu&&(e.memoizedState===null?(e=e.stateNode,(t&335544128)===t&&Zm(n,e)):Qm(n,ku,e.memoizedState,e.memoizedProps));break;case 5:Gu(e,t,n),e.flags&Wu&&(e=e.stateNode,(t&335544128)===t&&Zm(n,e));break;case 3:case 4:var r=ku;ku=bm(e.stateNode.containerInfo),Gu(e,t,n),ku=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=Wu,Wu=16777216,Gu(e,t,n),Wu=r):Gu(e,t,n));break;case 30:if((e.flags&Wu)!==0&&(r=e.memoizedProps.name,r!=null&&r!==`auto`)){var i=e.stateNode;i.paired=null,Bl===null&&(Bl=new Map),Bl.set(r,i)}Gu(e,t,n);break;default:Gu(e,t,n)}}function qu(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Ju(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];cu=r,Zu(r,e)}qu(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Yu(e),e=e.sibling}function Yu(e){switch(e.tag){case 0:case 11:case 15:Ju(e),e.flags&2048&&Sl(9,e,e.return);break;case 3:Ju(e);break;case 12:Ju(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Xu(e)):Ju(e);break;default:Ju(e)}}function Xu(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];cu=r,Zu(r,e)}qu(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Sl(8,t,t.return),Xu(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Xu(t));break;default:Xu(t)}e=e.sibling}}function Zu(e,t){for(;cu!==null;){var n=cu;switch(n.tag){case 0:case 11:case 15:Sl(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:Na(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,cu=r;else a:for(n=e;cu!==null;){r=cu;var i=r.sibling,a=r.return;if(yu(r),r===n){cu=null;break a}if(i!==null){i.return=a,cu=i;break a}cu=a}}}var Qu={getCacheForType:function(e){var t=Ea(z),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return Ea(z).controller.signal}},$u=typeof WeakMap==`function`?WeakMap:Map,K=0,q=null,J=null,Y=0,X=0,ed=null,td=!1,nd=!1,rd=!1,id=0,ad=0,od=0,sd=0,cd=0,ld=0,ud=0,dd=null,fd=null,pd=!1,md=0,hd=0,gd=1/0,_d=null,vd=null,yd=0,bd=null,xd=null,Sd=0,Cd=0,wd=null,Td=null,Ed=null,Dd=null,Od=null,kd=0,Ad=null;function jd(){return K&2&&Y!==0?Y&-Y:k.T===null?wt():Pf()}function Md(){if(ld===0){if(!(Y&536870912)||L){var e=ct;ct<<=1,!(ct&3932160)&&(ct=262144),ld=e}else ld=536870912}return e=jo.current,e!==null&&(e.flags|=32),ld}function Nd(e,t){if(t!=null){var n=e.stateNode,r=n.ref;r===null&&(r=n.ref=Pp(bi(e.memoizedProps,n))),Dd===null&&(Dd=[]),Dd.push(t.bind(null,r))}}function Pd(e,t,n){(e===q&&(X===2||X===9)||e.cancelPendingCommit!==null)&&(Vd(e,0),Rd(e,Y,ld,!1)),_t(e,n),(!(K&2)||e!==q)&&(e===q&&(!(K&2)&&(sd|=n),ad===4&&Rd(e,Y,ld,!1)),Ef(e))}function Fd(e,t,n){if(K&6)throw Error(a(327));var r=!n&&!(t&127)&&(t&e.expiredLanes)===0||ft(e,t),i=r?Yd(e,t):qd(e,t,!0),o=r;do{if(i===0){nd&&!r&&Rd(e,t,0,!1);break}if(n=e.current.alternate,o&&!Ld(n)){i=qd(e,t,!1),o=!1;continue}if(i===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var c=e;i=dd;var l=c.current.memoizedState.isDehydrated;if(l&&(Vd(c,s).flags|=256),s=qd(c,s,!1),s!==2&&s!==6){if(rd&&!l){c.errorRecoveryDisabledLanes|=o,sd|=o,i=4;break a}o=fd,fd=i,o!==null&&(fd===null?fd=o:fd.push.apply(fd,o))}i=s}if(o=!1,i!==2)continue}}if(i===1){Vd(e,0),Rd(e,t,0,!0);break}a:{switch(r=e,o=i,o){case 0:case 1:throw Error(a(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:Rd(r,t,ld,!td);break a;case 2:fd=null;break;case 3:case 5:break;default:throw Error(a(329))}if((t&62914560)===t&&(i=md+300-Ge(),10<i)){if(Rd(r,t,ld,!td),dt(r,0,!0)!==0)break a;Sd=t,r.timeoutHandle=gp(Id.bind(null,r,n,fd,_d,pd,t,ld,sd,ud,td,o,`Throttled`,-0,0),i);break a}Id(r,n,fd,_d,pd,t,ld,sd,ud,td,o,null,-0,0)}break}while(1);Ef(e)}function Id(e,t,n,r,i,a,o,s,c,l,u,d,f,p){e.timeoutHandle=-1;var m=t.subtreeFlags,h=(a&335544064)===a;if(d=null,(h||m&8192||(m&16785408)==16785408)&&(d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Cn},Bl=null,Ku(t,a,d),h&&(m=d,h=e.containerInfo,h=(h.nodeType===9?h:h.ownerDocument).__reactViewTransition,h!=null&&(m.count++,m.waitingForViewTransition=!0,m=nh.bind(m),h.finished.then(m,m))),m=(a&62914560)===a?md-Ge():(a&4194048)===a?hd-Ge():0,m=eh(d,m),m!==null)){Sd=a,e.cancelPendingCommit=m(nf.bind(null,e,t,a,n,r,i,o,s,c,l,u,d,null,f,p)),Rd(e,a,o,!l);return}nf(e,t,a,n,r,i,o,s,c,l,u,d)}function Ld(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!Wr(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Rd(e,t,n,r){t=pt(e,t),t&=~cd,t&=~sd,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-rt(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&yt(e,n,t)}function zd(){return K&6?!0:(Df(0,!1),!1)}function Bd(){if(J!==null){if(X===0)var e=J.return;else e=J,ya=va=null,rs(e),ao=null,oo=0,e=J;for(;e!==null;)bl(e.alternate,e),e=e.return;J=null}}function Vd(e,t){var n=e.timeoutHandle;return n!==-1&&(e.timeoutHandle=-1,_p(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),Sd=0,Bd(),q=e,J=n=Li(e.current,null),Y=t,X=0,ed=null,td=!1,nd=ft(e,t),rd=!1,ud=ld=cd=sd=od=ad=0,fd=dd=null,pd=!1,id=pt(e,t),Di(),n}function Hd(e,t){H=null,k.H=mc,t===Ya||t===Za?(t=ro(),X=3):t===Xa?(t=ro(),X=4):X=t===Mc?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,ed=t,J===null&&(ad=1,Ec(e,Gi(t,e.current)))}function Ud(){var e=jo.current;return e===null?!0:(Y&4194048)===Y?B===null:(Y&62914560)===Y||Y&536870912?e===B:!1}function Wd(){var e=k.H;return k.H=mc,e===null?mc:e}function Gd(){var e=k.A;return k.A=Qu,e}function Kd(){ad=4,td||(Y&4194048)!==Y&&jo.current!==null||(nd=!0),!(od&134217727)&&!(sd&134217727)||q===null||Rd(q,Y,ld,!1)}function qd(e,t,n){var r=K;K|=2;var i=Wd(),a=Gd();(q!==e||Y!==t)&&(_d=null,Vd(e,t)),t=!1;var o=ad;a:do try{if(X!==0&&J!==null){var s=J,c=ed;switch(X){case 8:Bd(),o=6;break a;case 3:case 2:case 9:case 6:jo.current===null&&(t=!0);var l=X;if(X=0,ed=null,$d(e,s,c,l),n&&nd){o=0;break a}break;default:l=X,X=0,ed=null,$d(e,s,c,l)}}Jd(),o=ad;break}catch(t){Hd(e,t)}while(1);return t&&e.shellSuspendCounter++,ya=va=null,K=r,k.H=i,k.A=a,J===null&&(q=null,Y=0,Di()),o}function Jd(){for(;J!==null;)Zd(J)}function Yd(e,t){var n=K;K|=2;var r=Wd(),i=Gd();q!==e||Y!==t?(_d=null,gd=Ge()+500,Vd(e,t)):nd=ft(e,t);a:do try{if(X!==0&&J!==null){t=J;var o=ed;b:switch(X){case 1:X=0,ed=null,$d(e,t,o,1);break;case 2:case 9:if($a(o)){X=0,ed=null,Qd(t);break}t=function(){X!==2&&X!==9||q!==e||(X=7),Ef(e)},o.then(t,t);break a;case 3:X=7;break a;case 4:X=5;break a;case 7:$a(o)?(X=0,ed=null,Qd(t)):(X=0,ed=null,$d(e,t,o,7));break;case 5:var s=null;switch(J.tag){case 26:s=J.memoizedState;case 5:case 27:var c=J;if(s?Ym(s):c.stateNode.complete){X=0,ed=null;var l=c.sibling;if(l!==null)J=l;else{var u=c.return;u===null?J=null:(J=u,ef(u))}break b}}X=0,ed=null,$d(e,t,o,5);break;case 6:X=0,ed=null,$d(e,t,o,6);break;case 8:Bd(),ad=6;break a;default:throw Error(a(462))}}Xd();break}catch(t){Hd(e,t)}while(1);return ya=va=null,k.H=r,k.A=i,K=n,J===null?(q=null,Y=0,Di(),ad):0}function Xd(){for(;J!==null&&!Ue();)Zd(J)}function Zd(e){var t=fl(e.alternate,e,id);e.memoizedProps=e.pendingProps,t===null?ef(e):J=t}function Qd(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=Kc(n,t,t.pendingProps,t.type,void 0,Y);break;case 11:t=Kc(n,t,t.pendingProps,t.type.render,t.ref,Y);break;case 5:rs(t);var r=t;r===aa&&(L?(fa(r),r.tag===5&&r.stateNode!=null&&(I=r.stateNode)):(fa(r),L=!0));default:bl(n,t),t=J=Ri(t,id),t=fl(n,t,id)}e.memoizedProps=e.pendingProps,t===null?ef(e):J=t}function $d(e,t,n,r){ya=va=null,rs(t),ao=null,oo=0;var i=t.return;try{if(jc(e,i,t,n,Y)){ad=1,Ec(e,Gi(n,e.current)),J=null;return}}catch(t){if(i!==null)throw J=i,t;ad=1,Ec(e,Gi(n,e.current)),J=null;return}t.flags&32768?(L||r===1?e=!0:nd||Y&536870912?e=!1:(td=e=!0,(r===2||r===9||r===3||r===6)&&(r=jo.current,r!==null&&r.tag===13&&(r.flags|=16384))),tf(t,e)):ef(t)}function ef(e){var t=e;do{if(t.flags&32768){tf(t,td);return}e=t.return;var n=vl(t.alternate,t,id);if(n!==null){J=n;return}if(t=t.sibling,t!==null){J=t;return}J=t=e}while(t!==null);ad===0&&(ad=5)}function tf(e,t){do{var n=yl(e.alternate,e);if(n!==null){n.flags&=32767,J=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){J=e;return}J=e=n}while(e!==null);ad=6,J=null}function nf(e,t,n,r,i,o,s,c,l,u,d,f){e.cancelPendingCommit=null;do df();while(yd!==0);if(K&6)throw Error(a(327));if(t!==null){if(t===e.current)throw Error(a(177));e===q&&(J=q=null,Y=0),xd=t,bd=e,Sd=n,wd=i,Td=r,rf(e,t,n,s,c,l,f)}}function rf(e,t,n,r,i,a,o){var s=t.lanes|t.childLanes;if(Cd=s,s|=Ei,vt(e,n,s,r,i,a),Dd=null,(n&335544064)===n?(Od=Ia(e),r=10262):(Od=null,r=10256),(t.subtreeFlags&r)!==0||(t.flags&r)!==0?(e.callbackNode=null,e.callbackPriority=0,yf(Ye,function(){return ff(),null})):(e.callbackNode=null,e.callbackPriority=0),zl=!1,r=!!(t.flags&13878),t.subtreeFlags&13878||r){r=k.T,k.T=null,i=A.p,A.p=2,a=K,K|=4;try{pu(e,t,n)}finally{K=a,A.p=i,k.T=r}}yd=1,zl?Ed=Mp(o,e.containerInfo,Od,sf,cf,of,lf,ff,af,null,null):(sf(),cf(),lf())}function af(e){if(yd!==0){var t=bd.onRecoverableError;t(e,{componentStack:null})}}function of(){yd===3&&(yd=0,Pu(xd,bd),yd=4)}function sf(){if(yd===1){yd=0;var e=bd,t=xd,n=Sd,r=!!(t.flags&13878);if(t.subtreeFlags&13878||r){r=k.T,k.T=null;var i=A.p;A.p=2;var a=K;K|=4;try{uu=du=!1,Au(t,e,n),n=cp;var o=Xr(e.containerInfo),s=n.focusedElem,c=n.selectionRange;if(o!==s&&s&&s.ownerDocument&&Yr(s.ownerDocument.documentElement,s)){if(c!==null&&Zr(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=Jr(s,h),v=Jr(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}gh=!!sp,cp=sp=null}finally{K=a,A.p=i,k.T=r}}e.current=t,yd=2}}function cf(){if(yd===2){yd=0;var e=bd,t=xd,n=!!(t.flags&8772);if(t.subtreeFlags&8772||n){n=k.T,k.T=null;var r=A.p;A.p=2;var i=K;K|=4;try{hu(e,t.alternate,t)}finally{K=i,A.p=r,k.T=n}}yd=3}}function lf(){if(yd===4||yd===3){yd=0;var e=Ed;Ed=null,We();var t=bd,n=xd,r=Sd,i=Td,a=(r&335544064)===r?10262:10256;if((n.subtreeFlags&a)!==0||(n.flags&a)!==0?yd=5:(yd=0,xd=bd=null,uf(t,t.pendingLanes)),a=t.pendingLanes,a===0&&(vd=null),Ct(r),n=n.stateNode,tt&&typeof tt.onCommitFiberRoot==`function`)try{tt.onCommitFiberRoot(et,n,void 0,(n.current.flags&128)==128)}catch{}if(i!==null){n=k.T,a=A.p,A.p=2,k.T=null;try{for(var o=t.onRecoverableError,s=0;s<i.length;s++){var c=i[s];o(c.value,{componentStack:c.stack})}}finally{k.T=n,A.p=a}}if(i=Dd,o=Od,Od=null,i!==null&&(Dd=null,o===null&&(o=[]),e!==null))for(c=0;c<i.length;c++)n=(0,i[c])(o),n!==void 0&&e.finished.finally(n);Sd&3&&df(),Ef(t),a=t.pendingLanes,r&261930&&a&42?t===Ad?kd++:(kd=0,Ad=t):(kd=0,Ad=null),Df(0,!1)}}function uf(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Na(t)))}function df(){return Ed!==null&&(Ed.skipTransition(),Ed=null),sf(),cf(),lf(),ff()}function ff(){if(yd!==5)return!1;var e=bd,t=Cd;Cd=0;var n=Ct(Sd),r=k.T,i=A.p;try{A.p=32>n?32:n,k.T=null,n=wd,wd=null;var o=bd,s=Sd;if(yd=0,xd=bd=null,Sd=0,K&6)throw Error(a(331));var c=K;if(K|=4,Yu(o.current),Vu(o,o.current,s,n),K=c,Df(0,!1),tt&&typeof tt.onPostCommitFiberRoot==`function`)try{tt.onPostCommitFiberRoot(et,o)}catch{}return!0}finally{A.p=i,k.T=r,uf(e,t)}}function pf(e,t,n){t=Gi(n,t),t=Oc(e.stateNode,t,2),e=vo(e,t,2),e!==null&&(_t(e,2),Ef(e))}function Z(e,t,n){if(e.tag===3)pf(e,e,n);else for(;t!==null;){if(t.tag===3){pf(t,e,n);break}if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(vd===null||!vd.has(r))){e=Gi(n,e),n=kc(2),r=vo(t,n,2),r!==null&&(Ac(n,r,t,e),_t(r,2),Ef(r));break}}t=t.return}}function mf(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new $u;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(rd=!0,i.add(n),e=hf.bind(null,e,t,n),t.then(e,e))}function hf(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,q===e&&(Y&n)===n&&(ad===4||ad===3&&(Y&62914560)===Y&&300>Ge()-md?K&2?cd|=n:Vd(e,0):cd|=n,ud===Y&&(ud=0)),Ef(e)}function gf(e,t){t===0&&(t=ht()),e=Ai(e,t),e!==null&&(_t(e,t),Ef(e))}function _f(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),gf(e,n)}function vf(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,i=e.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(a(314))}r!==null&&r.delete(t),gf(e,n)}function yf(e,t){return Ve(e,t)}var bf=null,xf=null,Sf=!1,Cf=!1,wf=!1,Tf=0;function Ef(e){e!==xf&&e.next===null&&(xf===null?bf=xf=e:xf=xf.next=e),Cf=!0,Sf||(Sf=!0,Nf())}function Df(e,t){if(!wf&&Cf){wf=!0;do for(var n=!1,r=bf;r!==null;){if(!t){if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-rt(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,Mf(r,a))}else a=Y,a=dt(r,r===q?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||ft(r,a)||(n=!0,Mf(r,a))}r=r.next}while(n);wf=!1}}function Of(){kf()}function kf(){Cf=Sf=!1;var e=0;Tf!==0&&hp()&&(e=Tf);for(var t=Ge(),n=null,r=bf;r!==null;){var i=r.next,a=Af(r,t);a===0?(r.next=null,n===null?bf=i:n.next=i,i===null&&(xf=n)):(n=r,(e!==0||a&3)&&(Cf=!0)),r=i}yd!==0&&yd!==5||Df(e,!1),Tf!==0&&(Tf=0)}function Af(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-rt(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=mt(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=q,n=Y,n=dt(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(X===2||X===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&He(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||ft(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&He(r),Ct(n)){case 2:case 8:n=Je;break;case 32:n=Ye;break;case 268435456:n=Ze;break;default:n=Ye}return r=jf.bind(null,e),n=Ve(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&He(r),e.callbackPriority=2,e.callbackNode=null,2}function jf(e,t){if(yd!==0&&yd!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(df()&&e.callbackNode!==n)return null;var r=Y;return r=dt(e,e===q?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(Fd(e,r,t),Af(e,Ge()),e.callbackNode!=null&&e.callbackNode===n?jf.bind(null,e):null)}function Mf(e,t){if(df())return null;Fd(e,t,!0)}function Nf(){bp(function(){K&6?Ve(qe,Of):kf()})}function Pf(){if(Tf===0){var e=za;e===0&&(e=st,st<<=1,!(st&261888)&&(st=256)),Tf=e}return Tf}function Ff(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:Sn(e)}function If(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=Ff((i[Ot]||null).action),o=r.submitter;o&&(t=(t=o[Ot]||null)?Ff(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new Wn(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(Tf!==0){var e=new FormData(i,o);ec(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=new FormData(i,o),ec(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var Lf=0;Lf<_i.length;Lf++){var Rf=_i[Lf];vi(Rf.toLowerCase(),`on`+(Rf[0].toUpperCase()+Rf.slice(1)))}vi(li,`onAnimationEnd`),vi(ui,`onAnimationIteration`),vi(di,`onAnimationStart`),vi(`dblclick`,`onDoubleClick`),vi(`focusin`,`onFocus`),vi(`focusout`,`onBlur`),vi(fi,`onTransitionRun`),vi(pi,`onTransitionStart`),vi(mi,`onTransitionCancel`),vi(hi,`onTransitionEnd`),Kt(`onMouseEnter`,[`mouseout`,`mouseover`]),Kt(`onMouseLeave`,[`mouseout`,`mouseover`]),Kt(`onPointerEnter`,[`pointerout`,`pointerover`]),Kt(`onPointerLeave`,[`pointerout`,`pointerover`]),Gt(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),Gt(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),Gt(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),Gt(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),Gt(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),Gt(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var zf=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),Bf=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(zf));function Vf(e,t){t=!!(t&4);for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Ci(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Ci(e)}i.currentTarget=null,a=c}}}}function Q(e,t){var n=t[At];n===void 0&&(n=t[At]=new Set);var r=e+`__bubble`;n.has(r)||(Gf(t,e,2,!1),n.add(r))}function Hf(e,t,n){var r=0;t&&(r|=4),Gf(n,e,r,t)}var Uf=`_reactListening`+Math.random().toString(36).slice(2);function Wf(e){if(!e[Uf]){e[Uf]=!0,Ut.forEach(function(t){t!==`selectionchange`&&(Bf.has(t)||Hf(t,!1,e),Hf(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Uf]||(t[Uf]=!0,Hf(`selectionchange`,!1,t))}}function Gf(e,t,n,r){switch(Ch(t)){case 2:var i=_h;break;case 8:i=vh;break;default:i=yh}n=i.bind(null,t,n,e),i=void 0,!Nn||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function Kf(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var c=r.stateNode.containerInfo;if(c===i)break;if(o===4)for(o=r.return;o!==null;){var l=o.tag;if((l===3||l===4)&&o.stateNode.containerInfo===i)return;o=o.return}for(;c!==null;){if(o=Lt(c),o===null)return;if(l=o.tag,l===5||l===6||l===26||l===27){r=a=o;continue a}c=c.parentNode}}r=r.return}An(function(){var r=a,i=Tn(n),o=[];a:{var c=gi.get(e);if(c!==void 0){var l=Wn,u=e;switch(e){case`keypress`:if(zn(n)===0)break a;case`keydown`:case`keyup`:l=cr;break;case`focusin`:u=`focus`,l=$n;break;case`focusout`:u=`blur`,l=$n;break;case`beforeblur`:case`afterblur`:l=$n;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=Zn;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=Qn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=dr;break;case li:case ui:case di:l=er;break;case hi:l=fr;break;case`scroll`:case`scrollend`:l=Kn;break;case`wheel`:l=pr;break;case`copy`:case`cut`:case`paste`:l=tr;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=lr;break;case`submit`:l=ur;break;case`toggle`:case`beforetoggle`:l=mr}var d=!!(t&4),f=!d&&(e===`scroll`||e===`scrollend`),p=d?c===null?null:c+`Capture`:c;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=jn(m,p),g!=null&&d.push(qf(m,g,h))),f)break;m=m.return}0<d.length&&(c=new l(c,u,null,n,i),o.push({event:c,listeners:d}))}}if(!(t&7)){a:{if(l=e===`mouseover`||e===`pointerover`,c=e===`mouseout`||e===`pointerout`,l&&n!==wn&&(u=n.relatedTarget||n.fromElement)&&(Lt(u)||u[kt]))break a;(c||l)&&(u=i.window===i?i:(l=i.ownerDocument)?l.defaultView||l.parentWindow:window,c?(l=n.relatedTarget||n.toElement,c=r,l=l?Lt(l):null,l!==null&&(f=s(l),d=l.tag,l!==f||d!==5&&d!==27&&d!==6)&&(l=null)):(c=null,l=r),c!==l&&(d=Zn,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=lr,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=c==null?u:zt(c),h=l==null?u:zt(l),u=new d(g,m+`leave`,c,n,i),u.target=f,u.relatedTarget=h,g=null,Lt(i)===r&&(d=new d(p,m+`enter`,l,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,d=c&&l?w(c,l,Yf):null,c!==null&&Xf(o,u,c,d,!1),l!==null&&f!==null&&Xf(o,f,l,d,!0)))}a:{if(c=r?zt(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var _=Mr;else if(Er(c)){if(Nr)_=Hr;else{_=Br;var v=zr}}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&yn(r.elementType)&&(_=Mr):_=Vr;if(_&&=_(e,r)){Dr(o,_,n,i);break a}v&&v(e,c,r)}switch(v=r?zt(r):window,e){case`focusin`:(Er(v)||v.contentEditable===`true`)&&($r=v,ei=r,ti=null);break;case`focusout`:ti=ei=$r=null;break;case`mousedown`:ni=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:ni=!1,ri(o,n,i);break;case`selectionchange`:if(Qr)break;case`keydown`:case`keyup`:ri(o,n,i)}var y;if(gr)b:{switch(e){case`compositionstart`:var b=`onCompositionStart`;break b;case`compositionend`:b=`onCompositionEnd`;break b;case`compositionupdate`:b=`onCompositionUpdate`;break b}b=void 0}else Sr?xr(e,n)&&(b=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(b=`onCompositionStart`);b&&(N&&n.locale!==`ko`&&(Sr||b!==`onCompositionStart`?b===`onCompositionEnd`&&Sr&&(y=Rn()):(Fn=i,In=`value`in Fn?Fn.value:Fn.textContent,Sr=!0)),v=Jf(r,b),0<v.length&&(b=new nr(b,e,null,n,i),o.push({event:b,listeners:v}),y?b.data=y:(y=P(n),y!==null&&(b.data=y)))),(y=vr?Cr(e,n):wr(e,n))&&(b=Jf(r,`onBeforeInput`),0<b.length&&(v=new nr(`onBeforeInput`,`beforeinput`,null,n,i),o.push({event:v,listeners:b}),v.data=y)),If(o,e,r,n,i)}Vf(o,t)})}function qf(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Jf(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=jn(e,n),i!=null&&r.unshift(qf(e,i,a)),i=jn(e,t),i!=null&&r.push(qf(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Yf(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Xf(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=jn(n,a),l!=null&&o.unshift(qf(n,l,c))):i||(l=jn(n,a),l!=null&&o.push(qf(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var Zf=/\r\n?/g,Qf=/\u0000|\uFFFD/g;function $f(e){return(typeof e==`string`?e:``+e).replace(Zf,`
`).replace(Qf,``)}function ep(e,t){return t=$f(t),$f(e)===t}function $(e,t,n,r,i,o){switch(n){case`children`:if(typeof r==`string`)t===`body`||t===`textarea`&&r===``||hn(e,r);else if(typeof r==`number`||typeof r==`bigint`)t!==`body`&&hn(e,``+r);else return;break;case`className`:$t(e,`class`,r);break;case`tabIndex`:$t(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:$t(e,n,r);break;case`style`:vn(e,r,o);return;case`data`:if(t!==`object`){$t(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)){e.removeAttribute(n);break}if(r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=Sn(r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}if(typeof o==`function`&&(n===`formAction`?(t!==`input`&&$(e,t,`name`,i.name,i,null),$(e,t,`formEncType`,i.formEncType,i,null),$(e,t,`formMethod`,i.formMethod,i,null),$(e,t,`formTarget`,i.formTarget,i,null)):($(e,t,`encType`,i.encType,i,null),$(e,t,`method`,i.method,i,null),$(e,t,`target`,i.target,i,null))),r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=Sn(r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=Cn);return;case`onScroll`:r!=null&&Q(`scroll`,e);return;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);return;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(a(61));if(n=r.__html,n!=null){if(i.children!=null)throw Error(a(60));o?.__html!==n&&(e.innerHTML=n)}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=Sn(r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`credentialless`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:Q(`beforetoggle`,e),Q(`toggle`,e),Qt(e,`popover`,r);break;case`xlinkActuate`:en(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:en(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:en(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:en(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:en(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:en(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:en(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:en(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:en(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:Qt(e,`is`,r);break;case`innerText`:case`textContent`:return;default:if(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)n=bn.get(n)||n,Qt(e,n,r);else return}M=!0}function tp(e,t,n,r,i,o){switch(n){case`style`:vn(e,r,o);return;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(a(61));if(n=r.__html,n!=null){if(i.children!=null)throw Error(a(60));o?.__html!==n&&(e.innerHTML=n)}}break;case`children`:if(typeof r==`string`)hn(e,r);else if(typeof r==`number`||typeof r==`bigint`)hn(e,``+r);else return;break;case`onScroll`:r!=null&&Q(`scroll`,e);return;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);return;case`onClick`:r!=null&&(e.onclick=Cn);return;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:return;case`innerText`:case`textContent`:return;default:if(!Wt.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(i=n.endsWith(`Capture`),o=n.slice(2,i?n.length-7:void 0),t=e[Ot]||null,t=t==null?null:t[n],typeof t==`function`&&e.removeEventListener(o,t,i),typeof r==`function`)){typeof t!=`function`&&t!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(o,r,i);break a}M=!0,n in e?e[n]=r:!0===r?e.setAttribute(n,``):Qt(e,n,r)}return}M=!0}function np(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:Q(`error`,e),Q(`load`,e);var r=!1,i=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:i=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(a(137,t));default:$(e,t,o,s,n,null)}}i&&$(e,t,`srcSet`,n.srcSet,n,null),r&&$(e,t,`src`,n.src,n,null);return;case`input`:Q(`invalid`,e);var c=o=s=i=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:i=d;break;case`type`:s=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:o=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(a(137,t));break;default:$(e,t,r,d,n,null)}}un(e,o,c,l,u,s,i,!1);return;case`select`:for(i in Q(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(i)&&(c=n[i],c!=null))switch(i){case`value`:o=c;break;case`defaultValue`:s=c;break;case`multiple`:r=c;default:$(e,t,i,c,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&fn(e,!!r,n,!0):fn(e,!!r,t,!1);return;case`textarea`:for(s in Q(`invalid`,e),o=i=r=null,n)if(n.hasOwnProperty(s)&&(c=n[s],c!=null))switch(s){case`value`:r=c;break;case`defaultValue`:i=c;break;case`children`:o=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(a(91));break;default:$(e,t,s,c,n,null)}mn(e,r,i,o);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:$(e,t,l,r,n,null)}return;case`dialog`:Q(`beforetoggle`,e),Q(`toggle`,e),Q(`cancel`,e),Q(`close`,e);break;case`iframe`:case`object`:Q(`load`,e);break;case`video`:case`audio`:for(r=0;r<zf.length;r++)Q(zf[r],e);break;case`image`:Q(`error`,e),Q(`load`,e);break;case`details`:Q(`toggle`,e);break;case`embed`:case`source`:case`link`:Q(`error`,e),Q(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(a(137,t));default:$(e,t,u,r,n,null)}return;default:if(yn(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&tp(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&$(e,t,c,r,n,null))}var rp={};function ip(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var i=null,o=null,s=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||$(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:m!==f&&(M=!0),o=m;break;case`name`:m!==f&&(M=!0),i=m;break;case`checked`:m!==f&&(M=!0),u=m;break;case`defaultChecked`:m!==f&&(M=!0),d=m;break;case`value`:m!==f&&(M=!0),s=m;break;case`defaultValue`:m!==f&&(M=!0),c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(a(137,t));break;default:m!==f&&$(e,t,p,m,r,f)}}ln(e,s,c,l,u,d,o,i);return;case`select`:for(o in m=s=c=p=null,n)if(l=n[o],n.hasOwnProperty(o)&&l!=null)switch(o){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(o)||$(e,t,o,null,r,l)}for(i in r)if(o=r[i],l=n[i],r.hasOwnProperty(i)&&(o!=null||l!=null))switch(i){case`value`:o!==l&&(M=!0),p=o;break;case`defaultValue`:o!==l&&(M=!0),c=o;break;case`multiple`:o!==l&&(M=!0),s=o;default:o!==l&&$(e,t,i,o,r,l)}t=c,n=s,r=m,p==null?!!r!=!!n&&(t==null?fn(e,!!n,n?[]:``,!1):fn(e,!!n,t,!0)):fn(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(i=n[c],n.hasOwnProperty(c)&&i!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:$(e,t,c,null,r,i)}for(s in r)if(i=r[s],o=n[s],r.hasOwnProperty(s)&&(i!=null||o!=null))switch(s){case`value`:i!==o&&(M=!0),p=i;break;case`defaultValue`:i!==o&&(M=!0),m=i;break;case`children`:break;case`dangerouslySetInnerHTML`:if(i!=null)throw Error(a(91));break;default:i!==o&&$(e,t,s,i,r,o)}pn(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:$(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:p!==m&&(M=!0),e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:$(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&$(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(a(137,t));break;default:$(e,t,u,p,r,m)}return;default:if(yn(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&tp(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||tp(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&$(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||$(e,t,f,p,r,m)}function ap(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function op(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&ap(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&ap(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var sp=null,cp=null;function lp(e){return e.nodeType===9?e:e.ownerDocument}function up(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function dp(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function fp(e,t,n,r){return n=lp(n).createElement(e),n[Dt]=r,n[Ot]=t,np(n,e,t),Vt(n),n}function pp(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var mp=null;function hp(){var e=window.event;return e&&e.type===`popstate`?e!==mp&&(mp=e,!0):(mp=null,!1)}var gp=typeof setTimeout==`function`?setTimeout:void 0,_p=typeof clearTimeout==`function`?clearTimeout:void 0,vp=typeof Promise==`function`?Promise:void 0,yp=typeof requestAnimationFrame==`function`?requestAnimationFrame:gp,bp=typeof queueMicrotask==`function`?queueMicrotask:vp===void 0?gp:function(e){return vp.resolve(null).then(e).catch(xp)};function xp(e){setTimeout(function(){throw e})}function Sp(e){return e===`head`}function Cp(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8){if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Hh(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)_m(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,_m(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[Pt]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&_m(e.ownerDocument.body)}n=i}while(n);Hh(t)}function wp(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8){if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++}n=r}while(n)}function Tp(e,t,n){if(t=CSS.escape(t)===t?t:`r-`+btoa(t).replace(/=/g,``),e.style.viewTransitionName=t,n!=null&&(e.style.viewTransitionClass=n),n=getComputedStyle(e),n.display===`inline`){if(t=e.getClientRects(),t.length===1)var r=1;else for(var i=r=0;i<t.length;i++){var a=t[i];0<a.width&&0<a.height&&r++}r===1&&(e=e.style,e.display=t.length===1?`inline-block`:`block`,e.marginTop=`-`+n.paddingTop,e.marginBottom=`-`+n.paddingBottom)}}function Ep(e,t){e=e.style,t=t.style;var n=t==null?null:t.hasOwnProperty(`viewTransitionName`)?t.viewTransitionName:t.hasOwnProperty(`view-transition-name`)?t[`view-transition-name`]:null;e.viewTransitionName=n==null||typeof n==`boolean`?``:(``+n).trim(),n=t==null?null:t.hasOwnProperty(`viewTransitionClass`)?t.viewTransitionClass:t.hasOwnProperty(`view-transition-class`)?t[`view-transition-class`]:null,e.viewTransitionClass=n==null||typeof n==`boolean`?``:(``+n).trim(),e.display===`inline-block`&&(t==null?e.display=e.margin=``:(n=t.display,e.display=n==null||typeof n==`boolean`?``:n,n=t.margin,n==null?(n=t.hasOwnProperty(`marginTop`)?t.marginTop:t[`margin-top`],e.marginTop=n==null||typeof n==`boolean`?``:n,t=t.hasOwnProperty(`marginBottom`)?t.marginBottom:t[`margin-bottom`],e.marginBottom=t==null||typeof t==`boolean`?``:t):e.margin=n))}function Dp(e,t,n){return n=n.ownerDocument.defaultView,{rect:e,abs:t.position===`absolute`||t.position===`fixed`,clip:t.clipPath!==`none`||t.overflow!==`visible`||t.filter!==`none`||t.mask!==`none`||t.mask!==`none`||t.borderRadius!==`0px`,view:0<=e.bottom&&0<=e.right&&e.top<=n.innerHeight&&e.left<=n.innerWidth}}function Op(e){return Dp(e.getBoundingClientRect(),getComputedStyle(e),e)}function kp(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var n=getComputedStyle(e);return Dp(t,n,e)}function Ap(e){return e.documentElement.clientHeight}function jp(e){this.addEventListener(`load`,e),this.addEventListener(`error`,e)}function Mp(e,t,n,r,i,a,o,s,c){var l=t.nodeType===9?t:t.ownerDocument;try{var u=l.startViewTransition({update:function(){var t=l.defaultView,n=t.navigation&&t.navigation.transition,o=l.fonts.status;r();var s=[];if(o===`loaded`&&(Ap(l),l.fonts.status===`loading`&&s.push(l.fonts.ready)),o=s.length,e!==null)for(var c=e.suspenseyImages,u=0,d=0;d<c.length;d++){var f=c[d];if(!f.complete){var p=f.getBoundingClientRect();if(0<p.bottom&&0<p.right&&p.top<t.innerHeight&&p.left<t.innerWidth){if(u+=Xm(f),u>$m){s.length=o;break}f=new Promise(jp.bind(f)),s.push(f)}}}if(0<s.length)return t=Promise.race([Promise.all(s),new Promise(function(e){return setTimeout(e,500)})]).then(i,i),(n?Promise.allSettled([n.finished,t]):t).then(a,a);if(i(),n)return n.finished.then(a,a);a()},types:n});l.__reactViewTransition=u;var d=[];return u.ready.then(function(){for(var e=l.documentElement.getAnimations({subtree:!0}),t=0;t<e.length;t++){var n=e[t],r=n.effect,i=r.pseudoElement;if(i!=null&&i.startsWith(`::view-transition`)){d.push(n),n=r.getKeyframes();for(var a=i=void 0,s=!0,c=0;c<n.length;c++){var u=n[c],f=u.width;if(i===void 0)i=f;else if(i!==f){s=!1;break}if(f=u.height,a===void 0)a=f;else if(a!==f){s=!1;break}delete u.width,delete u.height,u.transform===`none`&&delete u.transform}s&&i!==void 0&&a!==void 0&&(r.setKeyframes(n),s=getComputedStyle(r.target,r.pseudoElement),s.width!==i||s.height!==a)&&(s=n[0],s.width=i,s.height=a,s=n[n.length-1],s.width=i,s.height=a,r.setKeyframes(n))}}o()},function(e){l.__reactViewTransition===u&&(l.__reactViewTransition=null);try{if(typeof e==`object`&&e)switch(e.name){case`InvalidStateError`:(e.message===`View transition was skipped because document visibility state is hidden.`||e.message===`Skipping view transition because document visibility state has become hidden.`||e.message===`Skipping view transition because viewport size changed.`||e.message===`Transition was aborted because of invalid state`)&&(e=null)}e!==null&&c(e)}finally{r(),i(),o()}}),u.finished.finally(function(){for(var e=0;e<d.length;e++)d[e].cancel();l.__reactViewTransition===u&&(l.__reactViewTransition=null),s()}),u}catch{return r(),i(),o(),null}}function Np(e,t){this._scope=document.documentElement,this._selector=`::view-transition-`+e+`(`+t+`)`}Np.prototype.animate=function(e,t){return t=typeof t==`number`?{duration:t}:T({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)},Np.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,n=e.getAnimations({subtree:!0}),r=[],i=0;i<n.length;i++){var a=n[i].effect;a!==null&&a.target===e&&a.pseudoElement===t&&r.push(n[i])}return r},Np.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function Pp(e){return{name:e,group:new Np(`group`,e),imagePair:new Np(`image-pair`,e),old:new Np(`old`,e),new:new Np(`new`,e)}}function Fp(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Fp.prototype.addEventListener=function(e,t,n){var r=null,i=null;if(!(n!=null&&typeof n!=`boolean`&&(r=n.signal||null,r!==null&&r.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var a=this._eventListeners;if(Bp(a,e,t,n)===-1){var o=this,s=t;n!=null&&typeof n!=`boolean`&&!0===n.once&&(s=function(r){o.removeEventListener(e,t,n),typeof t==`function`?t.call(this,r):t.handleEvent(r)}),r!==null&&(i=o.removeEventListener.bind(o,e,t,n),r.addEventListener(`abort`,i,{once:!0}),i=r.removeEventListener.bind(r,`abort`,i)),r=Rp(n),a.push({type:e,listener:t,optionsOrUseCapture:n,attachedListener:s,cleanup:i}),p(this._fragmentFiber.child,!1,Ip,e,s,r)}this._eventListeners=a}};function Ip(e,t,n,r){return v(e).addEventListener(t,n,r),!1}Fp.prototype.removeEventListener=function(e,t,n){var r=this._eventListeners;if(r!==null&&(t=Bp(r,e,t,n),t!==-1)){var i=r[t];n=i.attachedListener;var a=i.cleanup;i=Rp(i.optionsOrUseCapture),p(this._fragmentFiber.child,!1,Lp,e,n,i),r.splice(t,1),a!==null&&a()}};function Lp(e,t,n,r){return v(e).removeEventListener(t,n,r),!1}function Rp(e){return e!=null&&typeof e!=`boolean`&&(!0===e.once||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function zp(e){return e==null?`c=0`:typeof e==`boolean`?`c=`+(e?`1`:`0`):`c=`+(e.capture?`1`:`0`)}function Bp(e,t,n,r){if(e.length===0)return-1;r=zp(r);for(var i=0;i<e.length;i++){var a=e[i];if(a.type===t&&a.listener===n&&zp(a.optionsOrUseCapture)===r)return i}return-1}Fp.prototype.dispatchEvent=function(e){var t=m(this._fragmentFiber);if(t===null)return!0;t=v(t);var n=this._eventListeners;if(n!==null&&0<n.length||!e.bubbles){var r=t.nodeType===9?t.createComment(``):document.createTextNode(``);if(n)for(var i=0;i<n.length;i++){var a=n[i];r.addEventListener(a.type,a.attachedListener,Rp(a.optionsOrUseCapture))}if(t.appendChild(r),e=r.dispatchEvent(e),n)for(i=0;i<n.length;i++)a=n[i],r.removeEventListener(a.type,a.attachedListener,Rp(a.optionsOrUseCapture));return t.removeChild(r),e}return t.dispatchEvent(e)},Fp.prototype.focus=function(e){p(this._fragmentFiber.child,!0,Vp,e,void 0,void 0)};function Vp(e,t){return e.tag!==6&&(e=v(e),pm(e,t))}Fp.prototype.focusLast=function(e){var t=[];p(this._fragmentFiber.child,!0,Hp,t,void 0,void 0);for(var n=t.length-1;0<=n&&!Vp(t[n],e);n--);};function Hp(e,t){return t.push(e),!1}Fp.prototype.blur=function(){var e=m(this._fragmentFiber);e!==null&&(e=v(e),e=lp(e).activeElement,e!==null&&p(this._fragmentFiber.child,!1,Up,e,void 0,void 0))};function Up(e,t){return e.tag!==6&&(e=v(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Fp.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),p(this._fragmentFiber.child,!1,Wp,e,void 0,void 0)};function Wp(e,t){return e.tag!==6&&(e=v(e),t.observe(e),!1)}Fp.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),p(this._fragmentFiber.child,!1,Gp,e,void 0,void 0);for(var n=t=0;n<Kp.length;n++){var r=Kp[n];r.fragmentInstance===this&&r.observer===e?e.unobserve(r.instance):Kp[t++]=r}Kp.length=t}};function Gp(e,t){return e.tag!==6&&(e=v(e),t.unobserve(e),!1)}var Kp=[],qp=!1;function Jp(e,t,n){Kp.push({fragmentInstance:e,observer:t,instance:n}),qp||(qp=!0,mm(function(){qp=!1;var e=Kp;Kp=[];for(var t=0;t<e.length;t++){var n=e[t];n.observer.unobserve(n.instance)}}))}Fp.prototype.getClientRects=function(){var e=[];return p(this._fragmentFiber.child,!1,Yp,e,void 0,void 0),e};function Yp(e,t){if(e.tag===6){e=e.stateNode;var n=e.ownerDocument.createRange();n.selectNodeContents(e),t.push.apply(t,n.getClientRects())}else e=v(e),t.push.apply(t,e.getClientRects());return!1}Fp.prototype.getRootNode=function(e){var t=m(this._fragmentFiber);return t===null?this:v(t).getRootNode(e)},Fp.prototype.compareDocumentPosition=function(e){var t=m(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var n=[];p(this._fragmentFiber.child,!1,Hp,n,void 0,void 0);var r=v(t);if(n.length===0){if(n=r,h(this._fragmentFiber)){a:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break a}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(n=t)}t=this._fragmentFiber;var i=r=n.compareDocumentPosition(e);return n===e?i=Node.DOCUMENT_POSITION_CONTAINS:r&Node.DOCUMENT_POSITION_CONTAINED_BY&&(n=g(t)[1],n===null?i=Node.DOCUMENT_POSITION_PRECEDING:(e=v(n).compareDocumentPosition(e),i=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),i|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=v(n[0]),i=v(n[n.length-1]);var a=h(this._fragmentFiber)?t.parentElement:r;if(a==null)return Node.DOCUMENT_POSITION_DISCONNECTED;r=a.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,a=a.compareDocumentPosition(i)&Node.DOCUMENT_POSITION_CONTAINED_BY;var o=t.compareDocumentPosition(e),s=i.compareDocumentPosition(e),c=o&Node.DOCUMENT_POSITION_CONTAINED_BY||s&Node.DOCUMENT_POSITION_CONTAINED_BY;return s=r&&a&&o&Node.DOCUMENT_POSITION_FOLLOWING&&s&Node.DOCUMENT_POSITION_PRECEDING,t=r&&t===e||a&&i===e||c||s?Node.DOCUMENT_POSITION_CONTAINED_BY:!r&&t===e||!a&&i===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:o,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||Xp(t,this._fragmentFiber,n[0],n[n.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function Xp(e,t,n,r,i){var a=Lt(i);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(n=!!a)a:{for(;a!==null;){if(a.tag===7&&(a===t||a.alternate===t)){n=!0;break a}a=a.return}n=!1}return n}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(a===null)return a=i.ownerDocument,i===a||i===a.documentElement||i===a.body;a:{for(a=t,t=m(t);a!==null;){if(!(a.tag!==5&&a.tag!==3&&a.tag!==27||a!==t&&a.alternate!==t)){a=!0;break a}a=a.return}a=!1}return a}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!a)&&!(t=a===n)&&(t=w(n,a,C),t===null?t=!1:(p(t,!0,x,a,n),a=y,y=null,t=a!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!a)&&!(t=a===r)&&(t=w(r,a,C),t===null?t=!1:(p(t,!0,S,a,r),a=y,b=y=null,t=a!==null)),t):!1}function Zp(e,t){var n=e.ownerDocument.createRange();n.selectNodeContents(e),e=n.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Fp.prototype.scrollIntoView=function(e){if(typeof e==`object`)throw Error(a(566));var t=[];p(this._fragmentFiber.child,!1,Hp,t,void 0,void 0);var n=!1!==e;if(t.length===0){var r=g(this._fragmentFiber);if(r=n?r[1]||r[0]||m(this._fragmentFiber):r[0]||r[1],r===null)return;if(r.tag===6){e=v(r),Zp(e,n);return}if(r=v(r),r.nodeType!==9){if(r.nodeType===11){n=`host`in r?r.host:null,n!==null&&n.scrollIntoView(e);return}r.scrollIntoView(e)}}for(r=n?t.length-1:0;r!==(n?-1:t.length);){var i=t[r];i.tag===6?(i=v(i),Zp(i,n)):v(i).scrollIntoView(e),r+=n?-1:1}};function Qp(e,t){return e=v(e),$p(e,t),!1}function $p(e,t){e.reactFragments??=new Set,e.reactFragments.add(t)}function em(e,t){var n=t._eventListeners;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];e.addEventListener(i.type,i.attachedListener,Rp(i.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(n){for(var r=0,i=0;i<Kp.length;i++){var a=Kp[i];(a.fragmentInstance!==t||a.observer!==n||a.instance!==e)&&(Kp[r++]=a)}Kp.length=r,n.observe(e)}),$p(e,t))}function tm(e,t){var n=t._eventListeners;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];e.removeEventListener(i.type,i.attachedListener,Rp(i.optionsOrUseCapture))}e.nodeType!==3&&(n=t._observers,n!==null&&n.forEach(function(n){typeof n.rootMargin==`string`?Jp(t,n,e):n.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function nm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:nm(n),It(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function rm(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r){if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e}else if(!e[Pt])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=lm(e.nextSibling),e===null)break}return null}function im(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=lm(e.nextSibling),e===null))return null;return e}function am(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=lm(e.nextSibling),e===null))return null;return e}function om(e){return e.data===`$?`||e.data===`$~`}function sm(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function cm(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function lm(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var um=null;function dm(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return lm(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function fm(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function pm(e,t){function n(){r=!0}if(e.ownerDocument.activeElement===e)return!0;var r=!1;try{e.ownerDocument.addEventListener(`focus`,n,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener(`focus`,n,!0)}return r}function mm(e){yp(function(){yp(function(t){return e(t)})})}function hm(e,t,n){switch(t=lp(n),e){case`html`:if(e=t.documentElement,!e)throw Error(a(452));return e;case`head`:if(e=t.head,!e)throw Error(a(453));return e;case`body`:if(e=t.body,!e)throw Error(a(454));return e;default:throw Error(a(451))}}function gm(e,t,n){for(var r in n){var i=n[r];n.hasOwnProperty(r)&&i!=null&&$(e,t,r,null,rp,i)}n.dangerouslySetInnerHTML!=null&&(e.textContent=``),e.onclick===Cn&&(e.onclick=null),It(e)}function _m(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);It(e)}var vm=new Map,ym=new Set;function bm(e){if(typeof e.getRootNode==`function`){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var xm=A.d;A.d={f:Sm,r:Cm,D:Em,C:Dm,L:Om,m:km,X:jm,S:Am,M:Mm};function Sm(){var e=xm.f(),t=zd();return e||t}function Cm(e){var t=Rt(e);t!==null&&t.tag===5&&t.type===`form`?nc(t):xm.r(e)}var wm=typeof document>`u`?null:document;function Tm(e,t,n){var r=wm;if(r&&typeof t==`string`&&t){var i=cn(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),ym.has(i)||(ym.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),np(t,`link`,e),Vt(t),r.head.appendChild(t)))}}function Em(e){xm.D(e),Tm(`dns-prefetch`,e,null)}function Dm(e,t){xm.C(e,t),Tm(`preconnect`,e,t)}function Om(e,t,n){xm.L(e,t,n);var r=wm;if(r&&e&&t){var i=`link[rel="preload"][as="`+cn(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+cn(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+cn(n.imageSizes)+`"]`)):i+=`[href="`+cn(e)+`"]`;var a=i;switch(t){case`style`:a=Pm(e);break;case`script`:a=Rm(e)}if(!(vm.has(a)||(e=T({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),vm.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(Fm(a))||t===`script`&&r.querySelector(zm(a))))){var o=r.createElement(`link`);np(o,`link`,e),t===`style`&&(o[Ft]=!0,o.onload=o.onerror=function(){Ht(o)}),Vt(o),r.head.appendChild(o)}}}function km(e,t){xm.m(e,t);var n=wm;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+cn(r)+`"][href="`+cn(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=Rm(e)}if(!vm.has(a)&&(e=T({rel:`modulepreload`,href:e},t),vm.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(zm(a)))return}r=n.createElement(`link`),np(r,`link`,e),Vt(r),n.head.appendChild(r)}}}function Am(e,t,n){xm.S(e,t,n);var r=wm;if(r&&e){var i=Bt(r).hoistableStyles,a=Pm(e);t||=`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(Fm(a)))s.loading=5;else{e=T({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=vm.get(a))&&Hm(e,n);var c=o=r.createElement(`link`);Vt(c),np(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,Vm(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function jm(e,t){xm.X(e,t);var n=wm;if(n&&e){var r=Bt(n).hoistableScripts,i=Rm(e),a=r.get(i);a||(a=n.querySelector(zm(i)),a||(e=T({src:e,async:!0},t),(t=vm.get(i))&&Um(e,t),a=n.createElement(`script`),Vt(a),np(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Mm(e,t){xm.M(e,t);var n=wm;if(n&&e){var r=Bt(n).hoistableScripts,i=Rm(e),a=r.get(i);a||(a=n.querySelector(zm(i)),a||(e=T({src:e,async:!0,type:`module`},t),(t=vm.get(i))&&Um(e,t),a=n.createElement(`script`),Vt(a),np(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Nm(e,t,n,r){var i=(i=De.current)?bm(i):null;if(!i)throw Error(a(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(n=Pm(n.href),t=Bt(i).hoistableStyles,r=t.get(n),r||(r={type:`style`,instance:null,count:0,state:null},t.set(n,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Pm(n.href);var o=Bt(i).hoistableStyles,s=o.get(e);if(s||(i=i.ownerDocument||i,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=i.querySelector(Fm(e)))?o._p||(s.instance=o,s.state.loading=5):(o=vm.get(e),o||(o={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},vm.set(e,o)),Lm(i,e,o,s.state))),t&&r===null)throw Error(a(528,``));return s}if(t&&r!==null)throw Error(a(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(n=Rm(n),t=Bt(i).hoistableScripts,r=t.get(n),r||(r={type:`script`,instance:null,count:0,state:null},t.set(n,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(a(444,e))}}function Pm(e){return`href="`+cn(e)+`"`}function Fm(e){return`link[rel="stylesheet"][`+e+`]`}function Im(e){return T({},e,{"data-precedence":e.precedence,precedence:null})}function Lm(e,t,n,r){if(t=e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)){if(!0!==t[Ft]){r.loading=1;return}}else t=e.createElement(`link`),t[Ft]=!0,t.onload=t.onerror=Ht.bind(null,t),np(t,`link`,n),Vt(t),e.head.appendChild(t);r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2})}function Rm(e){return`[src="`+cn(e)+`"]`}function zm(e){return`script[async]`+e}function Bm(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+cn(n.href)+`"]`);if(r)return t.instance=r,Vt(r),r;var i=T({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),Vt(r),np(r,`style`,i),Vm(r,n.precedence,e),t.instance=r;case`stylesheet`:i=Pm(n.href);var o=e.querySelector(Fm(i));if(o)return t.state.loading|=4,t.instance=o,Vt(o),o;r=Im(n),(i=vm.get(i))&&Hm(r,i),o=(e.ownerDocument||e).createElement(`link`),Vt(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),np(o,`link`,r),t.state.loading|=4,Vm(o,n.precedence,e),t.instance=o;case`script`:return o=Rm(n.src),(i=e.querySelector(zm(o)))?(t.instance=i,Vt(i),i):(r=n,(i=vm.get(o))&&(r=T({},n),Um(r,i)),e=e.ownerDocument||e,i=e.createElement(`script`),Vt(i),np(i,`link`,r),e.head.appendChild(i),t.instance=i);case`void`:return null;default:throw Error(a(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Vm(r,n.precedence,e));return t.instance}function Vm(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Hm(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.title??=t.title}function Um(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.integrity??=t.integrity}var Wm=null;function Gm(e,t,n){if(Wm===null){var r=new Map,i=Wm=new Map;i.set(n,r)}else i=Wm,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[Pt]||a[Dt]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Km(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function qm(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Jm(e,t){return e===`img`&&t.src!=null&&t.src!==``&&t.onLoad==null&&t.loading!==`lazy`}function Ym(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Xm(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio==`number`?devicePixelRatio:1)*.25}function Zm(e,t){typeof t.decode==`function`&&(e.imgCount++,t.complete||(e.imgBytes+=Xm(t),e.suspenseyImages.push(t)),e=rh.bind(e),t.decode().then(e,e))}function Qm(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Pm(r.href),a=t.querySelector(Fm(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=nh.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,Vt(a);return}a=t.ownerDocument||t,r=Im(r),(i=vm.get(i))&&Hm(r,i),a=a.createElement(`link`),Vt(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),np(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=nh.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var $m=0;function eh(e,t){return e.stylesheets&&e.count===0&&ah(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&ah(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&$m===0&&($m=62500*op());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&ah(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>$m?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function th(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)ah(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function nh(){this.count--,th(this)}function rh(){this.imgCount--,th(this)}var ih=null;function ah(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,ih=new Map,t.forEach(oh,e),ih=null,nh.call(e))}function oh(e,t){if(!(t.state.loading&4)){var n=ih.get(e);if(n)var r=n.get(null);else{n=new Map,ih.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=nh.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var sh={$$typeof:E,Provider:null,Consumer:null,_currentValue:be,_currentValue2:be,_threadCount:0};function ch(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=gt(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=gt(0),this.hiddenUpdates=gt(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.transitionTypes=null,this.incompleteTransitions=new Map}function lh(e,t,n,r,i,a,o,s,c,l,u,d){return e=new ch(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=Fi(3,null,null,t),e.current=a,a.stateNode=e,t=Ma(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},ho(a),e}function uh(e){return e?(e=Ni,e):Ni}function dh(e,t,n,r,i,a){i=uh(i),r.context===null?r.context=i:r.pendingContext=i,r=_o(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=vo(e,r,t),n!==null&&(Pd(n,e,t),yo(n,e,t))}function fh(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ph(e,t){fh(e,t),(e=e.alternate)&&fh(e,t)}function mh(e){if(e.tag===13||e.tag===31){var t=Ai(e,67108864);t!==null&&Pd(t,e,67108864),ph(e,67108864)}}function hh(e){if(e.tag===13||e.tag===31){var t=jd();t=St(t);var n=Ai(e,t);n!==null&&Pd(n,e,t),ph(e,t)}}var gh=!0;function _h(e,t,n,r){var i=k.T;k.T=null;var a=A.p;try{A.p=2,yh(e,t,n,r)}finally{A.p=a,k.T=i}}function vh(e,t,n,r){var i=k.T;k.T=null;var a=A.p;try{A.p=8,yh(e,t,n,r)}finally{A.p=a,k.T=i}}function yh(e,t,n,r){if(gh){var i=bh(r);if(i===null)Kf(e,t,r,xh,n),Mh(e,r);else if(Ph(i,e,t,n,r))r.stopPropagation();else if(Mh(e,r),t&4&&-1<jh.indexOf(e)){for(;i!==null;){var a=Rt(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=ut(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-rt(o);s.entanglements[1]|=c,o&=~c}Ef(a),!(K&6)&&(gd=Ge()+500,Df(0,!1))}}break;case 31:case 13:s=Ai(a,2),s!==null&&Pd(s,a,2),zd(),ph(a,2)}if(a=bh(r),a===null&&Kf(e,t,r,xh,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else Kf(e,t,r,null,n)}}function bh(e){return e=Tn(e),Sh(e)}var xh=null;function Sh(e){if(xh=null,e=Lt(e),e!==null){var t=s(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=c(t),e!==null)return e;e=null}else if(n===31){if(e=l(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return xh=e,null}function Ch(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`fullscreenerror`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`resize`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(Ke()){case qe:return 2;case Je:return 8;case Ye:case Xe:return 32;case Ze:return 268435456;default:return 32}default:return 32}}var wh=!1,Th=null,Eh=null,Dh=null,Oh=new Map,kh=new Map,Ah=[],jh=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Mh(e,t){switch(e){case`focusin`:case`focusout`:Th=null;break;case`dragenter`:case`dragleave`:Eh=null;break;case`mouseover`:case`mouseout`:Dh=null;break;case`pointerover`:case`pointerout`:Oh.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:kh.delete(t.pointerId)}}function Nh(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=Rt(t),t!==null&&mh(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Ph(e,t,n,r,i){switch(t){case`focusin`:return Th=Nh(Th,e,t,n,r,i),!0;case`dragenter`:return Eh=Nh(Eh,e,t,n,r,i),!0;case`mouseover`:return Dh=Nh(Dh,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return Oh.set(a,Nh(Oh.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,kh.set(a,Nh(kh.get(a)||null,e,t,n,r,i)),!0}return!1}function Fh(e){var t=Lt(e.target);if(t!==null){var n=s(t);if(n!==null){if(t=n.tag,t===13){if(t=c(n),t!==null){e.blockedOn=t,Tt(e.priority,function(){hh(n)});return}}else if(t===31){if(t=l(n),t!==null){e.blockedOn=t,Tt(e.priority,function(){hh(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ih(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=bh(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);wn=r,n.target.dispatchEvent(r),wn=null}else return t=Rt(n),t!==null&&mh(t),e.blockedOn=n,!1;t.shift()}return!0}function Lh(e,t,n){Ih(e)&&n.delete(t)}function Rh(){wh=!1,Th!==null&&Ih(Th)&&(Th=null),Eh!==null&&Ih(Eh)&&(Eh=null),Dh!==null&&Ih(Dh)&&(Dh=null),Oh.forEach(Lh),kh.forEach(Lh)}function zh(e,t){e.blockedOn===t&&(e.blockedOn=null,wh||(wh=!0,n.unstable_scheduleCallback(n.unstable_NormalPriority,Rh)))}var Bh=null;function Vh(e){Bh!==e&&(Bh=e,n.unstable_scheduleCallback(n.unstable_NormalPriority,function(){Bh===e&&(Bh=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(Sh(r||n)===null)continue;break}var a=Rt(n);a!==null&&(e.splice(t,3),t-=3,ec(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Hh(e){function t(t){return zh(t,e)}Th!==null&&zh(Th,e),Eh!==null&&zh(Eh,e),Dh!==null&&zh(Dh,e),Oh.forEach(t),kh.forEach(t);for(var n=0;n<Ah.length;n++){var r=Ah[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<Ah.length&&(n=Ah[0],n.blockedOn===null);)Fh(n),n.blockedOn===null&&Ah.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[Ot]||null;if(typeof a==`function`)o||Vh(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[Ot]||null)s=o.formAction;else if(Sh(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Vh(n)}}}function Uh(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Wh(e){this._internalRoot=e}Gh.prototype.render=Wh.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(a(409));var n=t.current;dh(n,jd(),e,t,null,null)},Gh.prototype.unmount=Wh.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;dh(e.current,2,null,e,null,null),zd(),t[kt]=null}};function Gh(e){this._internalRoot=e}Gh.prototype.unstable_scheduleHydration=function(e){if(e){var t=wt();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Ah.length&&t!==0&&t<Ah[n].priority;n++);Ah.splice(n,0,e),n===0&&Fh(e)}};var Kh=r.version;if(Kh!==`19.3.0`)throw Error(a(527,Kh,`19.3.0`));A.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(a(188)):(e=Object.keys(e).join(`,`),Error(a(268,e)));return e=d(t),e=e===null?null:f(e),e=e===null?null:e.stateNode,e};var qh={bundleType:0,version:`19.3.0`,rendererPackageName:`react-dom`,currentDispatcherRef:k,reconcilerVersion:`19.3.0`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var Jh=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Jh.isDisabled&&Jh.supportsFiber)try{et=Jh.inject(qh),tt=Jh}catch{}}e.createRoot=function(e,t){if(!o(e))throw Error(a(299));var n=!1,r=``,i=Cc,s=wc,c=Tc;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(i=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=lh(e,1,!1,null,null,n,r,null,i,s,c,Uh),e[kt]=t.current,Wf(e),new Wh(t)}})),Gs=n(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=Ws()})),Ks=Gs(),qs=`app-login`,Js=`--app-login-accent-color`,Ys=[10,22,40,58,75,88,100,88,76,62],Xs=te.colors.indigo,Zs=Oa({colors:{accent:Xs},primaryColor:`accent`,autoContrast:!0,defaultRadius:`sm`}),Qs=()=>({variables:Object.fromEntries(Ys.flatMap((e,t)=>[[`${Js}-${t}`,t===6?`var(${Js})`:`color-mix(in oklab, var(${Js}) ${e}%, ${t<6?`white`:`black`})`],[`--mantine-color-accent-${t}`,`var(${Js}-${t}, ${Xs[t]})`]])),light:{"--mantine-color-accent-outline-hover":`color-mix(in srgb, var(--mantine-color-accent-6) 5%, transparent)`},dark:{"--mantine-color-accent-light":`color-mix(in srgb, var(--mantine-color-accent-9) 50%, black)`,"--mantine-color-accent-light-hover":`color-mix(in srgb, var(--mantine-color-accent-9) 70%, black)`,"--mantine-color-accent-outline-hover":`color-mix(in srgb, var(--mantine-color-accent-4) 5%, transparent)`}});function $s(e){let t=As();return(0,R.jsx)(Da,{theme:Zs,cssVariablesResolver:Qs,forceColorScheme:t,cssVariablesSelector:`.${qs}`,deduplicateCssVariables:!1,getRootElement:()=>void 0,children:(0,R.jsx)(`div`,{className:qs,"data-mantine-color-scheme":t,children:(0,R.jsx)(Fs,{...e})})})}function ec(e,t){let n=(0,Ks.createRoot)(e),r=t,i=()=>n.render((0,R.jsx)(F.StrictMode,{children:(0,R.jsx)($s,{...r})}));return i(),{update(e){r={...r,...e},i()},unmount(){n.unmount()}}}var tc=`modulepreload`,nc=function(e,t){return new URL(e,t).href},rc={},ic=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=nc(t,n),t=s(t),t in rc)return;rc[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:tc,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};function ac(e,t){customElements.get(e)===void 0&&customElements.define(e,t)}var oc=async()=>{ac(`planned-demo`,(await ic(async()=>{let{PlannedDemo:e}=await import(`./PlannedDemo-BHjwPf6Q.js`);return{PlannedDemo:e}},[],import.meta.url)).PlannedDemo)},sc=e=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`;customElements.define(`app-cockpit`,Ji({title:`Back Office`,subtitle:`Acme Corporate`,search:!0,recent:!1,collapsibleGroups:!1,taskbar:!0,groups:[{name:`Main`,subgroups:[{name:`Apps`},{name:`Administration`,placement:`pinned`}]},{name:`Internals`,subgroups:[{name:`Components`,icon:sc(`<path d="M3 12l3 3l3 -3l-3 -3z"/><path d="M15 12l3 3l3 -3l-3 -3z"/><path d="M9 6l3 3l3 -3l-3 -3z"/><path d="M9 18l3 3l3 -3l-3 -3z"/>`)},{name:`Planned`,icon:sc(`<path d="M6.5 7h11"/><path d="M6.5 17h11"/><path d="M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z"/><path d="M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1z"/>`)}]}],defaultItem:`human-resources`,storageKey:`essential-components`,footer:{actions:[ye(`app-cockpit`,{scheme:`dark`,nav:`top`,startPage:!0}),ge(`indigo`),...me({schemes:[`system`,`light`,`dark`],scheme:`light`})],menu:be},user:xe,userMenu:Se(()=>mc()),items:[{id:`human-resources`,title:`Human Resources`,description:`Employees, departments, recruiting, onboarding and offboarding`,group:`Main`,subgroup:`Apps`,placement:`pinned`,icon:sc(`<path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1"/><path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M17 10h2a2 2 0 0 1 2 2v1"/><path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M3 13v-1a2 2 0 0 1 2 -2h2"/>`),element:`human-resources-demo`,load:async()=>{ac(`human-resources-demo`,(await ic(async()=>{let{HumanResourcesDemo:e}=await import(`./HumanResourcesDemo-C5rk4nCp.js`);return{HumanResourcesDemo:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]),import.meta.url)).HumanResourcesDemo)}},{id:`time-tracker`,title:`Time Tracker`,description:`The clock, timesheets, leave, sick calls and the team calendar`,group:`Main`,subgroup:`Apps`,placement:`pinned`,icon:sc(`<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>`),element:`time-tracker-demo`,load:async()=>{ac(`time-tracker-demo`,(await ic(async()=>{let{TimeTrackerDemo:e}=await import(`./TimeTrackerDemo-BWt-wNDV.js`);return{TimeTrackerDemo:e}},__vite__mapDeps([21,1,2,3,4,5,6,7,8,9,10,13,15,22,12,16,17,23,18,19,24]),import.meta.url)).TimeTrackerDemo)}},{id:`board-manager`,title:`Board Manager`,description:`Boards, meetings, agendas, minutes and documents`,group:`Main`,subgroup:`Apps`,placement:`pinned`,icon:sc(`<path d="M3 4l18 0"/><path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10"/><path d="M12 16l0 4"/><path d="M9 20l6 0"/><path d="M8 12l3 -3l2 2l3 -3"/>`),element:`board-manager-demo`,load:async()=>{ac(`board-manager-demo`,(await ic(async()=>{let{BoardManagerDemo:e}=await import(`./BoardManagerDemo-CzzY_b7L.js`);return{BoardManagerDemo:e}},__vite__mapDeps([25,1,2,3,4,5,6,7,8,9,10,11,12,22,18,26,19,27]),import.meta.url)).BoardManagerDemo)}},{id:`file-center`,title:`File Center`,description:`Storages, folders and files, like a file manager`,group:`Main`,subgroup:`Administration`,icon:sc(`<path d="M9 3h3l2 2h5a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"/><path d="M17 16v2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h2"/>`),element:`file-center-demo`,load:async()=>{ac(`file-center-demo`,(await ic(async()=>{let{FileCenterDemo:e}=await import(`./FileCenterDemo-DrE2moLQ.js`);return{FileCenterDemo:e}},__vite__mapDeps([28,1,2,3,4,6,29,15,17,23,10,19,30]),import.meta.url)).FileCenterDemo)}},{id:`user-manager`,title:`User Manager`,description:`Users, groups, roles, and who may do what where`,group:`Main`,subgroup:`Administration`,icon:sc(`<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/><path d="M11 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12l0 2.5"/>`),element:`user-manager-demo`,load:async()=>{ac(`user-manager-demo`,(await ic(async()=>{let{UserManagerDemo:e}=await import(`./UserManagerDemo-BSG3GULE.js`);return{UserManagerDemo:e}},__vite__mapDeps([31,1,2,3,4,5,6,11,12,29,13,14,15,22,23,10,18,32]),import.meta.url)).UserManagerDemo)}},{id:`data-navigator`,title:`Data navigator`,description:`A data table: search, filters, sorting, paging`,group:`Internals`,subgroup:`Components`,element:`data-navigator-demo`,load:async()=>{ac(`data-navigator-demo`,(await ic(async()=>{let{DataNavigatorDemo:e}=await import(`./DataNavigatorDemo-DiXR2rAj.js`);return{DataNavigatorDemo:e}},__vite__mapDeps([33,1,10,4,34]),import.meta.url)).DataNavigatorDemo)}},{id:`file-upload`,title:`File upload`,description:`Drop or choose files, with progress and validation`,group:`Internals`,subgroup:`Components`,element:`file-upload-demo`,load:async()=>{ac(`file-upload-demo`,(await ic(async()=>{let{FileUploadDemo:e}=await import(`./FileUploadDemo-Bw3QS59b.js`);return{FileUploadDemo:e}},__vite__mapDeps([35,1,19,36,37]),import.meta.url)).FileUploadDemo)}},{id:`dialogs-toasts`,title:`Dialogs + Toasts`,description:`Confirmations, prompts, forms in dialogs, and toasts`,group:`Internals`,subgroup:`Components`,element:`overlays-demo`,load:async()=>{ac(`overlays-demo`,(await ic(async()=>{let{OverlaysDemo:e}=await import(`./OverlaysDemo-BLKSUpyy.js`);return{OverlaysDemo:e}},__vite__mapDeps([38,1,2,3,4,7,8,11,12,26,39]),import.meta.url)).OverlaysDemo)}},{id:`form-validation`,title:`Form validation`,description:`Validated forms with Zod, a useForm hook for React`,group:`Internals`,subgroup:`Components`,element:`form-validation-demo`,load:async()=>{ac(`form-validation-demo`,(await ic(async()=>{let{FormValidationDemo:e}=await import(`./FormValidationDemo-WVwUfZjB.js`);return{FormValidationDemo:e}},__vite__mapDeps([40,1,18,41]),import.meta.url)).FormValidationDemo)}},{id:`autocomplete`,title:`Autocomplete`,description:`A text input that suggests as you type`,group:`Internals`,subgroup:`Planned`,element:`planned-demo`,attributes:{description:`A text input that suggests as you type: local or loaded options, keyboard friendly, accessible.`,note:`Planned: there is no package and no demo yet.`},load:oc}]}));var cc=document.querySelector(`app-cockpit`),lc=document.createElement(`div`),uc,dc=`<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" opacity="0.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" opacity="0.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>`;function fc(e){try{localStorage.setItem(`demo-page:signed-in`,String(e))}catch{}}var pc=!1;async function mc(){pc||=(pc=!0,fc(!1),cc.dataset.fading=``,await new Promise(e=>setTimeout(e,parseFloat(getComputedStyle(cc).transitionDuration)*1e3||0)),delete cc.dataset.fading,hc(),!1)}function hc(){cc.hidden=!0,lc.className=`login-host`,document.body.append(lc),uc??=ec(lc,{title:`Back Office`,subtitle:`Welcome to Acme Corporate`,logo:dc,hint:`A demo: any username and password sign in.`,providers:[{id:`microsoft`,label:`Microsoft`,icon:`<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8.5" height="8.5" fill="#f25022"/><rect x="12.5" y="3" width="8.5" height="8.5" fill="#7fba00"/><rect x="3" y="12.5" width="8.5" height="8.5" fill="#00a4ef"/><rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#ffb900"/></svg>`},{id:`google`,label:`Google`},{id:`sso`,label:`Company SSO`,icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15 19 4M18 5l3 3M15 8l2 2"/></svg>`}],onProvider:async()=>{await new Promise(e=>setTimeout(e,700)),gc()},onForgotPassword:()=>new Promise(e=>setTimeout(e,600)),onRegister:async({username:e})=>{if(await new Promise(e=>setTimeout(e,600)),e.toLowerCase()===`taken`)throw Error(`This username is already taken.`)},onLogin:async()=>{await new Promise(e=>setTimeout(e,500)),gc()}})}function gc(){fc(!0),uc?.unmount(),uc=void 0,lc.remove(),cc.hidden=!1}try{localStorage.getItem(`demo-page:signed-in`)===`false`&&hc()}catch{}export{Lt as $,aa as A,yr as B,ka as C,sa as D,ua as E,ti as F,xn as G,yn as H,P as I,En as J,Cn as K,Lr as L,ra as M,$i as N,L as O,Qi as P,Sn as Q,br as R,z as S,Da as T,_n as U,wn as V,Dn as W,mn as X,vn as Y,bn as Z,co as _,Xe as _t,ys as a,wt as at,Va as b,Ze as bt,Zo as c,Et as ct,V as d,je as dt,yt as et,Po as f,Me as ft,mo as g,Ie as gt,ko as h,Re as ht,bs as i,Ct as it,ia as j,I as k,Ho as l,Tt as lt,B as m,Pe as mt,Gs as n,zt as nt,hs as o,It as ot,Mo as p,Oe as pt,Tn as q,Ds as r,bt as rt,ts as s,St as st,ic as t,Vt as tt,H as u,Ft as ut,ro as v,Ne as vt,Oa as w,Pa as x,Ya as y,Le as yt,N as z};