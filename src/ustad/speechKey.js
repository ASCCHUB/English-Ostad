// The key that matches a spoken English line to its pre-recorded clip. Case, curly quotes, spacing and
// end punctuation do not matter, so "Find the cat." and "find the cat" share one recording.
export function speechKey(text){
 return String(text||'').toLowerCase().replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
}
