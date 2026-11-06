export const CLASS_COUNT=10;
export const defaultAdventure={classIndex:0,avatar:'fox',reducedMotion:false,captions:true,audio:true,pashtoAudio:true,effects:true,music:false,muted:false,autoInstructions:false,autoNext:true,voiceName:'',voiceSpeed:'normal',sessionLength:15,recording:false,events:{},placement:null,colorMode:'system',backgroundTheme:'clouds',unlockAll:false,pathResume:null};
export function validateAdventure(input){
 if(input===undefined)return {...defaultAdventure,events:{}};
 const fail=()=>{throw Error('Invalid adventure settings');};
 if(!input||typeof input!=='object'||Array.isArray(input))fail();
 const settings={...defaultAdventure,...input};
 if(!['system','light','dark'].includes(settings.colorMode)||!['clouds','forest','sunrise','stars'].includes(settings.backgroundTheme))fail();
 if(!Number.isInteger(settings.classIndex)||settings.classIndex<0||settings.classIndex>=CLASS_COUNT||!['fox','bunny','turtle'].includes(settings.avatar)||!['reducedMotion','captions','audio','pashtoAudio','effects','music','muted','autoInstructions','autoNext','recording','unlockAll'].every(k=>typeof settings[k]==='boolean')||typeof settings.voiceName!=='string'||settings.voiceName.length>200||!['normal','slow'].includes(settings.voiceSpeed)||![5,10,15,20,0].includes(settings.sessionLength))fail();
 if(settings.placement!==null&&(!Number.isInteger(settings.placement)||settings.placement<0||settings.placement>=CLASS_COUNT))fail();
 if(settings.pathResume!==null&&(!settings.pathResume||typeof settings.pathResume!=='object'||!/^[-a-z0-9]{1,60}$/.test(settings.pathResume.lesson)||!Number.isInteger(settings.pathResume.step)||settings.pathResume.step<0||settings.pathResume.step>20))fail();
 if(!settings.events||typeof settings.events!=='object'||Array.isArray(settings.events)||Object.keys(settings.events).length>1000)fail();
 const events={};
 for(const [id,event] of Object.entries(settings.events)){
  if(!/^[-a-z0-9]+$/.test(id)||id.length>100||!event||!['watched','demonstrated'].includes(event.kind)||!Number.isInteger(event.attempts)||event.attempts<0||event.attempts>100000||typeof event.needsReview!=='boolean'||typeof event.date!=='string'||!Number.isFinite(Date.parse(event.date)))fail();
  events[id]={kind:event.kind,attempts:event.attempts,needsReview:event.needsReview,date:event.date};
 }
 return Object.fromEntries(Object.keys(defaultAdventure).map(k=>[k,k==='events'?events:k==='pathResume'&&settings.pathResume?{lesson:settings.pathResume.lesson,step:settings.pathResume.step}:settings[k]]));
}
