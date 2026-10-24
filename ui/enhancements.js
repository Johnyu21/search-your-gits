const descriptionCache=new Map(),requestWaits=new WeakMap();
let descriptionObserver,descriptionBusy=false,descriptionRetryAt=0,descriptionRetryTimer,descriptionRun=0;
function descriptionText(r){return state.settings.descriptionLanguage==='chinese'?(descriptionCache.get(r.description)||clean(r.description)||'暂无项目介绍'):(clean(r.description)||'暂无项目介绍');}
function hydrateEnhancements(){
 $$('[data-description-language]').forEach(button=>{const selected=button.dataset.descriptionLanguage===(state.settings.descriptionLanguage||'original');button.setAttribute('aria-pressed',String(selected));});
 const c=state.translation||{};$('#translationProvider').value=c.provider||'mymemory';$('#translationEndpoint').value=c.endpoint||'';$('#translationModel').value=c.model||'';$('#translationEmail').value=c.email||'';$('#translationConfigStatus').textContent=c.hasKey?'当前服务的密钥已加密保存，留空即可保留。':'未保存翻译密钥。';
 $('#autoUpdateCheck').checked=state.settings.autoUpdateCheck!==false;$('#updatePreview').checked=state.settings.updatePreview!==false;translationFields();
}
function translationFields(){const p=$('#translationProvider').value;$('#translationEndpointLabel').hidden=p==='mymemory';$('#translationModelLabel').hidden=p!=='openai';$('#translationKeyLabel').hidden=p==='mymemory';$('#translationEmailLabel').hidden=p!=='mymemory';$('#translationEndpoint').disabled=p==='mymemory';$('#translationModel').disabled=p!=='openai';$('#translationKey').disabled=p==='mymemory';$('#translationEmail').disabled=p!=='mymemory';}
function showRequestIssue(issue,selector,retry,valid=()=>true){
 const host=$(selector);if(!host)return;const previous=requestWaits.get(host);if(previous)clearInterval(previous);
 const github=issue.code==='GITHUB_RATE_LIMIT'||issue.code==='GITHUB_TOKEN_INVALID'||/GitHub.*(?:受限|Token 无效)/.test(issue.message||issue.warning||'');
 if(github){const controls=document.createElement('span');controls.className='request-actions';for(const [label,action]of [['获取 GitHub Token',()=>api.open('https://github.com/settings/personal-access-tokens/new?name=Search%20Your%20Gits&expires_in=90')],['填写 Token',async()=>{$('#detail').close();await navigate('settings');await showSetting('general');$('#tokenGuide').open=true;$('#token').scrollIntoView({block:'center'});$('#token').focus();}]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>Promise.resolve(action()).catch(e=>toast(e.message));controls.append(b);}host.append(controls);}
 if(!issue.retryAt||issue.retryAt<=Date.now())return;
 const wait=document.createElement('span');wait.className='retry-countdown';host.append(wait);let active=true;
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='取消自动重试';cancel.onclick=()=>{active=false;clearInterval(timer);wait.textContent='已取消自动重试，可稍后手动刷新。';cancel.remove();};host.append(cancel);
 const tick=()=>{if(!valid()||!host.isConnected||!host.contains(wait)){clearInterval(timer);return;}const seconds=Math.max(0,Math.ceil((issue.retryAt-Date.now())/1000));wait.textContent='等待 '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' 后自动重试（保持当前页面）';if(!seconds&&active){clearInterval(timer);cancel.remove();Promise.resolve(retry()).catch(e=>toast(e.message));}};
 const timer=setInterval(tick,1000);requestWaits.set(host,timer);tick();
}
function scheduleDescriptions(){
 descriptionObserver?.disconnect();descriptionRun++;if(state.settings.descriptionLanguage!=='chinese'){$('#descriptionStatus').textContent='';return;}
 const run=descriptionRun;descriptionObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.dataset.visible='true';}pumpDescriptions(run);},{rootMargin:'80px'});
 $$('[data-description]').forEach(el=>descriptionObserver.observe(el));
}
async function pumpDescriptions(run){
 if(descriptionBusy||run!==descriptionRun||state.settings.descriptionLanguage!=='chinese'||descriptionRetryAt>Date.now())return;
 const nodes=$$('[data-description][data-visible="true"]');const node=nodes.find(el=>{const r=rows[Number(el.dataset.description)];return r?.description&&!descriptionCache.has(r.description)&&!el.dataset.translationFailed;});
 if(!node){$('#descriptionStatus').textContent='中文优先显示 · 未获取译文时保留原文';return;}
 const row=rows[Number(node.dataset.description)],text=row.description;descriptionBusy=true;$('#descriptionStatus').textContent='正在翻译可见项目简介…';
 try{const r=await api.translate(text);descriptionCache.set(text,r.text);if(run===descriptionRun&&state.settings.descriptionLanguage==='chinese'&&node.isConnected){node.textContent=r.text;node.title='原文：'+text;}$('#descriptionStatus').textContent='译文已缓存，切换原文可查看作者描述。';}
 catch(e){node.dataset.translationFailed='true';$('#descriptionStatus').textContent=e.message;descriptionRetryAt=e.retryAt||0;if(descriptionRetryAt>Date.now()){clearTimeout(descriptionRetryTimer);descriptionRetryTimer=setTimeout(()=>{descriptionRetryAt=0;$$('[data-description]').forEach(n=>delete n.dataset.translationFailed);pumpDescriptions(descriptionRun);},Math.min(2147483647,descriptionRetryAt-Date.now()+1000));}}
 finally{descriptionBusy=false;if(!descriptionRetryAt||descriptionRetryAt<=Date.now())setTimeout(()=>pumpDescriptions(descriptionRun),200);}
}
$$('[data-description-language]').forEach(button=>button.onclick=async()=>{const buttons=$$('[data-description-language]');buttons.forEach(b=>b.disabled=true);try{setState(await api.descriptionLanguage(button.dataset.descriptionLanguage));render();}catch(e){toast(e.message);}finally{buttons.forEach(b=>b.disabled=false);}});
new MutationObserver(()=>{$('.description-toggle').title=$('#descriptionStatus').textContent||'切换简介语言；未获取译文时保留原文';}).observe($('#descriptionStatus'),{childList:true,characterData:true,subtree:true});
$('#translationProvider').onchange=translationFields;
$('#translationForm').onsubmit=async e=>{e.preventDefault();try{setState(await api.translationSettings({provider:$('#translationProvider').value,endpoint:$('#translationProvider').value==='mymemory'?'':$('#translationEndpoint').value,key:$('#translationProvider').value==='mymemory'?'':$('#translationKey').value,model:$('#translationProvider').value==='openai'?$('#translationModel').value:'',email:$('#translationProvider').value==='mymemory'?$('#translationEmail').value:'',clearKey:$('#clearTranslationKey').checked}));$('#translationKey').value='';$('#clearTranslationKey').checked=false;descriptionCache.clear();descriptionRetryAt=0;clearTimeout(descriptionRetryTimer);toast('翻译设置已保存。');}catch(err){$('#translationConfigStatus').textContent=err.message;}};
$('#testTranslation').onclick=async()=>{const b=$('#testTranslation');b.disabled=true;$('#translationConfigStatus').textContent='正在测试已保存的翻译服务…';try{const r=await api.translate('Discover useful open source projects.');$('#translationConfigStatus').textContent=r.source+'：'+r.text+(r.cached?'（缓存）':'');}catch(e){$('#translationConfigStatus').textContent=e.message;showRequestIssue(e,'#translationConfigStatus',()=>b.click());}finally{b.disabled=false;}};
$('#getGithubToken').onclick=()=>api.open('https://github.com/settings/personal-access-tokens/new?name=Search%20Your%20Gits&expires_in=90').catch(e=>toast(e.message));
$('#testGithubToken').onclick=async()=>{const b=$('#testGithubToken');b.disabled=true;try{const r=await api.tokenTest();$('#tokenState').textContent=(r.hasToken?'Token 已配置':'匿名访问')+' · 常规 API 剩余 '+number(r.remaining)+' / '+number(r.limit)+(r.reset?' · 恢复时间 '+date(r.reset*1000):'');}catch(e){$('#tokenState').textContent=e.message;showRequestIssue(e,'#tokenState',()=>b.click());}finally{b.disabled=false;}};
let availableUpdate=null,updateChecking=false;
function paintUpdateIndicator(message=''){const b=$('#sidebarUpdate');b.disabled=updateChecking;b.dataset.available=String(!!availableUpdate);$('#sidebarUpdateText').textContent=availableUpdate?'发现新版本':updateChecking?'检查中…':'检查更新';$('#sidebarUpdateDot').hidden=!availableUpdate;b.title=availableUpdate?'发现 '+availableUpdate.version+'，点击前往下载更新':message||'检查软件更新';}
let updateURL='https://github.com/Johnyu21/search-your-gits/releases';
async function checkClientUpdates(force=false){
 if(updateChecking)return;updateChecking=true;paintUpdateIndicator();const b=$('#checkUpdates');b.disabled=true;$('#updateStatus').textContent='正在检查 GitHub 发布版本…';try{const r=await api.updateCheck(force);if(r.available){availableUpdate=r.available;updateURL=r.available.url;$('#updateStatus').textContent='发现 '+r.available.version+(r.available.preview?' 预览版':'')+' · 当前 '+state.appVersion+(r.source==='stale'?' · 上次检查结果':'');$('#updateBannerText').textContent='Search Your Gits '+r.available.version+' 已发布，当前版本 '+state.appVersion+'。';$('#updateBanner').hidden=false;}else{availableUpdate=null;$('#updateStatus').textContent='本次检查未发现更高版本 · '+date(r.checkedAt)+(r.warning?' · '+r.warning:'');$('#updateBanner').hidden=true;}}catch(e){$('#updateStatus').textContent=e.message;showRequestIssue(e,'#updateStatus',()=>checkClientUpdates(true));}finally{updateChecking=false;b.disabled=false;paintUpdateIndicator($('#updateStatus').textContent);}
}
$('#sidebarUpdate').onclick=()=>{if(availableUpdate)api.open(updateURL).catch(e=>toast(e.message));else checkClientUpdates(true).then(()=>toast($('#updateStatus').textContent));};
$('#checkUpdates').onclick=()=>checkClientUpdates(true);$('#openReleases').onclick=()=>api.open(updateURL).catch(e=>toast(e.message));$('#updateBannerOpen').onclick=()=>api.open(updateURL).catch(e=>toast(e.message));$('#updateBannerDismiss').onclick=()=>$('#updateBanner').hidden=true;
for(const id of ['autoUpdateCheck','updatePreview'])$('#'+id).onchange=async()=>{try{setState(await api.updateSettings({autoUpdateCheck:$('#autoUpdateCheck').checked,updatePreview:$('#updatePreview').checked}));}catch(e){toast(e.message);}};
setTimeout(()=>{if(state.settings.autoUpdateCheck!==false)checkClientUpdates();},5000);
setInterval(()=>{if(state.settings.autoUpdateCheck!==false)checkClientUpdates();},6*3600000);

// The narrow layout scrolls its header. Keep the update control in the viewport.
const updateRow=document.querySelector('.version-update-row'),updateHome=updateRow.parentElement,updateLayout=matchMedia('(max-width:1100px)');
function placeUpdateIndicator(){if(updateLayout.matches)document.body.append(updateRow);else updateHome.append(updateRow);}
updateLayout.addEventListener('change',placeUpdateIndicator);placeUpdateIndicator();
