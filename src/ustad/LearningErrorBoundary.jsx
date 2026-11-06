import React from 'react';
export class LearningErrorBoundary extends React.Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<main className="activity"><h1>Let’s take a little pause.</h1><p>The lesson could not open. Reload the app to try again. Saved progress stays on this device.</p><button className="primary" onClick={()=>window.location.reload()}>Reload Learn & Play</button></main>:this.props.children;}
}
