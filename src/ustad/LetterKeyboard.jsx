import {useState} from 'react';
import './keyboard.css';
export default function LetterKeyboard({value,onChange,disabled=false,sentence=false,className=''}){
 const [shift,setShift]=useState(false);
 const type=letter=>{onChange(value+(shift?letter.toUpperCase():letter));setShift(false);};
 const row=letters=>[...letters].map(letter=><button type="button" key={letter} disabled={disabled} onClick={()=>type(letter)}>{shift?letter.toUpperCase():letter}</button>);
 return <div className={'standard-keyboard '+className} role="group" aria-label="On-screen QWERTY keyboard" dir="ltr">
  <div className="keyboard-row keyboard-top">{row('qwertyuiop')}</div>
  <div className="keyboard-row keyboard-home">{row('asdfghjkl')}</div>
  <div className="keyboard-row keyboard-bottom"><button type="button" disabled={disabled} aria-label="Shift" aria-pressed={shift} className="keyboard-shift" onClick={()=>setShift(!shift)}>?</button>{row('zxcvbnm')}<button type="button" disabled={disabled} aria-label="Backspace" onClick={()=>onChange(value.slice(0,-1))}>?</button></div>
  {sentence&&<div className="keyboard-row keyboard-space"><button type="button" disabled={disabled} aria-label="Full stop" onClick={()=>onChange(value+'.')}>.</button><button type="button" className="keyboard-spacebar" disabled={disabled} onClick={()=>onChange(value+' ')}>Space</button><button type="button" disabled={disabled} aria-label="Question mark" onClick={()=>onChange(value+'?')}>?</button></div>}
 </div>;
}
