import * as T from 'three';
export function makeFox(){
 const root=new T.Group(),body=new T.Group();root.add(body);
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.72});
 const orange=mat('#dc782f'),cream=mat('#fff1d4'),dark=mat('#322927'),blue=mat('#247ec0');
 function oval(parent,m,x,y,z,a,b,c){const mesh=new T.Mesh(new T.SphereGeometry(1,24,16),m);mesh.position.set(x,y,z);mesh.scale.set(a,b,c);mesh.castShadow=true;parent.add(mesh);return mesh;}
 oval(body,orange,0,1.05,0,.48,.58,.36);oval(body,cream,0,1.1,.29,.31,.4,.13);
 oval(body,blue,0,1.14,-.35,.43,.46,.21);for(const x of [-.33,.33])oval(body,blue,x,1.18,.15,.065,.4,.065);
 const head=new T.Group();head.position.y=1.77;body.add(head);oval(head,orange,0,0,0,.51,.44,.37);
 for(const x of [-.33,.33]){const ear=new T.Mesh(new T.ConeGeometry(.19,.5,3),orange);ear.position.set(x,.41,0);ear.rotation.z=-x*.45;head.add(ear);oval(head,cream,x,.4,.09,.085,.15,.035);}
 oval(head,cream,-.2,-.16,.29,.29,.2,.23);oval(head,cream,.2,-.16,.29,.29,.2,.23);oval(head,dark,0,-.12,.51,.105,.07,.07);
 const smile=new T.CatmullRomCurve3([new T.Vector3(-.13,-.23,.48),new T.Vector3(0,-.27,.51),new T.Vector3(.13,-.23,.48)]);head.add(new T.Mesh(new T.TubeGeometry(smile,16,.012,6,false),dark));
 const eyes=[];for(const x of [-.21,.21]){const eye=oval(head,dark,x,.045,.34,.062,.093,.043);eyes.push(eye);oval(head,cream,x-.016,.077,.378,.017,.023,.012);}
 const legs=[];for(const x of [-.27,.27]){const leg=new T.Group();leg.position.set(x,.69,0);body.add(leg);oval(leg,orange,0,-.22,0,.14,.29,.15);oval(leg,dark,0,-.48,.08,.15,.1,.21);legs.push(leg);}
 const arms=[];for(const x of [-.48,.48]){const arm=new T.Group();arm.position.set(x,1.35,0);body.add(arm);oval(arm,orange,0,-.21,.02,.13,.31,.14);oval(arm,dark,0,-.46,.04,.12,.1,.13);arms.push(arm);}
 const tail=new T.Group();tail.position.set(.24,.66,-.25);body.add(tail);oval(tail,orange,.35,.09,-.25,.46,.22,.23);oval(tail,cream,.68,.13,-.37,.21,.19,.2);
 return {root,body,head,eyes,legs,arms,tail};
}
function prop(kind,colour){const g=new T.Group(),m=new T.MeshStandardMaterial({color:colour,roughness:.45});
 const sphere=(x,y,z,sx,sy,sz,material=m)=>{const o=new T.Mesh(new T.SphereGeometry(1,20,14),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;g.add(o);return o;};
 if(['apple','one','two','three'].includes(kind)){const n={two:2,three:3}[kind]||1;for(let i=0;i<n;i++){const x=(i-(n-1)/2)*.32,s=n===1?1:.65;sphere(x,.27,0,.25*s,.27*s,.25*s);const stem=new T.Mesh(new T.CylinderGeometry(.018,.025,.15),new T.MeshStandardMaterial({color:'#6c4833'}));stem.position.set(x,.27+.27*s,0);g.add(stem);sphere(x+.07,.36+.27*s,0,.12*s,.035,.06,new T.MeshStandardMaterial({color:'#55863c'}));}}
 else if(kind==='book'){const book=new T.Mesh(new T.BoxGeometry(.59,.13,.43),m);book.position.y=.15;book.rotation.z=.13;g.add(book);const pages=new T.Mesh(new T.BoxGeometry(.54,.06,.39),new T.MeshStandardMaterial({color:'#fff7dd'}));pages.position.y=.15;g.add(pages);}
 else if(kind==='rabbit'){sphere(0,.2,0,.23,.23,.19);sphere(0,.44,0,.17,.17,.16);for(const x of [-.09,.09])sphere(x,.68,0,.055,.19,.05);}
 else if(kind==='turtle'){sphere(0,.19,0,.32,.19,.24);sphere(.31,.15,.04,.12,.11,.1);}
 else if(kind==='fox'){const f=makeFox();f.root.scale.setScalar(.3);g.add(f.root);}
 else {sphere(0,.28,0,.28,.28,.28);const band=new T.Mesh(new T.TorusGeometry(.28,.014,8,40),new T.MeshStandardMaterial({color:'#fff2c9'}));band.position.y=.28;g.add(band);}
 return g;}
export function mountFoxScene(host,lesson,getSnapshot,onPick,onFallback){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.append(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#dceddf');scene.fog=new T.Fog('#dceddf',12,25);
 const camera=new T.PerspectiveCamera(39,1,.1,40);camera.position.set(0,4.4,8.5);camera.lookAt(0,.9,0);
 scene.add(new T.HemisphereLight('#fff6dd','#67846d',2.5));const sun=new T.DirectionalLight('#fff2cf',3);sun.position.set(-3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
 const ground=new T.Mesh(new T.CircleGeometry(12,64),new T.MeshStandardMaterial({color:'#a9c78b',roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 for(let i=0;i<9;i++){const bush=new T.Mesh(new T.SphereGeometry(.5,18,12),new T.MeshStandardMaterial({color:i%2?'#81a879':'#94b57b'}));bush.position.set((i-4)*1.3,.2,-2.6);scene.add(bush);}
 const fox=makeFox();fox.root.position.set(-1.9,0,-.2);scene.add(fox.root);
 const props=lesson.objects.map((o,i)=>{const group=prop(o.kind,o.colour);group.position.set((i-1)*1.65,0,1.35);group.userData.choice=o.id;scene.add(group);const ring=new T.Mesh(new T.TorusGeometry(.49,.045,10,48),new T.MeshBasicMaterial({color:'#ffcf53'}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;group.add(ring);return {group,ring,id:o.id,start:group.position.clone()};});
 const ray=new T.Raycaster(),pointer=new T.Vector2();const pick=e=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(props.map(p=>p.group),true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.choice)o=o.parent;if(o)onPick(o.userData.choice);}};
 renderer.domElement.addEventListener('pointerdown',pick);const lost=e=>{e.preventDefault();onFallback('The 3D view was interrupted. Your lesson is safe in 2D.');};renderer.domElement.addEventListener('webglcontextlost',lost);
 const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.render(scene,camera);};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 let time=0,previous=performance.now(),phase='',phaseTime=0,slow=0,frames=0,measure=0;
 renderer.setAnimationLoop(now=>{const dt=Math.min((now-previous)/1000,.1);previous=now;const s=getSnapshot();if(s.paused||document.hidden)return;if(phase!==s.phase){phase=s.phase;phaseTime=0;}phaseTime+=dt;if(!s.reduced)time+=dt;
 const motion=s.reduced?0:1,walking=phase==='introducing'&&phaseTime<2||phase==='celebrating'&&phaseTime<1.7;
 let x=-1.9;if(phase==='introducing')x=-3.8+Math.min(phaseTime/2,1)*1.9;if(phase==='celebrating'||phase==='review'||phase==='completed'){const target=props.find(p=>p.id===lesson.target);x=-1.9+(target.start.x+1.9)*Math.min(phaseTime/1.7,1);if(phase!=='celebrating')x=target.start.x;}
 fox.root.position.x=s.reduced?-1.9:x;fox.body.position.y=Math.sin(time*2.2)*.018*motion;fox.head.rotation.z=Math.sin(time*1.1)*.035*motion+(phase==='encouraging'?.12:0);fox.tail.rotation.y=Math.sin(time*(phase==='celebrating'?7:2))*.22*motion;
 const blink=time%4.7;for(const eye of fox.eyes)eye.scale.y=.093*(blink>4.48?Math.max(.04,Math.abs(blink-4.59)/.11):1);
 fox.legs.forEach((l,i)=>l.rotation.x=walking?Math.sin(time*9+i*Math.PI)*.42*motion:0);fox.arms.forEach((a,i)=>a.rotation.x=phase==='celebrating'||phase==='review'?-.7:walking?Math.sin(time*9+i*Math.PI)*.25*motion:0);
 for(const p of props){p.ring.visible=s.highlight&&p.id===lesson.target;p.group.position.copy(p.start);if(s.found&&p.id===lesson.target){const k=s.reduced?1:phase==='celebrating'?Math.max(0,Math.min((phaseTime-1.7)/.9,1)):1;p.group.position.lerp(new T.Vector3(fox.root.position.x,.95,.45),k);}}
 renderer.render(scene,camera);if(!s.reduced&&phase==='waiting'){measure+=dt;frames++;if(measure>4){if(frames/measure<22)slow++;else slow=0;measure=0;frames=0;if(slow>=2)onFallback('Using the lighter 2D garden for smoother play.');}}else{measure=0;frames=0;}
 });
 return ()=>{observer.disconnect();renderer.setAnimationLoop(null);renderer.domElement.removeEventListener('pointerdown',pick);renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of [].concat(o.material))m.dispose();});renderer.dispose();renderer.domElement.remove();};
}
