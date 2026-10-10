import{a as e,n as t,t as n}from"./jsx-runtime-D3jfb0Ew.js";import{F as r,I as i,M as a,R as o,S as s,V as c,d as l,j as u,n as d,r as f,t as p,u as m,y as h}from"./Box-CjRaXhaV.js";import{a as g,c as _,i as v,l as y,o as b,r as x,s as S,t as C,u as w}from"./floating-ui.react-dom-DrVqXbfF.js";import{$ as T,A as E,C as D,D as O,M as k,U as A,at as j,b as M,et as N,it as P,j as F,k as I,lt as L,nt as ee,ot as R,rt as z,st as B,tt as V,ut as te}from"./index-DdDBWYuA.js";var H=e(t(),1);function U(e){return Array.isArray(e)||e===null?!1:typeof e==`object`&&e.type!==H.Fragment}function ne(e){let t=(0,H.createContext)(null);return[t,()=>{let n=(0,H.use)(t);if(n===null)throw Error(e);return n}]}var re={app:100,modal:200,popover:300,overlay:400,max:9999};function ie(e){return re[e]}var ae=()=>{};function oe(e,t={active:!0}){return typeof e!=`function`||!t.active?t.onKeyDown||ae:n=>{n.key===`Escape`&&(e(n),t.onTrigger?.())}}function se(e,t){return n=>{e?.(n),t?.(n)}}function ce(e){let t=(0,H.useRef)(e);return(0,H.useEffect)(()=>{t.current=e}),(0,H.useMemo)(()=>((...e)=>t.current?.(...e)),[])}function le(e,t){let{delay:n,flushOnUnmount:r,leading:i,maxWait:a}=typeof t==`number`?{delay:t,flushOnUnmount:!1,leading:!1,maxWait:void 0}:t,o=ce(e),s=(0,H.useRef)(0),c=(0,H.useRef)(0),l=(0,H.useRef)(null),u=(0,H.useMemo)(()=>{let e=Object.assign((...t)=>{window.clearTimeout(s.current),l.current=t;let r=e._isFirstCall;e._isFirstCall=!1;function u(){window.clearTimeout(s.current),window.clearTimeout(c.current),s.current=0,c.current=0,e._isFirstCall=!0,e._hasPendingCallback=!1}function d(){a!==void 0&&c.current===0&&(c.current=window.setTimeout(()=>{if(s.current!==0){let e=l.current;u(),o(...e)}},a))}if(i&&r){o(...t),e.flush=()=>{s.current!==0&&(u(),o(...t))},e.cancel=()=>{u()},s.current=window.setTimeout(()=>{u()},n),d();return}if(i&&!r){e._hasPendingCallback=!0,e.flush=()=>{s.current!==0&&(u(),o(...t))},e.cancel=()=>{u()},s.current=window.setTimeout(()=>{u()},n),d();return}e._hasPendingCallback=!0;let f=()=>{s.current!==0&&(u(),o(...t))};e.flush=f,e.cancel=()=>{u()},s.current=window.setTimeout(f,n),d()},{flush:()=>{},cancel:()=>{},isPending:()=>e._hasPendingCallback,_isFirstCall:!0,_hasPendingCallback:!1});return e},[o,n,i,a]);return(0,H.useEffect)(()=>()=>{r?u.flush():u.cancel()},[u,r]),u}var ue=[`mousedown`,`touchstart`];function de(e,t,n,r=!0){let i=(0,H.useRef)(null),a=t||ue,o=(0,H.useEffectEvent)(t=>{let{target:r}=t??{};if(!document.body.contains(r)&&r?.tagName!==`HTML`)return;let a=t.composedPath();Array.isArray(n)?n.every(e=>!!e&&!a.includes(e))&&e(t):i.current&&!a.includes(i.current)&&e(t)}),s=a.join(`,`);return(0,H.useEffect)(()=>{if(!r)return;let e=s.split(`,`);return e.forEach(e=>document.addEventListener(e,o)),()=>{e.forEach(e=>document.removeEventListener(e,o))}},[s,r]),i}function fe({opened:e,shouldReturnFocus:t=!0}){let n=(0,H.useRef)(null),r=()=>{n.current&&`focus`in n.current&&typeof n.current.focus==`function`&&n.current?.focus({preventScroll:!0})};return F(()=>{let i=-1,a=e=>{e.key===`Tab`&&window.clearTimeout(i)};if(document.addEventListener(`keydown`,a),e)n.current=document.activeElement;else if(t){let e=document.activeElement;i=window.setTimeout(()=>{let t=document.activeElement;(t===null||t===document.body||t===e)&&r()},10)}return()=>{window.clearTimeout(i),document.removeEventListener(`keydown`,a)}},[e,t]),r}var pe=/input|select|textarea|button|object/,me=`a, input, select, textarea, button, object, [tabindex]`;function he(e){return e.style.display===`none`}function ge(e){if(e.getAttribute(`aria-hidden`)||e.getAttribute(`hidden`)||e.getAttribute(`type`)===`hidden`)return!1;let t=e;for(;t&&t!==document.body&&t.nodeType!==11;){if(he(t))return!1;t=t.parentNode}return!0}function _e(e){let t=e.getAttribute(`tabindex`);return t===null&&(t=void 0),parseInt(t,10)}function ve(e){let t=e.nodeName.toLowerCase(),n=!Number.isNaN(_e(e));return(pe.test(t)&&!e.disabled||e instanceof HTMLAnchorElement&&e.href||n)&&ge(e)}function ye(e){let t=_e(e);return(Number.isNaN(t)||t>=0)&&ve(e)}function be(e){return Array.from(e.querySelectorAll(me)).filter(ye)}function xe(e,t){let n=be(e);if(!n.length){t.preventDefault();return}let r=n[t.shiftKey?0:n.length-1],i=e.getRootNode(),a=r===i.activeElement||e===i.activeElement,o=i.activeElement;if(o.tagName===`INPUT`&&o.getAttribute(`type`)===`radio`&&(a=n.filter(e=>e.getAttribute(`type`)===`radio`&&e.getAttribute(`name`)===o.getAttribute(`name`)).includes(r)),!a)return;t.preventDefault();let s=n[t.shiftKey?n.length-1:0];s&&s.focus()}function Se(e=!0){let t=(0,H.useRef)(null),n=e=>{let t=e.querySelector(`[data-autofocus]`);if(!t){let n=Array.from(e.querySelectorAll(me));t=n.find(ye)||n.find(ve)||null,!t&&ve(e)&&(t=e)}t?t.focus({preventScroll:!0}):console.warn(`[@mantine/hooks/use-focus-trap] Failed to find focusable element within provided node`,e)},r=(0,H.useCallback)(r=>{if(e){if(r===null){t.current=null;return}t.current!==r&&(setTimeout(()=>{r.getRootNode()?n(r):console.warn(`[@mantine/hooks/use-focus-trap] Ref node is not part of the dom`,r)}),t.current=r)}},[e]);return(0,H.useEffect)(()=>{if(!e)return;t.current&&setTimeout(()=>{t.current&&n(t.current)});let r=e=>{e.key===`Tab`&&t.current&&xe(t.current,e)};return document.addEventListener(`keydown`,r),()=>document.removeEventListener(`keydown`,r)},[e]),r}function Ce(e,t){if(typeof e==`function`)return e(t);typeof e==`object`&&e&&`current`in e&&(e.current=t)}function W(...e){let t=new Map;return n=>{if(e.forEach(e=>{let r=Ce(e,n);r&&t.set(e,r)}),t.size>0)return()=>{e.forEach(e=>{let n=t.get(e);n&&typeof n==`function`?n():Ce(e,null)}),t.clear()}}}function we(...e){return(0,H.useCallback)(W(...e),e)}var Te=[`mouse`,`touch`],Ee=10;function De(e,t={}){let{threshold:n=400,events:r=Te,cancelOnMove:i=!1,onStart:a,onFinish:o,onCancel:s}=t,c=(0,H.useRef)(!1),l=(0,H.useRef)(!1),u=(0,H.useRef)(-1),d=(0,H.useRef)(null);return(0,H.useEffect)(()=>()=>window.clearTimeout(u.current),[]),(0,H.useMemo)(()=>{if(typeof e!=`function`)return{};let t=i!==!1,f=i===!0?Ee:i===!1?0:i,p=t=>{(Ae(t)||ke(t))&&(a&&a(t),d.current=Oe(t),l.current=!0,u.current=window.setTimeout(()=>{e(t),c.current=!0},n))},m=e=>{(Ae(e)||ke(e))&&(c.current?o&&o(e):l.current&&s&&s(e),c.current=!1,l.current=!1,d.current=null,u.current!==-1&&(window.clearTimeout(u.current),u.current=-1))},h=e=>{if(!t||!l.current||c.current)return;let n=Oe(e);if(!n||!d.current)return;let r=n.x-d.current.x,i=n.y-d.current.y;Math.sqrt(r*r+i*i)>f&&m(e)},g={};return r.includes(`mouse`)&&(g.onMouseDown=p,g.onMouseUp=m,g.onMouseLeave=m,t&&(g.onMouseMove=h)),r.includes(`touch`)&&(g.onTouchStart=p,g.onTouchEnd=m,g.onTouchCancel=m,t&&(g.onTouchMove=h)),g},[e,n,s,o,a,i,r.join(`,`)])}function Oe(e){if(ke(e)){let t=e.touches[0]??e.changedTouches[0];return t?{x:t.clientX,y:t.clientY}:null}return{x:e.clientX,y:e.clientY}}function ke(e){return window.TouchEvent?e.nativeEvent instanceof TouchEvent:`touches`in e.nativeEvent}function Ae(e){return e.nativeEvent instanceof MouseEvent}var je=e(O(),1);function Me(e){return e?.props?.ref}function Ne(e){let t=H.Children.toArray(e);return t.length!==1||!U(t[0])?null:t[0]}var G=n(),Pe=(0,H.createContext)({dir:`ltr`,toggleDirection:()=>{},setDirection:()=>{}});function Fe(){return(0,H.use)(Pe)}var[Ie,Le]=ne(`ScrollArea.Root component was not found in tree`);function Re(e,t){let n=(0,H.useEffectEvent)(t);k(()=>{let t=0;if(e){let r=new ResizeObserver(()=>{cancelAnimationFrame(t),t=window.requestAnimationFrame(n)});return r.observe(e),()=>{window.cancelAnimationFrame(t),r.unobserve(e)}}},[e])}function ze(e){let{style:t,...n}=e,r=Le(),[i,a]=(0,H.useState)(0),[o,s]=(0,H.useState)(0),c=!!(i&&o);return Re(r.scrollbarX,()=>{let e=r.scrollbarX?.offsetHeight||0;r.onCornerHeightChange(e),s(e)}),Re(r.scrollbarY,()=>{let e=r.scrollbarY?.offsetWidth||0;r.onCornerWidthChange(e),a(e)}),c?(0,G.jsx)(`div`,{...n,style:{...t,width:i,height:o}}):null}function Be(e){let t=Le(),n=!!(t.scrollbarX&&t.scrollbarY);return t.type!==`scroll`&&n?(0,G.jsx)(ze,{...e}):null}var Ve={scrollHideDelay:1e3,type:`hover`};function He(e){let{type:t,scrollHideDelay:n,scrollbars:r,getStyles:i,ref:a,...o}=l(`ScrollAreaRoot`,Ve,e),[s,c]=(0,H.useState)(null),[u,d]=(0,H.useState)(null),[f,m]=(0,H.useState)(null),[h,g]=(0,H.useState)(null),[_,v]=(0,H.useState)(null),[y,b]=(0,H.useState)(0),[x,S]=(0,H.useState)(0),[C,w]=(0,H.useState)(!1),[T,E]=(0,H.useState)(!1),D=we(a,c);return(0,G.jsx)(Ie,{value:{type:t,scrollHideDelay:n,scrollArea:s,viewport:u,onViewportChange:d,content:f,onContentChange:m,scrollbarX:h,onScrollbarXChange:g,scrollbarXEnabled:C,onScrollbarXEnabledChange:w,scrollbarY:_,onScrollbarYChange:v,scrollbarYEnabled:T,onScrollbarYEnabledChange:E,onCornerWidthChange:b,onCornerHeightChange:S,getStyles:i},children:(0,G.jsx)(p,{...o,ref:D,__vars:{"--sa-corner-width":r===`xy`?`${y}px`:`0px`,"--sa-corner-height":r===`xy`?`${x}px`:`0px`}})})}He.displayName=`@mantine/core/ScrollAreaRoot`;function Ue(e,t){let n=e/t;return Number.isNaN(n)?0:n}function We(e){let t=Ue(e.viewport,e.content),n=e.scrollbar.paddingStart+e.scrollbar.paddingEnd,r=(e.scrollbar.size-n)*t;return Math.max(r,18)}function Ge(e,t){return n=>{if(e[0]===e[1]||t[0]===t[1])return t[0];let r=(t[1]-t[0])/(e[1]-e[0]);return t[0]+r*(n-e[0])}}function Ke(e,[t,n]){return Math.min(n,Math.max(t,e))}function qe(e,t,n=`ltr`){let r=We(t),i=t.scrollbar.paddingStart+t.scrollbar.paddingEnd,a=t.scrollbar.size-i,o=t.content-t.viewport,s=a-r,c=Ke(e,n===`ltr`?[0,o]:[o*-1,0]);return Ge([0,o],[0,s])(c)}function Je(e,t,n,r=`ltr`){let i=We(n),a=i/2,o=t||a,s=i-o,c=n.scrollbar.paddingStart+o,l=n.scrollbar.size-n.scrollbar.paddingEnd-s,u=n.content-n.viewport,d=r===`ltr`?[0,u]:[u*-1,0];return Ge([c,l],d)(e)}function Ye(e,t){return e>0&&e<t}function Xe(e){return e?parseInt(e,10):0}function Ze(e,t,{checkForDefaultPrevented:n=!0}={}){return r=>{e?.(r),(n===!1||!r.defaultPrevented)&&t?.(r)}}var[Qe,$e]=ne(`ScrollAreaScrollbar was not found in tree`);function et(e){let{sizes:t,hasThumb:n,onThumbChange:r,onThumbPointerUp:i,onThumbPointerDown:a,onThumbPositionChange:o,onDragScroll:s,onWheelScroll:c,onResize:l,ref:u,...d}=e,f=Le(),[p,m]=(0,H.useState)(null),h=we(u,m),g=(0,H.useRef)(null),_=(0,H.useRef)(``),{viewport:v}=f,y=t.content-t.viewport,b=(0,H.useEffectEvent)(c),x=ce(o),S=le(l,10),C=e=>{if(g.current){let t=e.clientX-g.current.left,n=e.clientY-g.current.top;s({x:t,y:n})}};return(0,H.useEffect)(()=>{let e=e=>{let t=e.target;p?.contains(t)&&b(e,y)};return document.addEventListener(`wheel`,e,{passive:!1}),()=>document.removeEventListener(`wheel`,e,{passive:!1})},[v,p,y]),(0,H.useEffect)(x,[t,x]),Re(p,S),Re(f.content,S),(0,G.jsx)(Qe,{value:{scrollbar:p,hasThumb:n,onThumbChange:ce(r),onThumbPointerUp:ce(i),onThumbPositionChange:x,onThumbPointerDown:ce(a)},children:(0,G.jsx)(`div`,{...d,ref:h,"data-mantine-scrollbar":!0,style:{position:`absolute`,...d.style},onPointerDown:Ze(e.onPointerDown,e=>{e.preventDefault(),e.button===0&&(e.target.setPointerCapture(e.pointerId),g.current=p.getBoundingClientRect(),_.current=document.body.style.webkitUserSelect,document.body.style.webkitUserSelect=`none`,C(e))}),onPointerMove:Ze(e.onPointerMove,C),onPointerUp:Ze(e.onPointerUp,e=>{let t=e.target;t.hasPointerCapture(e.pointerId)&&(e.preventDefault(),t.releasePointerCapture(e.pointerId))}),onLostPointerCapture:()=>{document.body.style.webkitUserSelect=_.current,g.current=null}})})}var tt=e=>{let{sizes:t,onSizesChange:n,style:r,ref:i,...a}=e,o=Le(),[s,c]=(0,H.useState)(),l=(0,H.useRef)(null),u=we(i,l,o.onScrollbarXChange);return(0,H.useEffect)(()=>{l.current&&c(getComputedStyle(l.current))},[l]),(0,G.jsx)(et,{"data-orientation":`horizontal`,...a,ref:u,sizes:t,style:{...r,"--sa-thumb-width":`${We(t)}px`},onThumbPointerDown:t=>e.onThumbPointerDown(t.x),onDragScroll:t=>e.onDragScroll(t.x),onWheelScroll:(t,n)=>{if(o.viewport){let r=o.viewport.scrollLeft+t.deltaX;e.onWheelScroll(r),Ye(r,n)&&t.preventDefault()}},onResize:()=>{l.current&&o.viewport&&s&&n({content:o.viewport.scrollWidth,viewport:o.viewport.offsetWidth,scrollbar:{size:l.current.clientWidth,paddingStart:Xe(s.paddingLeft),paddingEnd:Xe(s.paddingRight)}})}})};tt.displayName=`@mantine/core/ScrollAreaScrollbarX`;function nt(e){let{sizes:t,onSizesChange:n,style:r,ref:i,...a}=e,o=Le(),[s,c]=(0,H.useState)(),l=(0,H.useRef)(null),u=we(i,l,o.onScrollbarYChange);return(0,H.useEffect)(()=>{l.current&&c(window.getComputedStyle(l.current))},[]),(0,G.jsx)(et,{...a,"data-orientation":`vertical`,ref:u,sizes:t,style:{"--sa-thumb-height":`${We(t)}px`,...r},onThumbPointerDown:t=>e.onThumbPointerDown(t.y),onDragScroll:t=>e.onDragScroll(t.y),onWheelScroll:(t,n)=>{if(o.viewport){let r=o.viewport.scrollTop+t.deltaY;e.onWheelScroll(r),Ye(r,n)&&t.preventDefault()}},onResize:()=>{l.current&&o.viewport&&s&&n({content:o.viewport.scrollHeight,viewport:o.viewport.offsetHeight,scrollbar:{size:l.current.clientHeight,paddingStart:Xe(s.paddingTop),paddingEnd:Xe(s.paddingBottom)}})}})}nt.displayName=`@mantine/core/ScrollAreaScrollbarY`;function rt(e){let{orientation:t=`vertical`,...n}=e,{dir:r}=Fe(),i=Le(),a=(0,H.useRef)(null),o=(0,H.useRef)(0),[s,c]=(0,H.useState)({content:0,viewport:0,scrollbar:{size:0,paddingStart:0,paddingEnd:0}}),l=Ue(s.viewport,s.content),u={...n,sizes:s,onSizesChange:c,hasThumb:l>0&&l<1,onThumbChange:e=>{a.current=e},onThumbPointerUp:()=>{o.current=0},onThumbPointerDown:e=>{o.current=e}},d=(e,t)=>Je(e,o.current,s,t);return t===`horizontal`?(0,G.jsx)(tt,{...u,onThumbPositionChange:()=>{if(i.viewport&&a.current){let e=i.viewport.scrollLeft,t=qe(e,s,r);a.current.style.transform=`translate3d(${t}px, 0, 0)`}},onWheelScroll:e=>{i.viewport&&(i.viewport.scrollLeft=e)},onDragScroll:e=>{i.viewport&&(i.viewport.scrollLeft=d(e,r))}}):t===`vertical`?(0,G.jsx)(nt,{...u,onThumbPositionChange:()=>{if(i.viewport&&a.current){let e=i.viewport.scrollTop,t=qe(e,s);s.scrollbar.size===0?a.current.style.setProperty(`--thumb-opacity`,`0`):a.current.style.setProperty(`--thumb-opacity`,`1`),a.current.style.transform=`translate3d(0, ${t}px, 0)`}},onWheelScroll:e=>{i.viewport&&(i.viewport.scrollTop=e)},onDragScroll:e=>{i.viewport&&(i.viewport.scrollTop=d(e))}}):null}rt.displayName=`@mantine/core/ScrollAreaScrollbarVisible`;function it(e){let t=Le(),{forceMount:n,...r}=e,[i,a]=(0,H.useState)(!1),o=e.orientation===`horizontal`,s=le(()=>{if(t.viewport){let e=t.viewport.offsetWidth<t.viewport.scrollWidth,n=t.viewport.offsetHeight<t.viewport.scrollHeight;a(o?e:n)}},10);return Re(t.viewport,s),Re(t.content,s),n||i?(0,G.jsx)(rt,{"data-state":i?`visible`:`hidden`,...r}):null}it.displayName=`@mantine/core/ScrollAreaScrollbarAuto`;function at(e){let{forceMount:t,...n}=e,r=Le(),[i,a]=(0,H.useState)(!1);return(0,H.useEffect)(()=>{let{scrollArea:e}=r,t=0;if(e){let n=()=>{window.clearTimeout(t),a(!0)},i=()=>{t=window.setTimeout(()=>a(!1),r.scrollHideDelay)};return e.addEventListener(`pointerenter`,n),e.addEventListener(`pointerleave`,i),()=>{window.clearTimeout(t),e.removeEventListener(`pointerenter`,n),e.removeEventListener(`pointerleave`,i)}}},[r.scrollArea,r.scrollHideDelay]),t||i?(0,G.jsx)(it,{"data-state":i?`visible`:`hidden`,...n}):null}at.displayName=`@mantine/core/ScrollAreaScrollbarHover`;function ot(e){let{forceMount:t,...n}=e,r=Le(),i=e.orientation===`horizontal`,[a,o]=(0,H.useState)(`hidden`),s=le(()=>o(`idle`),100);return(0,H.useEffect)(()=>{if(a===`idle`){let e=window.setTimeout(()=>o(`hidden`),r.scrollHideDelay);return()=>window.clearTimeout(e)}},[a,r.scrollHideDelay]),(0,H.useEffect)(()=>{let{viewport:e}=r,t=i?`scrollLeft`:`scrollTop`;if(e){let n=e[t],r=()=>{let r=e[t];n!==r&&(o(`scrolling`),s()),n=r};return e.addEventListener(`scroll`,r),()=>e.removeEventListener(`scroll`,r)}},[r.viewport,i,s]),t||a!==`hidden`?(0,G.jsx)(rt,{"data-state":a===`hidden`?`hidden`:`visible`,...n,onPointerEnter:Ze(e.onPointerEnter,()=>o(`interacting`)),onPointerLeave:Ze(e.onPointerLeave,()=>o(`idle`))}):null}function st(e){let{forceMount:t,...n}=e,r=Le(),{onScrollbarXEnabledChange:i,onScrollbarYEnabledChange:a}=r,o=e.orientation===`horizontal`;return(0,H.useEffect)(()=>(o?i(!0):a(!0),()=>{o?i(!1):a(!1)}),[o,i,a]),r.type===`hover`?(0,G.jsx)(at,{...n,forceMount:t}):r.type===`scroll`?(0,G.jsx)(ot,{...n,forceMount:t}):r.type===`auto`?(0,G.jsx)(it,{...n,forceMount:t}):r.type===`always`?(0,G.jsx)(rt,{...n}):null}st.displayName=`@mantine/core/ScrollAreaScrollbar`;function ct(e,t=()=>{}){let n={left:e.scrollLeft,top:e.scrollTop},r=0;return(function i(){let a={left:e.scrollLeft,top:e.scrollTop},o=n.left!==a.left,s=n.top!==a.top;(o||s)&&t(),n=a,r=window.requestAnimationFrame(i)})(),()=>window.cancelAnimationFrame(r)}function lt(e){let{style:t,ref:n,...r}=e,i=Le(),a=$e(),{onThumbPositionChange:o}=a,s=we(n,a.onThumbChange),c=(0,H.useRef)(void 0),l=le(()=>{c.current&&=(c.current(),void 0)},100);return(0,H.useEffect)(()=>{let{viewport:e}=i;if(e){let t=()=>{if(l(),!c.current){let t=ct(e,o);c.current=t,o()}};return o(),e.addEventListener(`scroll`,t),()=>e.removeEventListener(`scroll`,t)}},[i.viewport,l,o]),(0,G.jsx)(`div`,{"data-state":a.hasThumb?`visible`:`hidden`,...r,ref:s,style:{width:`var(--sa-thumb-width)`,height:`var(--sa-thumb-height)`,...t},onPointerDownCapture:Ze(e.onPointerDownCapture,e=>{let t=e.target.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;a.onThumbPointerDown({x:n,y:r})}),onPointerUp:Ze(e.onPointerUp,a.onThumbPointerUp)})}lt.displayName=`@mantine/core/ScrollAreaThumb`;function ut(e){let{forceMount:t,...n}=e,r=$e();return t||r.hasThumb?(0,G.jsx)(lt,{...n}):null}ut.displayName=`@mantine/core/ScrollAreaThumb`;function dt({children:e,style:t,ref:n,onWheel:r,...i}){let a=Le(),o=we(n,a.onViewportChange),s=e=>{if(r?.(e),a.scrollbarXEnabled&&a.viewport&&e.shiftKey){let{scrollTop:t,scrollHeight:n,clientHeight:r,scrollWidth:i,clientWidth:o}=a.viewport,s=t<1,c=t>=n-r-1;i>o&&(s||c)&&e.stopPropagation()}};return(0,G.jsx)(p,{...i,ref:o,onWheel:s,"data-scrollarea-viewport":!0,style:{overflowX:a.scrollbarXEnabled?`scroll`:`hidden`,overflowY:a.scrollbarYEnabled?`scroll`:`hidden`,...t},children:(0,G.jsx)(`div`,{...a.getStyles(`content`),ref:a.onContentChange,children:e})})}dt.displayName=`@mantine/core/ScrollAreaViewport`;var ft={root:`m_d57069b5`,content:`m_b1336c6`,viewport:`m_c0783ff9`,viewportInner:`m_f8f631dd`,scrollbar:`m_c44ba933`,thumb:`m_d8b5e363`,corner:`m_21657268`},pt=[`input:not([inert]):not([inert] *)`,`select:not([inert]):not([inert] *)`,`textarea:not([inert]):not([inert] *)`,`a[href]:not([inert]):not([inert] *)`,`area[href]:not([inert]):not([inert] *)`,`button:not([inert]):not([inert] *)`,`[tabindex]:not(slot):not([inert]):not([inert] *)`,`audio[controls]:not([inert]):not([inert] *)`,`video[controls]:not([inert]):not([inert] *)`,`[contenteditable]:not([contenteditable="false"]):not([inert]):not([inert] *)`,`details>summary:first-of-type:not([inert]):not([inert] *)`,`details:not([inert]):not([inert] *)`].join(`,`),mt=typeof Element>`u`,ht=mt?function(){}:Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector,gt=!mt&&Element.prototype.getRootNode?function(e){return e?.getRootNode?.call(e)}:function(e){return e?.ownerDocument},_t=function(e,t){t===void 0&&(t=!0);var n=e?.getAttribute?.call(e,`inert`);return n===``||n===`true`||t&&e&&(typeof e.closest==`function`?e.closest(`[inert]`):_t(e.parentNode))},vt=function(e){var t=e?.getAttribute?.call(e,`contenteditable`);return t===``||t===`true`},yt=function(e,t,n){if(_t(e))return[];var r=Array.prototype.slice.apply(e.querySelectorAll(pt));return t&&ht.call(e,pt)&&r.unshift(e),r=r.filter(n),r},bt=function(e,t,n){for(var r=[],i=Array.from(e);i.length;){var a=i.shift();if(!_t(a,!1)){if(a.tagName===`SLOT`){var o=a.assignedElements(),s=bt(o.length?o:a.children,!0,n);n.flatten?r.push.apply(r,s):r.push({scopeParent:a,candidates:s})}else{ht.call(a,pt)&&n.filter(a)&&(t||!e.includes(a))&&r.push(a);var c=a.shadowRoot||typeof n.getShadowRoot==`function`&&n.getShadowRoot(a),l=!_t(c,!1)&&(!n.shadowRootFilter||n.shadowRootFilter(a));if(c&&l){var u=bt(c===!0?a.children:c.children,!0,n);n.flatten?r.push.apply(r,u):r.push({scopeParent:a,candidates:u})}else i.unshift.apply(i,a.children)}}}return r},xt=function(e){return!isNaN(parseInt(e.getAttribute(`tabindex`),10))},St=function(e){if(!e)throw Error(`No node provided`);return e.tabIndex<0&&(/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName)||vt(e))&&!xt(e)?0:e.tabIndex},Ct=function(e,t){var n=St(e);return n<0&&t&&!xt(e)?0:n},wt=function(e,t){return e.tabIndex===t.tabIndex?e.documentOrder-t.documentOrder:e.tabIndex-t.tabIndex},Tt=function(e){return e.tagName===`INPUT`},Et=function(e){return Tt(e)&&e.type===`hidden`},Dt=function(e){return e.tagName===`DETAILS`&&Array.prototype.slice.apply(e.children).some(function(e){return e.tagName===`SUMMARY`})},Ot=function(e,t){for(var n=0;n<e.length;n++)if(e[n].checked&&e[n].form===t)return e[n]},kt=function(e){if(!e.name)return!0;var t=e.form||gt(e),n=function(e){return t.querySelectorAll(`input[type="radio"][name="`+e+`"]`)},r;if(typeof window<`u`&&window.CSS!==void 0&&typeof window.CSS.escape==`function`)r=n(window.CSS.escape(e.name));else try{r=n(e.name)}catch(e){return console.error(`Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s`,e.message),!1}var i=Ot(r,e.form);return!i||i===e},At=function(e){return Tt(e)&&e.type===`radio`},jt=function(e){return At(e)&&!kt(e)},Mt=function(e){var t=e&&gt(e),n=t?.host,r=!1;if(t&&t!==e){var i,a,o;for(r=!!((i=n)!=null&&(a=i.ownerDocument)!=null&&a.contains(n)||e!=null&&(o=e.ownerDocument)!=null&&o.contains(e));!r&&n;){var s,c;t=gt(n),n=t?.host,r=!!((s=n)!=null&&(c=s.ownerDocument)!=null&&c.contains(n))}}return r},Nt=function(e){var t=e.getBoundingClientRect(),n=t.width,r=t.height;return n===0&&r===0},Pt=function(e,t){var n=t.displayCheck,r=t.getShadowRoot;if(n===`full-native`&&`checkVisibility`in e)return!e.checkVisibility({checkOpacity:!1,opacityProperty:!1,contentVisibilityAuto:!0,visibilityProperty:!0,checkVisibilityCSS:!0});var i=getComputedStyle(e).visibility;if(i===`hidden`||i===`collapse`)return!0;var a=ht.call(e,`details>summary:first-of-type`)?e.parentElement:e;if(ht.call(a,`details:not([open]) *`))return!0;if(!n||n===`full`||n===`full-native`||n===`legacy-full`){if(typeof r==`function`){for(var o=e;e;){var s=e.parentElement,c=gt(e);if(s&&!s.shadowRoot&&r(s)===!0)return Nt(e);e=e.assignedSlot?e.assignedSlot:!s&&c!==e.ownerDocument?c.host:s}e=o}if(Mt(e))return!e.getClientRects().length;if(n!==`legacy-full`)return!0}else if(n===`non-zero-area`)return Nt(e);return!1},Ft=function(e){if(/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))for(var t=e.parentElement;t;){if(t.tagName===`FIELDSET`&&t.disabled){for(var n=0;n<t.children.length;n++){var r=t.children.item(n);if(r.tagName===`LEGEND`)return ht.call(t,`fieldset[disabled] *`)?!0:!r.contains(e)}return!0}t=t.parentElement}return!1},It=function(e,t){return!(t.disabled||Et(t)||Pt(t,e)||Dt(t)||Ft(t))},Lt=function(e,t){return!(jt(t)||St(t)<0||!It(e,t))},Rt=function(e){var t=parseInt(e.getAttribute(`tabindex`),10);return!!(isNaN(t)||t>=0)},zt=function(e){var t=[],n=[];return e.forEach(function(e,r){var i=!!e.scopeParent,a=i?e.scopeParent:e,o=Ct(a,i),s=i?zt(e.candidates):a;o===0?i?t.push.apply(t,s):t.push(a):n.push({documentOrder:r,tabIndex:o,item:e,isScope:i,content:s})}),n.sort(wt).reduce(function(e,t){return t.isScope?e.push.apply(e,t.content):e.push(t.content),e},[]).concat(t)},Bt=function(e,t){return t||={},zt(t.getShadowRoot?bt([e],t.includeContainer,{filter:Lt.bind(null,t),flatten:!1,getShadowRoot:t.getShadowRoot,shadowRootFilter:Rt}):yt(e,t.includeContainer,Lt.bind(null,t)))},Vt=function(e,t){return t||={},t.getShadowRoot?bt([e],t.includeContainer,{filter:It.bind(null,t),flatten:!0,getShadowRoot:t.getShadowRoot}):yt(e,t.includeContainer,It.bind(null,t))},Ht=function(e,t){if(t||={},!e)throw Error(`No node provided`);return ht.call(e,pt)!==!1&&Lt(t,e)};function Ut(){let e=navigator.userAgentData;return e!=null&&e.platform?e.platform:navigator.platform}function Wt(){let e=navigator.userAgentData;return e&&Array.isArray(e.brands)?e.brands.map(e=>{let{brand:t,version:n}=e;return t+`/`+n}).join(` `):navigator.userAgent}function Gt(){return/apple/i.test(navigator.vendor)}function Kt(){let e=/android/i;return e.test(Ut())||e.test(Wt())}function qt(){return Ut().toLowerCase().startsWith(`mac`)&&!navigator.maxTouchPoints}function Jt(){return Wt().includes(`jsdom/`)}var Yt=`data-floating-ui-focusable`,Xt=`input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])`;function Zt(e){let t=e.activeElement;for(;((n=t)==null||(n=n.shadowRoot)==null?void 0:n.activeElement)!=null;){var n;t=t.shadowRoot.activeElement}return t}function K(e,t){if(!e||!t)return!1;let n=t.getRootNode==null?void 0:t.getRootNode();if(e.contains(t))return!0;if(n&&L(n)){let n=t;for(;n;){if(e===n)return!0;n=n.parentNode||n.host}}return!1}function Qt(e){return`composedPath`in e?e.composedPath()[0]:e.target}function $t(e,t){if(t==null)return!1;if(`composedPath`in e)return e.composedPath().includes(t);let n=e;return n.target!=null&&t.contains(n.target)}function en(e){return e.matches(`html,body`)}function q(e){return e?.ownerDocument||document}function tn(e){return j(e)&&e.matches(Xt)}function nn(e){return e?e.getAttribute(`role`)===`combobox`&&tn(e):!1}function rn(e){if(!e||Jt())return!0;try{return e.matches(`:focus-visible`)}catch{return!0}}function an(e){return e?e.hasAttribute(Yt)?e:e.querySelector(`[`+Yt+`]`)||e:null}function on(e,t,n){return n===void 0&&(n=!0),e.filter(e=>e.parentId===t&&(!n||e.context?.open)).flatMap(t=>[t,...on(e,t.id,n)])}function sn(e,t){let n=[],r=e.find(e=>e.id===t)?.parentId;for(;r;){let t=e.find(e=>e.id===r);r=t?.parentId,t&&(n=n.concat(t))}return n}function cn(e){e.preventDefault(),e.stopPropagation()}function ln(e){return`nativeEvent`in e}function un(e){return e.mozInputSource===0&&e.isTrusted?!0:Kt()&&e.pointerType?e.type===`click`&&e.buttons===1:e.detail===0&&!e.pointerType}function dn(e){return Jt()?!1:!Kt()&&e.width===0&&e.height===0||Kt()&&e.width===1&&e.height===1&&e.pressure===0&&e.detail===0&&e.pointerType===`mouse`||e.width<1&&e.height<1&&e.pressure===0&&e.detail===0&&e.pointerType===`touch`}function fn(e,t){let n=[`mouse`,`pen`];return t||n.push(``,void 0),n.includes(e)}var J=typeof document<`u`?H.useLayoutEffect:function(){},pn={...H};function mn(e){let t=H.useRef(e);return J(()=>{t.current=e}),t}var hn=pn.useInsertionEffect||(e=>e());function Y(e){let t=H.useRef(()=>{});return hn(()=>{t.current=e}),H.useCallback(function(){var e=[...arguments];return t.current==null?void 0:t.current(...e)},[])}var gn=()=>({getShadowRoot:!0,displayCheck:typeof ResizeObserver==`function`&&ResizeObserver.toString().includes(`[native code]`)?`full`:`none`});function _n(e,t){let n=Bt(e,gn()),r=n.length;if(r===0)return;let i=Zt(q(e)),a=n.indexOf(i);return n[a===-1?t===1?0:r-1:a+t]}function vn(e){return _n(q(e).body,1)||e}function yn(e){return _n(q(e).body,-1)||e}function bn(e,t){let n=t||e.currentTarget,r=e.relatedTarget;return!r||!K(n,r)}function xn(e){Bt(e,gn()).forEach(e=>{e.dataset.tabindex=e.getAttribute(`tabindex`)||``,e.setAttribute(`tabindex`,`-1`)})}function Sn(e){e.querySelectorAll(`[data-tabindex]`).forEach(e=>{let t=e.dataset.tabindex;delete e.dataset.tabindex,t?e.setAttribute(`tabindex`,t):e.removeAttribute(`tabindex`)})}function Cn(e){let t=H.useRef(void 0),n=H.useCallback(t=>{let n=e.map(e=>{if(e!=null){if(typeof e==`function`){let n=e,r=n(t);return typeof r==`function`?r:()=>{n(null)}}return e.current=t,()=>{e.current=null}}});return()=>{n.forEach(e=>e?.())}},e);return H.useMemo(()=>e.every(e=>e==null)?null:e=>{t.current&&=(t.current(),void 0),e!=null&&(t.current=n(e))},e)}var wn=`data-floating-ui-focusable`,Tn=`active`,En=`selected`,Dn=`ArrowLeft`,On=`ArrowRight`,kn=`ArrowUp`,An=`ArrowDown`,jn=[Dn,On],Mn=[kn,An];[...jn,...Mn];var Nn={...H},Pn=!1,Fn=0,In=()=>`floating-ui-`+Math.random().toString(36).slice(2,6)+Fn++;function Ln(){let[e,t]=H.useState(()=>Pn?In():void 0);return J(()=>{e??t(In())},[]),H.useEffect(()=>{Pn=!0},[]),e}var Rn=Nn.useId||Ln;function zn(){let e=new Map;return{emit(t,n){var r;(r=e.get(t))==null||r.forEach(e=>e(n))},on(t,n){e.has(t)||e.set(t,new Set),e.get(t).add(n)},off(t,n){var r;(r=e.get(t))==null||r.delete(n)}}}var Bn=H.createContext(null),Vn=H.createContext(null),Hn=()=>H.useContext(Bn)?.id||null,Un=()=>H.useContext(Vn);function Wn(e){return`data-floating-ui-`+e}function X(e){e.current!==-1&&(clearTimeout(e.current),e.current=-1)}var Gn=Wn(`safe-polygon`);function Kn(e,t,n){if(n&&!fn(n))return 0;if(typeof e==`number`)return e;if(typeof e==`function`){let n=e();return typeof n==`number`?n:n?.[t]}return e?.[t]}function qn(e){return typeof e==`function`?e():e}function Jn(e,t){t===void 0&&(t={});let{open:n,onOpenChange:r,dataRef:i,events:a,elements:o}=e,{enabled:s=!0,delay:c=0,handleClose:l=null,mouseOnly:u=!1,restMs:d=0,move:f=!0}=t,p=Un(),m=Hn(),h=mn(l),g=mn(c),_=mn(n),v=mn(d),y=H.useRef(),b=H.useRef(-1),x=H.useRef(),S=H.useRef(-1),C=H.useRef(!0),w=H.useRef(!1),T=H.useRef(()=>{}),E=H.useRef(!1),D=Y(()=>{let e=i.current.openEvent?.type;return e?.includes(`mouse`)&&e!==`mousedown`});H.useEffect(()=>{if(!s)return;function e(e){let{open:t}=e;t||(X(b),X(S),C.current=!0,E.current=!1)}return a.on(`openchange`,e),()=>{a.off(`openchange`,e)}},[s,a]),H.useEffect(()=>{if(!s||!h.current||!n)return;function e(e){D()&&r(!1,e,`hover`)}let t=q(o.floating).documentElement;return t.addEventListener(`mouseleave`,e),()=>{t.removeEventListener(`mouseleave`,e)}},[o.floating,n,r,s,h,D]);let O=H.useCallback(function(e,t,n){t===void 0&&(t=!0),n===void 0&&(n=`hover`);let i=Kn(g.current,`close`,y.current);i&&!x.current?(X(b),b.current=window.setTimeout(()=>r(!1,e,n),i)):t&&(X(b),r(!1,e,n))},[g,r]),k=Y(()=>{T.current(),x.current=void 0}),A=Y(()=>{if(w.current){let e=q(o.floating).body;e.style.pointerEvents=``,e.removeAttribute(Gn),w.current=!1}}),j=Y(()=>i.current.openEvent?[`click`,`mousedown`].includes(i.current.openEvent.type):!1);H.useEffect(()=>{if(!s)return;function e(e){if(X(b),C.current=!1,u&&!fn(y.current)||qn(v.current)>0&&!Kn(g.current,`open`))return;let t=Kn(g.current,`open`,y.current);t?b.current=window.setTimeout(()=>{_.current||r(!0,e,`hover`)},t):n||r(!0,e,`hover`)}function t(e){if(j()){A();return}T.current();let t=q(o.floating);if(X(S),E.current=!1,h.current&&i.current.floatingContext){n||X(b),x.current=h.current({...i.current.floatingContext,tree:p,x:e.clientX,y:e.clientY,onClose(){A(),k(),j()||O(e,!0,`safe-polygon`)}});let r=x.current;t.addEventListener(`mousemove`,r),T.current=()=>{t.removeEventListener(`mousemove`,r)};return}(y.current!==`touch`||!K(o.floating,e.relatedTarget))&&O(e)}function a(e){j()||i.current.floatingContext&&(h.current==null||h.current({...i.current.floatingContext,tree:p,x:e.clientX,y:e.clientY,onClose(){A(),k(),j()||O(e)}})(e))}function c(){X(b)}function l(e){j()||O(e,!1)}if(P(o.domReference)){let r=o.domReference,i=o.floating;return n&&r.addEventListener(`mouseleave`,a),f&&r.addEventListener(`mousemove`,e,{once:!0}),r.addEventListener(`mouseenter`,e),r.addEventListener(`mouseleave`,t),i&&(i.addEventListener(`mouseleave`,a),i.addEventListener(`mouseenter`,c),i.addEventListener(`mouseleave`,l)),()=>{n&&r.removeEventListener(`mouseleave`,a),f&&r.removeEventListener(`mousemove`,e),r.removeEventListener(`mouseenter`,e),r.removeEventListener(`mouseleave`,t),i&&(i.removeEventListener(`mouseleave`,a),i.removeEventListener(`mouseenter`,c),i.removeEventListener(`mouseleave`,l))}}},[o,s,e,u,f,O,k,A,r,n,_,p,g,h,i,j,v]),J(()=>{var e;if(s&&n&&(e=h.current)!=null&&(e=e.__options)!=null&&e.blockPointerEvents&&D()){w.current=!0;let e=o.floating;if(P(o.domReference)&&e){var t;let n=q(o.floating).body;n.setAttribute(Gn,``);let r=o.domReference,i=p==null||(t=p.nodesRef.current.find(e=>e.id===m))==null||(t=t.context)==null?void 0:t.elements.floating;return i&&(i.style.pointerEvents=``),n.style.pointerEvents=`none`,r.style.pointerEvents=`auto`,e.style.pointerEvents=`auto`,()=>{n.style.pointerEvents=``,r.style.pointerEvents=``,e.style.pointerEvents=``}}}},[s,n,m,o,p,h,D]),J(()=>{n||(y.current=void 0,E.current=!1,k(),A())},[n,k,A]),H.useEffect(()=>()=>{k(),X(b),X(S),A()},[s,o.domReference,k,A]);let M=H.useMemo(()=>{function e(e){y.current=e.pointerType}return{onPointerDown:e,onPointerEnter:e,onMouseMove(e){let{nativeEvent:t}=e;function i(){!C.current&&!_.current&&r(!0,t,`hover`)}(!u||fn(y.current))&&(n||qn(v.current)===0||E.current&&e.movementX**2+e.movementY**2<2||(X(S),y.current===`touch`?i():(E.current=!0,S.current=window.setTimeout(i,qn(v.current)))))}}},[u,r,n,_,v]);return H.useMemo(()=>s?{reference:M}:{},[s,M])}var Yn=()=>{},Xn=H.createContext({delay:0,initialDelay:0,timeoutMs:0,currentId:null,setCurrentId:Yn,setState:Yn,isInstantPhase:!1}),Zn=()=>H.useContext(Xn);function Qn(e){let{children:t,delay:n,timeoutMs:r=0}=e,[i,a]=H.useReducer((e,t)=>({...e,...t}),{delay:n,timeoutMs:r,initialDelay:n,currentId:null,isInstantPhase:!1}),o=H.useRef(null),s=H.useCallback(e=>{a({currentId:e})},[]);return J(()=>{i.currentId?o.current===null?o.current=i.currentId:i.isInstantPhase||a({isInstantPhase:!0}):(i.isInstantPhase&&a({isInstantPhase:!1}),o.current=null)},[i.currentId,i.isInstantPhase]),(0,G.jsx)(Xn.Provider,{value:H.useMemo(()=>({...i,setState:a,setCurrentId:s}),[i,s]),children:t})}function $n(e,t){t===void 0&&(t={});let{open:n,onOpenChange:r,floatingId:i}=e,{id:a,enabled:o=!0}=t,s=a??i,c=Zn(),{currentId:l,setCurrentId:u,initialDelay:d,setState:f,timeoutMs:p}=c;return J(()=>{o&&l&&(f({delay:{open:1,close:Kn(d,`close`)}}),l!==s&&r(!1))},[o,s,r,f,l,d]),J(()=>{function e(){r(!1),f({delay:d,currentId:null})}if(o&&l&&!n&&l===s){if(p){let t=window.setTimeout(e,p);return()=>{clearTimeout(t)}}e()}},[o,n,f,l,s,r,d,p]),J(()=>{o&&u!==Yn&&n&&u(s)},[o,n,u,s]),c}var er=0;function tr(e,t){t===void 0&&(t={});let{preventScroll:n=!1,cancelPrevious:r=!0,sync:i=!1}=t;r&&cancelAnimationFrame(er);let a=()=>e?.focus({preventScroll:n});i?a():er=requestAnimationFrame(a)}function nr(e,t){if(!e||!t)return!1;let n=t.getRootNode==null?void 0:t.getRootNode();if(e.contains(t))return!0;if(n&&L(n)){let n=t;for(;n;){if(e===n)return!0;n=n.parentNode||n.host}}return!1}function rr(e){return`composedPath`in e?e.composedPath()[0]:e.target}function ir(e){return e?.ownerDocument||document}var ar={inert:new WeakMap,"aria-hidden":new WeakMap,none:new WeakMap};function or(e){return e===`inert`?ar.inert:e===`aria-hidden`?ar[`aria-hidden`]:ar.none}var sr=new WeakSet,cr={},lr=0,ur=()=>typeof HTMLElement<`u`&&`inert`in HTMLElement.prototype;function dr(e){return e?L(e)?e.host:dr(e.parentNode):null}var fr=(e,t)=>t.map(t=>{if(e.contains(t))return t;let n=dr(t);return e.contains(n)?n:null}).filter(e=>e!=null);function pr(e,t,n,r){let i=`data-floating-ui-inert`,a=r?`inert`:n?`aria-hidden`:null,o=fr(t,e),s=new Set,c=new Set(o),l=[];cr[i]||(cr[i]=new WeakMap);let u=cr[i];o.forEach(d),f(t),s.clear();function d(e){e&&!s.has(e)&&(s.add(e),e.parentNode&&d(e.parentNode))}function f(e){e&&!c.has(e)&&[].forEach.call(e.children,e=>{if(N(e)!==`script`){if(s.has(e))f(e);else{let t=a?e.getAttribute(a):null,n=t!==null&&t!==`false`,r=or(a),o=(r.get(e)||0)+1,s=(u.get(e)||0)+1;r.set(e,o),u.set(e,s),l.push(e),o===1&&n&&sr.add(e),s===1&&e.setAttribute(i,``),!n&&a&&e.setAttribute(a,a===`inert`?``:`true`)}}})}return lr++,()=>{l.forEach(e=>{let t=or(a),n=(t.get(e)||0)-1,r=(u.get(e)||0)-1;t.set(e,n),u.set(e,r),n||(!sr.has(e)&&a&&e.removeAttribute(a),sr.delete(e)),r||e.removeAttribute(i)}),lr--,lr||(ar.inert=new WeakMap,ar[`aria-hidden`]=new WeakMap,ar.none=new WeakMap,sr=new WeakSet,cr={})}}function mr(e,t,n){t===void 0&&(t=!1),n===void 0&&(n=!1);let r=ir(e[0]).body;return pr(e.concat(Array.from(r.querySelectorAll(`[aria-live],[role="status"],output`))),r,t,n)}var hr={border:0,clip:`rect(0 0 0 0)`,height:`1px`,margin:`-1px`,overflow:`hidden`,padding:0,position:`fixed`,whiteSpace:`nowrap`,width:`1px`,top:0,left:0},gr=H.forwardRef(function(e,t){let[n,r]=H.useState();J(()=>{Gt()&&r(`button`)},[]);let i={ref:t,tabIndex:0,role:n,"aria-hidden":!n||void 0,[Wn(`focus-guard`)]:``,style:hr};return(0,G.jsx)(`span`,{...e,...i})}),_r={clipPath:`inset(50%)`,position:`fixed`,top:0,left:0},vr=H.createContext(null),yr=Wn(`portal`);function br(e){e===void 0&&(e={});let{id:t,root:n}=e,r=Rn(),i=Sr(),[a,o]=H.useState(null),s=H.useRef(null);return J(()=>()=>{a?.remove(),queueMicrotask(()=>{s.current=null})},[a]),J(()=>{if(!r||s.current)return;let e=t?document.getElementById(t):null;if(!e)return;let n=document.createElement(`div`);n.id=r,n.setAttribute(yr,``),e.appendChild(n),s.current=n,o(n)},[t,r]),J(()=>{if(n===null||!r||s.current)return;let e=n||i?.portalNode;e&&!B(e)&&(e=e.current),e||=document.body;let a=null;t&&(a=document.createElement(`div`),a.id=t,e.appendChild(a));let c=document.createElement(`div`);c.id=r,c.setAttribute(yr,``),e=a||e,e.appendChild(c),s.current=c,o(c)},[t,n,r,i]),a}function xr(e){let{children:t,id:n,root:r,preserveTabOrder:i=!0}=e,a=br({id:n,root:r}),[o,s]=H.useState(null),c=H.useRef(null),l=H.useRef(null),u=H.useRef(null),d=H.useRef(null),f=o?.modal,p=o?.open,m=!!o&&!o.modal&&o.open&&i&&!!(r||a);return H.useEffect(()=>{if(!a||!i||f)return;function e(e){a&&bn(e)&&(e.type===`focusin`?Sn:xn)(a)}return a.addEventListener(`focusin`,e,!0),a.addEventListener(`focusout`,e,!0),()=>{a.removeEventListener(`focusin`,e,!0),a.removeEventListener(`focusout`,e,!0)}},[a,i,f]),H.useEffect(()=>{a&&(p||Sn(a))},[p,a]),(0,G.jsxs)(vr.Provider,{value:H.useMemo(()=>({preserveTabOrder:i,beforeOutsideRef:c,afterOutsideRef:l,beforeInsideRef:u,afterInsideRef:d,portalNode:a,setFocusManagerState:s}),[i,a]),children:[m&&a&&(0,G.jsx)(gr,{"data-type":`outside`,ref:c,onFocus:e=>{if(bn(e,a)){var t;(t=u.current)==null||t.focus()}else yn(o?o.domReference:null)?.focus()}}),m&&a&&(0,G.jsx)(`span`,{"aria-owns":a.id,style:_r}),a&&je.createPortal(t,a),m&&a&&(0,G.jsx)(gr,{"data-type":`outside`,ref:l,onFocus:e=>{if(bn(e,a)){var t;(t=d.current)==null||t.focus()}else vn(o?o.domReference:null)?.focus(),o!=null&&o.closeOnFocusOut&&o?.onOpenChange(!1,e.nativeEvent,`focus-out`)}})]})}var Sr=()=>H.useContext(vr);function Cr(e){return H.useMemo(()=>t=>{e.forEach(e=>{e&&(e.current=t)})},e)}var wr=20,Tr=[];function Er(){Tr=Tr.filter(e=>e.deref()?.isConnected)}function Dr(e){Er(),e&&N(e)!==`body`&&(Tr.push(new WeakRef(e)),Tr.length>wr&&(Tr=Tr.slice(-20)))}function Or(){return Er(),Tr[Tr.length-1]?.deref()}function kr(e){let t=gn();return Ht(e,t)?e:Bt(e,t)[0]||e}function Ar(e,t){var n;if(!t.current.includes(`floating`)&&!((n=e.getAttribute(`role`))!=null&&n.includes(`dialog`)))return;let r=gn(),i=Vt(e,r).filter(e=>{let t=e.getAttribute(`data-tabindex`)||``;return Ht(e,r)||e.hasAttribute(`data-tabindex`)&&!t.startsWith(`-`)}),a=e.getAttribute(`tabindex`);t.current.includes(`floating`)||i.length===0?a!==`0`&&e.setAttribute(`tabindex`,`0`):(a!==`-1`||e.hasAttribute(`data-tabindex`)&&e.getAttribute(`data-tabindex`)!==`-1`)&&(e.setAttribute(`tabindex`,`-1`),e.setAttribute(`data-tabindex`,`-1`))}var jr=H.forwardRef(function(e,t){return(0,G.jsx)(`button`,{...e,type:`button`,ref:t,tabIndex:-1,style:hr})});function Mr(e){let{context:t,children:n,disabled:r=!1,order:i=[`content`],guards:a=!0,initialFocus:o=0,returnFocus:s=!0,restoreFocus:c=!1,modal:l=!0,visuallyHiddenDismiss:u=!1,closeOnFocusOut:d=!0,outsideElementsInert:f=!1,getInsideElements:p=()=>[]}=e,{open:m,onOpenChange:h,events:g,dataRef:_,elements:{domReference:v,floating:y}}=t,b=Y(()=>_.current.floatingContext?.nodeId),x=Y(p),S=typeof o==`number`&&o<0,C=nn(v)&&S,w=ur(),T=!w||a,E=!T||w&&f,D=mn(i),O=mn(o),k=mn(s),A=Un(),M=Sr(),N=H.useRef(null),P=H.useRef(null),F=H.useRef(!1),I=H.useRef(!1),L=H.useRef(-1),ee=H.useRef(-1),R=M!=null,z=an(y),B=Y(function(e){return e===void 0&&(e=z),e?Bt(e,gn()):[]}),V=Y(e=>{let t=B(e);return D.current.map(e=>v&&e===`reference`?v:z&&e===`floating`?z:t).filter(Boolean).flat()});H.useEffect(()=>{if(r||!l)return;function e(e){if(e.key===`Tab`){K(z,Zt(q(z)))&&B().length===0&&!C&&cn(e);let t=V(),n=Qt(e);D.current[0]===`reference`&&n===v&&(cn(e),e.shiftKey?tr(t[t.length-1]):tr(t[1])),D.current[1]===`floating`&&n===z&&e.shiftKey&&(cn(e),tr(t[0]))}}let t=q(z);return t.addEventListener(`keydown`,e),()=>{t.removeEventListener(`keydown`,e)}},[r,v,z,l,D,C,B,V]),H.useEffect(()=>{if(r||!y)return;function e(e){let t=Qt(e),n=B().indexOf(t);n!==-1&&(L.current=n)}return y.addEventListener(`focusin`,e),()=>{y.removeEventListener(`focusin`,e)}},[r,y,B]),H.useEffect(()=>{if(r||!d)return;function e(){I.current=!0,setTimeout(()=>{I.current=!1})}function t(e){let t=e.relatedTarget,n=e.currentTarget,r=Qt(e);queueMicrotask(()=>{let i=b(),a=!(K(v,t)||K(y,t)||K(t,y)||K(M?.portalNode,t)||t!=null&&t.hasAttribute(Wn(`focus-guard`))||A&&(on(A.nodesRef.current,i).find(e=>K(e.context?.elements.floating,t)||K(e.context?.elements.domReference,t))||sn(A.nodesRef.current,i).find(e=>[e.context?.elements.floating,an(e.context?.elements.floating)].includes(t)||e.context?.elements.domReference===t)));if(n===v&&z&&Ar(z,D),c&&n!==v&&!(r!=null&&r.isConnected)&&Zt(q(z))===q(z).body){j(z)&&z.focus();let e=L.current,t=B(),n=t[e]||t[t.length-1]||z;j(n)&&n.focus()}if(_.current.insideReactTree){_.current.insideReactTree=!1;return}(C||!l)&&t&&a&&!I.current&&t!==Or()&&(F.current=!0,h(!1,e,`focus-out`))})}let n=!(A||!M);function i(){X(ee),_.current.insideReactTree=!0,ee.current=window.setTimeout(()=>{_.current.insideReactTree=!1})}if(y&&j(v))return v.addEventListener(`focusout`,t),v.addEventListener(`pointerdown`,e),y.addEventListener(`focusout`,t),n&&y.addEventListener(`focusout`,i,!0),()=>{v.removeEventListener(`focusout`,t),v.removeEventListener(`pointerdown`,e),y.removeEventListener(`focusout`,t),n&&y.removeEventListener(`focusout`,i,!0)}},[r,v,y,z,l,A,M,h,d,c,B,C,b,D,_]);let te=H.useRef(null),U=H.useRef(null),ne=Cr([te,M?.beforeInsideRef]),re=Cr([U,M?.afterInsideRef]);H.useEffect(()=>{var e,t;if(r||!y)return;let n=Array.from((M==null||(e=M.portalNode)==null?void 0:e.querySelectorAll(`[`+Wn(`portal`)+`]`))||[]),i=(t=(A?sn(A.nodesRef.current,b()):[]).find(e=>nn(e.context?.elements.domReference||null)))==null||(t=t.context)==null?void 0:t.elements.domReference,a=[y,i,...n,...x(),N.current,P.current,te.current,U.current,M?.beforeOutsideRef.current,M?.afterOutsideRef.current,D.current.includes(`reference`)||C?v:null].filter(e=>e!=null),o=l||C?mr(a,!E,E):mr(a);return()=>{o()}},[r,v,y,l,D,M,C,T,E,A,b,x]),J(()=>{if(r||!j(z))return;let e=Zt(q(z));queueMicrotask(()=>{let t=V(z),n=O.current,r=(typeof n==`number`?t[n]:n.current)||z,i=K(z,e);!S&&!i&&m&&tr(r,{preventScroll:r===z})})},[r,m,z,S,V,O]),J(()=>{if(r||!z)return;let e=q(z);Dr(Zt(e));function t(e){let{reason:t,event:n,nested:r}=e;if([`hover`,`safe-polygon`].includes(t)&&n.type===`mouseleave`&&(F.current=!0),t===`outside-press`){if(r)F.current=!1;else if(un(n)||dn(n))F.current=!1;else{let e=!1;document.createElement(`div`).focus({get preventScroll(){return e=!0,!1}}),e?F.current=!1:F.current=!0}}}g.on(`openchange`,t);let n=e.createElement(`span`);n.setAttribute(`tabindex`,`-1`),n.setAttribute(`aria-hidden`,`true`),Object.assign(n.style,hr),R&&v&&v.insertAdjacentElement(`afterend`,n);function i(){if(typeof k.current==`boolean`){let e=v||Or();return e&&e.isConnected?e:n}return k.current.current||n}return()=>{g.off(`openchange`,t);let r=Zt(e),a=K(y,r)||A&&on(A.nodesRef.current,b(),!1).some(e=>K(e.context?.elements.floating,r)),o=i();queueMicrotask(()=>{let t=kr(o);k.current&&!F.current&&j(t)&&(t===r||r===e.body||a)&&t.focus({preventScroll:!0}),n.remove()})}},[r,y,z,k,_,g,A,R,v,b]),H.useEffect(()=>(queueMicrotask(()=>{F.current=!1}),()=>{queueMicrotask(Er)}),[r]),J(()=>{if(!r&&M)return M.setFocusManagerState({modal:l,closeOnFocusOut:d,open:m,onOpenChange:h,domReference:v}),()=>{M.setFocusManagerState(null)}},[r,M,l,m,h,d,v]),J(()=>{r||z&&Ar(z,D)},[r,z,D]);function ie(e){return r||!u||!l?null:(0,G.jsx)(jr,{ref:e===`start`?N:P,onClick:e=>h(!1,e.nativeEvent),children:typeof u==`string`?u:`Dismiss`})}let ae=!r&&T&&(!l||!C)&&(R||l);return(0,G.jsxs)(G.Fragment,{children:[ae&&(0,G.jsx)(gr,{"data-type":`inside`,ref:ne,onFocus:e=>{if(l){let e=V();tr(i[0]===`reference`?e[0]:e[e.length-1])}else if(M!=null&&M.preserveTabOrder&&M.portalNode){if(F.current=!1,bn(e,M.portalNode))vn(v)?.focus();else{var t;(t=M.beforeOutsideRef.current)==null||t.focus()}}}}),!C&&ie(`start`),n,ie(`end`),ae&&(0,G.jsx)(gr,{"data-type":`inside`,ref:re,onFocus:e=>{if(l)tr(V()[0]);else if(M!=null&&M.preserveTabOrder&&M.portalNode){if(d&&(F.current=!0),bn(e,M.portalNode))yn(v)?.focus();else{var t;(t=M.afterOutsideRef.current)==null||t.focus()}}}})]})}var Nr={pointerdown:`onPointerDown`,mousedown:`onMouseDown`,click:`onClick`},Pr={pointerdown:`onPointerDownCapture`,mousedown:`onMouseDownCapture`,click:`onClickCapture`},Fr=e=>({escapeKey:typeof e==`boolean`?e:e?.escapeKey??!1,outsidePress:typeof e==`boolean`?e:e?.outsidePress??!0});function Ir(e,t){t===void 0&&(t={});let{open:n,onOpenChange:r,elements:i,dataRef:a}=e,{enabled:o=!0,escapeKey:s=!0,outsidePress:c=!0,outsidePressEvent:l=`pointerdown`,referencePress:u=!1,referencePressEvent:d=`pointerdown`,ancestorScroll:f=!1,bubbles:p,capture:m}=t,h=Un(),g=Y(typeof c==`function`?c:()=>!1),_=typeof c==`function`?g:c,v=H.useRef(!1),{escapeKey:y,outsidePress:b}=Fr(p),{escapeKey:x,outsidePress:S}=Fr(m),C=H.useRef(!1),w=Y(e=>{if(!n||!o||!s||e.key!==`Escape`||C.current)return;let t=a.current.floatingContext?.nodeId,i=h?on(h.nodesRef.current,t):[];if(!y&&(e.stopPropagation(),i.length>0)){let e=!0;if(i.forEach(t=>{var n;if((n=t.context)!=null&&n.open&&!t.context.dataRef.current.__escapeKeyBubbles){e=!1;return}}),!e)return}r(!1,ln(e)?e.nativeEvent:e,`escape-key`)}),E=Y(e=>{var t;let n=()=>{var t;w(e),(t=Qt(e))==null||t.removeEventListener(`keydown`,n)};(t=Qt(e))==null||t.addEventListener(`keydown`,n)}),D=Y(e=>{let t=a.current.insideReactTree;a.current.insideReactTree=!1;let n=v.current;if(v.current=!1,l===`click`&&n||t||typeof _==`function`&&!_(e))return;let o=Qt(e),s=`[`+Wn(`inert`)+`]`,c=q(i.floating).querySelectorAll(s),u=P(o)?o:null;for(;u&&!R(u);){let e=ee(u);if(R(e)||!P(e))break;u=e}if(c.length&&P(o)&&!en(o)&&!K(o,i.floating)&&Array.from(c).every(e=>!K(u,e)))return;if(j(o)&&A){let t=R(o),n=T(o),r=/auto|scroll/,i=t||r.test(n.overflowX),a=t||r.test(n.overflowY),s=i&&o.clientWidth>0&&o.scrollWidth>o.clientWidth,c=a&&o.clientHeight>0&&o.scrollHeight>o.clientHeight,l=n.direction===`rtl`,u=c&&(l?e.offsetX<=o.offsetWidth-o.clientWidth:e.offsetX>o.clientWidth),d=s&&e.offsetY>o.clientHeight;if(u||d)return}let d=a.current.floatingContext?.nodeId,f=h&&on(h.nodesRef.current,d).some(t=>$t(e,t.context?.elements.floating));if($t(e,i.floating)||$t(e,i.domReference)||f)return;let p=h?on(h.nodesRef.current,d):[];if(p.length>0){let e=!0;if(p.forEach(t=>{var n;if((n=t.context)!=null&&n.open&&!t.context.dataRef.current.__outsidePressBubbles){e=!1;return}}),!e)return}r(!1,e,`outside-press`)}),O=Y(e=>{var t;let n=()=>{var t;D(e),(t=Qt(e))==null||t.removeEventListener(l,n)};(t=Qt(e))==null||t.addEventListener(l,n)});H.useEffect(()=>{if(!n||!o)return;a.current.__escapeKeyBubbles=y,a.current.__outsidePressBubbles=b;let e=-1;function t(e){r(!1,e,`ancestor-scroll`)}function c(){window.clearTimeout(e),C.current=!0}function u(){e=window.setTimeout(()=>{C.current=!1},te()?5:0)}let d=q(i.floating);s&&(d.addEventListener(`keydown`,x?E:w,x),d.addEventListener(`compositionstart`,c),d.addEventListener(`compositionend`,u)),_&&d.addEventListener(l,S?O:D,S);let p=[];return f&&(P(i.domReference)&&(p=V(i.domReference)),P(i.floating)&&(p=p.concat(V(i.floating))),!P(i.reference)&&i.reference&&i.reference.contextElement&&(p=p.concat(V(i.reference.contextElement)))),p=p.filter(e=>e!==d.defaultView?.visualViewport),p.forEach(e=>{e.addEventListener(`scroll`,t)}),()=>{s&&(d.removeEventListener(`keydown`,x?E:w,x),d.removeEventListener(`compositionstart`,c),d.removeEventListener(`compositionend`,u)),_&&d.removeEventListener(l,S?O:D,S),p.forEach(e=>{e.removeEventListener(`scroll`,t)}),window.clearTimeout(e)}},[a,i,s,_,l,n,r,f,o,y,b,w,x,E,D,S,O]),H.useEffect(()=>{a.current.insideReactTree=!1},[a,_,l]);let k=H.useMemo(()=>({onKeyDown:w,...u&&{[Nr[d]]:e=>{r(!1,e.nativeEvent,`reference-press`)},...d!==`click`&&{onClick(e){r(!1,e.nativeEvent,`reference-press`)}}}}),[w,r,u,d]),A=H.useMemo(()=>{function e(e){e.button===0&&(v.current=!0)}return{onKeyDown:w,onMouseDown:e,onMouseUp:e,[Pr[l]]:()=>{a.current.insideReactTree=!0}}},[w,l,a]);return H.useMemo(()=>o?{reference:k,floating:A}:{},[o,k,A])}function Lr(e){let{open:t=!1,onOpenChange:n,elements:r}=e,i=Rn(),a=H.useRef({}),[o]=H.useState(()=>zn()),s=Hn()!=null,[c,l]=H.useState(r.reference),u=Y((e,t,r)=>{a.current.openEvent=e?t:void 0,o.emit(`openchange`,{open:e,event:t,reason:r,nested:s}),n?.(e,t,r)}),d=H.useMemo(()=>({setPositionReference:l}),[]),f=H.useMemo(()=>({reference:c||r.reference||null,floating:r.floating||null,domReference:r.reference}),[c,r.reference,r.floating]);return H.useMemo(()=>({dataRef:a,open:t,onOpenChange:u,elements:f,events:o,floatingId:i,refs:d}),[t,u,f,o,i,d])}function Rr(e){let{elements:t,...n}=e===void 0?{}:e,{nodeId:r}=n,i=Lr({...n,elements:{reference:t?.reference??null,floating:t?.floating??null}}),a=n.rootContext||i,o=a.elements,[s,c]=H.useState(null),[l,u]=H.useState(null),d=o?.domReference||s,f=H.useRef(null),p=Un();J(()=>{d&&(f.current=d)},[d]);let m=w({...n,elements:{...o,...l&&{reference:l}}}),h=H.useCallback(e=>{let t=P(e)?{getBoundingClientRect:()=>e.getBoundingClientRect(),getClientRects:()=>e.getClientRects(),contextElement:e}:e;u(t),m.refs.setReference(t)},[m.refs]),g=H.useCallback(e=>{(P(e)||e===null)&&(f.current=e,c(e)),(P(m.refs.reference.current)||m.refs.reference.current===null||e!==null&&!P(e))&&m.refs.setReference(e)},[m.refs]),_=H.useMemo(()=>({...m.refs,setReference:g,setPositionReference:h,domReference:f}),[m.refs,g,h]),v=H.useMemo(()=>({...m.elements,domReference:d}),[m.elements,d]),y=H.useMemo(()=>({...m,...a,refs:_,elements:v,nodeId:r}),[m,_,v,r,a]);return J(()=>{a.dataRef.current.floatingContext=y;let e=p?.nodesRef.current.find(e=>e.id===r);e&&(e.context=y)}),H.useMemo(()=>({...m,context:y,refs:_,elements:v}),[m,_,v,y])}function zr(){return qt()&&Gt()}function Br(e,t){t===void 0&&(t={});let{open:n,onOpenChange:r,events:i,dataRef:a,elements:o}=e,{enabled:s=!0,visibleOnly:c=!0}=t,l=H.useRef(!1),u=H.useRef(-1),d=H.useRef(!0);H.useEffect(()=>{if(!s)return;let e=z(o.domReference);function t(){!n&&j(o.domReference)&&o.domReference===Zt(q(o.domReference))&&(l.current=!0)}function r(){d.current=!0}function i(){d.current=!1}return e.addEventListener(`blur`,t),zr()&&(e.addEventListener(`keydown`,r,!0),e.addEventListener(`pointerdown`,i,!0)),()=>{e.removeEventListener(`blur`,t),zr()&&(e.removeEventListener(`keydown`,r,!0),e.removeEventListener(`pointerdown`,i,!0))}},[o.domReference,n,s]),H.useEffect(()=>{if(!s)return;function e(e){let{reason:t}=e;(t===`reference-press`||t===`escape-key`)&&(l.current=!0)}return i.on(`openchange`,e),()=>{i.off(`openchange`,e)}},[i,s]),H.useEffect(()=>()=>{X(u)},[]);let f=H.useMemo(()=>({onMouseLeave(){l.current=!1},onFocus(e){if(l.current)return;let t=Qt(e.nativeEvent);if(c&&P(t)){if(zr()&&!e.relatedTarget){if(!d.current&&!tn(t))return}else if(!rn(t))return}r(!0,e.nativeEvent,`focus`)},onBlur(e){l.current=!1;let t=e.relatedTarget,n=e.nativeEvent,i=P(t)&&t.hasAttribute(Wn(`focus-guard`))&&t.getAttribute(`data-type`)===`outside`;u.current=window.setTimeout(()=>{let e=Zt(o.domReference?o.domReference.ownerDocument:document);(t||e!==o.domReference)&&(K(a.current.floatingContext?.refs.floating.current,e)||K(o.domReference,e)||i||r(!1,n,`focus`))})}}),[a,o.domReference,r,c]);return H.useMemo(()=>s?{reference:f}:{},[s,f])}function Vr(e,t,n){let r=new Map,i=n===`item`,a=e;if(i&&e){let{[Tn]:t,[En]:n,...r}=e;a=r}return{...n===`floating`&&{tabIndex:-1,[wn]:``},...a,...t.map(t=>{let r=t?t[n]:null;return typeof r==`function`?e?r(e):null:r}).concat(e).reduce((e,t)=>(t&&Object.entries(t).forEach(t=>{let[n,a]=t;if(!(i&&[Tn,En].includes(n))){if(n.indexOf(`on`)===0){if(r.has(n)||r.set(n,[]),typeof a==`function`){var o;(o=r.get(n))==null||o.push(a),e[n]=function(){var e=[...arguments];return r.get(n)?.map(t=>t(...e)).find(e=>e!==void 0)}}}else e[n]=a}}),e),{})}}function Hr(e){e===void 0&&(e=[]);let t=e.map(e=>e?.reference),n=e.map(e=>e?.floating),r=e.map(e=>e?.item),i=H.useCallback(t=>Vr(t,e,`reference`),t),a=H.useCallback(t=>Vr(t,e,`floating`),n),o=H.useCallback(t=>Vr(t,e,`item`),r);return H.useMemo(()=>({getReferenceProps:i,getFloatingProps:a,getItemProps:o}),[i,a,o])}var Ur=new Map([[`select`,`listbox`],[`combobox`,`listbox`],[`label`,!1]]);function Wr(e,t){t===void 0&&(t={});let{open:n,elements:r,floatingId:i}=e,{enabled:a=!0,role:o=`dialog`}=t,s=Rn(),c=r.domReference?.id||s,l=H.useMemo(()=>an(r.floating)?.id||i,[r.floating,i]),u=Ur.get(o)??o,d=Hn()!=null,f=H.useMemo(()=>u===`tooltip`||o===`label`?{[`aria-`+(o===`label`?`labelledby`:`describedby`)]:n?l:void 0}:{"aria-expanded":n?`true`:`false`,"aria-haspopup":u===`alertdialog`?`dialog`:u,"aria-controls":n?l:void 0,...u===`listbox`&&{role:`combobox`},...u===`menu`&&{id:c},...u===`menu`&&d&&{role:`menuitem`},...o===`select`&&{"aria-autocomplete":`none`},...o===`combobox`&&{"aria-autocomplete":`list`}},[u,l,d,n,c,o]),p=H.useMemo(()=>{let e={id:l,...u&&{role:u}};return u===`tooltip`||o===`label`?e:{...e,...u===`menu`&&{"aria-labelledby":c}}},[u,l,c,o]),m=H.useCallback(e=>{let{active:t,selected:n}=e,r={role:`option`,...t&&{id:l+`-fui-option`}};switch(o){case`select`:case`combobox`:return{...r,"aria-selected":n}}return{}},[l,o]);return H.useMemo(()=>a?{reference:f,floating:p,item:m}:{},[a,f,p,m])}var Gr=e=>e.replace(/[A-Z]+(?![a-z])|[A-Z]/g,(e,t)=>(t?`-`:``)+e.toLowerCase());function Kr(e,t){return typeof e==`function`?e(t):e}function qr(e,t){let[n,r]=H.useState(e);return e&&!n&&r(!0),H.useEffect(()=>{if(!e&&n){let e=setTimeout(()=>r(!1),t);return()=>clearTimeout(e)}},[e,n,t]),n}function Jr(e,t){t===void 0&&(t={});let{open:n,elements:{floating:r}}=e,{duration:i=250}=t,a=(typeof i==`number`?i:i.close)||0,[o,s]=H.useState(`unmounted`),c=qr(n,a);return!c&&o===`close`&&s(`unmounted`),J(()=>{if(r){if(n){s(`initial`);let e=requestAnimationFrame(()=>{je.flushSync(()=>{s(`open`)})});return()=>{cancelAnimationFrame(e)}}s(`close`)}},[n,r]),{isMounted:c,status:o}}function Yr(e,t){t===void 0&&(t={});let{initial:n={opacity:0},open:r,close:i,common:a,duration:o=250}=t,s=e.placement,c=s.split(`-`)[0],l=H.useMemo(()=>({side:c,placement:s}),[c,s]),u=typeof o==`number`,d=(u?o:o.open)||0,f=(u?o:o.close)||0,[p,m]=H.useState(()=>({...Kr(a,l),...Kr(n,l)})),{isMounted:h,status:g}=Jr(e,{duration:o}),_=mn(n),v=mn(r),y=mn(i),b=mn(a);return J(()=>{let e=Kr(_.current,l),t=Kr(y.current,l),n=Kr(b.current,l),r=Kr(v.current,l)||Object.keys(e).reduce((e,t)=>(e[t]=``,e),{});if(g===`initial`&&m(t=>({transitionProperty:t.transitionProperty,...n,...e})),g===`open`&&m({transitionProperty:Object.keys(r).map(Gr).join(`,`),transitionDuration:d+`ms`,...n,...r}),g===`close`){let r=t||e;m({transitionProperty:Object.keys(r).map(Gr).join(`,`),transitionDuration:f+`ms`,...n,...r})}},[f,y,_,v,b,d,g,l]),{isMounted:h,styles:p}}function Xr(e,t,n){return n===void 0&&(n=!0),e.filter(e=>e.parentId===t&&(!n||e.context?.open)).flatMap(t=>[t,...Xr(e,t.id,n)])}function Zr(e,t){let[n,r]=e,i=!1,a=t.length;for(let e=0,o=a-1;e<a;o=e++){let[a,s]=t[e]||[0,0],[c,l]=t[o]||[0,0];s>=r!=l>=r&&n<=(c-a)*(r-s)/(l-s)+a&&(i=!i)}return i}function Qr(e,t){return e[0]>=t.x&&e[0]<=t.x+t.width&&e[1]>=t.y&&e[1]<=t.y+t.height}function $r(e){e===void 0&&(e={});let{buffer:t=.5,blockPointerEvents:n=!1,requireIntent:r=!0}=e,i={current:-1},a=!1,o=null,s=null,c=typeof performance<`u`?performance.now():0;function l(e,t){let n=performance.now(),r=n-c;if(o===null||s===null||r===0)return o=e,s=t,c=n,null;let i=e-o,a=t-s,l=Math.sqrt(i*i+a*a)/r;return o=e,s=t,c=n,l}let u=e=>{let{x:n,y:o,placement:s,elements:c,onClose:u,nodeId:d,tree:f}=e;return function(e){function p(){X(i),u()}if(X(i),!c.domReference||!c.floating||s==null||n==null||o==null)return;let{clientX:m,clientY:h}=e,g=[m,h],_=rr(e),v=e.type===`mouseleave`,y=nr(c.floating,_),b=nr(c.domReference,_),x=c.domReference.getBoundingClientRect(),S=c.floating.getBoundingClientRect(),C=s.split(`-`)[0],w=n>S.right-S.width/2,T=o>S.bottom-S.height/2,E=Qr(g,x),D=S.width>x.width,O=S.height>x.height,k=(D?x:S).left,A=(D?x:S).right,j=(O?x:S).top,M=(O?x:S).bottom;if(y&&(a=!0,!v))return;if(b&&(a=!1),b&&!v){a=!0;return}if(v&&P(e.relatedTarget)&&nr(c.floating,e.relatedTarget)||f&&Xr(f.nodesRef.current,d).length)return;if(C===`top`&&o>=x.bottom-1||C===`bottom`&&o<=x.top+1||C===`left`&&n>=x.right-1||C===`right`&&n<=x.left+1)return p();let N=[];switch(C){case`top`:N=[[k,x.top+1],[k,S.bottom-1],[A,S.bottom-1],[A,x.top+1]];break;case`bottom`:N=[[k,S.top+1],[k,x.bottom-1],[A,x.bottom-1],[A,S.top+1]];break;case`left`:N=[[S.right-1,M],[S.right-1,j],[x.left+1,j],[x.left+1,M]];break;case`right`:N=[[x.right-1,M],[x.right-1,j],[S.left+1,j],[S.left+1,M]]}function F(e){let[n,r]=e;switch(C){case`top`:return[[D?n+t/2:w?n+t*4:n-t*4,r+t+1],[D?n-t/2:w?n+t*4:n-t*4,r+t+1],[S.left,w||D?S.bottom-t:S.top],[S.right,w?D?S.bottom-t:S.top:S.bottom-t]];case`bottom`:return[[D?n+t/2:w?n+t*4:n-t*4,r-t],[D?n-t/2:w?n+t*4:n-t*4,r-t],[S.left,w||D?S.top+t:S.bottom],[S.right,w?D?S.top+t:S.bottom:S.top+t]];case`left`:{let e=[n+t+1,O?r+t/2:T?r+t*4:r-t*4],i=[n+t+1,O?r-t/2:T?r+t*4:r-t*4];return[[T||O?S.right-t:S.left,S.top],[T?O?S.right-t:S.left:S.right-t,S.bottom],e,i]}case`right`:return[[n-t,O?r+t/2:T?r+t*4:r-t*4],[n-t,O?r-t/2:T?r+t*4:r-t*4],[T||O?S.left+t:S.right,S.top],[T?O?S.left+t:S.right:S.left+t,S.bottom]]}}if(!Zr([m,h],N)){if(a&&!E)return p();if(!v&&r){let t=l(e.clientX,e.clientY);if(t!==null&&t<.1)return p()}Zr([m,h],F([n,o]))?!a&&r&&(i.current=window.setTimeout(p,40)):p()}}};return u.__options={blockPointerEvents:n},u}var ei={scrollHideDelay:1e3,type:`hover`,scrollbars:`xy`},ti=a((e,{scrollbarSize:t,overscrollBehavior:n,scrollbars:r})=>{let i=n;return n&&r&&(r===`x`?i=`${n} auto`:r===`y`&&(i=`auto ${n}`)),{root:{"--scrollarea-scrollbar-size":c(t),"--scrollarea-over-scroll-behavior":i}}}),ni=f(e=>{let t=l(`ScrollArea`,ei,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,scrollbarSize:s,vars:c,type:u,scrollHideDelay:d,viewportProps:f,viewportRef:p,onScrollPositionChange:h,children:g,offsetScrollbars:_,scrollbars:v,onBottomReached:y,onTopReached:b,onLeftReached:x,onRightReached:S,overscrollBehavior:C,startScrollPosition:w,verticalScrollbarPosition:T,attributes:E,...D}=t,[O,A]=(0,H.useState)(!1),[j,M]=(0,H.useState)(!1),[N,P]=(0,H.useState)(!1),F=(0,H.useRef)(!0),I=(0,H.useRef)(!1),L=(0,H.useRef)(!0),ee=(0,H.useRef)(!1),R=m({name:`ScrollArea`,props:t,classes:ft,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:E,vars:c,varsResolver:ti}),z=(0,H.useRef)(null),[B,V]=(0,H.useState)(null),te=Cn([p,z,(0,H.useCallback)(e=>{V(t=>t===e?t:e)},[])]);return Re(_===`present`?B:null,()=>{let e=z.current;e&&(M(e.scrollHeight>e.clientHeight),P(e.scrollWidth>e.clientWidth))}),k(()=>{w&&z.current&&z.current.scrollTo({left:w.x??0,top:w.y??0})},[]),(0,G.jsxs)(He,{getStyles:R,type:u===`never`?`always`:u,scrollHideDelay:d,scrollbars:v,...R(`root`),...D,children:[(0,G.jsx)(dt,{...f,...R(`viewport`,{style:f?.style}),ref:te,"data-offset-scrollbars":_===!0?`xy`:_||void 0,"data-scrollbars":v||void 0,"data-vertical-scrollbar-position":T||void 0,"data-horizontal-hidden":_===`present`&&!N?`true`:void 0,"data-vertical-hidden":_===`present`&&!j?`true`:void 0,onScroll:e=>{f?.onScroll?.(e),h?.({x:e.currentTarget.scrollLeft,y:e.currentTarget.scrollTop});let{scrollTop:t,scrollHeight:n,clientHeight:r,scrollLeft:i,scrollWidth:a,clientWidth:o}=e.currentTarget,s=t-(n-r)>=-.8,c=t===0;s&&!I.current&&y?.(),c&&!F.current&&b?.(),I.current=s,F.current=c;let l=i-(a-o)>=-.8,u=i===0;l&&!ee.current&&S?.(),u&&!L.current&&x?.(),ee.current=l,L.current=u},children:g}),(v===`xy`||v===`x`)&&(0,G.jsx)(st,{...R(`scrollbar`),orientation:`horizontal`,"data-vertical-scrollbar-position":T||void 0,"data-hidden":u===`never`||_===`present`&&!N||void 0,forceMount:!0,onMouseEnter:()=>A(!0),onMouseLeave:()=>A(!1),children:(0,G.jsx)(ut,{...R(`thumb`)})}),(v===`xy`||v===`y`)&&(0,G.jsx)(st,{...R(`scrollbar`),orientation:`vertical`,"data-vertical-scrollbar-position":T||void 0,"data-hidden":u===`never`||_===`present`&&!j||void 0,forceMount:!0,onMouseEnter:()=>A(!0),onMouseLeave:()=>A(!1),children:(0,G.jsx)(ut,{...R(`thumb`)})}),(0,G.jsx)(Be,{...R(`corner`),"data-vertical-scrollbar-position":T||void 0,"data-hovered":O||void 0,"data-hidden":u===`never`||void 0})]})});ni.displayName=`@mantine/core/ScrollArea`;var ri=f(e=>{let{children:t,classNames:n,styles:r,scrollbarSize:i,scrollHideDelay:a,type:o,dir:s,offsetScrollbars:c,overscrollBehavior:u,viewportRef:d,onScrollPositionChange:f,unstyled:m,variant:h,viewportProps:g,scrollbars:_,style:v,vars:y,onBottomReached:b,onTopReached:x,startScrollPosition:S,verticalScrollbarPosition:C,onOverflowChange:w,...T}=l(`ScrollAreaAutosize`,ei,e),E=(0,H.useRef)(null),[D,O]=(0,H.useState)(null),k=Cn([d,E,(0,H.useCallback)(e=>{O(t=>t===e?t:e)},[])]),A=(0,H.useRef)(!1),j=(0,H.useRef)(!1),M=(0,H.useEffectEvent)(()=>{let e=E.current;if(!e||!w)return;let t=e.scrollHeight>e.clientHeight;t!==A.current&&(j.current?w(t):(j.current=!0,t&&w(!0)),A.current=t)});return Re(w?D:null,M),(0,G.jsx)(p,{...T,variant:h,style:[{display:`flex`,overflow:`hidden`},v],children:(0,G.jsx)(p,{style:{display:`flex`,flexDirection:`column`,flex:1,overflow:`hidden`,..._===`y`&&{minWidth:0},..._===`x`&&{minHeight:0},..._===`xy`&&{minWidth:0,minHeight:0},..._===!1&&{minWidth:0,minHeight:0}},children:(0,G.jsx)(ni,{classNames:n,styles:r,scrollHideDelay:a,scrollbarSize:i,type:o,dir:s,offsetScrollbars:c,overscrollBehavior:u,viewportRef:k,onScrollPositionChange:f,unstyled:m,variant:h,viewportProps:g,vars:y,scrollbars:_,onBottomReached:b,onTopReached:x,startScrollPosition:S,verticalScrollbarPosition:C,"data-autosize":`true`,children:t})})})});ni.classes=ft,ni.varsResolver=ti,ri.displayName=`@mantine/core/ScrollAreaAutosize`,ri.classes=ft,ni.Autosize=ri;var ii={root:`m_515a97f8`},ai=f(e=>{let t=l(`VisuallyHidden`,null,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,attributes:c,...u}=t;return(0,G.jsx)(p,{component:`span`,...m({name:`VisuallyHidden`,classes:ii,props:t,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:c})(`root`),...u})});ai.classes=ii,ai.displayName=`@mantine/core/VisuallyHidden`;function oi(e,t,n,r){return e===`center`||r===`center`?{top:t}:e===`end`?{bottom:n}:e===`start`?{top:n}:{}}function si(e,t,n,r,i){return e===`center`||r===`center`?{left:t}:e===`end`?{[i===`ltr`?`right`:`left`]:n}:e===`start`?{[i===`ltr`?`left`:`right`]:n}:{}}var ci={bottom:`borderTopLeftRadius`,left:`borderTopRightRadius`,right:`borderBottomLeftRadius`,top:`borderBottomRightRadius`};function li({position:e,arrowSize:t,dir:n}){let[r,i]=e.split(`-`);if(!i)return;let a={width:t,height:t,position:`absolute`};if(r===`bottom`){let e=i===`start`,r=e?n===`ltr`?`left`:`right`:n===`ltr`?`right`:`left`;return{...a,top:-t,[r]:0,clipPath:e===(n===`rtl`)?`polygon(100% 0%, 0% 100%, 100% 100%)`:`polygon(0% 0%, 0% 100%, 100% 100%)`}}if(r===`top`){let e=i===`start`,r=e?n===`ltr`?`left`:`right`:n===`ltr`?`right`:`left`;return{...a,bottom:-t,[r]:0,clipPath:e===(n===`rtl`)?`polygon(0% 0%, 100% 0%, 100% 100%)`:`polygon(0% 0%, 100% 0%, 0% 100%)`}}if(r===`left`)return{...a,right:-t,[i===`start`?`top`:`bottom`]:0,clipPath:i===`start`?`polygon(0% 0%, 100% 0%, 0% 100%)`:`polygon(0% 0%, 0% 100%, 100% 100%)`};if(r===`right`)return{...a,left:-t,[i===`start`?`top`:`bottom`]:0,clipPath:i===`start`?`polygon(0% 0%, 100% 0%, 100% 100%)`:`polygon(100% 0%, 0% 100%, 100% 100%)`}}function ui({position:e,arrowSize:t,arrowOffset:n,arrowRadius:r,arrowPosition:i,arrowX:a,arrowY:o,dir:s}){if(i===`merge`){let n=li({position:e,arrowSize:t,dir:s});if(n)return n}let[c,l=`center`]=e.split(`-`),u={width:t,height:t,transform:`rotate(45deg)`,position:`absolute`,[ci[c]]:r},d=-t/2;return c===`left`?{...u,...oi(l,o,n,i),right:d,borderLeftColor:`transparent`,borderBottomColor:`transparent`,clipPath:`polygon(100% 0, 0 0, 100% 100%)`}:c===`right`?{...u,...oi(l,o,n,i),left:d,borderRightColor:`transparent`,borderTopColor:`transparent`,clipPath:`polygon(0 100%, 0 0, 100% 100%)`}:c===`top`?{...u,...si(l,a,n,i,s),bottom:d,borderTopColor:`transparent`,borderLeftColor:`transparent`,clipPath:`polygon(0 100%, 100% 100%, 100% 0)`}:c===`bottom`?{...u,...si(l,a,n,i,s),top:d,borderBottomColor:`transparent`,borderRightColor:`transparent`,clipPath:`polygon(0 100%, 0 0, 100% 0)`}:{}}function di({position:e,dir:t}){let[n,r]=e.split(`-`);if(!r)return;let i=r===`start`&&t===`ltr`||r===`end`&&t===`rtl`;if(n===`bottom`)return i?{borderTopLeftRadius:0}:{borderTopRightRadius:0};if(n===`top`)return i?{borderBottomLeftRadius:0}:{borderBottomRightRadius:0};if(n===`left`)return r===`start`?{borderTopRightRadius:0}:{borderBottomRightRadius:0};if(n===`right`)return r===`start`?{borderTopLeftRadius:0}:{borderBottomLeftRadius:0}}function fi({position:e,arrowSize:t,arrowOffset:n,arrowRadius:r,arrowPosition:i,visible:a,arrowX:o,arrowY:s,style:c,...l}){let{dir:u}=Fe();return a?(0,G.jsx)(`div`,{role:`presentation`,...l,style:{...c,...ui({position:e,arrowSize:t,arrowOffset:n,arrowRadius:r,arrowPosition:i,dir:u,arrowX:o,arrowY:s})}}):null}fi.displayName=`@mantine/core/FloatingArrow`;function pi(e,t){if(e===`rtl`&&(t.includes(`right`)||t.includes(`left`))){let[e,n]=t.split(`-`),r=e===`right`?`left`:`right`;return n===void 0?r:`${r}-${n}`}return t}var mi={root:`m_9814e45f`},hi={zIndex:ie(`modal`)},gi=a((e,{gradient:t,color:n,backgroundOpacity:i,blur:a,radius:o,zIndex:l})=>({root:{"--overlay-bg":t||(n!==void 0||i!==void 0)&&s(n||`#000`,i??.6)||void 0,"--overlay-filter":a?`blur(${c(a)})`:void 0,"--overlay-radius":o===void 0?void 0:r(o),"--overlay-z-index":l?.toString()}})),_i=d(e=>{let t=l(`Overlay`,hi,e),{classNames:n,className:r,style:i,styles:a,unstyled:o,vars:s,fixed:c,center:u,children:d,radius:f,zIndex:h,gradient:g,blur:_,color:v,backgroundOpacity:y,mod:b,attributes:x,...S}=t;return(0,G.jsx)(p,{...m({name:`Overlay`,props:t,classes:mi,className:r,style:i,classNames:n,styles:a,unstyled:o,attributes:x,vars:s,varsResolver:gi})(`root`),mod:[{center:u,fixed:c},b],...S,children:d})});_i.classes=mi,_i.varsResolver=gi,_i.displayName=`@mantine/core/Overlay`;function vi(e){let t=document.createElement(`div`);return t.setAttribute(`data-portal`,`true`),typeof e.className==`string`&&t.classList.add(...e.className.split(` `).filter(Boolean)),typeof e.style==`object`&&Object.assign(t.style,e.style),typeof e.id==`string`&&t.setAttribute(`id`,e.id),t}function yi({target:e,reuseTargetNode:t,...n}){if(e)return typeof e==`string`?document.querySelector(e)||vi(n):e;if(t){let e=document.querySelector(`[data-mantine-shared-portal-node]`);if(e)return e;let t=vi(n);return t.setAttribute(`data-mantine-shared-portal-node`,`true`),document.body.appendChild(t),t}return vi(n)}var bi={reuseTargetNode:!0},xi=f(e=>{let{children:t,target:n,reuseTargetNode:r,ref:i,...a}=l(`Portal`,bi,e),[o,s]=(0,H.useState)(!1),c=(0,H.useRef)(null);return k(()=>(s(!0),c.current=yi({target:n,reuseTargetNode:r,...a}),Ce(i,c.current),!n&&!r&&c.current&&document.body.appendChild(c.current),()=>{!n&&!r&&c.current&&document.body.removeChild(c.current)}),[n]),!o||!c.current?null:(0,je.createPortal)((0,G.jsx)(G.Fragment,{children:t}),c.current)});xi.displayName=`@mantine/core/Portal`;var Si=f(({withinPortal:e=!0,children:t,...n})=>h()===`test`||!e?(0,G.jsx)(G.Fragment,{children:t}):(0,G.jsx)(xi,{...n,children:t}));Si.displayName=`@mantine/core/OptionalPortal`;var[Ci,wi]=ne(`Popover component was not found in the tree`);function Ti({childProps:e,disabled:t,opened:n,longPressDelay:r=500,setReference:i,open:a}){let o=(0,H.useRef)(!1),s=(0,H.useRef)(!1),c=(0,H.useRef)(null),l=(0,H.useRef)(t);l.current=t;let u=(e,t,n)=>{i({getBoundingClientRect:()=>({x:e,y:t,width:0,height:0,top:t,left:e,right:e,bottom:t,toJSON:()=>void 0}),contextElement:n}),a()},d=se(e.onMouseDown,e=>{t||e.button===2&&e.stopPropagation()}),f=se(e.onContextMenu,e=>{t||e.defaultPrevented||(e.preventDefault(),!s.current&&(u(e.clientX,e.clientY,e.currentTarget),o.current&&(s.current=!0)))}),p=De(e=>{if(l.current||s.current)return;let t=e,n=t.touches[0]??t.changedTouches[0];n&&(u(n.clientX,n.clientY,c.current),s.current=!0)},{threshold:r,events:[`touch`],cancelOnMove:!0,onStart:e=>{o.current=!0,s.current=!1,c.current=e.currentTarget},onFinish:e=>{o.current=!1,s.current=!1,l.current||e.preventDefault()},onCancel:()=>{o.current=!1,s.current=!1}});return{onContextMenu:f,onMouseDown:d,onTouchStart:se(e.onTouchStart,p.onTouchStart),onTouchEnd:se(e.onTouchEnd,p.onTouchEnd),onTouchCancel:se(e.onTouchCancel,p.onTouchCancel),onTouchMove:se(e.onTouchMove,p.onTouchMove),style:t?e.style:{...e.style,WebkitTouchCallout:`none`,WebkitUserSelect:`none`,userSelect:`none`},"data-expanded":n?!0:void 0}}function Ei(e){let{children:t,disabled:n,longPressDelay:r}=l(`PopoverContextMenu`,null,e),i=Ne(t);if(!i)throw Error(`Popover.ContextMenu component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported`);let a=wi();return(0,H.cloneElement)(i,Ti({childProps:i.props,disabled:n||a.disabled,opened:a.opened,longPressDelay:r,setReference:a.reference,open:()=>{a.opened||a.onToggle()}}))}Ei.displayName=`@mantine/core/PopoverContextMenu`;function Di({children:e,active:t=!0,refProp:n=`ref`,innerRef:r}){let i=we(Se(t),r),a=Ne(e);return a?(0,H.cloneElement)(a,{[n]:i}):e}function Oi(e){return(0,G.jsx)(ai,{tabIndex:-1,"data-autofocus":!0,...e})}Di.displayName=`@mantine/core/FocusTrap`,Oi.displayName=`@mantine/core/FocusTrapInitialFocus`,Di.InitialFocus=Oi;var ki={dropdown:`m_38a85659`,arrow:`m_a31dc6c1`,overlay:`m_3d7bc908`},Ai=f(e=>{let t=l(`PopoverDropdown`,null,e),{className:n,style:r,vars:i,children:a,onKeyDownCapture:o,variant:s,classNames:u,styles:d,ref:f,...m}=t,h=wi(),{dir:g}=Fe(),_=h.arrowPosition===`merge`&&h.withArrow?di({position:h.placement,dir:g}):void 0,v=fe({opened:h.opened,shouldReturnFocus:h.returnFocus}),y=h.withRoles?{"aria-labelledby":h.getTargetId(),id:h.getDropdownId(),role:`dialog`,tabIndex:-1}:{},b=we(f,h.floating);return h.disabled?null:(0,G.jsx)(Si,{...h.portalProps,withinPortal:h.withinPortal,children:(0,G.jsx)(M,{mounted:h.opened,...h.transitionProps,transition:h.transitionProps?.transition||`fade`,duration:h.transitionProps?.duration??150,keepMounted:h.keepMounted,keepMountedMode:h.keepMountedMode,exitDuration:typeof h.transitionProps?.exitDuration==`number`?h.transitionProps.exitDuration:h.transitionProps?.duration,children:e=>(0,G.jsx)(Di,{active:h.trapFocus&&h.opened,innerRef:b,children:(0,G.jsxs)(p,{...y,...m,variant:s,onKeyDownCapture:oe(()=>{h.onClose?.(),h.onDismiss?.()},{active:h.closeOnEscape,onTrigger:v,onKeyDown:o}),"data-position":h.placement,"data-fixed":h.floatingStrategy===`fixed`||void 0,...h.getStyles(`dropdown`,{className:n,props:t,classNames:u,styles:d,style:[{...e,..._,zIndex:h.zIndex,top:h.y??0,left:h.x??0,width:h.width===`target`?void 0:c(h.width),...h.referenceHidden?{display:`none`}:null},h.resolvedStyles?.dropdown,d?.dropdown,r]}),children:[a,(0,G.jsx)(fi,{ref:h.arrowRef,arrowX:h.arrowX,arrowY:h.arrowY,visible:h.withArrow,position:h.placement,arrowSize:h.arrowSize,arrowRadius:h.arrowRadius,arrowOffset:h.arrowOffset,arrowPosition:h.arrowPosition,...h.getStyles(`arrow`,{props:t,classNames:u,styles:d})})]})})})})});Ai.classes=ki,Ai.displayName=`@mantine/core/PopoverDropdown`;var ji={refProp:`ref`,popupType:`dialog`},Mi=f(e=>{let{children:t,refProp:n,popupType:r,ref:i,...a}=l(`PopoverTarget`,ji,e),o=Ne(t);if(!o)throw Error(`Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported`);let s=a,c=wi(),d=we(c.reference,Me(o),i),f=c.withRoles?{"aria-haspopup":r,"aria-expanded":c.opened,"aria-controls":c.opened?c.getDropdownId():void 0,id:c.getTargetId()}:{},p=o.props;return(0,H.cloneElement)(o,{...s,...f,...c.targetProps,className:u(c.targetProps.className,s.className,p.className),[n]:d,...c.controlled?null:{onClick:e=>{c.onToggle(),p.onClick?.(e)}}})});Mi.displayName=`@mantine/core/PopoverTarget`;function Ni(e){if(e===void 0)return{shift:!0,flip:!0};let t={...e};return e.shift===void 0&&(t.shift=!0),e.flip===void 0&&(t.flip=!0),t}function Pi(e,t,n,r){let i=Ni(e.middlewares),a=[S(e.offset),v()];if(i.flip&&!n){let e=typeof i.flip==`boolean`?{}:i.flip,t=r?{fallbackStrategy:`initialPlacement`,...e}:e;a.push(x(t))}if(i.shift){let t=typeof i.shift==`boolean`?{}:i.shift;a.push(_(n=>{let r=n.placement.startsWith(`top`)||n.placement.startsWith(`bottom`);return{limiter:b(),padding:5,...e.width===`target`&&r?{mainAxis:!1}:null,...t}}))}return i.inline&&a.push(typeof i.inline==`boolean`?g():g(i.inline)),a.push(C({element:e.arrowRef,padding:e.arrowOffset})),(i.size||e.width===`target`)&&a.push(y({...typeof i.size==`boolean`?{}:i.size,apply({rects:n,availableWidth:r,availableHeight:a,...o}){let s=t().refs.floating.current?.style??{};i.size&&(typeof i.size==`object`&&i.size.apply?i.size.apply({rects:n,availableWidth:r,availableHeight:a,...o}):Object.assign(s,{maxWidth:`${r}px`,maxHeight:`${a}px`})),e.width===`target`&&Object.assign(s,{width:`${n.reference.width}px`})}})),a}function Fi(e){let[t,n]=I({value:e.opened,defaultValue:e.defaultOpened,finalValue:!1,onChange:e.onChange}),r=(0,H.useRef)(t),[i,a]=(0,H.useState)(null),o=e.preventPositionChangeWhenVisible!==!1,s=(0,H.useRef)(t);t!==s.current&&(s.current=t,t&&i!==null&&a(null));let c=(0,H.useCallback)(()=>a(null),[]),l=()=>{t&&!e.disabled&&n(!1)},u=()=>{e.disabled||n(!t)},d=Rr({open:t,strategy:e.strategy,placement:o?i??e.position:e.position,middleware:Pi(e,()=>d,o&&i!==null,o),whileElementsMounted:e.keepMounted?void 0:A});(0,H.useEffect)(()=>{if(!e.keepMounted)return;let n=d.refs.reference.current,r=d.refs.floating.current;if(t&&n&&r)return A(n,r,d.update)},[e.keepMounted,t,d.update,d.elements.reference,d.elements.floating]);let f=(0,H.useRef)(!1);k(()=>{if(!t){f.current=!1;return}if(!o||i!==null)return;let e=d.refs.floating.current;if(e&&e.offsetHeight!==0&&e.offsetWidth!==0){if(!f.current){f.current=!0,d.update();return}d.isPositioned&&a(d.placement)}},[o,t,d.isPositioned,d.placement,i,d.update]);let p=(0,H.useRef)(d.placement);return k(()=>{p.current!==d.placement&&(p.current=d.placement,e.onPositionChange?.(d.placement))},[d.placement]),F(()=>{t!==r.current&&(t?e.onOpen?.():e.onClose?.()),r.current=t},[t,e.onClose,e.onOpen]),{floating:d,controlled:typeof e.opened==`boolean`,opened:t,onClose:l,onToggle:u,resetLockedPlacement:c}}var Ii={position:`bottom`,offset:8,transitionProps:{transition:`fade`,duration:150},middlewares:{flip:!0,shift:!0,inline:!1},arrowSize:7,arrowOffset:5,arrowRadius:0,arrowPosition:`side`,closeOnClickOutside:!0,withinPortal:!0,closeOnEscape:!0,trapFocus:!1,withRoles:!0,returnFocus:!1,withOverlay:!1,hideDetached:!0,preventPositionChangeWhenVisible:!0,clickOutsideEvents:[`mousedown`,`touchstart`],zIndex:ie(`popover`),__staticSelector:`Popover`,width:`max-content`},Li=a((e,{radius:t,shadow:n})=>({dropdown:{"--popover-radius":t===void 0?void 0:r(t),"--popover-shadow":i(n)}}));function Ri(e){let t=l(`Popover`,Ii,e),{children:n,position:r,offset:i,onPositionChange:a,opened:o,transitionProps:s,onExitTransitionEnd:c,onEnterTransitionEnd:u,width:d,middlewares:f,withArrow:p,arrowSize:g,arrowOffset:_,arrowRadius:v,arrowPosition:y,unstyled:b,classNames:x,styles:S,closeOnClickOutside:C,withinPortal:w,portalProps:T,closeOnEscape:O,clickOutsideEvents:k,trapFocus:A,onClose:j,onDismiss:N,onOpen:P,onChange:F,zIndex:I,radius:L,shadow:ee,id:R,defaultOpened:z,__staticSelector:B,withRoles:V,disabled:te,returnFocus:U,variant:ne,keepMounted:re,keepMountedMode:ie,vars:ae,floatingStrategy:oe,withOverlay:se,overlayProps:ce,hideDetached:le,attributes:ue,preventPositionChangeWhenVisible:fe,...pe}=t,me=m({name:B,props:t,classes:ki,classNames:x,styles:S,unstyled:b,attributes:ue,rootSelector:`dropdown`,vars:ae,varsResolver:Li}),{resolvedStyles:he}=D({classNames:x,styles:S,props:t}),ge=(0,H.useRef)(null),[_e,ve]=(0,H.useState)(null),[ye,be]=(0,H.useState)(null),{dir:xe}=Fe(),Se=h(),Ce=E(R),W=Fi({middlewares:f,width:d,position:pi(xe,r),offset:typeof i==`number`?i+(p?g/2:0):i,arrowRef:ge,arrowOffset:_,onPositionChange:a,opened:o,defaultOpened:z,onChange:F,onOpen:P,onClose:j,onDismiss:N,strategy:oe,disabled:te,preventPositionChangeWhenVisible:fe,keepMounted:re});de(()=>{C&&(W.onClose(),N?.())},k,[_e,ye]);let we=(0,H.useCallback)(e=>{ve(e),W.floating.refs.setReference(e)},[W.floating.refs.setReference]),Te=(0,H.useCallback)(e=>{be(e),W.floating.refs.setFloating(e)},[W.floating.refs.setFloating]),Ee=(0,H.useCallback)(()=>{s?.onExited?.(),c?.(),W.resetLockedPlacement()},[s?.onExited,c,W.resetLockedPlacement]),De=(0,H.useCallback)(()=>{s?.onEntered?.(),u?.()},[s?.onEntered,u]);return(0,G.jsxs)(Ci,{value:{returnFocus:U,disabled:te,controlled:W.controlled,reference:we,floating:Te,x:W.floating.x,y:W.floating.y,arrowX:W.floating?.middlewareData?.arrow?.x,arrowY:W.floating?.middlewareData?.arrow?.y,opened:W.opened,arrowRef:ge,transitionProps:{...s,onExited:Ee,onEntered:De},width:d,withArrow:p,arrowSize:g,arrowOffset:_,arrowRadius:v,arrowPosition:y,placement:W.floating.placement,trapFocus:A,withinPortal:w,portalProps:T,zIndex:I,radius:L,shadow:ee,closeOnEscape:O,onDismiss:N,onClose:W.onClose,onToggle:W.onToggle,getTargetId:()=>Ce,getDropdownId:()=>`${Ce}-dropdown`,withRoles:V,targetProps:pe,__staticSelector:B,classNames:x,styles:S,unstyled:b,variant:ne,keepMounted:re,keepMountedMode:ie,getStyles:me,resolvedStyles:he,floatingStrategy:oe,referenceHidden:le&&Se!==`test`?W.floating.middlewareData.hide?.referenceHidden:!1},children:[n,se&&(0,G.jsx)(M,{transition:`fade`,mounted:W.opened,duration:s?.duration||250,exitDuration:s?.exitDuration||250,children:e=>(0,G.jsx)(Si,{withinPortal:w,children:(0,G.jsx)(_i,{...ce,...me(`overlay`,{className:ce?.className,style:[e,ce?.style]})})})})]})}Ri.Target=Mi,Ri.Dropdown=Ai,Ri.ContextMenu=Ei,Ri.varsResolver=Li,Ri.displayName=`@mantine/core/Popover`,Ri.extend=e=>e,Ri.withProps=e=>{let t=t=>(0,G.jsx)(Ri,{...e,...t});return t.extend=Ri.extend,t.displayName=`WithProps(${Ri.displayName})`,t};function zi(e){return H.Children.toArray(e).filter(Boolean)}var Bi={root:`m_4081bf90`},Vi={preventGrowOverflow:!0,gap:`md`,align:`center`,justify:`flex-start`,wrap:`wrap`},Hi=a((e,{grow:t,preventGrowOverflow:n,gap:r,align:i,justify:a,wrap:s},{childWidth:c})=>({root:{"--group-child-width":t&&n?c:void 0,"--group-gap":o(r),"--group-align":i,"--group-justify":a,"--group-wrap":s}})),Ui=f(e=>{let t=l(`Group`,Vi,e),{classNames:n,className:r,style:i,styles:a,unstyled:s,children:c,gap:u,align:d,justify:f,wrap:h,grow:g,preventGrowOverflow:_,vars:v,variant:y,__size:b,mod:x,attributes:S,...C}=t,w=zi(c),T=w.length,E=o(u??`md`);return(0,G.jsx)(p,{...m({name:`Group`,props:t,stylesCtx:{childWidth:`calc(${100/T}% - (${E} - ${E} / ${T}))`},className:r,style:i,classes:Bi,classNames:n,styles:a,unstyled:s,attributes:S,vars:v,varsResolver:Hi})(`root`),variant:y,mod:[{grow:g},x],size:b,...C,children:w})});Ui.classes=Bi,Ui.varsResolver=Hi,Ui.displayName=`@mantine/core/Group`;function Wi({style:e,size:t=16,...n}){return(0,G.jsx)(`svg`,{viewBox:`0 0 15 15`,fill:`none`,xmlns:`http://www.w3.org/2000/svg`,style:{...e,width:c(t),height:c(t),display:`block`},...n,children:(0,G.jsx)(`path`,{d:`M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z`,fill:`currentColor`,fillRule:`evenodd`,clipRule:`evenodd`})})}Wi.displayName=`@mantine/core/AccordionChevron`;function Gi({size:e,style:t,...n}){return(0,G.jsx)(`svg`,{viewBox:`0 0 10 7`,fill:`none`,xmlns:`http://www.w3.org/2000/svg`,style:e===void 0?t:{width:c(e),height:c(e),...t},"aria-hidden":!0,...n,children:(0,G.jsx)(`path`,{d:`M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z`,fill:`currentColor`,fillRule:`evenodd`,clipRule:`evenodd`})})}function Ki({indeterminate:e,...t}){return e?(0,G.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 32 6`,"aria-hidden":!0,...t,children:(0,G.jsx)(`rect`,{width:`32`,height:`6`,fill:`currentColor`,rx:`3`})}):(0,G.jsx)(Gi,{...t})}function qi(e,...t){let n=e[0];for(let r=0;r<t.length;r++)n+=String(t[r])+e[r+1];return n}function Ji(e){return`--`+e.replace(/[A-Z]/g,e=>`-`+e.toLowerCase())}function Yi(e,t){if(!t)return e;let n=Object.entries(t).map(([e,t])=>{let n=typeof t==`string`?{text:t}:t,r=n.variant??`secondary`;return{id:Symbol(e),overrideKey:null,type:r,text:n.text,defaultTextKey:`buttonOk`,validate:n.validate??!0,action:e,separate:r!==`secondary`}}),[r,...i]=e;return[...r?[r]:[],...n.filter(e=>!e.separate),...i,...n.filter(e=>e.separate)]}var Xi=Symbol(`ok`),Zi=Symbol(`cancel`),Qi=Symbol(`confirm`),$i=Symbol(`decline`);function ea(e,t,n,r){return{id:e,overrideKey:t,type:n,defaultTextKey:r,validate:n!==`secondary`}}var ta=ea(Xi,`ok`,`primary`,`buttonOk`),na=ea(Xi,`ok`,`danger`,`buttonOk`),ra=ea(Qi,`confirm`,`primary`,`buttonOk`),ia=ea(Qi,`confirm`,`danger`,`buttonOk`),aa=ea(Zi,`cancel`,`secondary`,`buttonCancel`),oa=ea(Qi,`confirm`,`primary`,`buttonYes`),sa=ea(Qi,`confirm`,`danger`,`buttonYes`),ca=ea($i,`decline`,`secondary`,`buttonNo`);function la(e,t){let n=1,r=`${e}-${n}`;for(;customElements.get(r);)n+=1,r=`${e}-${n}`;return customElements.define(r,t),{tag:r,index:n}}function Z(e,t,...n){let r=document.createElement(e);if(t)for(let e in t){let n=t[e];n!=null&&n!==!1&&(e===`class`?r.className=String(n):e.startsWith(`on`)&&typeof n==`function`?r.addEventListener(e.slice(2).toLowerCase(),n):n===!0?r.setAttribute(e,``):r.setAttribute(e,String(n)))}return ua(r,n),r}function ua(e,t){for(let n of t)n!=null&&n!==!1&&n!==!0&&(Array.isArray(n)?ua(e,n):n instanceof Node?e.appendChild(n):e.appendChild(document.createTextNode(String(n))))}function da(e){let t=document.createElement(`template`);return t.innerHTML=e.trim(),t.content.firstElementChild}function fa(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}var pa=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" overflow="visible">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
  </svg>
`,ma=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" overflow="visible">
    <path d="M3 14.5A1.5 1.5 0 0 1 1.5 13V3A1.5 1.5 0 0 1 3 1.5h8a.5.5 0 0 1 0 1H3a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8a.5.5 0 0 1 1 0v5a1.5 1.5 0 0 1-1.5 1.5z"/>
    <path d="m8.354 10.354 7-7a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0"/>
  </svg>
`,ha=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" overflow="visible">
    <path d="M6.95.435c.58-.58 1.52-.58 2.1 0l6.515 6.516c.58.58.58 1.519 0 2.098L9.05 15.565c-.58.58-1.519.58-2.098 0L.435 9.05a1.48 1.48 0 0 1 0-2.098zm1.4.7a.495.495 0 0 0-.7 0L1.134 7.65a.495.495 0 0 0 0 .7l6.516 6.516a.495.495 0 0 0 .7 0l6.516-6.516a.495.495 0 0 0 0-.7L8.35 1.134z"/>
    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
  </svg>
`,ga=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" overflow="visible">
    <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
    <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
  </svg>
`,_a=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
  </svg>
`,va=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="-1 -1 18 18">
    <path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707"/>
  </svg>
`,ya=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="-1 -1 18 18">
    <path fill-rule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707M15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707"/>
  </svg>
`,ba=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" overflow="visible">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
  </svg>
`,xa=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" overflow="visible">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
  </svg>
`,Sa=`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
  </svg>
`;function Ca(e){switch(e){case`info`:return da(pa);case`success`:return da(ma);case`warn`:case`error`:return da(xa);case`confirm`:case`confirmCritical`:case`decide`:case`decideCritical`:return da(ba);case`form`:case`formCritical`:return null}}var Q={background:`light-dark(white, #333)`,text:`light-dark(black, white)`,radius:`6px`,divider:`light-dark(#e5e7eb, rgba(255, 255, 255, 0.12))`,primaryText:`var(--theme-surface, #ffffff)`,primaryBackground:`var(--theme-color-primary-500, #007EC6)`,secondaryText:`var(--theme-text, #1f2430)`,secondaryBackground:`white`,secondaryBorder:`#b0b0b0`,dangerText:`white`,dangerBackground:`#D03B3B`,successAccent:`var(--theme-color-success-500, #00883c)`,closeRadius:`100%`,actionRadius:`5px`,buttonTransition:`120ms ease`,buttonActiveScale:`1`,fontSize:`16px`,fontFamily:`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,spinner:`#444`};function wa(e){return{...Q,...e}}var $={textColor:`var(--dialog-text, ${Q.text})`,dividerColor:`var(--dialog-divider, ${Q.divider})`,primaryTextColor:`var(--dialog-primary-text, ${Q.primaryText})`,primaryBackgroundColor:`var(--dialog-primary-background, ${Q.primaryBackground})`,secondaryTextColor:`var(--dialog-secondary-text, ${Q.secondaryText})`,secondaryBackgroundColor:`var(--dialog-secondary-background, ${Q.secondaryBackground})`,secondaryBorderColor:`var(--dialog-secondary-border, ${Q.secondaryBorder})`,dangerTextColor:`var(--dialog-danger-text, ${Q.dangerText})`,dangerBackgroundColor:`var(--dialog-danger-background, ${Q.dangerBackground})`,successColor:`var(--dialog-success-accent, ${Q.successAccent})`,dialogBorderRadius:`var(--dialog-radius, ${Q.radius})`,closeButtonBorderRadius:`var(--dialog-close-radius, ${Q.closeRadius})`,actionButtonBorderRadius:`var(--dialog-action-radius, ${Q.actionRadius})`,dialogBackgroundColor:`var(--dialog-background, ${Q.background})`,buttonTransition:`var(--dialog-button-transition, ${Q.buttonTransition})`,buttonActiveScale:`var(--dialog-button-active-scale, ${Q.buttonActiveScale})`,fontSize:`var(--dialog-font-size, ${Q.fontSize})`,fontFamily:`var(--dialog-font-family, ${Q.fontFamily})`,spinnerColor:`var(--dialog-spinner, ${Q.spinner})`},Ta=qi`
  dialog {
    outline: none;
    position: fixed;
    /* Horizontally centered; vertically a bit above the middle (2026-10-08, the user's
       wish; a top anchor at 12dvh for most dialogs and exact centering for forms before):
       the top edge at the middle, then up by 40% of the dialog's own height (a percentage
       of translate is the element's own size) plus 10dvh, so the free space is split
       40/60 above and below it. Never closer than 2em to the top (max()), and with the
       max-height below never past the bottom. translate is its own property: the open
       animation's transform (element.ts, #growIn) adds to it. */
    inset-inline: 0;
    inset-block: 50dvh auto;
    translate: 0 max(calc(2em - 50dvh), calc(-40% - 10dvh));
    width: fit-content;
    /* Cap the line length so a long single-line message wraps to a few lines instead of
       stretching the dialog very wide - a calmer width/height ratio. Still shrinks to fit
       the viewport on small screens.
       The cap is what a message *just* over it has to live with: sizing here is computed
       from the unwrapped text and never revisited once it wraps, so such a message pins
       the box to the full cap and then fills only part of it. A tighter cap keeps that
       leftover small. It costs height on genuinely long text, which wraps a line or two
       further, and nothing at all on text that already fits. */
    max-width: min(calc(100dvw - 4em), 26em);
    height: fit-content;
    max-height: calc(100dvh - 4em);
    margin-inline: auto;
    margin-block: 0;
    color: ${$.textColor};
    background-color: ${$.dialogBackgroundColor};
    border: none;
    border-radius: ${$.dialogBorderRadius};
    min-width: 22em;
    box-sizing: border-box;
    padding: 0;
    overflow: auto;
    /* No bounce at the ends of a scroll area (Firefox's elastic overscroll), here and in
       the bodies below (2026-10-08). */
    overscroll-behavior: none;
    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.25), 0 4px 10px -4px rgba(0,0,0,0.15);  
  }

  dialog[open].closing {
    animation: dialog-fade-out ${200}ms ease-in-out;
  }

  dialog[open]::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
  }

  dialog[open]:not(.closing)::backdrop {
    animation: backdrop-fade-in ${200}ms ease-in-out;
  }

  dialog[open].closing::backdrop {
    animation: backdrop-fade-out ${200}ms ease-in-out;
  }

  /* Form dialogs get a bit more room so labelled fields aren't cramped. Placed like every
     centered dialog (above); a note added to a form (a failed save) moves it up by 40% of
     the note's height. */
  :host([data-dialog-type="form"]) dialog,
  :host([data-dialog-type="formCritical"]) dialog {
    min-width: 26em;
  }

  /* ---- Drawer surface ------------------------------------------------------
     Same modal <dialog> as the centered surface, for every dialog type — only the geometry changes, so the focus
     trap, inert background, Escape handling and ::backdrop all keep working untouched.
     Undoes the centering above: auto on the start side pushes the panel to the inline-end
     edge (right in LTR, left in RTL) and it fills the block axis. */
  :host([data-surface="drawer"]) dialog {
    inset: 0;
    translate: none;
    margin-inline-start: auto;
    margin-inline-end: 0;
    margin-block: 0;
    /* As wide as the content's narrowest layout (min-content: text still wraps), at least
       the named width (data-width, below; 30em by default) and never past the viewport:
       content that needs more room (a min-width, a wide table) widens it. The floor also
       replaces the base rule's 22em, which would exceed the panel on a narrow phone. */
    --named-width: 30em;
    width: min-content;
    min-width: min(calc(100dvw - 2em), var(--named-width));
    max-width: calc(100dvw - 2em);
    height: 100dvh;
    max-height: none;
    border-radius: 0;
    /* The panel itself doesn't scroll — its body does (below) — so the title and the
       action buttons stay put on a long form. */
    overflow: hidden;
  }

  /* ---- Named widths (data-width) ------------------------------------------
     For both surfaces. "default" keeps each surface's own sizing (a centered dialog sizes
     itself to its text, up to 26em; a drawer is 30em). The others set --named-width, the
     floor of the rules that use it: the drawer above, the centered dialog below. */
  :host([data-width="wide"]) dialog {
    --named-width: 48em;
  }

  :host([data-width="extraWide"]) dialog {
    --named-width: 64em;
  }

  :host([data-width="full"]) dialog {
    --named-width: 100dvw;
  }

  /* A centered dialog of a named width: like the drawer, as wide as its content needs, at
     least that width, and never past the viewport (2em of it on each side). After the
     form rule above, whose 26em floor it replaces. Placed vertically like every centered
     dialog (the base rule). */
  :host(:not([data-surface="drawer"]):is([data-width="wide"], [data-width="extraWide"], [data-width="full"])) dialog {
    width: min-content;
    min-width: min(calc(100dvw - 4em), var(--named-width));
    max-width: calc(100dvw - 4em);
  }

  /* A question in place of the content: the dialog is only as
     wide as the question needs, not the form's floor (the attributes are always on the
     host; naming them all outweighs the rules of the form and the named widths above). */
  :host([data-asking][data-dialog-type][data-surface][data-width]:not([data-surface="drawer"])) dialog {
    width: fit-content;
    min-width: 0;
  }

  /* ---- Maximized (data-maximized, see DialogConfig.maximizable) --------------------
     The whole viewport, for both surfaces and every width: no margin, no rounding. The
     three attributes are always on the host; naming them all makes this more specific than
     the rules of the named widths above (two conditions in their :host()). */
  :host([data-maximized][data-surface][data-width]) dialog {
    inset: 0;
    translate: none;
    width: 100dvw;
    min-width: 0;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    border-radius: 0;
  }

  /* Its content fills that height, so the buttons sit at the bottom edge and the body
     takes the rest (the drawer's content does already). */
  :host([data-maximized]:not([data-surface="drawer"])) .dialog-content {
    flex: 1 1 auto;
  }

  :host([data-maximized]:not([data-surface="drawer"])) .dialog-content .body {
    flex: 1 1 auto;
  }

  /* The content part passes that height on (both surfaces), so content can fill the
     maximized dialog: the part is a column at least as high as the body's free room, and
     the slotted content grows with it. The page takes it from there with CSS keyed on
     [data-maximized], which is on the dialog element, an ancestor of the content in the
     light DOM. Not shrinking: longer content still scrolls the body, as before. */
  :host([data-maximized]) .dialog-content .body > .part[data-part="content"] {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
  }

  :host([data-maximized]) ::slotted([slot="content"]) {
    flex: 1 0 auto;
  }

  /* Only the body scrolls, also in a centered dialog: the header (title, close button) and
     the footer (note, action buttons) stay in place, like in the drawer below. The open
     dialog is a column whose one child, the content, shrinks to the dialog's max-height
     (not a max-height of its own: the content's em may differ from the dialog's, e.g. with
     a theme's fontSize, and the few pixels between them gave the dialog a second scroll
     bar). Not the spinner placeholder, which centers its spinner itself. */
  :host(:not([data-surface="drawer"])) dialog[open]:not(.spinner-dialog) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :host(:not([data-surface="drawer"])) .dialog-content {
    display: flex;
    flex-direction: column;
    flex: 0 1 auto;
    min-height: 0;
  }

  :host(:not([data-surface="drawer"])) .dialog-content .body {
    flex: 0 1 auto;
    overflow-y: auto;
    overscroll-behavior: none;
  }

  :host(:not([data-surface="drawer"])) .dialog-content > :not(.body) {
    flex: none;
  }

  :host([data-surface="drawer"]) .dialog-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    /* Same reason as min-width above: the base 20em floor is wider than the panel on a
       small screen. */
    min-width: 0;
  }

  :host([data-surface="drawer"]) .dialog-content .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: none;
  }

  /* Slides out to the edge rather than fading in place. The distance is a custom property
     because transforms have no logical equivalent — the element sets it per writing
     direction (see #growIn in element.ts). */
  :host([data-surface="drawer"]) dialog[open].closing {
    animation: drawer-slide-out ${200}ms ease-in-out;
  }

  /* Hidden rather than absent when the dialog has no icon: the adapter renders a fixed
     set of slot wrappers (that is what lets a framework diff them), so an empty one is
     always assigned and would otherwise claim the header's gap. The id selector beats the
     UA [hidden] rule, hence the explicit pairing. */
  #icon[hidden] {
    display: none;
  }

  #icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    /* The slotted glyphs are sized in em (width/height="1em" in the markup), so this
       is the single lever for how large the header icon renders. */
    font-size: 1.6em;
    line-height: 1;
  }

  /* The icon is projected through the "icon" slot (light DOM), so this stylesheet
     can't reach the actual <svg> inside it: ::slotted() only selects the top-level
     slotted node itself, never its descendants (this previous rule tried
     "::slotted([slot=\"icon\"]) svg", which is invalid — a pseudo-element can't be
     followed by a further compound selector — and, being comma-listed with #icon
     svg, silently invalidated this whole rule). Sizing/overflow for these glyphs is
     baked into the SVG markup itself (see internal/icons.ts, dialogs/icons.ts)
     instead; this just avoids the inline-element baseline gap on the wrapper. */
  ::slotted([slot="icon"]) {
    display: flex;
  }

  :host([data-dialog-type="info"]) #icon,
  :host([data-dialog-type="confirm"]) #icon,
  :host([data-dialog-type="decide"]) #icon,
  :host([data-dialog-type="success"]) #icon {
    color: ${$.primaryBackgroundColor};
  }

  :host([data-dialog-type="warn"]) #icon,
  :host([data-dialog-type="error"]) #icon,
  :host([data-dialog-type="confirmCritical"]) #icon,
  :host([data-dialog-type="decideCritical"]) #icon {
    color: ${$.dangerBackgroundColor};
  }

  .dialog-content {
    /* Chrome (titles, buttons) stays unselectable; the body and note opt back
       into text selection below so error messages can be copied. */
    user-select: none;
    min-width: 20em;
    font-size: ${$.fontSize};
    font-family: ${$.fontFamily};
  }

  .dialog-content .header {
    display: flex;
    align-items: center;
    gap: 0.6em;
    padding: 1.25em 1.5em 0.75em;
  }

  /* Grows to fill the row so the close button is pushed to the far edge; min-width: 0
     lets long titles wrap/ellipsize instead of overflowing. */
  .dialog-content .header .titles {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .dialog-content .header .titles .title {
    font-size: 1.1em;
    font-weight: 600;
    line-height: 1.25;
  }

  .dialog-content .header .titles .subtitle {
    font-size: 0.95em;
    line-height: 1.25;
    margin-top: -0.1em;
    opacity: 0.8;
  }

  .dialog-content .body {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 0 1.5em 1.1em 1.5em;
    min-height: 1.75em;
    line-height: 1.25em;
    user-select: text;
    /* pretty, not balance. The dialog is sized from the *unwrapped* text (see the
       width/max-width above), so a message just past the width cap takes the box to full
       width - and balance would then split it into two short, equal lines and leave the
       rest of that width empty, because balancing never feeds back into sizing. pretty
       keeps the orphan avoidance and lets the lines fill the box.
       Progressively enhanced: browsers without support fall back to normal wrapping. */
    text-wrap: pretty;
  }

  /* One shadow-side part per body slot, so an empty intro/outro can be taken out of the
     flex flow — the row gap above would otherwise show around nothing. It has to be a
     shadow element: styling the slotted wrapper instead is not an option, since any rule
     in the outer tree beats ::slotted() regardless of specificity. */
  .dialog-content .body > .part {
    min-width: 0;
  }
  .dialog-content .body > .part[hidden] {
    display: none;
  }

  /* Turns "\n" in a caller's plain string into a line break. Set only on slots the
     element has found to hold text and no markup (see #syncSlotPresence) — a Lit or JSX
     template is full of source-formatting newlines that must stay collapsed. */
  .pre-line {
    white-space: pre-line;
  }

  .dialog-content .footer {
    user-select: none;
  }

  /* A question asked in place of the content: the body is
     hidden (still in the DOM, so nothing typed is lost) and the footer, with the question
     and its two buttons, shows alone; */
  /* The header's stand-ins: a question icon, and the question's title if it has one. */
  #ask-icon,
  .ask-title {
    display: none;
  }
  :host([data-asking]) #icon {
    display: none;
  }
  :host([data-asking]) #ask-icon {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    font-size: 1.6em;
    line-height: 1;
    color: ${$.primaryBackgroundColor};
  }
  :host([data-asking]) #ask-icon[data-tone="error"] {
    color: ${$.dangerBackgroundColor};
  }
  #ask-icon svg {
    display: block;
    width: 1em;
    height: 1em;
    overflow: visible;
  }
  :host([data-asking][data-ask-title]) .ask-title {
    display: block;
  }
  :host([data-asking][data-ask-title]) .titles > :not(.ask-title) {
    display: none;
  }
  :host([data-asking]) .dialog-content .footer .note-icon {
    display: none;
  }
  :host([data-asking]) .dialog-content .body {
    display: none;
  }
  :host([data-asking]) .dialog-content .footer {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  :host([data-asking]) .dialog-content .footer .note {
    border: none;
    background: none;
    font-size: 1em;
  }
  /* The question's text left-aligned, the buttons stay centered. */
  :host([data-asking]) .dialog-content .footer .note-inner {
    justify-content: start;
    text-align: start;
  }
  :host([data-asking]) .dialog-content .footer .action-buttons {
    justify-content: center;
  }

  .dialog-content .footer .action-buttons {
    display: flex;
    flex-direction: row-reverse;
    gap: 0.4em;
    /* A little more room above and below the buttons (2026-10-06, the user's wish; 0.6em before). */
    padding: 0.8em 1.5em;
  }

  .action-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none;
    border: none;
    border-radius: ${$.actionButtonBorderRadius};
    padding: 0.65em 1.5em;
    /* A stack that ships a Medium (500) face, so the weight below is visible (unlike
       Helvetica/Arial, which only have 400 + 700). */
    font-family:
      system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif;
    font-weight: 500;
    /* Pin the line-height so the label box doesn't inherit the host page's line-height
       (which crosses the shadow boundary) — keeps the button snug and centering exact. */
    line-height: 1;
    cursor: pointer;
    transition:
      background-color ${$.buttonTransition},
      border-color ${$.buttonTransition},
      transform ${$.buttonTransition};
  }

  .action-button:active {
    transform: scale(${$.buttonActiveScale});
  }

  .action-button .spinner {
    display: none;
  }

  .action-button.loading .spinner {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    width: 1.5em;
    height: 1.5em;
    border: 3px solid color-mix(in srgb, currentColor 20%, transparent);
    border-top: 3px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    overflow: hidden;
    box-sizing: border-box;
  }

  .action-button.loading .button-text {
    visibility: hidden;
  }

  .action-button[data-type="primary"] {
    color: ${$.primaryTextColor};
    background-color: ${$.primaryBackgroundColor};
  }
  .action-button[data-type="primary"]:hover {
    background-color: color-mix(in srgb, ${$.primaryBackgroundColor}, black 10%);
  }
  .action-button[data-type="primary"]:active {
    background-color: color-mix(in srgb, ${$.primaryBackgroundColor}, black 20%);
  }

  .action-button[data-type="secondary"] {
    color: ${$.secondaryTextColor};
    background-color: ${$.secondaryBackgroundColor};
    border: 1px solid ${$.secondaryBorderColor};
  }
  .action-button[data-type="secondary"]:hover {
    background-color: color-mix(in srgb, ${$.secondaryBackgroundColor}, black 5%);
  }
  .action-button[data-type="secondary"]:active {
    background-color: color-mix(in srgb, ${$.secondaryBackgroundColor}, black 10%);
  }

  .action-button[data-type="danger"] {
    color: ${$.dangerTextColor};
    background-color: ${$.dangerBackgroundColor};
  }
  .action-button[data-type="danger"]:hover {
    background-color: color-mix(in srgb, ${$.dangerBackgroundColor}, black 15%);
  }
  .action-button[data-type="danger"]:active {
    background-color: color-mix(in srgb, ${$.dangerBackgroundColor}, black 40%);
  }

  /* A link action: text only, in the primary color. */
  .action-button[data-type="link"] {
    color: ${$.primaryBackgroundColor};
    background-color: transparent;
  }
  .action-button[data-type="link"]:hover {
    text-decoration: underline;
  }

  /* The separate buttons (danger and link actions) on the footer's other side: it is
     row-reverse, so the free space goes after the first of them (overridden buttons: a
     spacer between their two slots). */
  .action-button.separate-first {
    margin-inline-end: auto;
  }
  .actions-spacer {
    flex: 1;
  }

  .action-button[data-type="success"] {
    color: white;
    background-color: ${$.successColor};
  }
  .action-button[data-type="success"]:hover {
    background-color: color-mix(in srgb, ${$.successColor}, black 10%);
  }
  .action-button[data-type="success"]:active {
    background-color: color-mix(in srgb, ${$.successColor}, black 20%);
  }

  /* Maximize/Restore (only with maximizable) and close, at the end of the header, at its
     top. Close together: they are one group, not two items of the header's gap. */
  .header-buttons {
    flex: none;
    display: flex;
    align-self: flex-start;
    gap: 0.15em;
  }

  /* The maximize button has the look of the close button (it carries both classes). */
  .close-button {
    align-self: flex-start;
    border: none;
    border-radius: ${$.closeButtonBorderRadius};
    outline: none;
    margin: 0;
    font-size: 1em;
    line-height: 0;
    background-color: transparent;
    cursor: pointer;
    padding: 0.3em;
  }
  .close-button:hover {
    background-color: light-dark(
      color-mix(in srgb, white, black 7%),
      color-mix(in srgb, black, white 7%)
    );
  }
  .close-button:active {
    background-color: light-dark(
      color-mix(in srgb, #f0f0f0, black 10%),
      color-mix(in srgb, #f0f0f0, white 10%)
    );
  }

  /* Note (see FormAttempt.reject): lives inside the footer (see element.ts
     #buildChrome), as its first child — flush against the footer's top border
     (the divider line) with no gap, and edge-to-edge across the dialog with no rounding.
     Flat fill, normal text color, reddish icon.

     The enter/exit collapse is animated in JS (element.ts #animateNoteHeight)
     via the Web Animations API, using the element's actual measured height rather than a
     CSS transition — a height transition needs a concrete end value and "auto" isn't
     one. Two CSS-only workarounds were tried and discarded: an oversized max-height
     spent most of the transition idle and then clipped unevenly right at the end (the
     icon and text visibly diverged), and an animated CSS Grid fr track wasn't reliably
     smooth across engines. overflow: hidden below just clips content during that
     JS-driven height animation. */
  /* The animated wrapper. It is the element whose height is driven (see
     #animateNoteHeight), and it stays in the chrome for the dialog's whole life —
     only its slots fill and empty — so the collapse has something stable to run on. */
  .note-region {
    box-sizing: border-box;
    overflow: hidden;
  }
  /* Collapsed rather than display:none so the region stays in the accessibility tree and
     its role="alert" can announce (see #buildChrome). Its own overflow does the hiding,
     and the JS height animation overrides this while it plays. */
  .note-region.collapsed {
    height: 0;
  }

  .note {
    margin: 0;
    /* Border-box so the two 1px borders sit inside the natural height the wrapper
       measures, rather than adding to it. */
    box-sizing: border-box;
    border: none;
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 0;
    color: ${$.textColor};
    background-color: #f8f8f8;
    font-size: 0.85em;
    line-height: 1.35;
    user-select: text;
    overflow: hidden;
  }

  .note-inner {
    display: flex;
    align-items: center;
    gap: 0.85em;
    padding: 0.85em 1.5em;
  }

  .note .note-icon {
    flex: none;
    display: flex;
    align-items: center;
    font-size: 1.5em;
    line-height: 1;
    color: ${$.dangerBackgroundColor};
  }

  /* A question (FormAttempt.ask): not an error, so the primary color on a light ground of
     it, with a question mark. */
  .note[data-tone="question"] {
    background-color: color-mix(in srgb, ${$.primaryBackgroundColor} 8%, transparent);
  }
  .note[data-tone="question"] .note-icon {
    color: ${$.primaryBackgroundColor};
  }

  .note-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .note-title {
    font-weight: 600;
    line-height: 1.15;
  }
  /* A plain string: "\n" breaks the line (e.g. the discard question and its Esc hint). */
  .note-text {
    line-height: 1.25;
    white-space: pre-line;
  }
  .note-icon svg {
    display: block;
    width: 1em;
    height: 1em;
    /* This glyph draws to the edge of its 16×16 viewBox; the SVG viewport would
       otherwise shave that outer edge at this small size. */
    overflow: visible;
  }


  @keyframes drawer-slide-out {
    to {
      transform: translateX(var(--drawer-exit-translate, 100%));
      opacity: 0;
    }
  }

  @keyframes dialog-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes backdrop-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes backdrop-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
`+qi`
  :host {
    display: contents;
  }

  dialog.spinner-dialog {
    min-width: 0;
    width: 3.25em;
    height: 3.25em;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-spinner {
    width: 2.2em;
    height: 2.2em;
    border: 3px solid color-mix(in srgb, currentColor 20%, transparent);
    border-top: 3px solid ${$.spinnerColor};
    border-radius: 50%;
    animation: spin-plain 1s linear infinite;
    box-sizing: border-box;
  }

  @keyframes spin-plain {
    to { transform: rotate(360deg); }
  }
`,Ea=3,Da=0,Oa=``,ka=``;function Aa(){if(Da++>0)return;let e=document.documentElement,t=window.innerWidth-e.clientWidth;Oa=e.style.overflow,ka=e.style.paddingRight,e.style.overflow=`hidden`,t>0&&(e.style.paddingRight=`${t}px`)}function ja(){if(--Da>0)return;Da=0;let e=document.documentElement;e.style.overflow=Oa,e.style.paddingRight=ka}function Ma(e,t){return e.querySelector(`:scope > [slot="${t}"]`)}function Na(e){return e?e.childElementCount>0||(e.textContent??``).trim()!==``:!1}function Pa(e){return e!=null&&e.childElementCount===0}var Fa=0,Ia=null;function La(){if(Ia)return Ia;let{tag:e,index:t}=la(`js-interact-dialog`,class extends Ba{});return Fa=t,Ia=e,e}var Ra=0,za=typeof HTMLElement<`u`?HTMLElement:class{},Ba=class extends za{scopeClass=`__internal-dialog-${Fa}-${++Ra}__`;#e;#t=!1;#n=!1;#r=!1;#i=null;#a=!1;#o=null;#s;#c;#l;#u;#d=new Map;#f;#p;#m;#h=!1;#g;#_;#v=!1;#y=null;#b=null;#x=!1;#S=null;#C=!1;#w;#T=!1;#E=[];#D=[];#O=null;#k=!1;#A=!1;#j(e){this.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0}))}#M=!1;#N=!1;#P=!1;#F=null;#I=null;#L=null;#R=null;#z=null;#B=null;#V=null;#H=!1;#U=null;#W=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.appendChild(Z(`style`,null,Ta)),this.addEventListener(`click`,e=>{e.target?.closest?.(`[slot="action"], [slot="action-separate"]`)&&this.#me()}),e.addEventListener(`slotchange`,()=>{this.#o&&(this.#ce(),this.#fe())}),this.#e=Z(`dialog`,{onkeydown:this.#_e}),this.#e.addEventListener(`cancel`,e=>{e.preventDefault(),this.#j(`dialog-cancel`)}),e.appendChild(this.#e)}connectedCallback(){this.classList.add(this.scopeClass)}disconnectedCallback(){this.#r&&(this.#r=!1,ja()),this.#W&&=(this.#W.remove(),null)}#G=null;#K=!1;set props(e){this.#G=e,!this.#K&&(this.#K=!0,queueMicrotask(()=>this.#q()))}get props(){return this.#G}beginSwap(){let e=this.#e;return!e.open||this.#n?Promise.resolve():new Promise(t=>{let n=e.animate([{opacity:1,transform:`scale(1)`},{opacity:0,transform:`scale(0.97)`}],{duration:this.#t?300:140,easing:`ease-in`,fill:`forwards`});this.#i=n,this.#a=!0,this.#pe(),n.onfinish=()=>t(),n.oncancel=()=>t()})}getForm(){return this.querySelector(`form`)}async closeDialog(){let e=this.#e;!e||this.#n||(this.#n=!0,e.classList.add(`closing`),await Promise.race([new Promise(t=>e.addEventListener(`animationend`,()=>t(),{once:!0})),new Promise(e=>setTimeout(e,300))]),e.close())}#q(){this.#K=!1;let e=this.#G;e&&(e.spinnerOnly?(this.#Q(e.themeVars),this.#J()):(this.#Z(e),this.#te(e),this.#e.firstChild!==this.#o&&this.#e.replaceChildren(this.#o)),this.#e.open?this.#a&&(this.#a=!1,this.#X(),this.#he()):this.#Y())}#J(){this.#t=!0,this.removeAttribute(`data-maximized`),this.#e.classList.add(`spinner-dialog`),this.#e.setAttribute(`aria-label`,`Loading`),this.#e.removeAttribute(`aria-labelledby`),this.#e.removeAttribute(`aria-describedby`),this.#e.replaceChildren(Z(`div`,{class:`dialog-spinner`,role:`status`,"aria-label":`Loading`}))}#Y(){this.#e.open||(this.#a=!1,this.#e.showModal(),this.#r=!0,Aa(),this.#X(),this.#he())}#X(){let e=this.#e,t=`100%`;this.#A&&(t=getComputedStyle(this).direction===`rtl`?`-100%`:`100%`,this.style.setProperty(`--drawer-exit-translate`,t));let n=this.#A?[{transform:`translateX(${t})`},{transform:`translateX(0)`}]:this.#t?[{transform:`translateY(-3em)`,opacity:0},{transform:`translateY(0)`,opacity:1}]:[{transform:`scale(0)`,opacity:0},{transform:`scale(1)`,opacity:1}];e.animate(n,{duration:this.#t?500:200,easing:`cubic-bezier(0.2, 0, 0, 1)`}),this.#i?.cancel(),this.#i=null}#Z(e){this.#t=!1,this.#Q(e.themeVars),this.#e.classList.remove(`spinner-dialog`),this.#e.setAttribute(`aria-labelledby`,`dialog-title`),this.#e.setAttribute(`aria-describedby`,`dialog-body`),this.#e.removeAttribute(`aria-label`),this.setAttribute(`data-dialog-type`,e.dialogType),this.#O=e.defaultButtonIndex,this.#k=e.hasForm,this.setAttribute(`data-surface`,e.surface),this.setAttribute(`data-width`,e.width),this.toggleAttribute(`data-maximized`,e.maximizable&&e.maximized),this.#A=e.surface===`drawer`,this.#D=e.buttons,this.#$(e.styles)}#Q(e){for(let[t,n]of Object.entries(e))this.style.setProperty(t,n)}#$(e){if(!e){this.#W&&=(this.#W.remove(),null);return}if(!this.#W){this.#W=document.createElement(`style`);let e=this.getRootNode();(e instanceof ShadowRoot?e:document.head).append(this.#W)}this.#W.textContent=`.${this.scopeClass} { ${e} }`}#ee(){this.#c=Z(`div`,{id:`icon`,hidden:!0},Z(`slot`,{name:`icon`})),this.#l=Z(`span`,{class:`title`,id:`dialog-title`},Z(`slot`,{name:`title`})),this.#u=Z(`span`,{class:`subtitle`},Z(`slot`,{name:`subtitle`})),this.#g=Z(`div`,{id:`ask-icon`}),this.#_=Z(`span`,{class:`title ask-title`}),this.#w=Z(`div`,{class:`header-buttons`}),this.#s=Z(`div`,{class:`header`},this.#c,this.#g,Z(`div`,{class:`titles`},this.#l,this.#u,this.#_),this.#w);let e=e=>{let t=Z(`div`,{class:`part`,"data-part":e},Z(`slot`,{name:e}));return this.#d.set(e,t),t},t=Z(`div`,{class:`body`,id:`dialog-body`,oninput:this.#me},e(`intro`),e(`content`),e(`outro`));this.#p=Z(`div`,{class:`note-region collapsed`,role:`alert`}),this.#f=Z(`div`,{class:`action-buttons`}),this.#m=t;let n=Z(`div`,{class:`footer`},this.#p,this.#f);this.#o=Z(`div`,{class:`dialog-content`},this.#s,t,n)}#te(e){this.#o||this.#ee(),this.#h=e.asking||this.hasAttribute(`data-asking`),this.#ie(e),this.#re(e),this.#ae(e),this.#se(e),this.#ce(),this.#fe(),this.#le(e),this.#ne(e)}#ne(e){let t=e.asking;if(this.#m.inert=t,t&&(this.#g.replaceChildren(da(e.note?.tone===`error`?xa:ba)),this.#g.dataset.tone=e.note?.tone??`question`,this.#_.textContent=e.askTitle??``,this.toggleAttribute(`data-ask-title`,!!e.askTitle)),this.toggleAttribute(`data-asking`,t),t&&!this.#v)this.#y=fa(),requestAnimationFrame(()=>this.#ge()?.focus());else if(!t&&this.#v){let e=this.#y;this.#y=null,requestAnimationFrame(()=>{e?.isConnected&&e.focus()})}this.#v=t}#re(e){let t=e.render?.closeButton!=null;if(this.#b&&t===this.#x)return;let n=t?Z(`slot`,{name:`close`}):Z(`button`,{class:`close-button`,type:`button`,onclick:()=>this.#j(`dialog-close`)},da(_a));this.#b?this.#b.replaceWith(n):this.#w.append(n),this.#b=n,this.#x=t}#ie(e){if(!e.maximizable){this.#S?.remove(),this.#S=null;return}let t=e.render?.maximizeButton!=null;if(!this.#S||t!==this.#C){let e=t?Z(`slot`,{name:`maximize`}):Z(`button`,{class:`close-button maximize-button`,type:`button`,onclick:()=>this.#j(`dialog-toggle-maximize`)});this.#S?this.#S.replaceWith(e):this.#w.prepend(e),this.#S=e,this.#C=t}if(!t){let t=this.#S,n=e.maximized?`restore`:`maximize`;t.setAttribute(`aria-label`,e.maximizeLabel),t.setAttribute(`title`,e.maximizeLabel),t.dataset.state!==n&&(t.dataset.state=n,t.replaceChildren(da(e.maximized?ya:va)))}}#ae(e){if(e.render?.actionButton!=null){this.#T||=(this.#E=[],this.#f.replaceChildren(Z(`slot`,{name:`action`}),Z(`span`,{class:`actions-spacer`}),Z(`slot`,{name:`action-separate`})),!0);return}for(this.#T&&=(this.#f.replaceChildren(),!1);this.#E.length>e.buttons.length;)this.#E.pop()?.remove();e.buttons.forEach((t,n)=>{let r=this.#E[n];r||(r=this.#oe(n),this.#E[n]=r,this.#f.append(r)),r.classList.toggle(`loading`,t.loading),r.classList.toggle(`separate-first`,t.separate&&!e.buttons[n-1]?.separate),r.getAttribute(`data-type`)!==t.type&&r.setAttribute(`data-type`,t.type);let i=r.querySelector(`.button-text`);i.textContent!==t.text&&(i.textContent=t.text)})}#oe(e){return Z(`button`,{class:`action-button`,type:`button`,onclick:()=>{this.#me(),this.#D[e]?.onClick()}},Z(`span`,{class:`spinner`}),Z(`span`,{class:`button-text`}))}#se(e){let t=e.render?.note!=null;if((this.#p.childElementCount===0||t!==this.#P)&&(this.#P=t,this.#F=null,this.#I=null,t?this.#p.replaceChildren(Z(`slot`,{name:`note`})):(this.#F=Z(`div`,{class:`note-title`}),this.#I=Z(`div`,{class:`note-text`}),this.#R=Z(`span`,{class:`note-icon`}),this.#L=Z(`div`,{class:`note`},Z(`div`,{class:`note-inner`},this.#R,Z(`div`,{class:`note-body`},this.#F,this.#I))),this.#z=null,this.#p.replaceChildren(this.#L))),this.#B=t?null:e.note??null,e.note&&this.#F&&this.#I){let t=e.note.title??``;this.#F.textContent=t,this.#F.hidden=t===``,this.#I.textContent=e.note.message,e.note.tone!==this.#z&&(this.#z=e.note.tone,this.#L.dataset.tone=e.note.tone,this.#R.replaceChildren(da(e.note.tone===`question`?ba:Sa)))}}#ce(){let e=Ma(this,`icon`);this.#c.hidden=!Na(e);let t=Ma(this,`title`);this.#l.classList.toggle(`pre-line`,Pa(t));let n=Ma(this,`subtitle`);this.#u.classList.toggle(`pre-line`,Pa(n));for(let e of[`intro`,`content`,`outro`]){let t=Ma(this,e),n=this.#d.get(e);n.hidden=!Na(t),n.classList.toggle(`pre-line`,Pa(t))}}#le(e){let t=e.buttons.some(e=>e.loading);if(!this.#H&&t)this.#U=fa();else if(this.#H&&!t){let e=this.#U;this.#U=null,requestAnimationFrame(()=>{e?.isConnected&&e.focus()})}this.#H=t,this.#o.inert=t,this.#ue(e,t)}#ue(e,t){this.#T||this.#E.forEach((n,r)=>{let i=e.buttons[r];n.inert=t&&i!=null&&(i.role!==`cancel`||i.loading)})}#de(e,t){let n=this.#p;if(this.#V?.cancel(),this.#h){this.#V=null,t?.();return}let r=[{height:`0px`,opacity:0},{height:`${n.getBoundingClientRect().height}px`,opacity:1}],i=n.animate(e===`in`?r:[...r].reverse(),{duration:450,easing:`ease`});this.#V=i,i.onfinish=()=>{this.#V===i&&(this.#V=null),t?.()}}#fe(){let e=this.#P?Na(Ma(this,`note`)):this.#B!=null;e&&!this.#M?(this.#M=!0,this.#N=!1,this.#p.classList.remove(`collapsed`),this.#de(`in`)):!e&&this.#M&&!this.#N&&(this.#z===`question`?this.#me():this.#pe())}#pe(){this.#V?.cancel(),this.#V=null,this.#M=!1,this.#N=!1,this.#p?.classList.add(`collapsed`)}#me=()=>{!this.#M||this.#N||(this.#N=!0,this.#de(`out`,()=>{this.#M=!1,this.#N=!1,this.#p.classList.add(`collapsed`),this.#j(`dialog-note-dismiss`)}))};focusFirstInvalid(){let e=this.getForm();if(!e)return;this.#U=null;let t=Ea,n=()=>{if(--t>0){requestAnimationFrame(n);return}(e.querySelector(`[aria-invalid="true"]`)??e.querySelector(`[autofocus]`))?.focus()};requestAnimationFrame(n)}#he(){let e=this.querySelector(`[autofocus]`);if(e){requestAnimationFrame(()=>e.focus());return}if(this.#k){let e=this.querySelector(`input:not([type="hidden"]), select, textarea, [name]`);if(e){requestAnimationFrame(()=>e.focus());return}}let t=this.#ge();if(t)try{requestAnimationFrame(()=>t.focus())}catch{}}#ge(){let e=this.#D,t=e.findIndex(e=>e.role===`cancel`),n=this.#O??(t>=0?t:e.length-1);if(!this.#T)return this.#E[n]??null;let r=this.querySelector(`:scope > [data-action-index="${n}"]`);return r?.querySelector(`button, [tabindex]`)??r?.firstElementChild??r??null}#_e=e=>{if(e.key===`Escape`&&!e.defaultPrevented&&!e.isComposing){e.preventDefault(),this.#j(`dialog-cancel`);return}if(e.key!==`Enter`||e.defaultPrevented||e.isComposing||e.shiftKey||e.ctrlKey||e.metaKey||e.altKey)return;let t=e.composedPath()[0]?.tagName??``,n=e.target;if(!(t===`INPUT`||t===`SELECT`||n!=null&&n.tagName.includes(`-`)&&this.getForm()?.contains(n)===!0))return;let r=this.#O;if(r==null)return;let i=this.#D[r];i&&(e.preventDefault(),this.#me(),i.onClick())}};function Va(e,t){return e.querySelector(t)}function Ha(e,t,n,r){let i=document.createElement(`div`);i.id=e,i.style.display=`contents`,r.append(i);let a=La(),o=t({container:i,tag:a,requestRender:n}),s=null,c=!1,l=!1,u=()=>{s&&!l&&o.render(s)};return i.addEventListener(`dialog-close`,()=>s?.props.onClose()),i.addEventListener(`dialog-cancel`,()=>s?.props.onCancel()),i.addEventListener(`dialog-toggle-maximize`,()=>s?.props.onToggleMaximize()),i.addEventListener(`dialog-note-dismiss`,()=>s?.props.onNoteDismiss()),{show(e){if(s=e,l)return;let t=Va(i,a);if(!t){u();return}c||(c=!0,t.beginSwap().then(()=>{c=!1,u()}))},update(e){s=e,c||u()},async close(){l=!0,await Va(i,a)?.closeDialog(),o.destroy?.(),i.remove()},getForm:()=>Va(i,a)?.getForm()??null,getConfirm:()=>o.getConfirm?.(),isDirty:()=>o.isDirty?.()??!1,focusFirstInvalid:()=>Va(i,a)?.focusFirstInvalid()}}var Ua=new Set([``,`0`,`false`,`off`,`no`]);function Wa(e){return typeof File<`u`&&e instanceof File}var Ga=class extends FormData{string(e,t=null){let n=this.get(e);return typeof n==`string`?n:t}strings(e){return this.getAll(e).filter(e=>typeof e==`string`)}number(e,t=null){let n=this.get(e);if(typeof n!=`string`||n.trim()===``)return t;let r=Number(n);return Number.isNaN(r)?t:r}numbers(e){let t=[];for(let n of this.strings(e)){if(n.trim()===``)continue;let e=Number(n);Number.isNaN(e)||t.push(e)}return t}boolean(e){let t=this.get(e);return t==null?!1:typeof t!=`string`||!Ua.has(t.trim().toLowerCase())}integer(e,t=null){let n=this.number(e);return n!==null&&Number.isInteger(n)?n:t}date(e,t=null){let n=this.string(e);if(n===null||n.trim()===``)return t;let r=new Date(n);return Number.isNaN(r.getTime())?t:r}file(e){let t=this.get(e);return Wa(t)?t:null}files(e){return this.getAll(e).filter(Wa)}fieldNames(){return[...new Set(this.keys())]}toRecord(){let e={};for(let[t,n]of this){let r=e[t];r===void 0?e[t]=n:Array.isArray(r)?r.push(n):e[t]=[r,n]}return e}},Ka={buttonOk:`OK`,buttonCancel:`Cancel`,buttonYes:`Yes`,buttonNo:`No`,titleInfo:`Information`,titleSuccess:`Success`,titleWarn:`Warning`,titleError:`Error`,titleConfirm:`Confirmation`,titleConfirmCritical:`Confirmation`,titleDecide:`Please decide`,titleDecideCritical:`Please decide`,titleForm:`Form`,titleFormCritical:`Form`,labelMaximize:`Maximize`,labelRestore:`Restore`,questionDiscard:`Discard your changes?`,buttonDiscard:`Discard`,buttonKeepEditing:`Keep editing`,titleUnsavedChanges:`Unsaved changes`,hintEscapeDiscards:`Press Esc to discard them.`},qa={dismiss:`Dismiss notification`,info:`Information`,success:`Success`,warn:`Warning`,error:`Error`,loading:`Loading`},Ja={buttonOk:`Ok`,buttonCancel:`Abbrechen`,buttonYes:`Ja`,buttonNo:`Nein`,titleInfo:`Information`,titleSuccess:`Erfolg`,titleWarn:`Warnung`,titleError:`Fehler`,titleConfirm:`Bestätigung`,titleConfirmCritical:`Bestätigung`,titleDecide:`Entscheidung`,titleDecideCritical:`Entscheidung`,titleForm:`Eingabe`,titleFormCritical:`Eingabe`,labelMaximize:`Maximieren`,labelRestore:`Wiederherstellen`,questionDiscard:`Änderungen verwerfen?`,buttonDiscard:`Verwerfen`,buttonKeepEditing:`Weiter bearbeiten`,titleUnsavedChanges:`Nicht gespeicherte Änderungen`,hintEscapeDiscards:`Mit Esc werden sie verworfen.`},Ya={dismiss:`Benachrichtigung ausblenden`,info:`Information`,success:`Erfolg`,warn:`Warnung`,error:`Fehler`,loading:`Wird geladen`},Xa={en:Ka,de:Ja},Za={en:qa,de:Ya};function Qa(){return typeof document>`u`?`en-us`:document.documentElement.lang.trim().toLowerCase()||`en-us`}function $a(e,t){let n=Qa();return e[n]??e[n.split(`-`)[0]]??t}function eo(e){return $a(Xa,Ka)[e]}function to(e){return $a(Za,qa)[e]}function no(...e){let t=e.filter(e=>e!=null);if(t.length!==0)return t.length===1?t[0]:AbortSignal.any(t)}function ro(e){return typeof e==`object`&&!!e&&typeof e.then==`function`}function io(){let e=[],t=null,n=!1;return{push(r){if(!n){if(t){let e=t;t=null,e({value:r,done:!1})}else e.push(r)}},end(){if(n=!0,t){let e=t;t=null,e({value:void 0,done:!0})}},iterator(){return{next(){return e.length>0?Promise.resolve({value:e.shift(),done:!1}):n?Promise.resolve({value:void 0,done:!0}):new Promise(e=>{t=e})}}}}}function ao(e){let t=new Set,n=n=>{let r=co(e,n,()=>t.delete(r));return t.add(r),r},r=e=>{let t=n(),r=e(t);return Promise.resolve(r).then(()=>t.dispose(),()=>t.dispose()),r};return{open:n,abortAll:()=>{for(let e of[...t])e.dispose();t.clear()},info:e=>r(t=>t.info(e)),success:e=>r(t=>t.success(e)),warn:e=>r(t=>t.warn(e)),error:e=>r(t=>t.error(e)),confirm:e=>r(t=>t.confirm(e)),confirmCritical:e=>r(t=>t.confirmCritical(e)),decide:e=>r(t=>t.decide(e)),decideCritical:e=>r(t=>t.decideCritical(e)),form:e=>r(t=>t.form(e)),formCritical:e=>r(t=>t.formCritical(e))}}function oo(e){return!e.allowsForm||e.config.nativeValidation!==!1}var so=0;function co(e,t,n){let r=`internal-dialog-${++so}`,i={};if(e.theme)for(let[t,n]of Object.entries(e.theme))n!=null&&(i[`--dialog-${Ji(t).slice(2)}`]=n);let a=e.adapter,o=null,s=!1,c=null,l=()=>o??=Ha(r,a,()=>c?.(),e.mountTarget?.()??document.body),u=()=>{},d=()=>({icon:null,title:null,subtitle:null,intro:null,content:null,outro:null,note:null}),f=null,p=new AbortController,m=setTimeout(()=>{!s&&!o&&l().show({props:{dialogType:`info`,surface:`dialog`,width:`default`,maximizable:!1,maximized:!1,maximizeLabel:``,onToggleMaximize:u,themeVars:i,styles:null,hasForm:!1,nativeValidation:!0,buttons:[],defaultButtonIndex:null,spinnerOnly:!0,render:e.render,onClose:u,onCancel:u,note:null,asking:!1,onNoteDismiss:u},slots:d()})},300),h=()=>{clearTimeout(m),f?.(),f=null,c=null;let e=o;o=null,e?.close()};t&&!t.aborted&&t.addEventListener(`abort`,h,{once:!0,signal:p.signal});function g(t){return e.getText?.(t)??eo(t)}function _(e,t){return t===!0?Ca(e):t===!1?null:t}function v(t,n){let r=_(t,n.icon);if(r!==void 0)return r;let i=e.icons;return(typeof i==`function`?_(t,i(t)):_(t,i))??null}function y(e){let t=e.config.buttons;return t?e.buttons.map(e=>{let n=e.overrideKey===null?void 0:t[e.overrideKey];return n?{...e,text:n}:e}):e.buttons}function b(e){return e.config.styles??null}function x(e){return e===Xi?`ok`:e===Qi?`confirm`:e===$i?`decline`:null}function S(e,t,n){let r=n??x(e);t(r===null?{canceled:!0,aborted:!1}:{canceled:!1,action:r,data:void 0})}function C(n,r,a,d,_){clearTimeout(m);let x=no(p.signal,t,n.config.abortSignal,_),C=()=>{h(),a?a.abort():r({canceled:!0,aborted:!0})};if(x?.aborted)return C(),()=>{};s=!0,f?.(),f=null;let w=y(n),T=n.config,E=!1,D=(e,t)=>{let i=null,s=()=>{if(a){if(e.id===Qi||e.action!==void 0){let n=i??o?.getForm()??null,r=n?new Ga(n):new Ga;a.submit(r,N,t,e.action??`confirm`,L)}else a.cancel(t,L,ee);return}S(e.id,r,e.action)};if(n.allowsForm&&e.validate){i=o?.getForm()??null;let r=e.id===Qi?o?.getConfirm():void 0;if(r){c(r);return}if(i?.requestSubmit(),oo(n)&&!(i?.reportValidity()??!0)){t();return}let a=T.validator;if(a){let e=a.validate(i);if(ro(e)){Promise.resolve(e).then(e=>{if(d?.aborted||!e){t(),d?.aborted||o?.focusFirstInvalid();return}s()},e=>{t(),queueMicrotask(()=>{throw e})});return}if(!e){t(),o?.focusFirstInvalid();return}}}s();function c(e){let n=e=>{if(!d?.aborted){if(e.ok){s();return}t(),e.error===void 0?o?.focusFirstInvalid():N({message:e.error,tone:`error`})}},r=e();if(ro(r)){Promise.resolve(r).then(n,e=>{t(),queueMicrotask(()=>{throw e})});return}n(r)}},O=(e,t)=>{let n=k[e];n&&n.loading!==t&&(n.loading=t,U())},k=w.map((e,t)=>({role:e.overrideKey??`action`,action:e.action,separate:e.separate??!1,type:e.type,loading:!1,text:e.text??g(e.defaultTextKey),onClick:()=>{let r=n.allowsForm&&(e.validate||e.action!==void 0);if(r&&E)return;let i=setTimeout(()=>O(t,!0),150),a=r;E||=r,f=()=>clearTimeout(i),D(e,()=>{clearTimeout(i),O(t,!1),a&&(a=!1,E=!1)})}})),A=w.findIndex(e=>e.id===Zi),j=()=>{I?I.dismiss():A>=0?k[A].onClick():a?a.cancel(u,L,ee):S(Xi,r)},M=null,N=e=>{M=e,U()},P=()=>{M&&(M=null,U())},F=!1,I=null,L=((e,t={})=>new Promise(n=>{I?.dismiss();let r=t.choices?Object.entries(t.choices).map(([e,t],n)=>{let{text:r,critical:i}=typeof t==`string`?{text:t,critical:!1}:{text:t.text,critical:t.critical===!0};return{value:e,type:i?`danger`:n===0?`primary`:`secondary`,text:r}}):[{value:!0,type:t.critical?`danger`:`primary`,text:t.confirm??g(`buttonOk`)},{value:!1,type:`secondary`,text:t.cancel??g(`buttonCancel`)}],i=r[r.length-1].value,a=t.escapeConfirms===!0&&!t.choices,o=e=>{I===s&&(I=null,n(e),setTimeout(()=>{d?.aborted||U()}))},s={note:{message:e,tone:t.critical||t.choices&&r.some(e=>e.type===`danger`)?`error`:`question`},dismiss:()=>o(i),escape:()=>o(a?r[0].value:i),title:t.title,views:r.map((e,t)=>({role:t===r.length-1?`cancel`:`confirm`,separate:!1,type:e.type,loading:!1,text:e.text,onClick:()=>o(e.value)}))};if(d?.aborted){n(i);return}M=null,I=s,U()}));d?.addEventListener(`abort`,()=>I?.dismiss(),{once:!0});let ee=()=>o?.isDirty()??!1,R=()=>{F=!F,U()},z=null,B=null,V=()=>{let t=n.config.content;return t==null||!e.wrapContent?t:((!B||B.key!==t)&&(B={key:t,value:e.wrapContent(t,{dialogType:n.dialogType,hasForm:n.allowsForm,surface:n.config.surface??`dialog`})}),B.value)},te=()=>{let e=n.config.icon;return(!z||z.key!==e)&&(z={key:e,value:v(n.dialogType,n.config)}),z.value},H=()=>({props:{dialogType:n.dialogType,surface:n.config.surface??`dialog`,width:n.config.width??`default`,maximizable:n.config.maximizable??!1,maximized:F,maximizeLabel:g(F?`labelRestore`:`labelMaximize`),onToggleMaximize:R,themeVars:i,styles:b(n),hasForm:n.allowsForm,nativeValidation:oo(n),buttons:I?I.views:k,defaultButtonIndex:I||n.dialogType.endsWith(`Critical`)?null:0,spinnerOnly:!1,note:I?.note??M,asking:I!==null,askTitle:I?.title,render:e.render,onClose:j,onCancel:()=>I?I.escape():j(),onNoteDismiss:P},slots:{icon:te(),title:n.config.title??g(n.defaultTitle),subtitle:n.config.subtitle,intro:n.config.intro,content:V(),outro:n.config.outro,note:null}}),U=()=>o?.update(H());x&&x.addEventListener(`abort`,C,{once:!0,signal:d});let ne=()=>{y(n).forEach((e,t)=>{let n=k[t];n&&(n.text=e.text??g(e.defaultTextKey))}),U()};return c=ne,l().show(H()),e=>{Object.assign(n.config,e),ne()}}function w(e){let t=new AbortController,n=new AbortController,r=!1,i,a=new Promise(e=>{i=e}),o=C(e,e=>{r||(r=!0,t.abort(),i(e))},void 0,t.signal,n.signal);return{get pending(){return!r},abort:()=>n.abort(),update:e=>{r||o(e)},then:(e,t)=>a.then(e,t)}}function T(e){let t=io(),n=new AbortController,r=new AbortController,i=!1,a=!1,o=!1,s,c=new Promise(e=>{s=e}),l=e=>{a||(a=!0,s(e),t.end(),n.abort())},u=e=>e(matchMedia(`(hover: hover)`).matches?`${g(`questionDiscard`)}\n${g(`hintEscapeDiscards`)}`:g(`questionDiscard`),{confirm:g(`buttonDiscard`),cancel:g(`buttonKeepEditing`),critical:!0,title:g(`titleUnsavedChanges`),escapeConfirms:!0}),d=C(e,()=>{},{submit(e,n,r,a,o){i?t.push({kind:`submit`,action:a,data:e,ask:o,askDiscard:()=>u(o),accept(t){l({canceled:!1,action:a,data:t??e})},reject(e,t){r(),n({title:t,message:e,tone:`error`})}}):l({canceled:!1,action:a,data:e})},cancel(n,r,a){if(!(i&&e.config.guardClose===!0)){if(a()){if(n(),o)return;o=!0,u(r).then(e=>{o=!1,e&&l({canceled:!0,aborted:!1})});return}l({canceled:!0,aborted:!1});return}n(),!o&&(o=!0,t.push({kind:`close`,accept(){l({canceled:!0,aborted:!1})},reject(){o=!1},ask:r,askDiscard:()=>u(r)}))},abort(){l({canceled:!0,aborted:!0})}},n.signal,r.signal);return{get pending(){return!a},abort:()=>r.abort(),update:e=>{a||d(e)},then:(e,t)=>c.then(e,t),[Symbol.asyncIterator]:()=>(i=!0,t.iterator())}}let E={info:[ta],success:[ta],warn:[na],error:[na],confirm:[ra,aa],confirmCritical:[ia,aa],decide:[oa,ca,aa],decideCritical:[sa,ca,aa],form:[ra,aa],formCritical:[ia,aa]},D=(e,t)=>({dialogType:e,defaultTitle:`title${e[0].toUpperCase()}${e.slice(1)}`,config:t,buttons:Yi(E[e],t.actions),allowsForm:e.startsWith(`form`)}),O={info:e=>w(D(`info`,e)),success:e=>w(D(`success`,e)),warn:e=>w(D(`warn`,e)),error:e=>w(D(`error`,e)),confirm:e=>w(D(`confirm`,e)),confirmCritical:e=>w(D(`confirmCritical`,e)),decide:e=>w(D(`decide`,e)),decideCritical:e=>w(D(`decideCritical`,e)),form:e=>T(D(`form`,e)),formCritical:e=>T(D(`formCritical`,e)),dispose(){p.abort(),clearTimeout(m),f?.(),f=null,o?.close(),o=null,n?.()}},k=Symbol.dispose??Symbol.for(`Symbol.dispose`);return O[k]=()=>O.dispose(),O}var lo={info:pa,success:ma,warn:ha,error:ga,loading:`
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-opacity="0.25"/>
    <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`},uo=`internal-toast:dismiss`,fo=`
<style>${qi`
:host {
  position: relative;
  box-sizing: border-box;
  /* --toast-scale (default 1) is the controller's \`size\` multiplier: width, padding,
     font-size and gap all scale by it, so the whole card grows/shrinks together. At the
     default 1 every value below computes to exactly the px/em written here. */
  width: min(calc(360px * var(--toast-scale, 1)), calc(100vw - 40px));
  padding: calc(14px * var(--toast-scale, 1)) calc(18px * var(--toast-scale, 1))
    calc(14px * var(--toast-scale, 1)) calc(22px * var(--toast-scale, 1));
  background: var(--background, #ffffff);
  color: var(--text, #111827);
  border-radius: var(--radius, 5px);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: calc(1em * var(--toast-scale, 1));
  line-height: 1.5;
  /* Fallback for a card rendered before the controller sets --shadow; kept identical to
     defaultToastTheme.shadow, which carries the reasoning for the values. */
  box-shadow: var(
    --shadow,
    0 4px 10px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06)
  );
  overflow: hidden;
  pointer-events: auto;
  transform: translateX(0);
  display: flex;
  align-items: center;
  gap: calc(12px * var(--toast-scale, 1));
  /* Size of the close/countdown affordance, and the single lever for it (see
     .close-wrap). */
  --affordance-size: 1.9em;
  /* Pin the card's minimum height to the affordance box plus the vertical padding, so a
     collapsed affordance can't shorten the card. Without this, a toast that is both
     sticky and non-dismissible — a loading toast, typically — drops .close-wrap out of
     this flex row entirely and ends up shorter than every other toast. */
  min-height: calc(var(--affordance-size) + 28px * var(--toast-scale, 1));
  /* Let vertical scroll pass through while we own horizontal swipe. */
  touch-action: pan-y;
}

.accent {
  position: absolute;
  inset-inline-start: 0.25em;
  top: 0.25em;
  bottom: 0.25em;
  width: 4px;
  border-radius: 2em;
  background: var(--info-accent, #2563eb);
}

:host([type="success"]) .accent {
  background: var(--success-accent, #16a34a);
}

:host([type="warn"]) .accent {
  background: var(--warn-accent, #d97706);
}

:host([type="error"]) .accent {
  background: var(--error-accent, #dc2626);
}

:host([type="loading"]) .accent {
  background: var(--loading-accent, #2563eb);
}

.icon {
  flex: none;
  display: none;
  align-items: center;
  justify-content: center;
  color: var(--icon-color, var(--info-accent, #2563eb));
}

:host([type="success"]) .icon {
  color: var(--icon-color, var(--success-accent, #16a34a));
}

:host([type="warn"]) .icon {
  color: var(--icon-color, var(--warn-accent, #d97706));
}

:host([type="error"]) .icon {
  color: var(--icon-color, var(--error-accent, #dc2626));
}

:host([type="loading"]) .icon {
  color: var(--icon-color, var(--loading-accent, #2563eb));
}

/* Built-in severity icon: shown only when the policy opts in and the caller
   didn't provide their own (loading always opts in). */
:host([icon-mode="default"]) .icon {
  display: inline-flex;
}

.icon svg {
  display: block;
  width: 1.4em;
  height: 1.4em;
}

/* The loading spinner rotates; everything else is static. */
:host([type="loading"]) .icon svg {
  animation: toast-spin 0.75s linear infinite;
}

@keyframes toast-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Caller-supplied icon (light-DOM slot): sized to match the built-in, but not
   tinted — a custom icon keeps its own colors. */
.icon-slot {
  flex: none;
  display: none;
  align-items: center;
  justify-content: center;
}

:host([icon-mode="custom"]) .icon-slot {
  display: inline-flex;
}

::slotted([slot="icon"]) {
  display: block;
  width: 1.4em;
  height: 1.4em;
}

slot {
  display: contents;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

::slotted([slot="title"]) {
  font-weight: 600;
  color: var(--title-color, #111827);
}

::slotted([slot="content"]) {
  color: var(--message-color, #374151);
}

/* Screen-reader-only severity prefix. Absolute so it never affects layout. */
::slotted([slot="severity"]) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(16px * var(--toast-scale, 1));
  margin-top: calc(4px * var(--toast-scale, 1));
}

:host(:not([has-actions])) .actions {
  display: none;
}

/* The action buttons themselves are styled at the document level (see
   containerStyles) — ::slotted() is unreliable for native form controls. This
   element only lays them out via the slot above. */

/* --affordance-size (on :host) is the one size lever here: the ring fills this box via
   inset: 0 and scales with it through its viewBox units, .close is sized in percentages
   of it, and :host derives its min-height from it so collapsing this box never changes
   the card's height. */
.close-wrap {
  flex: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--affordance-size);
  height: var(--affordance-size);
  /* Pulls the affordance toward the card edge. Was -0.4em when the box was 2.4em with a
     2em button inset inside it; -0.2em keeps the same optical gap now the button fills
     the box. */
  margin-inline-end: -0.2em;
}

/* Non-dismissible + nothing to count down: the whole affordance collapses. */
:host([dismissible="false"][duration="0"]) .close-wrap {
  display: none;
}

.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
  display: block;
}

.progress-ring__value {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  /* r is chosen so the circumference is exactly 100 user units, so the dash
     values read as a simple 0..100 "percent remaining". */
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
  stroke: var(--progress-color, var(--info-accent, #2563eb));
  animation: toast-countdown var(--toast-duration, 7000ms) linear forwards;
  /* Driven to "paused" by the controller when the tab is hidden. */
  animation-play-state: var(--toast-play-state, running);
}

:host([type="success"]) .progress-ring__value {
  stroke: var(--progress-color, var(--success-accent, #16a34a));
}

:host([type="warn"]) .progress-ring__value {
  stroke: var(--progress-color, var(--warn-accent, #d97706));
}

:host([type="error"]) .progress-ring__value {
  stroke: var(--progress-color, var(--error-accent, #dc2626));
}

/* Freezes together with the JS auto-dismiss timer, which also pauses on hover.
   More specific than the var rule above, so hover always wins. */
:host(:hover) .progress-ring__value {
  animation-play-state: paused;
}

/* Sticky toasts (duration 0), incl. loading, have nothing to count down. */
:host([duration="0"]) .progress-ring {
  display: none;
}

/* Hide the button (but keep the ring) when the user can't dismiss. */
:host([dismissible="false"]) .close {
  display: none;
}

@keyframes toast-countdown {
  to {
    stroke-dashoffset: 100;
  }
}

.close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Fills .close-wrap so that box stays the single size lever. */
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--close-color, #9ca3af);
  cursor: pointer;
  border-radius: 50%;
  transition: color 150ms ease, background 150ms ease;
}

.close:hover {
  color: var(--close-hover-color, #374151);
  background: var(--close-hover-background, rgba(0, 0, 0, 0.06));
}

.close svg {
  display: block;
  width: 0.9em;
  height: 0.9em;
}

/* -------------------------------------------------------------------------
   Appearance variants (see ToastControllerOptions.appearance). Placed after the
   per-type rules above so they win on equal-specificity ties by source order.

   "solid": the whole card takes the severity accent as its background, with a
   light foreground (--solid-text, default white). Good for e.g. white-on-red
   errors.
   ------------------------------------------------------------------------- */
:host([appearance="solid"]) {
  background: var(--info-accent, #2563eb);
  color: var(--solid-text, #ffffff);
}

:host([appearance="solid"][type="success"]) {
  background: var(--success-accent, #16a34a);
}

:host([appearance="solid"][type="warn"]) {
  background: var(--warn-accent, #d97706);
}

:host([appearance="solid"][type="error"]) {
  background: var(--error-accent, #dc2626);
}

:host([appearance="solid"][type="loading"]) {
  background: var(--loading-accent, #2563eb);
}

/* The whole card is the accent now, so the little stripe is redundant. */
:host([appearance="solid"]) .accent {
  display: none;
}

:host([appearance="solid"]) .icon,
:host([appearance="solid"]) ::slotted([slot="title"]),
:host([appearance="solid"]) ::slotted([slot="content"]) {
  color: var(--solid-text, #ffffff);
}

:host([appearance="solid"]) .close {
  color: var(--solid-text, #ffffff);
  opacity: 0.85;
}

:host([appearance="solid"]) .close:hover {
  color: var(--solid-text, #ffffff);
  opacity: 1;
  background: rgba(255, 255, 255, 0.18);
}

:host([appearance="solid"]) .progress-ring__value {
  stroke: var(--solid-text, #ffffff);
  opacity: 0.85;
}

/* "dark": a neutral dark card (--dark-background) with light text
   (--dark-text). Unlike "solid", the severity color is *kept* for the accent
   stripe, icon and countdown ring — so it reads as a dark-mode toast rather
   than a colored one. */
:host([appearance="dark"]) {
  background: var(--dark-background, #1f2937);
  color: var(--dark-text, #f9fafb);
}

:host([appearance="dark"]) ::slotted([slot="title"]),
:host([appearance="dark"]) ::slotted([slot="content"]) {
  color: var(--dark-text, #f9fafb);
}

:host([appearance="dark"]) .close {
  color: var(--dark-close-color, #9ca3af);
}

:host([appearance="dark"]) .close:hover {
  color: var(--dark-text, #f9fafb);
  background: rgba(255, 255, 255, 0.1);
}

/* The 600-level accents go muddy against the dark card, so they're lifted toward white
   here. Mixing rather than hard-coding lighter hexes means a caller's own accent
   override gets the same lift instead of being silently ignored on this appearance.
   Resolved once per type into --dark-accent, then consumed by the three rules below. */
:host([appearance="dark"]) {
  --dark-accent: color-mix(in oklab, var(--info-accent, #2563eb) 65%, white);
}

:host([appearance="dark"][type="success"]) {
  --dark-accent: color-mix(in oklab, var(--success-accent, #16a34a) 65%, white);
}

:host([appearance="dark"][type="warn"]) {
  --dark-accent: color-mix(in oklab, var(--warn-accent, #d97706) 65%, white);
}

:host([appearance="dark"][type="error"]) {
  --dark-accent: color-mix(in oklab, var(--error-accent, #dc2626) 65%, white);
}

:host([appearance="dark"][type="loading"]) {
  --dark-accent: color-mix(in oklab, var(--loading-accent, #2563eb) 65%, white);
}

/* These tie on specificity with the per-type .accent / .icon / .progress-ring__value
   rules further up, so it's source order — being below them — that makes them win.
   Keep them after those rules. */
:host([appearance="dark"]) .accent {
  background: var(--dark-accent);
}

:host([appearance="dark"]) .icon {
  color: var(--icon-color, var(--dark-accent));
}

:host([appearance="dark"]) .progress-ring__value {
  stroke: var(--progress-color, var(--dark-accent));
}

@media (prefers-reduced-motion: reduce) {
  :host,
  .close {
    transition: none;
  }

  .progress-ring,
  :host([type="loading"]) .icon svg {
    animation: none;
  }
}
`}</style>
<span class="accent"></span>
<span class="icon" aria-hidden="true"></span>
<span class="icon-slot" aria-hidden="true"><slot name="icon"></slot></span>
<div class="content">
  <slot name="severity"></slot>
  <slot name="title"></slot>
  <slot name="content"></slot>
  <div class="actions"><slot name="action"></slot></div>
</div>
<div class="close-wrap">
  <svg class="progress-ring" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
    <circle class="progress-ring__value" cx="18" cy="18" r="15.9155"></circle>
  </svg>
  <button class="close" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
      <line x1="6" y1="6" x2="18" y2="18"></line>
      <line x1="18" y1="6" x2="6" y2="18"></line>
    </svg>
  </button>
</div>
`,po=null;function mo(){if(po)return po;class e extends HTMLElement{button=null;iconEl=null;ringEl=null;dragging=!1;dragStartX=0;dx=0;swipeDir=null;constructor(){super();let e=this.attachShadow({mode:`open`});e.innerHTML=fo,this.button=e.querySelector(`button.close`),this.iconEl=e.querySelector(`.icon`),this.ringEl=e.querySelector(`.progress-ring__value`),this.button?.addEventListener(`click`,()=>this.emitDismiss()),this.addEventListener(`pointerdown`,this.onPointerDown),this.addEventListener(`pointermove`,this.onPointerMove),this.addEventListener(`pointerup`,this.onPointerUp),this.addEventListener(`pointercancel`,this.onPointerUp)}emitDismiss(){this.dispatchEvent(new CustomEvent(uo,{bubbles:!0,composed:!0}))}static get observedAttributes(){return[`dismiss-label`,`duration`,`type`]}attributeChangedCallback(e,t,n){if(e===`dismiss-label`)this.button?.setAttribute(`aria-label`,n??``);else if(e===`duration`)this.style.setProperty(`--toast-duration`,`${n??`0`}ms`),n&&n!==`0`&&this.ringEl&&(this.ringEl.style.animation=`none`,this.ringEl.getBoundingClientRect(),this.ringEl.style.animation=``);else if(e===`type`&&this.iconEl){let e=n?lo[n]:void 0;this.iconEl.innerHTML=e??``}}onPointerDown=e=>{if(e.button!==0&&e.pointerType===`mouse`||e.composedPath().some(e=>e instanceof HTMLElement&&e.tagName===`BUTTON`)||this.getAttribute(`dismissible`)===`false`)return;let t=this.closest(`.toasts-container`)?.dataset.swipe;(t===`left`||t===`right`)&&(this.swipeDir=t,this.dragging=!0,this.dx=0,this.dragStartX=e.clientX,this.style.transition=`none`,this.setPointerCapture(e.pointerId))};onPointerMove=e=>{if(!this.dragging)return;let t=e.clientX-this.dragStartX;t=this.swipeDir===`right`?Math.max(0,t):Math.min(0,t),this.dx=t;let n=this.offsetWidth||1,r=Math.min(1,Math.abs(t)/n);this.style.transform=`translateX(${t}px)`,this.style.opacity=String(1-r*.6)};onPointerUp=()=>{if(!this.dragging)return;this.dragging=!1;let e=this.offsetWidth||1,t=Math.max(60,e*.3);Math.abs(this.dx)>t?this.emitDismiss():(this.style.transition=`transform 200ms ease, opacity 200ms ease`,this.style.transform=``,this.style.opacity=``)}}let{tag:t}=la(`internal-toast`,e);return po=t,t}function ho(e){let[t,n]=e.split(`-`);return{vertical:t,horizontal:n}}function go(e,t){let{vertical:n,horizontal:r}=ho(t),i=e.style;i.flexDirection=n===`top`?`column-reverse`:`column`,i.top=n===`top`?`20px`:`auto`,i.bottom=n===`bottom`?`20px`:`auto`,r===`center`?(i.insetInlineStart=``,i.insetInlineEnd=``,i.left=`50%`,i.right=`auto`,i.transform=`translateX(-50%)`,i.alignItems=`center`):(i.left=``,i.right=``,i.transform=`none`,i.insetInlineEnd=r===`end`?`20px`:`auto`,i.insetInlineStart=r===`start`?`20px`:`auto`,i.alignItems=r===`end`?`flex-end`:`flex-start`)}var _o=qi`
.toasts-container {
  position: fixed;
  z-index: 10000;
  display: flex;
  /* Set by the controller from TOAST_GAP_PX, which also drives the offsets an expanding
     stack animates to — the two have to agree or the layouts disagree on where a card goes. */
  gap: var(--toast-gap, 8px);
  pointer-events: none;
}
/* Stacked layout, opt-in via the "stacked" option. Collapsed, every card occupies the
   same grid cell, so they overlap and the container keeps the height of one of them —
   absolute positioning would collapse it to nothing and take the hover target with it.
   Expanded, none of this applies and the ordinary flex column is back.

   Paint order is DOM order, and the newest host is the last child, so the newest card
   lands on top without any z-index. --stack-index (set by the controller) counts back
   from it; --stack-dir (set with the placement) flips the offset so the pile always grows
   away from the anchored edge. The offset stops growing after the third card: beyond that
   they are fully covered anyway, and letting them drift on would push the pile across the
   screen. */
/* Grid in BOTH states, never flex: the cards share one cell throughout and only their
   transform differs, so expanding is an animation rather than a relayout.

   Alignment is NOT set here. applyPlacement writes align-items inline for a flex column,
   which under grid names the other axis entirely, and an inline declaration outranks this
   rule — so the controller corrects both axes inline instead (see applyContainerOptions).
   The height is measured there too, since a one-cell grid cannot derive it. */
.toasts-container[data-stacked="on"] {
  display: grid;
  gap: 0;
  height: var(--stack-collapsed-height, auto);
  transition: height var(--stack-duration, 400ms) ease;
}

.toasts-container[data-stacked="on"][data-expanded="on"] {
  height: var(--stack-expanded-height, auto);
}

/* The offset rides on the independent "translate"/"scale" properties, NOT on transform.
   transform belongs to the controller: the enter slide writes an off-screen transform,
   forces a reflow to commit it, and only then enables its own transition (see playEnter).
   A stylesheet transition on transform would animate that first write too, so the toast
   would creep a few pixels instead of sliding in. Swipe-to-dismiss and the exit slide
   write transform inline for the same reason. The independent properties compose with it
   rather than replacing it, so both effects can run at once and neither has to know about
   the other. */
/* Both offsets are computed by the controller, which is the only place that knows how tall
   the cards actually are — a card behind a shorter one has to sit further back to clear it
   by the same sliver. transform-origin is the anchored edge, so shrinking a card pulls its
   trailing edge in without moving the edge it lines up on. */
.toasts-container[data-stacked="on"] > [data-id] {
  grid-area: 1 / 1;
  transform-origin: var(--stack-origin, bottom);
  translate: 0 calc(var(--stack-collapsed, 0px) * var(--stack-dir, -1));
  scale: var(--stack-scale, 1);
}

/* Expanded, a card steps back by the measured heights of everything in front of it, at
   full size — which is exactly where the flat list would have put it. */
.toasts-container[data-stacked="on"][data-expanded="on"] > [data-id] {
  translate: 0 calc(var(--stack-offset, 0px) * var(--stack-dir, -1));
  scale: 1;
}

/* --stack-duration is set by the controller: the slide's own 700ms when a toast arrives or
   leaves, so the pile settles in step with it rather than finishing first; a brisk 200ms
   when the user expands the stack by hand. Same easing as the slide, for the same reason. */
.toasts-container[data-stacked="on"] > [data-id] {
  transition:
    translate var(--stack-duration, 700ms) ease-in-out,
    scale var(--stack-duration, 700ms) ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .toasts-container[data-stacked="on"] > [data-id] {
    transition: none;
  }
}

/* Expanded, the offset simply falls back to the initial values and transitions there. */

.toasts-liveregion {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Action buttons rendered as inline text links (not filled buttons).

   These are light-DOM buttons, so the host app's own global button styles
   (design-system resets, bare element rules, Tailwind/Bootstrap base layers)
   land on them too. To reliably out-rank that without !important, every rule
   here carries the extra [data-id] (raising specificity to (0,3,1)) and the
   base rule performs a FULL reset of the properties frameworks typically set —
   not just border/background — so a stray app declaration can't re-boxify the
   link. If your app forces button styles with !important, override via the
   --action-color token or add your own higher-specificity rule. */
.toasts-container [data-id] button[slot="action"] {
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  display: inline;
  width: auto;
  min-width: 0;
  height: auto;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: none;
  box-shadow: none;
  font: inherit;
  font-size: 0.9em;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: normal;
  text-transform: none;
  text-align: inherit;
  text-decoration: none;
  vertical-align: baseline;
  color: var(--action-color, var(--info-accent, #2563eb));
  cursor: pointer;
  transition: opacity 150ms ease;
}

.toasts-container [data-id][type="success"] button[slot="action"] {
  color: var(--action-color, var(--success-accent, #16a34a));
}

.toasts-container [data-id][type="warn"] button[slot="action"] {
  color: var(--action-color, var(--warn-accent, #d97706));
}

.toasts-container [data-id][type="error"] button[slot="action"] {
  color: var(--action-color, var(--error-accent, #dc2626));
}

.toasts-container [data-id][type="loading"] button[slot="action"] {
  color: var(--action-color, var(--loading-accent, #2563eb));
}

/* Hover feedback is a subtle dim rather than an underline: these actions sit in
   their own row (not inline in prose), where semibold accent text already reads
   as actionable, so the underline convention isn't needed and reads dated. */
.toasts-container [data-id] button[slot="action"]:hover {
  opacity: 0.75;
  background: none;
}

.toasts-container [data-id] button[slot="action"]:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Solid appearance: light links on the accent-colored card (same dim-on-hover). */
.toasts-container [data-id][appearance="solid"] button[slot="action"] {
  color: var(--solid-text, #ffffff);
}

/* Dark appearance: reuse the same lightened accent the stripe, icon and countdown ring
   use, since the 600-level accents are hard to read on the dark card. --dark-accent is
   set on the host by the shadow stylesheet (see element.ts) and inherits down to these
   slotted buttons, so the two stay in step automatically. Placed after the per-type
   rules above, which it ties with on specificity. */
.toasts-container [data-id][appearance="dark"] button[slot="action"] {
  color: var(--action-color, var(--dark-accent));
}

@media (prefers-reduced-motion: reduce) {
  .toasts-container [data-id] button[slot="action"] {
    transition: none;
  }
}
`,vo=new WeakSet;function yo(e){let t=e.getRootNode(),n=t instanceof ShadowRoot?t:null;if(n?vo.has(n):document.getElementById(`toasts-styles`))return;let r=document.createElement(`style`);r.textContent=_o,n?(vo.add(n),n.append(r)):(r.id=`toasts-styles`,document.head.appendChild(r))}var bo={background:`#ffffff`,text:`#111827`,radius:`5px`,shadow:`0 4px 10px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06)`,infoAccent:`#2563eb`,successAccent:`#16a34a`,warnAccent:`#d97706`,errorAccent:`#dc2626`,loadingAccent:`#2563eb`,titleColor:`#111827`,messageColor:`#374151`,closeColor:`#9ca3af`,closeHoverColor:`#374151`,closeHoverBackground:`rgba(0, 0, 0, 0.06)`,solidText:`#ffffff`,darkBackground:`#1f2937`,darkText:`#f9fafb`,darkCloseColor:`#9ca3af`};function xo(e){return{...bo,...e}}function So(e,t){return Array.isArray(e)?e.includes(t):e===!0}function Co(e){return e===`error`||e===`warn`?`alert`:`status`}var wo=400,To=`ease`,Eo=`transform ${wo}ms ${To}, opacity ${wo}ms ${To}, translate ${wo}ms ${To}, scale ${wo}ms ${To}`,Do=`transform 700ms ease-in-out, translate 400ms ease, scale 400ms ease`,Oo=700,ko=`120vw`,Ao=`120vh`,jo=400,Mo=200,No=8,Po=10,Fo=.05,Io=3,Lo=`opacity 500ms ease`,Ro=500,zo=5e3,Bo={small:`0.875`,medium:`1`,large:`1.125`};function Vo(e){let{adapter:t}=e,n=e,r=()=>n.autoIcons??!0,i=()=>n.placement??`bottom-end`,a=()=>n.overflow??`evict`,o=()=>n.dismissOnSwipe??!0,s=()=>n.pauseOnHidden??!0,c=()=>n.liveRegion??!1,l=()=>n.size??`medium`,u=()=>n.autoTitles,d=()=>n.maxVisible,f=()=>n.stacked??!1;function p(e){let t=n.appearance??`light`;return typeof t==`string`?t:t[e]??`light`}let m=mo();function h(e){return n.getText?.(e)??to(e)}let g=typeof window<`u`&&window.matchMedia?window.matchMedia(`(prefers-reduced-motion: reduce)`):null;function _(){return g?.matches??!1}let v=document.createElement(`div`);v.className=`toasts-container`;let y=null,b=null;function x(e,t){let n=document.createElement(`div`);return n.className=`toasts-liveregion`,n.setAttribute(`aria-live`,e),n.setAttribute(`role`,t),n}function S(){go(v,i());let e={...bo,...n.theme};for(let[t,n]of Object.entries(e))n!=null&&v.style.setProperty(Ji(t),n);v.style.setProperty(`--toast-scale`,Bo[l()]),v.style.setProperty(`--toast-gap`,`${No}px`);let{horizontal:t}=ho(i());if(!o()||t===`center`)v.dataset.swipe=`off`;else{let e=getComputedStyle(v).direction===`rtl`;v.dataset.swipe=t===`end`===e?`left`:`right`}if(f()){v.dataset.stacked=`on`;let{vertical:e,horizontal:t}=ho(i());v.style.setProperty(`--stack-dir`,e===`top`?`1`:`-1`),v.style.alignItems=e===`top`?`start`:`end`,v.style.justifyItems=t,v.style.setProperty(`--stack-origin`,e===`top`?`top`:`bottom`)}else delete v.dataset.stacked,delete v.dataset.expanded,v.style.removeProperty(`--stack-dir`),v.style.removeProperty(`justify-items`);c()&&!y?(y=x(`polite`,`status`),b=x(`assertive`,`alert`),v.append(y,b)):!c()&&y&&(y.remove(),b?.remove(),y=null,b=null)}S();function C(){if(v.isConnected)return;let e=n.mountTarget?.()??document.body;yo(e),e.appendChild(v),S()}let w=t({container:v,tag:m}),T=[],E=0;v.addEventListener(uo,e=>{let t=e.target;if(!t)return;let n=Number(t.dataset.id);Number.isNaN(n)||ae(n)}),v.addEventListener(`click`,e=>{let t=e.target?.closest(`[data-action-index]`);if(!t)return;let n=t.closest(`[data-id]`);if(!n)return;let r=Number(n.dataset.id),i=Number(t.dataset.actionIndex),a=T.find(e=>e.id===r)?.actions[i];if(!a)return;let o=a.onClick?.();o instanceof Promise?o.then(e=>{e!==!1&&ae(r)}):o!==!1&&ae(r)}),v.addEventListener(`mouseover`,e=>{let t=e.target?.closest(`[data-id]`);t&&(ee(Number(t.dataset.id)),A(!0))}),v.addEventListener(`mouseout`,e=>{let t=e.target?.closest(`[data-id]`);t&&R(Number(t.dataset.id))});let D=e=>{e.pointerType===`mouse`&&(O(e)?window.clearTimeout(k):j())};function O(e){let t=v.getBoundingClientRect();return e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom}let k;function A(e){window.clearTimeout(k),f()&&(v.style.setProperty(`--stack-duration`,`${Mo}ms`),e?(v.dataset.expanded=`on`,document.addEventListener(`pointermove`,D)):(delete v.dataset.expanded,document.removeEventListener(`pointermove`,D)))}function j(){window.clearTimeout(k),k=window.setTimeout(()=>A(!1),120)}v.addEventListener(`click`,e=>{e.target?.closest(`[data-id]`)&&A(!0)}),v.addEventListener(`focusin`,()=>A(!0)),v.addEventListener(`focusout`,e=>{let t=e.relatedTarget;(!t||!v.contains(t))&&j()});let M=e=>{e.composedPath().includes(v)||A(!1)};document.addEventListener(`pointerdown`,M);function N(e){if(e.key===`Escape`)for(let e=T.length-1;e>=0;e--){let t=T[e];if(!t.removing&&!t.queued&&t.dismissible){ae(t.id);break}}}document.addEventListener(`keydown`,N);function P(){s()&&(document.hidden?(z(),v.style.setProperty(`--toast-play-state`,`paused`)):(v.style.setProperty(`--toast-play-state`,`running`),B()))}document.addEventListener(`visibilitychange`,P);function F(){let{vertical:e}=ho(i());return`translateY(${e===`top`?`-`:``}100%)`}function I(){let{vertical:e,horizontal:t}=ho(i());if(t===`center`)return`translateY(${e===`top`?`-`:``}${Ao})`;let n=getComputedStyle(v).direction===`rtl`;return`translateX(${t===`end`===n?`-`:``}${ko})`}function L(e){e.duration<=0||e.remaining<=0||(e.startedAt=Date.now(),e.timer=window.setTimeout(()=>{e.timer=null,ae(e.id)},e.remaining))}function ee(e){let t=T.find(t=>t.id===e);t&&t.timer!==null&&(window.clearTimeout(t.timer),t.timer=null,t.remaining=Math.max(0,t.remaining-(Date.now()-t.startedAt)))}function R(e){let t=T.find(t=>t.id===e);!t||t.removing||t.queued||t.timer!==null||t.duration<=0||L(t)}function z(){for(let e of T)ee(e.id)}function B(){for(let e of T)R(e.id)}function V(){let e=new Map;return v.querySelectorAll(`[data-id]`).forEach(t=>{e.set(Number(t.dataset.id),t.getBoundingClientRect())}),e}function te(e){_()||f()||requestAnimationFrame(()=>{v.querySelectorAll(`[data-id]`).forEach(t=>{let n=Number(t.dataset.id),r=T.find(e=>e.id===n);if(r?.removing&&r.exitMode===`slide`)return;let i=e.get(n);if(!i)return;let a=t.getBoundingClientRect(),o=i.top-a.top;o!==0&&t.animate([{transform:`translateY(${o}px)`},{transform:`translateY(0)`}],{duration:wo,easing:To})})})}function H(e){let t=e.title===void 0&&So(u(),e.type),n;n=e.title===!1?null:e.title===void 0?t?h(e.type):null:e.title;let i=t?null:`${h(e.type)}: `,a=e.icon!==void 0&&e.icon!==!1?e.icon:null,o;return o=a===null?e.type===`loading`||e.icon===void 0&&So(r(),e.type)?e.icon===!1?`none`:`default`:`none`:`custom`,{id:e.id,type:e.type,role:c()?`none`:Co(e.type),duration:e.duration,dismissLabel:h(`dismiss`),iconMode:o,icon:a,severity:i,title:n,message:e.message,actions:e.actions.map(e=>({label:e.label})),dismissible:e.dismissible,appearance:p(e.type)}}function U(e){w.render(T.filter(e=>!e.queued).map(H)),ne(),e&&te(e)}function ne(){if(!f())return;v.style.setProperty(`--stack-duration`,`${jo}ms`);let e=Array.from(v.querySelectorAll(`:scope > [data-id]`)),t=e.length-1,n=e[t]?.offsetHeight??0,r=0;for(let i=t;i>=0;i--){let a=e[i],o=Math.min(t-i,Io),s=1-o*Fo,c=n+o*Po-a.offsetHeight*s;a.style.setProperty(`--stack-index`,String(t-i)),a.style.setProperty(`--stack-scale`,String(s)),a.style.setProperty(`--stack-collapsed`,`${Math.max(0,c)}px`),a.style.setProperty(`--stack-offset`,`${r}px`),r+=a.offsetHeight+No}let i=e[t]?.offsetHeight??0;v.style.setProperty(`--stack-collapsed-height`,`${i}px`),v.style.setProperty(`--stack-expanded-height`,`${Math.max(i,r-No)}px`)}function re(e){if(!c())return;let t=v.querySelector(`[data-id="${e.id}"]`),n=t?.querySelector(`[slot="title"]`)?.textContent?.trim()??``,r=t?.querySelector(`[slot="content"]`)?.textContent?.trim()??``,i=[h(e.type),n,r].filter(Boolean).join(` `),a=Co(e.type)===`alert`?b:y;a&&(a.textContent=``,requestAnimationFrame(()=>{a.textContent=i}))}function ie(e){let t=v.querySelector(`[data-id="${e.id}"]`);t&&!_()&&(t.style.transform=F(),t.style.opacity=`0`,t.offsetWidth,t.style.transition=Eo,t.style.transform=``,t.style.opacity=``,window.setTimeout(()=>{t.style.transition=``},wo))}function ae(e,t=`slide`){let n=T.find(t=>t.id===e);if(!n||n.removing)return;if(n.queued){let t=T.findIndex(t=>t.id===e);t!==-1&&T.splice(t,1);return}n.removing=!0,n.exitMode=t,n.timer!==null&&(window.clearTimeout(n.timer),n.timer=null);let r=()=>{let t=T.findIndex(t=>t.id===e);if(t===-1)return;let n=V();T.splice(t,1),U(n),ce()},i=v.querySelector(`[data-id="${e}"]`);if(!i||_()){r();return}if(t===`fade`){i.style.transition=Lo,requestAnimationFrame(()=>{i.style.opacity=`0`}),window.setTimeout(r,Ro);return}i.style.transition=Do,requestAnimationFrame(()=>{i.style.transform=I()}),window.setTimeout(r,Oo)}function oe(){return T.filter(e=>!e.removing&&!e.queued).length}function se(){let e=d();if(!e||e<=0)return;let t=T.filter(e=>!e.removing&&!e.queued),n=t.length-e;for(let e=0;e<n;e++)ae(t[e].id,`fade`)}function ce(){let e=d();if(a()!==`queue`||!e||e<=0||oe()>=e)return!1;let t=T.find(e=>e.queued);if(!t)return!1;let n=V();return t.queued=!1,U(n),ie(t),L(t),re(t),!0}function le(e){return typeof e==`string`?{message:e}:e}function ue(e){return{dismiss:()=>ae(e),set:t=>de(e,t)}}function de(e,t){let n=T.find(t=>t.id===e);if(!n||n.removing)return;n.type=t.type,n.title=t.title,n.icon=t.icon,n.message=t.message,n.actions=t.actions??[],n.dismissible=t.dismissible??!0;let r=t.duration??(t.type===`loading`?0:zo);n.duration=r,n.remaining=r,n.timer!==null&&(window.clearTimeout(n.timer),n.timer=null),n.queued||L(n),n.queued||(U(),re(n))}function fe(e){C();let t=V(),n=e.duration??(e.type===`loading`?0:zo),r={id:E++,type:e.type,title:e.title,icon:e.icon,message:e.message,duration:n,removing:!1,exitMode:null,timer:null,remaining:n,startedAt:0,actions:e.actions??[],dismissible:e.dismissible??!0,queued:!1};return T.push(r),a()===`queue`&&d()&&d()>0&&oe()>d()?(r.queued=!0,ue(r.id)):(U(t),ie(r),L(r),re(r),a()===`evict`&&se(),ue(r.id))}function pe(e,t){return fe({type:e,...le(t)})}return{show:fe,info(e){return pe(`info`,e)},success(e){return pe(`success`,e)},warn(e){return pe(`warn`,e)},error(e){return pe(`error`,e)},loading(e){return pe(`loading`,e)},promise(e,t){let n=pe(`loading`,t.loading);return e.then(e=>{let r=typeof t.success==`function`?t.success(e):t.success;n.set({type:`success`,...le(r)})},e=>{let r=typeof t.error==`function`?t.error(e):t.error;n.set({type:`error`,...le(r)})}),e},configure(e){for(n={...e,adapter:t},S(),se();ce(););U()},clear(){for(let e of T)e.timer!==null&&(window.clearTimeout(e.timer),e.timer=null);T.length=0,U()},destroy(){for(let e of T)e.timer!==null&&(window.clearTimeout(e.timer),e.timer=null);T.length=0,window.clearTimeout(k),document.removeEventListener(`keydown`,N),document.removeEventListener(`visibilitychange`,P),document.removeEventListener(`pointerdown`,M),document.removeEventListener(`pointermove`,D),w.destroy?.(),v.remove()}}}var Ho=(0,H.createContext)(null);function Uo({confirm:e,dirty:t,children:n}){let r=(0,H.useContext)(Ho);if(!r)throw Error(`<Form> is only for the content of a form dialog (dialogs.form).`);return(0,H.useLayoutEffect)(()=>{r.confirm=e,r.dirty=t}),(0,H.useLayoutEffect)(()=>()=>{r.confirm=void 0,r.dirty=void 0},[r]),(0,H.createElement)(H.Fragment,null,n)}function Wo(e){let t=new Set;return{factory:({container:n,tag:r,requestRender:i})=>{let a=e.nextId(),o={confirm:void 0,dirty:void 0};return t.add(i),{render(t){(0,je.flushSync)(()=>{e.set(a,n,(0,H.createElement)(Jo,{tag:r,spec:t,formBox:o}))})},getConfirm:()=>o.confirm,isDirty:()=>o.dirty?.()??!1,destroy(){t.delete(i),(0,je.flushSync)(()=>e.remove(a))}}},refresh:()=>{for(let e of t)e()}}}var Go={display:`contents`};function Ko({node:e}){let t=(0,H.useRef)(null);return(0,H.useLayoutEffect)(()=>{let n=t.current;if(n)return n.replaceChildren(e),()=>n.replaceChildren()},[e]),(0,H.createElement)(`span`,{ref:t,style:Go})}function qo(e){return typeof Node<`u`&&e instanceof Node?(0,H.createElement)(Ko,{node:e}):e}function Jo({tag:e,spec:t,formBox:n}){let r=(0,H.useRef)(null);(0,H.useLayoutEffect)(()=>{r.current&&(r.current.props=t.props)});let{props:i,slots:a}=t,o=i.hasForm?(0,H.createElement)(`form`,{slot:`content`,key:`content`,className:`content`,noValidate:!i.nativeValidation,onSubmit:Yo},(0,H.createElement)(Ho.Provider,{value:n},qo(a.content))):(0,H.createElement)(`div`,{slot:`content`,key:`content`,className:`content`},qo(a.content));return(0,H.createElement)(e,{ref:r},(0,H.createElement)(`span`,{slot:`icon`,key:`icon`},qo(a.icon)),(0,H.createElement)(`span`,{slot:`title`,key:`title`},qo(a.title)),(0,H.createElement)(`span`,{slot:`subtitle`,key:`subtitle`},qo(a.subtitle)),(0,H.createElement)(`div`,{slot:`intro`,key:`intro`},qo(a.intro)),o,(0,H.createElement)(`div`,{slot:`outro`,key:`outro`},qo(a.outro)),Xo(i,a),Qo(i),Zo(i),...$o(i))}function Yo(e){e.preventDefault()}function Xo(e,t){let n=e.render?.note;return(0,H.createElement)(`span`,{key:`note`,slot:`note`},n&&e.note?qo(n(e.note)):qo(t.note))}function Zo(e){let t=e.render?.closeButton;return t?(0,H.createElement)(`span`,{slot:`close`,key:`close`},qo(t({onClose:e.onClose}))):null}function Qo(e){let t=e.render?.maximizeButton;return!t||!e.maximizable?null:(0,H.createElement)(`span`,{slot:`maximize`,key:`maximize`},qo(t({maximized:e.maximized,label:e.maximizeLabel,onToggle:e.onToggleMaximize})))}function $o(e){let t=e.render?.actionButton;return t?e.buttons.map((e,n)=>(0,H.createElement)(`span`,{slot:e.separate?`action-separate`:`action`,key:`action-${n}`,"data-action-index":n},qo(t({role:e.role,action:e.action,text:e.text,variant:e.type,loading:e.loading,onClick:e.onClick})))):[]}function es(e){return({container:t,tag:n})=>{let r=e.nextId();return{render(i){(0,je.flushSync)(()=>{e.set(r,t,i.map(e=>ts(n,e)))})},destroy(){(0,je.flushSync)(()=>e.remove(r))}}}}function ts(e,t){let n=[],r=(e,t,r)=>{n.push((0,H.createElement)(`span`,{key:e,slot:t},r))};return t.icon!==null&&r(`i`,`icon`,t.icon),t.severity!==null&&r(`s`,`severity`,t.severity),t.title!==null&&r(`t`,`title`,t.title),r(`m`,`content`,t.message),t.actions.forEach((e,t)=>{n.push((0,H.createElement)(`button`,{key:`a${t}`,slot:`action`,type:`button`,"data-action-index":t},e.label))}),(0,H.createElement)(e,{key:t.id,"data-id":t.id,type:t.type,role:t.role,duration:t.duration,"dismiss-label":t.dismissLabel,"icon-mode":t.iconMode,dismissible:String(t.dismissible),"has-actions":t.actions.length>0?``:void 0,appearance:t.appearance},...n)}function ns(){let e=[],t=0,n=new Set,r=()=>{for(let e of n)e()};return{set(t,n,i){let a=e.findIndex(e=>e.id===t),o={id:t,container:n,node:i};e=a<0?[...e,o]:e.map((e,t)=>t===a?o:e),r()},remove(t){let n=e.filter(e=>e.id!==t);n.length!==e.length&&(e=n,r())},nextId:()=>++t,subscribe(e){return n.add(e),()=>n.delete(e)},snapshot:()=>e}}function rs(e){return(0,H.useSyncExternalStore)(e.subscribe,e.snapshot,e.snapshot)}var is=(0,H.createContext)(null);function as(e,t,n=2){if(Object.is(e,t)||typeof e==`function`&&typeof t==`function`)return!0;if(Array.isArray(e)&&Array.isArray(t))return e.length===t.length&&e.every((e,r)=>as(e,t[r],n-1));if(n>0&&os(e)&&os(t)){let r=Object.keys(e);return r.length===Object.keys(t).length&&r.every(r=>as(e[r],t[r],n-1))}return!1}function os(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function ss(e,t){let n=null,r={},i=()=>n??=Vo({mountTarget:t,...r,adapter:es(e)});return{facade:{show:e=>i().show(e),info:e=>i().info(e),success:e=>i().success(e),warn:e=>i().warn(e),error:e=>i().error(e),loading:e=>i().loading(e),promise:(e,t)=>i().promise(e,t),clear:()=>n?.clear(),configure:e=>i().configure(e),destroy:()=>{n?.destroy(),n=null}},configure:e=>{let i=!as(r,e);r=e,i&&n?.configure({mountTarget:t,...e})},teardown:()=>{n?.destroy(),n=null}}}function cs({config:e,refreshKey:t,children:n}){let[r]=(0,H.useState)(()=>{let e=ns(),t={current:null},n=()=>t.current,r=ss(e,n),i=Wo(e),a={adapter:i.factory,mountTarget:n},o=ao(a);return{store:e,mountPoint:t,mountTarget:n,liveDialogConfig:a,refreshDialogs:i.refresh,configureToasts:r.configure,teardown:()=>{o.abortAll(),r.teardown()},value:{dialogs:o,toasts:r.facade}}});(0,H.useLayoutEffect)(()=>{let t=r.liveDialogConfig;for(let e of Object.keys(t))e!==`adapter`&&delete t[e];Object.assign(t,{mountTarget:r.mountTarget},e?.dialogs),r.configureToasts(e?.toasts??{})}),(0,H.useLayoutEffect)(()=>{r.refreshDialogs()},[r,t]),(0,H.useEffect)(()=>r.teardown,[r]);let i=rs(r.store);return(0,H.createElement)(is.Provider,{value:r.value},n,(0,H.createElement)(`div`,{ref:e=>{r.mountPoint.current=e},"data-overlays":``,style:{display:`contents`}}),(0,H.createElement)(H.Fragment,null,...i.map(e=>(0,je.createPortal)(e.node,e.container,String(e.id)))))}function ls(e){let t=(0,H.useContext)(is);if(!t)throw Error(`${e} must be used inside an <OverlaysProvider>.`);return t}function us(){return ls(`useDialogs()`).dialogs}function ds(){return ls(`useToast()`).toasts}export{$n as A,Fe as B,di as C,Mr as D,Qn as E,Hr as F,we as G,Me as H,Cn as I,se as J,fe as K,Wr as L,Rr as M,Br as N,xr as O,Jn as P,U as Q,Jr as R,fi as S,ni as T,Ce as U,Ne as V,W,ie as X,ae as Y,ne as Z,Ti as _,Vo as a,_i as b,wa as c,Wi as d,Ui as f,Di as g,Ai as h,Uo as i,Ir as j,$r as k,Gi as l,Mi as m,us as n,xo as o,Ri as p,de as q,ds as r,ao as s,cs as t,Ki as u,wi as v,ai as w,pi as x,Si as y,Yr as z};