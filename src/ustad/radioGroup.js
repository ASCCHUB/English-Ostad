// Keyboard behaviour for role="radiogroup": arrow keys move to the next or previous choice and select it;
// only the checked radio is in the tab order (pass radioProps(checked) to each item).
export function radioKeys(event){
 const keys={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1};if(!(event.key in keys))return;
 const radios=[...event.currentTarget.querySelectorAll('[role="radio"]')],at=radios.indexOf(document.activeElement);if(at<0)return;
 event.preventDefault();const next=radios[(at+keys[event.key]+radios.length)%radios.length];next.focus();next.click();
}
export const radioProps=checked=>({role:'radio','aria-checked':checked,tabIndex:checked?0:-1});
