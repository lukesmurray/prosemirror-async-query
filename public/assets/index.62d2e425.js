var x=Object.defineProperty,E=Object.defineProperties;var P=Object.getOwnPropertyDescriptors;var m=Object.getOwnPropertySymbols;var I=Object.prototype.hasOwnProperty,F=Object.prototype.propertyIsEnumerable;var h=(a,e,t)=>e in a?x(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t,f=(a,e)=>{for(var t in e||(e={}))I.call(e,t)&&h(a,t,e[t]);if(m)for(var t of m(e))F.call(e,t)&&h(a,t,e[t]);return a},p=(a,e)=>E(a,P(e));var c=(a,e,t)=>(h(a,typeof e!="symbol"?e+"":e,t),t);import{n as _,m as M,E as S,P as D,a as L,i as w,r as C,l as g,j as q,F as N,b as u,u as k,c as O,D as T,d as A,T as K,R as j,e as $}from"./vendor.eaf6b8dd.js";const B=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerpolicy&&(n.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?n.credentials="include":s.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}};B();class d{constructor({metaKey:e,parameters:t,query:r,cancel:s,enabled:n,queryId:o}){c(this,"metaKey");c(this,"parameters");c(this,"queryId");c(this,"enabled");c(this,"_canceled");c(this,"_data");c(this,"_error");c(this,"_status");c(this,"cancelFn");c(this,"queryFn");this._status="idle",this.queryFn=r!=null?r:()=>Promise.resolve(),this.cancelFn=s,this.parameters=t,this._canceled=!1,this.metaKey=e!=null?e:_(),this.queryId=o!=null?o:_(),this.enabled=n!=null?n:!0}get status(){return this._status}get data(){return this._data}get error(){return this._error}get canceled(){return this._canceled}toString(){return`Query(${this.parameters}) { status: ${this.status}, canceled: ${this.canceled}, enabled: ${this.enabled} }`}async run(){if(this.enabled!==!1)return this._status="loading",this._canceled=!1,this.queryFn().then(e=>{if(this._canceled)throw new Error("Canceled");this._data=e,this._status="success"}).catch(e=>{this._status="error",this._error=e})}cancel(){var e;this._status==="loading"&&(this._status="error",this._canceled=!0,this._error=new Error("Canceled"),(e=this.cancelFn)==null||e.call(this))}viewUpdate(e,{ignoreCanceled:t=!1,ignoreError:r=!1,ignoreLoading:s=!1,ignoreSuccess:n=!1}={}){if(this.enabled!==!1&&this.status==="idle"){if(this.run().finally(()=>{if(this._canceled&&t||this.status==="success"&&n||this.status==="error"&&r)return;const i=e.state.tr;i.setMeta("addToHistory",!1),i.setMeta(this.metaKey,{queryId:this.queryId}),e.dispatch(i)}),s)return;const o=e.state.tr;o.setMeta("addToHistory",!1),o.setMeta(this.metaKey,{queryId:this.queryId}),e.dispatch(o)}}viewDestroy(){this.cancel()}statusChanged(e,t){var s;let r=((s=e.getMeta(this.metaKey))==null?void 0:s.queryId)===this.queryId;return typeof t=="string"?r=this.status===t&&r:Array.isArray(t)&&(r=t.indexOf(this.status)!==-1&&r),r}static empty(){return new d({enabled:!1})}}function H(a){const e=[];let t=!1,r=!1;return a.mapping.maps.forEach(s=>{s.forEach((n,o,i,l)=>{i===l?r=!0:t=!0,e.push({from:i,to:l})})}),{changedRanges:e,isInsertion:t,isDeletion:r}}const Q=M(H),U=S.create({name:"async-flow",addProseMirrorPlugins(){const a=this;return[new D({key:new L(a.name),view(e){const t=this.key;return w(t),{update(r,s){const n=t.getState(r.state),o=t.getState(s),{query:i,queryResult:l}=n!=null?n:{};i==null||i.viewUpdate(r,{ignoreCanceled:!0,ignoreLoading:!0}),l&&l!==(o==null?void 0:o.queryResult)&&console.log("query data loaded",l)},destroy(){var r,s;(s=(r=t.getState(e.state))==null?void 0:r.query)==null||s.viewDestroy()}}},state:{init(){return{query:d.empty(),queryResult:null}},apply(e,t,r,s){const{query:n}=t,o=this.spec.key;if(w(o),n.statusChanged(e,"success"))return p(f({},t),{queryResult:n.data});const i=z(s,e),l=i&&n.parameters!==i;if(!l)return t;const y=f({},t);if(l){n.cancel();const R=new d({query:async()=>(await(b=>new Promise(v=>setTimeout(v,b)))(1e3),i),metaKey:o,parameters:i});y.query=R}return y}}})]}});function z(a,e){const{empty:t,from:r,to:s}=a.selection,n={from:r,to:s},o=Q(e).changedRanges.filter(i=>G(i,n));if(t&&o.length>0){const i=e.doc.textBetween(o[0].from,o[0].to);if(i.length>0)return i[i.length-1]}return null}function G(a,e){return a.from<=e.to&&a.to>=e.from}const W=()=>{const[a,e]=C.exports.useState([]);return C.exports.useEffect(()=>(g.Hook(window.console,t=>e(r=>[...r,t]),!1),()=>{g.Unhook(window.console)}),[]),q(N,{children:[u("h4",{children:"Console"}),u("div",{className:"consoleWrapper",children:u(g.Console,{styles:{PADDING:"0.5rem"},logs:a,variant:"dark"})}),u("button",{className:"clearConsoleButton",onClick:()=>{e([])},children:"Clear Console"})]})},J=()=>{const a=k({extensions:[T,A,K,U],content:"<p>This editor uses queries to implement async behavior. It uses promises to log the last character typed on a 1 second debounce.</p>"});return q("div",{className:"tiptap",children:[u(O,{className:"editor",editor:a}),u(W,{})]})};j.render(u($.StrictMode,{children:u(J,{})}),document.getElementById("root"));
