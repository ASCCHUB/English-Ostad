import {Icon} from './ExplorerArt.jsx';
import {backgroundThemes} from './appearanceModel.js';
import {SoundSettings} from './SoundKit.jsx';
import {ariaText} from './supportCopy.js';
import {radioKeys,radioProps} from './radioGroup.js';
// Every visible line has a row in supportAppearance.js, so the support layer shows it in the chosen language.
export default function Appearance({settings,onChange,language}){
 const mode=settings.colorMode||'system',background=settings.backgroundTheme||'clouds';
 return <section className="appearance-page"><div className="adventure-heading"><p className="section-kicker">MAKE YOUR LITTLE WORLD YOURS</p><h1>A little change of scenery</h1><p>Choose a cosy background and the light that feels right for you.</p></div>
  <section className="appearance-section"><div className="appearance-section-title"><Icon name="moon"/><div><h2>Choose your light</h2><p>System follows your device’s light or dark setting.</p></div></div>
   <div className="mode-options" role="radiogroup" aria-label={ariaText('Colour mode',language)} onKeyDown={radioKeys}>{[['light','sun','Light','Bright and cheerful'],['dark','moon','Dark','A softer evening glow'],['system','settings','System','Follow my device']].map(([id,icon,title,detail])=><button key={id} {...radioProps(mode===id)} className={mode===id?'appearance-selected':''} onClick={()=>onChange({colorMode:id})}><Icon name={icon} size={27}/><strong>{title}</strong><small>{detail}</small>{mode===id&&<span className="appearance-check"><Icon name="check" size={15}/></span>}</button>)}</div>
  </section>
  <section className="appearance-section"><div className="appearance-section-title"><Icon name="leaf"/><div><h2>Your adventure background</h2><p>Every background works in light and dark mode.</p></div></div>
   <div className="background-options" role="radiogroup" aria-label={ariaText('Background theme',language)} onKeyDown={radioKeys}>{backgroundThemes.map(theme=><button key={theme.id} {...radioProps(background===theme.id)} className={background===theme.id?'appearance-selected':''} onClick={()=>onChange({backgroundTheme:theme.id})}><span className={`theme-swatch swatch-${theme.id}`} aria-hidden="true"><span>{theme.emoji}</span><i/><i/><i/></span><span className="theme-option-copy"><strong>{theme.title}</strong><small>{theme.detail}</small></span>{background===theme.id&&<span className="appearance-check"><Icon name="check" size={15}/></span>}</button>)}</div>
  </section>
  <SoundSettings settings={settings} onChange={onChange} language={language}/>
  <p className="appearance-saved" role="status"><Icon name="check" size={17}/> Your choices save automatically for this learner.</p>
 </section>;
}
