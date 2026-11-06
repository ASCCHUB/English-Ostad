import test from 'node:test';
import assert from 'node:assert/strict';
import {APP_SHARE_TITLE,publicDownloadUrl,shareMessage,shareLinks} from './appSharing.js';
test('App sharing accepts public HTTPS links and rejects local or credential-bearing addresses',()=>{
 assert.equal(publicDownloadUrl(' https://example.org/app.apk#install '),'https://example.org/app.apk');
 for(const url of ['','not a URL','http://example.org/app','file:///app.apk','javascript:alert(1)','https://localhost:5173/','https://127.0.0.1/','https://192.168.1.2/','https://10.0.0.5/','https://172.16.1.1/','https://phone.local/','https://[::1]/','https://user:secret@example.org/app'])assert.equal(publicDownloadUrl(url),'',url);
 assert.throws(()=>shareMessage('http://localhost:5173'));
});
test('WhatsApp and email drafts contain the app description and exactly the entered public download link',()=>{
 const url='https://example.org/download?edition=android&language=ps',message=shareMessage(url),links=shareLinks(url);
 assert.equal(new URL(links.whatsapp).origin,'https://wa.me');
 assert.equal(new URL(links.whatsapp).searchParams.get('text'),message);
 assert.equal(new URL(links.email).protocol,'mailto:');
 assert.equal(new URL(links.email).searchParams.get('subject'),APP_SHARE_TITLE);
 assert.equal(new URL(links.email).searchParams.get('body'),message);
 assert.ok(message.includes(url));
 assert.ok(!links.email.includes('to@example'));
});
test('No learner names, answers, progress, or recipients are part of an app-share payload',()=>{
 const message=shareMessage('https://example.org/app');
 assert.ok(message.startsWith(APP_SHARE_TITLE));
 for(const privateField of ['learnerId','firstSteps','startingAssessment','completed','answers','minutes'])assert.ok(!message.includes(privateField));
});
