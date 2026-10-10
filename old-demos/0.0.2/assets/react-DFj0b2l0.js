const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./client-C5sPviEq.js","./createFileUploadClass-Fy0SH1SL.js"])))=>i.map(i=>d[i]);
import{a as e,n as t,t as n}from"./jsx-runtime-D3jfb0Ew.js";import{t as r}from"./index-DdDBWYuA.js";var i={de:{dropHint:`Dateien hierher ziehen oder`,browse:`Durchsuchen`,hintAccept:`Erlaubt: {types}`,hintMaxFiles:`Maximale Anzahl Dateien: {count}`,hintMaxFileSize:`Maximale Größe pro Datei: {size}`,fileList:`Dateien`,statusReady:`Bereit zum Hochladen`,statusQueued:`Wartet`,statusUploading:`Wird hochgeladen: {percent} %`,statusDone:`Hochgeladen`,statusError:`Hochladen fehlgeschlagen`,statusAborted:`Abgebrochen`,rejectedType:`Dieser Dateityp ist nicht erlaubt`,rejectedSize:`Die Datei ist größer als {size}`,rejectedCount:`Zu viele Dateien, maximal {count}`,upload:`Hochladen`,uploadAll:`Alle hochladen`,clear:`Leeren`,cancel:`Abbrechen`,stop:`Stoppen`,retry:`Erneut versuchen`,remove:`Entfernen`,showPreview:`Vorschau anzeigen`,closePreview:`Vorschau schließen`,validationFailed:`Die fehlgeschlagenen Dateien erneut hochladen oder entfernen.`,validationPending:`Warten, bis alle Dateien hochgeladen sind.`,validationRequired:`Bitte eine Datei hinzufügen.`}};function a(){let e=document.documentElement,t=()=>e.lang||`en-US`;return{currentLocale:t,resolveText:(e,n,r,i)=>s(t(),e,n,r,i),onChange:t=>{let n=new MutationObserver(t);return n.observe(e,{attributes:!0,attributeFilter:[`lang`]}),()=>n.disconnect()}}}function o(e){return{currentLocale:()=>e,resolveText:(t,n,r,i)=>s(e,t,n,r,i)}}function s(e,t,n,r,a){let o=t===`fileupload`?i[e.split(`-`)[0]??``]?.[n]:void 0;return o===void 0?a:o.replace(/\{(\w+)\}/g,(t,n)=>{let i=r?.[n];return typeof i==`number`?new Intl.NumberFormat(e).format(i):String(i)})}var c=e(t(),1),l={compact:{row:.286,drop:.571},normal:{row:.571,drop:.857},comfortable:{row:1.143,drop:1.429}},u={accentColor:{light:`#228be6`,dark:`#1c7ed6`},accentTextColor:`#fff`,textColor:`inherit`,mutedColor:{light:`#868e96`,dark:`#909296`},borderColor:{light:`#dee2e6`,dark:`#424242`},surfaceColor:{light:`#f1f3f5`,dark:`#2e2e2e`},successColor:{light:`#2f9e44`,dark:`#51cf66`},dangerColor:{light:`#e03131`,dark:`#ff6b6b`},borderRadius:`4px`,buttonBorderRadius:`5px`,fontFamily:`inherit`,fontSize:`0.875rem`};function d(e){let t=`${p({...u,...e.theme})}\n${e.styles??``}`;if(typeof CSSStyleSheet==`function`&&`replaceSync`in CSSStyleSheet.prototype)try{let e=new CSSStyleSheet;return e.replaceSync(t),e}catch{return t}return t}function f(e){return typeof e==`string`?e:`light-dark(${e.light}, ${e.dark})`}function p(e){let t=f(e.accentColor),n=f(e.accentTextColor),r=f(e.mutedColor),i=f(e.borderColor),a=f(e.surfaceColor),o=e.borderRadius;return`
:host {
  /* A column: our label (if any) and the frame. With a height limit on the element (e.g. \`max-height\`), the frame
     shrinks and its list scrolls, so the line below the list stays visible. Without one, it is as high as its content. */
  display: flex;
  flex-direction: column;
  color: ${f(e.textColor)};
  font-family: ${e.fontFamily};
  /* The base size. All sizes and spacings are relative to it (\`em\`), so it scales the whole element. The small texts
     are 6/7 of it: their spacings are relative to their own size. */
  font-size: ${e.fontSize};
  /* Nothing is selectable except the file names (see \`.name\`). Safari still needs the prefix. */
  -webkit-user-select: none;
  user-select: none;
}

:host([hidden]) {
  display: none;
}

/* A table with one line per file, and below it one line with the prompt, "Browse", the hints and "Upload all". The
   whole element is the drop target. The columns of all rows line up (subgrid). */
/* Our own label, above the element (only when it has one). */
.label {
  margin-block-end: 0.429em;
  font-weight: 500;
}

/* The error text below the frame (only when there is one): the app's, or our own message of an invalid element. The
   frame turns to the danger color with it. */
.error {
  margin-block-start: 0.5em;
  color: ${f(e.dangerColor)};
  font-size: 0.857em;
  font-weight: 500;
}

.root {
  display: grid;
  /* The list grows with its files, up to the space the element leaves it (see \`:host\`). */
  grid-template-rows: minmax(0, auto) auto;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: 'list list' 'drop action';
  min-height: 0;
  /* For the narrow layout (see \`@container\` below). The element takes its width from outside. */
  container: file-upload / inline-size;
  border: 1px solid ${i};
  border-radius: ${o};

  &[data-invalid] {
    border-color: ${f(e.dangerColor)};
  }

  &[inert] {
    opacity: 0.6;
  }

  &[data-dragging] {
    border-color: ${t};
    background-color: color-mix(in srgb, ${t} 10%, transparent);
  }
}

.drop-area {
  display: flex;
  flex-wrap: wrap;
  grid-area: drop;
  align-items: center;
  gap: 0.571em;
  padding: ${l.normal.drop}em 0.857em;

  :where(.root[data-density='compact']) & {
    padding-block: ${l.compact.drop}em;
  }

  :where(.root[data-density='comfortable']) & {
    padding-block: ${l.comfortable.drop}em;
  }
}

.prompt {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.571em;
}

/* In the text color, like the prompt next to it. */
.drop-icon {
  width: 1.143em;
  height: 1.143em;
}

.limits {
  margin-inline-start: auto;
  color: ${r};
  font-size: 0.857em;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  border: 1px solid transparent;
  border-radius: ${e.buttonBorderRadius};
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${t};
    outline-offset: 2px;
  }
}

.text-button {
  gap: 0.5em;
  padding: 0.333em 1em;
  /* Darker than the other borders, so the button stands out as a control. All text buttons look the same, none in the
     accent color: as harmless as possible, because they rarely match the buttons of the app exactly. */
  border-color: color-mix(in srgb, ${i}, ${r});
  /* The size of the prompt next to it (it was 0.857em, too small). */
  font-size: 1em;
  font-weight: 600;

  &:hover {
    background-color: ${a};
  }

  & svg {
    width: 1.167em;
    height: 1.167em;
  }
}

.list-header {
  display: flex;
  grid-area: action;
  gap: 0.571em;
  align-items: center;
  padding-inline-end: 0.857em;
}

.list {
  display: grid;
  grid-area: list;
  grid-template-columns: auto minmax(0, 1fr) auto auto auto auto;
  /* The rows keep their own height when the list has less space than it needs: it scrolls. */
  grid-auto-rows: max-content;
  align-content: start;
  column-gap: 0.857em;
  min-height: 0;
  overflow: auto;
  /* No bounce at its ends (Firefox's elastic overscroll), and the page does not scroll on (2026-10-08). */
  overscroll-behavior: none;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid ${i};
  list-style: none;
}

.row {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  align-items: center;
  padding: ${l.normal.row}em 0.857em;

  :where(.root[data-density='compact']) & {
    padding-block: ${l.compact.row}em;
  }

  :where(.root[data-density='comfortable']) & {
    padding-block: ${l.comfortable.row}em;
  }

  & + & {
    border-top: 1px solid ${i};
  }
}

.info,
.name-line,
.progress-line {
  display: contents;
}

.thumbnail {
  display: flex;
  position: relative;
  grid-column: 1;
  align-items: center;
  justify-content: center;
  width: 1.714em;
  height: 1.714em;
  border-radius: calc(${o} / 2);
  background-color: ${a};
  color: ${r};

  & img {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }

  /* A preview opens large in a dialog. The thumbnail does not clip, so the focus outline stays visible. */
  & .preview-button {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    border-radius: inherit;
    cursor: zoom-in;
  }

  & svg {
    width: 1.143em;
    height: 1.143em;
  }

  /* The icon of the status (without a preview). */
  .row[data-status='done'] & {
    color: ${f(e.successColor)};
  }

  .row:is([data-status='error'], [data-status='rejected']) & {
    color: ${f(e.dangerColor)};
  }

  & [data-icon='spinner'] {
    animation: spin 1s linear infinite;
  }

  /* The status on a preview, in its corner. */
  & .badge {
    display: flex;
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: 0;
    align-items: center;
    justify-content: center;
    width: 0.75em;
    height: 0.75em;
    border-radius: 50%;
    background-color: ${f(e.successColor)};
    color: ${n};
    pointer-events: none;

    .row:is([data-status='error'], [data-status='rejected']) & {
      background-color: ${f(e.dangerColor)};
    }

    /* While uploading: a dot with a ring that grows and fades. */
    &[data-badge='pulse'] {
      background-color: ${t};
      animation: pulse 1.2s ease-out infinite;
    }

    & svg {
      width: 0.5em;
      height: 0.5em;
      stroke-width: 3;
    }
  }
}

@keyframes spin {
  to {
    rotate: 1turn;
  }
}

@keyframes pulse {
  from {
    box-shadow: 0 0 0 0 color-mix(in srgb, ${t} 60%, transparent);
  }

  to {
    box-shadow: 0 0 0 0.3em transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .thumbnail :is([data-icon='spinner'], [data-badge='pulse']) {
    animation: none;
  }
}

.name {
  grid-column: 2;
  overflow: hidden;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size {
  grid-column: 3;
  color: ${r};
  font-size: 0.857em;
}

.progress {
  grid-column: 4;
  width: 4.571em;
  height: 0.286em;
  overflow: hidden;
  border: none;
  border-radius: 999px;
  appearance: none;
  background-color: ${a};
  color: ${t};

  &::-webkit-progress-bar {
    background-color: ${a};
  }

  &::-webkit-progress-value {
    background-color: ${t};
  }

  &::-moz-progress-bar {
    background-color: ${t};
  }
}

.status {
  grid-column: 5;
  color: ${r};
  font-size: 0.857em;
  font-weight: 500;

  .row[data-status='done'] & {
    color: ${f(e.successColor)};
  }

  .row:is([data-status='error'], [data-status='rejected']) & {
    color: ${f(e.dangerColor)};
  }
}

.actions {
  display: flex;
  grid-column: 6;
  /* Right-aligned, so "Remove" (always the last one) lines up in every row. */
  justify-content: flex-end;
  gap: 0.286em;
}

/* Narrow: two lines per file. The first one with the thumbnail, the name, the size and the buttons, the second one with
   the progress bar (filling the line) and the status. */
@container file-upload (width < 60em) {
  .list {
    grid-template-columns: auto minmax(0, 1fr) auto auto;
  }

  .row {
    row-gap: 0.143em;
  }

  .thumbnail,
  .name,
  .size,
  .actions {
    grid-row: 1;
  }

  .actions {
    grid-column: 4;
  }

  .progress-line {
    display: flex;
    grid-row: 2;
    grid-column: 2 / -1;
    align-items: center;
    gap: 0.857em;
  }

  .progress {
    flex: 1;
    width: auto;
    min-width: 0;
  }
}

.icon-button {
  width: 2em;
  height: 2em;
  padding: 0;
  color: ${r};

  & svg {
    width: 1.143em;
    height: 1.143em;
  }

  &:hover {
    background-color: ${a};
    color: inherit;
  }
}

/* The button whose tooltip is shown (an icon button or a preview). */
[data-tooltip-anchor] {
  anchor-name: --tooltip-anchor;
}

.tooltip {
  position-anchor: --tooltip-anchor;
  position-area: top;
  position-try-fallbacks: flip-block;
  inset: auto;
  margin: 0.5em;
  padding: 0.333em 0.667em;
  border: none;
  border-radius: calc(${o} / 2);
  background-color: light-dark(#212529, #f1f3f5);
  color: light-dark(#fff, #212529);
  font-size: 0.857em;
  pointer-events: none;
}

/* A preview, large, in a modal dialog. */
.preview-dialog {
  max-width: 90vw;
  max-height: 90vh;
  padding: 0;
  overflow: hidden;
  border: 1px solid ${i};
  /* Half of the radius, like the thumbnail it enlarges. */
  border-radius: calc(${o} / 2);
  background-color: ${a};
  color: ${f(e.textColor)};
  /* Fades in and grows a little when it opens (\`@starting-style\` below). When it closes, \`data-closing\` plays the
     same the other way round, and the dialog is closed when that has ended. */
  transition:
    opacity 0.3s ease-out,
    scale 0.3s ease-out;

  &[data-closing] {
    opacity: 0;
    scale: 0.95;
  }

  &::backdrop {
    background-color: rgb(0 0 0 / 60%);
    transition: background-color 0.3s ease-out;
  }

  &[data-closing]::backdrop {
    background-color: transparent;
  }

  & img {
    display: block;
    max-width: calc(90vw - 2px);
    max-height: calc(90vh - 2px);
    object-fit: contain;
  }

  /* Flush in the top corner, without a gap: the dialog clips the outer corner, only the inner one is rounded. The focus
     ring goes inside, where the dialog does not clip it. */
  & .dialog-close {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    border-radius: 0;
    border-end-start-radius: calc(${o} / 2);
    background-color: ${a};
    color: inherit;

    &:focus-visible {
      outline-offset: -2px;
    }
  }
}

@starting-style {
  .preview-dialog[open] {
    opacity: 0;
    scale: 0.95;
  }

  .preview-dialog[open]::backdrop {
    background-color: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-dialog,
  .preview-dialog::backdrop {
    transition: none;
  }
}

/* Without anchor positioning the tooltip could not be placed next to its button. The buttons keep their accessible
   names. */
@supports not (anchor-name: --tooltip-anchor) {
  .tooltip {
    display: none;
  }
}

/* The rules above set \`display\`, which would win over the \`hidden\` attribute. */
.root [hidden] {
  display: none;
}
`}var m=n(),h={upload:void 0,accept:void 0,maxFiles:void 0,maxFileSize:void 0,multiple:!1,manualUpload:!1,previews:!1,density:`normal`,disabled:!1,name:void 0,required:!1},g=Object.keys(h),_=[`label`,`error`,`icon`,`prompt`,`limits`],v=`internal-file-upload-`,y=e=>`calc(${Number((1.806+2*l[e].drop).toFixed(3))}em + 4px)`,b=()=>void 0;function x(e={}){let{i18n:t,tagName:n,...i}=e,a=e.theme?.fontSize??u.fontSize,o;if(t!==void 0&&t.type!==`factory`&&t.type!==`hook`)throw TypeError(`Unknown i18n type: ${String(t.type)} (expected 'factory' or 'hook').`);let s=t?.type===`factory`?{...i,i18n:t}:i,l=t?.type===`hook`?t.useAdapter:b,d=()=>o??=r(async()=>{let{createFileUploadClass:e,setElementI18nAdapter:t}=await import(`./client-C5sPviEq.js`);return{createFileUploadClass:e,setElementI18nAdapter:t}},__vite__mapDeps([0,1]),import.meta.url).then(({createFileUploadClass:e,setElementI18nAdapter:t})=>{let r=e(s),i=n??S();return customElements.define(i,r),{tag:i,setI18nAdapter:t}});function f(e){let{ref:t,onChange:n,lang:r,id:i,className:o,style:s,maxParallel:u,label:f,error:p,icon:v,prompt:b,limits:x,...S}=e,w=l(),[T,E]=(0,c.useState)(),[D,O]=(0,c.useState)(),[k,A]=(0,c.useState)(null),j=(0,c.useRef)(n);if((0,c.useEffect)(()=>{let e=!0;return d().then(t=>e&&E(t),t=>e&&O({error:t})),()=>{e=!1}},[]),(0,c.useLayoutEffect)(()=>{j.current=n}),(0,c.useLayoutEffect)(()=>{if(k!==null){for(let t of g){let n=e[t]??h[t];k[t]!==n&&Reflect.set(k,t,n)}u===void 0?k.removeAttribute(`max-parallel`):k.maxParallel!==u&&(k.maxParallel=u)}}),(0,c.useLayoutEffect)(()=>{k!==null&&T?.setI18nAdapter(k,w)},[k,T,w]),(0,c.useEffect)(()=>{if(k===null)return;let e=()=>j.current?.(k.items);return k.addEventListener(`change`,e),()=>k.removeEventListener(`change`,e)},[k]),(0,c.useLayoutEffect)(()=>k===null?void 0:C(t,k),[k,t]),D!==void 0)throw D.error;if(T===void 0)return(0,m.jsx)(`div`,{id:i,className:o,style:{fontSize:a,minHeight:y(e.density??`normal`),...s},"aria-busy":!0});let M={label:f,error:p,icon:v,prompt:b,limits:x},N=Object.fromEntries(Object.entries(S).filter(([e])=>e.startsWith(`aria-`)||e.startsWith(`data-`)));return(0,c.createElement)(T.tag,{...N,ref:A,lang:r,id:i,className:o,style:s},_.map(e=>M[e]===void 0?null:(0,m.jsx)(`span`,{slot:e,children:M[e]},e)))}return f}function S(){let e=1;for(;customElements.get(`${v}${e}`)!==void 0;)e++;return`${v}${e}`}function C(e,t){if(typeof e==`function`){let n=e(t);return typeof n==`function`?n:()=>e(null)}if(e!=null)return e.current=t,()=>{e.current=null}}export{o as i,d as n,a as r,x as t};