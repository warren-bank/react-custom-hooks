!function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=1)}([function(e,t){e.exports=window.React},function(e,t,r){var n=r(2);window.UnifiedReduxReactHook=n},function(e,t,r){{const{StoreContext:t,useDispatch:n,useMappedState:o}=r(3),u=r(4),{useEffect:f,useRef:i,useCallback:c,useMemo:a}=r(0);let s;const l=[],p=e=>(l.push(e),l.length),d=e=>{let t=l.indexOf(e);return t>=0&&l.splice(t,1),l.length},h=e=>{const t=[...l];s&&t.push(s),t.forEach(t=>t(e))},y=(...e)=>(s=n(),f(()=>{if(!e||!e.length)return;return e.forEach(p),()=>{e.forEach(d)}},e),h),b=(...e)=>{let t=null;if(e&&e.length){let r=e[e.length-1];if("object"==typeof r&&(e.pop(),"string"==typeof r.equality))switch(r.equality.toLowerCase()){case"deep":t=(e,t)=>u(e,t,{shallow:!1});break;case"shallow":t=(e,t)=>u(e,t,{shallow:!0,depth:2})}}const r=(...r)=>{const n=[...e];if(!n||!n.length)return null;const u=i([]),f=n.pop();let s,l=[];for(let e=0;e<n.length;e++){let t=n[e];if(Array.isArray(t))n.splice(e+1,0,...t);else if("function"==typeof t)if(t.hasOwnProperty("UnifiedReduxReactHook_ReduxSelector")){let e=t(...r);l.push(e)}else{let e=c(e=>t(e,...r),r),n=o(e);l.push(n)}else l.push(t)}return l.length?("function"==typeof t&&(t(u.current,l)?l=u.current:u.current=l),s=a(()=>f(...l),l)):("function"==typeof t&&(u.current=[]),s=o(c(f,[]))),s};return Object.defineProperty(r,"UnifiedReduxReactHook_ReduxSelector",{enumerable:!1,configurable:!1,writable:!1,value:!0}),r};e.exports={StoreContext:t,addDispatch:p,removeDispatch:d,useDispatch:y,useReduxDispatch:n,useReduxMappedState:o,createReduxSelector:b}}},function(e,t,r){"use strict";r.r(t),r.d(t,"StoreContext",(function(){return l})),r.d(t,"create",(function(){return a})),r.d(t,"useDispatch",(function(){return p})),r.d(t,"useMappedState",(function(){return d}));var n=r(0),o=function(e,t){return(o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])})(e,t)};var u,f="undefined"!=typeof window?n.useLayoutEffect:n.useEffect,i=function(e){function t(){return e.call(this,"redux-react-hook requires your Redux store to be passed through context via the <StoreContext.Provider>")||this}return function(e,t){function r(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r)}(t,e),t}(Error);function c(e,t){return e===t}function a(e){var t=(void 0===e?{}:e).defaultEqualityCheck,r=void 0===t?c:t,o=Object(n.createContext)(null);return{StoreContext:o,useDispatch:function(){var e=Object(n.useContext)(o);if(!e)throw new i;return e.dispatch},useMappedState:function(e,t){void 0===t&&(t=r);var u=Object(n.useContext)(o);if(!u)throw new i;var c=Object(n.useMemo)((function(){return t=e,function(e){return n!==e&&(n=e,r=t(e)),r};var t,r,n}),[e]),a=u.getState(),l=c(a),p=Object(n.useState)(0)[1],d=Object(n.useRef)(l),h=Object(n.useRef)(c);return f((function(){d.current=l,h.current=c})),f((function(){var e=!1,r=function(){if(!e){var r=h.current(u.getState());t(r,d.current)||p(s)}};r();var n=u.subscribe(r);return function(){e=!0,n()}}),[u]),l}}}function s(e){return e+1}var l=(u=a()).StoreContext,p=u.useDispatch,d=u.useMappedState},function(e,t,r){"use strict";const n={depth:0,shallow:!1,react:!1,es6:{Map:!1,Set:!1,ArrayBuffer:!1}},o=(e,t,r)=>{if(e===t)return!0;if(r.shallow){if(r.depth<=0)return!1;r={...r,depth:r.depth-1}}if(e&&t&&"object"==typeof e&&"object"==typeof t){if(e.constructor!==t.constructor)return!1;var n,u,f;if(Array.isArray(e)){if((n=e.length)!=t.length)return!1;for(u=n;0!=u--;)if(!o(e[u],t[u],r))return!1;return!0}if(r.es6.Map&&e instanceof Map&&t instanceof Map){if(e.size!==t.size)return!1;for(u of e.entries())if(!t.has(u[0]))return!1;for(u of e.entries())if(!o(u[1],t.get(u[0]),r))return!1;return!0}if(r.es6.Set&&e instanceof Set&&t instanceof Set){if(e.size!==t.size)return!1;for(u of e.entries())if(!t.has(u[0]))return!1;return!0}if(r.es6.ArrayBuffer&&ArrayBuffer.isView(e)&&ArrayBuffer.isView(t)){if((n=e.length)!=t.length)return!1;for(u=n;0!=u--;)if(e[u]!==t[u])return!1;return!0}if(e.constructor===RegExp)return e.source===t.source&&e.flags===t.flags;if(e.valueOf!==Object.prototype.valueOf)return e.valueOf()===t.valueOf();if(e.toString!==Object.prototype.toString)return e.toString()===t.toString();if((n=(f=Object.keys(e)).length)!==Object.keys(t).length)return!1;for(u=n;0!=u--;)if(!Object.prototype.hasOwnProperty.call(t,f[u]))return!1;for(u=n;0!=u--;){var i=f[u];if((!r.react||"_owner"!==i||!e.$$typeof)&&!o(e[i],t[i],r))return!1}return!0}return e!=e&&t!=t};e.exports=function(e,t,r){if(e===t)return!0;const u=(e=>{if(!(e&&e instanceof Object))return n;if("number"==typeof e.depth&&(e.depth>=0&&e.depth<1/0?e.shallow=!0:(delete e.depth,delete e.shallow)),"number"!=typeof e.depth&&void 0!==e.depth&&delete e.depth,"boolean"==typeof e.shallow&&null==e.depth){let t=e.shallow;e.depth=t?1:0}if("boolean"!=typeof e.shallow&&void 0!==e.shallow&&delete e.shallow,"boolean"!=typeof e.react&&void 0!==e.react&&delete e.react,"boolean"==typeof e.es6){let t=e.es6;e.es6={Map:t,Set:t,ArrayBuffer:t}}return"object"!=typeof e.es6&&void 0!==e.es6&&delete e.es6,{...n,...e}})(r);return o(e,t,u)}}]);
//# sourceMappingURL=bundle.map