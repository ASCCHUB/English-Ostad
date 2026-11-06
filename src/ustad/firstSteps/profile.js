import {completeActivity} from '../engine.js';
import {validateCourse} from './state.js';
export function mergeCourseProfile(profile,progress){const clean=validateCourse(progress);let next={...profile,firstSteps:clean};for(const id of Object.keys(clean.mastered))if(!profile.firstSteps?.mastered[id])next=completeActivity(next,'first-steps-'+id);return next;}
