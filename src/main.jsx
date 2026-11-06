// First: gives the Android app a speaking voice (see nativeSpeech.js).
import './nativeSpeech.js';
import {Capacitor} from '@capacitor/core';
// Bundled fonts (work offline and in the phone app): Nunito for buttons and menus, Andika for English
// letters and words (made for early readers: simple a and g, like the tracing letters).
import '@fontsource/nunito/latin-400.css';import '@fontsource/nunito/latin-500.css';import '@fontsource/nunito/latin-600.css';import '@fontsource/nunito/latin-700.css';import '@fontsource/nunito/latin-800.css';import '@fontsource/nunito/latin-900.css';
import '@fontsource/andika/latin-400.css';import '@fontsource/andika/latin-700.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './ustad/App.jsx';
import {LearningErrorBoundary} from './ustad/LearningErrorBoundary.jsx';
import './ustad/explorers.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><LearningErrorBoundary><App/></LearningErrorBoundary></React.StrictMode>);
// Native Android and iOS apps have every file built in, so it needs no offline cache (and a cache could keep old files after an update).
if('serviceWorker' in navigator && import.meta.env.PROD && !Capacitor.isNativePlatform()) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));

import './ustad/study.css';
import './ustad/theme.css';
import './ustad/adventure.css';
import './ustad/appearance.css';
import './ustad/adult.css';
import './ustad/brand.css';
import './ustad/lightWallpaper.css';
