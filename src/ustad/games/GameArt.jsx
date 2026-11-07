import {useState} from 'react';
import {wordPhoto} from '../wordPhotos.js';
import {artSvg,sceneMarkup} from './art.js';

// A picture reference from a bank: "photo:apple" (photo library or drawing) or "art:apple-red" (games art).
export function Pic({src,size,className=''}){
 const [broken,setBroken]=useState(false);
 if(typeof src!=='string')return null;
 const cls=`gm-pic ${size?'gm-size-'+size:''} ${className}`;
 if(src.startsWith('art:')){const markup=artSvg(src.slice(4));return markup?<span className={cls+' gm-art'} aria-hidden="true" dangerouslySetInnerHTML={{__html:markup}}/>:null;}
 const record=wordPhoto(src.slice(6));
 if(!record||broken)return <span className={cls+' gm-pic-missing'} aria-hidden="true"/>;
 return <span className={cls} aria-hidden="true"><img src={record.src} alt="" loading="lazy" decoding="async" draggable="false" onError={()=>setBroken(true)}/></span>;
}
// A counted group: the same picture n times, laid out in tidy rows so each one can be touched and counted.
export function Group({picture,count,small}){
 const cols=count<=3?count:count<=4?2:count<=6?3:count<=8?4:5;
 return <span className={`gm-group ${small?'gm-group-small':''}`} style={{'--cols':cols}} aria-hidden="true">{Array.from({length:count},(_,i)=><Pic key={i} src={picture}/>)}</span>;
}

export function Scene({scene,big}){
 const markup=sceneMarkup(scene);
 return <span className={`gm-scene ${big?'gm-scene-big':''}`} aria-hidden="true" dangerouslySetInnerHTML={{__html:markup}}/>;
}
