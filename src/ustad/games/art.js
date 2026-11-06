// Flat illustrations drawn for the games: game icons, colourable items and scene landmarks.
// Plain data (SVG strings) so the bank validator can check every "art:" reference in Node.
// One style: soft outline #23324a, rounded shapes, warm palette.
export const COLORS={red:'#e5484d',green:'#46a758',yellow:'#f5c400',blue:'#3e8ee8',purple:'#8e4ec6',pink:'#ef5f9c',orange:'#f78a1d',white:'#ffffff',brown:'#9a6b3f'};
const ink='#23324a';
const svg=(body,view='0 0 100 100')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" aria-hidden="true" focusable="false">${body}</svg>`;
const shade=(c)=>c===COLORS.white?'#e6e9f0':c;

// ---------- Items that come in colours ----------
const items={
 apple:c=>svg(`<path d="M50 30C22 12 10 52 30 76Q46 90 50 82Q56 90 70 76C90 52 78 12 50 30Z" fill="${c}" stroke="${ink}" stroke-width="3"/><path d="M50 30Q48 18 54 10" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M55 20Q66 10 76 16Q66 26 55 20Z" fill="#46a758" stroke="${ink}" stroke-width="2.5"/><ellipse cx="36" cy="44" rx="5" ry="9" fill="#fff" opacity=".45"/>`),
 ball:c=>svg(`<circle cx="50" cy="52" r="36" fill="${c}" stroke="${ink}" stroke-width="3"/><path d="M14 52Q50 30 86 52M50 16Q30 52 50 88" stroke="${c===COLORS.white?'#9aa5b8':'#ffffff'}" stroke-width="5" fill="none" opacity=".85"/><circle cx="50" cy="52" r="36" fill="none" stroke="${ink}" stroke-width="3"/>`),
 flower:c=>svg(`<path d="M50 58V94" stroke="#2f8a3e" stroke-width="5" stroke-linecap="round"/><path d="M50 80Q34 70 30 78Q38 88 50 84" fill="#46a758" stroke="${ink}" stroke-width="2"/>${[0,72,144,216,288].map(a=>`<ellipse cx="50" cy="22" rx="12" ry="17" transform="rotate(${a} 50 40)" fill="${c}" stroke="${ink}" stroke-width="2.5"/>`).join('')}<circle cx="50" cy="40" r="10" fill="${c===COLORS.yellow?COLORS.orange:'#f5c400'}" stroke="${ink}" stroke-width="2.5"/>`),
 cup:c=>svg(`<path d="M22 30H70L64 84Q63 90 56 90H36Q29 90 28 84Z" fill="${c}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M70 40Q88 40 86 56Q84 70 66 68" fill="none" stroke="${ink}" stroke-width="5"/><path d="M70 40Q88 40 86 56Q84 70 66 68" fill="none" stroke="${shade(c)}" stroke-width="2"/><ellipse cx="46" cy="30" rx="24" ry="5" fill="#fff" stroke="${ink}" stroke-width="2.5"/>`),
 balloon:c=>svg(`<path d="M50 70Q48 82 54 96" stroke="${ink}" stroke-width="2" fill="none"/><ellipse cx="50" cy="38" rx="26" ry="31" fill="${c}" stroke="${ink}" stroke-width="3"/><path d="M45 69L55 69L50 74Z" fill="${c}" stroke="${ink}" stroke-width="2"/><ellipse cx="40" cy="26" rx="5" ry="9" fill="#fff" opacity=".5"/>`),
 star:c=>svg(`<path d="M50 8L61 36L92 38L68 57L76 88L50 71L24 88L32 57L8 38L39 36Z" fill="${c}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`)
};
export const COLOR_ITEMS=Object.keys(items);

// ---------- Scene landmarks (wide viewBox 0 0 120 100) ----------
const W='0 0 120 100';
const landmarks={
 tree:()=>svg(`<rect x="52" y="52" width="16" height="44" rx="4" fill="#9a6b3f" stroke="${ink}" stroke-width="3"/><circle cx="60" cy="34" r="30" fill="#5bbf6a" stroke="${ink}" stroke-width="3"/><circle cx="38" cy="44" r="16" fill="#5bbf6a" stroke="${ink}" stroke-width="3"/><circle cx="82" cy="44" r="16" fill="#5bbf6a" stroke="${ink}" stroke-width="3"/><path d="M40 44Q60 58 80 44" fill="#5bbf6a"/>`,W),
 chair:()=>svg(`<rect x="38" y="8" width="44" height="44" rx="6" fill="#f2a65a" stroke="${ink}" stroke-width="3"/><rect x="32" y="52" width="56" height="10" rx="4" fill="#e0893a" stroke="${ink}" stroke-width="3"/><path d="M38 62V96M82 62V96" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`,W),
 table:()=>svg(`<rect x="8" y="40" width="104" height="12" rx="4" fill="#c98a4b" stroke="${ink}" stroke-width="3"/><path d="M20 52V96M100 52V96" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`,W),
 bed:()=>svg(`<rect x="10" y="46" width="100" height="26" rx="6" fill="#8fc3f2" stroke="${ink}" stroke-width="3"/><rect x="14" y="36" width="28" height="14" rx="6" fill="#fff" stroke="${ink}" stroke-width="3"/><rect x="6" y="24" width="10" height="66" rx="4" fill="#9a6b3f" stroke="${ink}" stroke-width="3"/><path d="M104 72V90M20 72V90" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`,W),
 box:()=>svg(`<rect x="24" y="40" width="72" height="54" rx="4" fill="#d9a066" stroke="${ink}" stroke-width="3"/><path d="M24 40L36 26H84L96 40" fill="#e9b97f" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M60 40V94" stroke="${ink}" stroke-width="2" opacity=".5"/>`,W),
 basket:()=>svg(`<path d="M34 44Q60 0 86 44" fill="none" stroke="#9a6b3f" stroke-width="6"/><path d="M20 44H100L90 92H30Z" fill="#d8a25e" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M26 60H94M28 76H92" stroke="${ink}" stroke-width="2" opacity=".5"/>`,W),
 house:()=>svg(`<rect x="22" y="44" width="76" height="52" fill="#f6d28b" stroke="${ink}" stroke-width="3"/><path d="M14 46L60 8L106 46Z" fill="#e5484d" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><rect x="50" y="64" width="20" height="32" rx="3" fill="#9a6b3f" stroke="${ink}" stroke-width="3"/><rect x="30" y="56" width="14" height="14" fill="#8fc3f2" stroke="${ink}" stroke-width="2.5"/><rect x="76" y="56" width="14" height="14" fill="#8fc3f2" stroke="${ink}" stroke-width="2.5"/>`,W),
 car:()=>svg(`<path d="M10 70V56Q10 50 18 48L32 30Q36 26 44 26H76Q84 26 88 32L100 48Q110 50 110 58V70Z" fill="#3e8ee8" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M38 46L46 34H74L84 46Z" fill="#cfe6fb" stroke="${ink}" stroke-width="2.5"/><circle cx="32" cy="74" r="11" fill="#33415c" stroke="${ink}" stroke-width="3"/><circle cx="88" cy="74" r="11" fill="#33415c" stroke="${ink}" stroke-width="3"/>`,W)
};
export const LANDMARKS=Object.keys(landmarks);

// ---------- Game icons (rounded tile, one style) ----------
const tile=(bg,body)=>svg(`<rect x="4" y="4" width="92" height="92" rx="24" fill="${bg}"/>${body}`);
const icons={
 'letter-hunt':()=>tile('#cfe8ff',`<text x="38" y="62" font-family="Andika,Nunito,sans-serif" font-size="44" font-weight="800" fill="${ink}" text-anchor="middle">A</text><text x="60" y="66" font-family="Andika,Nunito,sans-serif" font-size="28" font-weight="800" fill="#3e8ee8" text-anchor="middle">a</text><circle cx="62" cy="56" r="18" fill="none" stroke="${ink}" stroke-width="5"/><path d="M75 69L86 80" stroke="${ink}" stroke-width="7" stroke-linecap="round"/>`),
 'sound-safari':()=>tile('#d4f5e4',`<path d="M26 40H38L54 26V74L38 60H26Z" fill="#46a758" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M62 38Q70 50 62 62M70 30Q84 50 70 70" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>`),
 'feed-animal':()=>tile('#fff1c2',`<ellipse cx="44" cy="62" rx="20" ry="18" fill="#fff" stroke="${ink}" stroke-width="3"/><ellipse cx="36" cy="30" rx="6" ry="16" fill="#fff" stroke="${ink}" stroke-width="3"/><ellipse cx="52" cy="30" rx="6" ry="16" fill="#fff" stroke="${ink}" stroke-width="3"/><circle cx="38" cy="58" r="2.5" fill="${ink}"/><circle cx="50" cy="58" r="2.5" fill="${ink}"/><path d="M66 50L86 82L74 84Z" fill="#f78a1d" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M68 50Q66 40 72 36M70 50Q76 42 82 44" stroke="#46a758" stroke-width="4" fill="none" stroke-linecap="round"/>`),
 'number-adventure':()=>tile('#ffe0d6',`<rect x="18" y="28" width="30" height="44" rx="8" fill="#fff" stroke="${ink}" stroke-width="3"/><text x="33" y="61" font-family="Andika,Nunito,sans-serif" font-size="28" font-weight="800" fill="#e5484d" text-anchor="middle">3</text><circle cx="64" cy="38" r="8" fill="#f5c400" stroke="${ink}" stroke-width="3"/><circle cx="80" cy="56" r="8" fill="#f5c400" stroke="${ink}" stroke-width="3"/><circle cx="62" cy="68" r="8" fill="#f5c400" stroke="${ink}" stroke-width="3"/>`),
 'fox-apple':()=>tile('#ffe6c7',`<path d="M24 30L36 52H64L76 30L62 40H38Z" fill="#f78a1d" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M30 46Q50 86 70 46Z" fill="#f78a1d" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M40 62Q50 80 60 62Q50 68 40 62Z" fill="#fff"/><circle cx="42" cy="54" r="3" fill="${ink}"/><circle cx="58" cy="54" r="3" fill="${ink}"/><circle cx="50" cy="66" r="3" fill="${ink}"/><path d="M78 62C70 56 66 70 72 78Q77 82 78 80Q80 82 84 78C90 70 86 56 78 62Z" fill="#e5484d" stroke="${ink}" stroke-width="2.5"/>`),
 'word-builder':()=>tile('#e9e0ff',`${['c','a','t'].map((l,i)=>`<rect x="${14+i*25}" y="36" width="22" height="28" rx="5" fill="#fff" stroke="${ink}" stroke-width="3"/><text x="${25+i*25}" y="57" font-family="Andika,Nunito,sans-serif" font-size="20" font-weight="800" fill="${ink}" text-anchor="middle">${l}</text>`).join('')}`),
 'missing-letter':()=>tile('#cfe8ff',`<text x="50" y="62" font-family="Andika,Nunito,sans-serif" font-size="30" font-weight="800" fill="${ink}" text-anchor="middle">d _ g</text>`),
 'picture-word':()=>tile('#d4f5e4',`<rect x="16" y="24" width="34" height="34" rx="6" fill="#fff" stroke="${ink}" stroke-width="3"/><circle cx="33" cy="41" r="9" fill="#e5484d"/><path d="M56 41H84" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><path d="M56 64H76" stroke="${ink}" stroke-width="5" stroke-linecap="round" opacity=".5"/>`),
 'sentence-builder':()=>tile('#fff1c2',`<rect x="12" y="30" width="34" height="18" rx="5" fill="#fff" stroke="${ink}" stroke-width="3"/><rect x="50" y="30" width="38" height="18" rx="5" fill="#fff" stroke="${ink}" stroke-width="3"/><rect x="24" y="54" width="48" height="18" rx="5" fill="#fff" stroke="${ink}" stroke-width="3"/>`),
 'story-detective':()=>tile('#ffe0d6',`<path d="M18 26H48V76H18Z" fill="#fff" stroke="${ink}" stroke-width="3"/><path d="M48 26H78V76H48Z" fill="#fff" stroke="${ink}" stroke-width="3"/><circle cx="66" cy="58" r="14" fill="none" stroke="${ink}" stroke-width="5"/><path d="M76 68L86 78" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`),
 'fox':()=>svg(`<path d="M18 22L34 52H66L82 22L64 36H36Z" fill="#f78a1d" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M24 46Q50 100 76 46Z" fill="#f78a1d" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M36 66Q50 90 64 66Q50 74 36 66Z" fill="#fff"/><circle cx="38" cy="56" r="4" fill="${ink}"/><circle cx="62" cy="56" r="4" fill="${ink}"/><circle cx="50" cy="72" r="4" fill="${ink}"/>`)
};

const registry={
 ...Object.fromEntries(Object.entries(items).map(([k,f])=>[k,f])),
 ...Object.fromEntries(Object.entries(landmarks).map(([k,f])=>[k,f])),
 ...Object.fromEntries(Object.entries(icons).map(([k,f])=>['icon-'+k,f]))
};
export const ART_KEYS=Object.keys(registry);
// "apple-red" → coloured apple; "tree" → landmark; "icon-letter-hunt" → game icon.
export function artSvg(ref){
 const m=/^([a-z]+)-(red|green|yellow|blue|purple|pink|orange|white|brown)$/.exec(ref);
 if(m&&items[m[1]])return items[m[1]](COLORS[m[2]]);
 if(items[ref])return items[ref](COLORS.red);
 return registry[ref]?.()||null;
}
export function hasArt(ref){return artSvg(ref)!==null;}
