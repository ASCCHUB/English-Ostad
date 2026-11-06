import {completeActivity} from './engine.js';
import {foxCheckpoint} from './foxLessonModel.js';
export function saveFoxSession(profile,id,state){return {...profile,foxLessons:{...profile.foxLessons,[id]:foxCheckpoint(state)}};}
export function completeFoxSession(profile,id,state,now=new Date()){
 if(state.phase!=='completed'||!state.found)throw Error('Finish the fox lesson review first');
 const saved=saveFoxSession(profile,id,state);
 if(profile.completed.includes('fox-game-'+id))return saved;
 return completeActivity(saved,'fox-game-'+id,now);
}
