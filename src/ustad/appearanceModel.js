export const backgroundThemes=[
 {id:'clouds',title:'Cloud meadow',detail:'Soft skies and floating clouds',emoji:'☁️'},
 {id:'forest',title:'Forest trail',detail:'Fresh greens and little leaves',emoji:'🌿'},
 {id:'sunrise',title:'Peach sunrise',detail:'Warm peach and golden light',emoji:'🌅'},
 {id:'stars',title:'Starlight',detail:'A sprinkle of faraway stars',emoji:'✨'}
];
export function resolveColorMode(mode,darkSystem=false){return mode==='system'?(darkSystem?'dark':'light'):mode==='dark'?'dark':'light';}
