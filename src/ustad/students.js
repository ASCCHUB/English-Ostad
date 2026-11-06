import {freshProfile} from './engine.js';
import {outlineLessons} from './firstSteps/state.js';
export const MAX_STUDENTS=20;
export function addStudent(saved,name){
 const clean=String(name||'').trim().slice(0,40);
 if(!clean||saved.profiles.length>=MAX_STUDENTS)return saved;
 return {...saved,profiles:[...saved.profiles,freshProfile(clean)],active:saved.profiles.length};
}
export function selectStudent(saved,id){const active=saved.profiles.findIndex(p=>p.id===id);return active<0?saved:{...saved,active};}
export function studentStandings(profiles){
 const ids=new Set(outlineLessons.map(l=>l.id));
 const rows=profiles.map(p=>({id:p.id,name:p.name,stars:Object.keys(p.firstSteps?.mastered||{}).filter(id=>ids.has(id)).length})).sort((a,b)=>b.stars-a.stars||a.name.localeCompare(b.name));
 return rows.map(p=>({...p,rank:rows.findIndex(x=>x.stars===p.stars)+1}));
}
