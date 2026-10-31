// Desktop test fixture: isolated profile and synthetic HTTP responses; excluded from the EXE.
const path=require('node:path');const root=path.resolve(__dirname,'../..');
const {app,net}=require('electron');app.setPath('userData',process.env.SYG_DESKTOP_PROFILE);app.getVersion=()=>require(path.join(root,'package.json')).version;
require('electron').dialog.showMessageBox=async(_window,options)=>{global.qa113.confirmations||=[];global.qa113.confirmations.push({message:options.message,buttons:options.buttons,defaultId:options.defaultId,cancelId:options.cancelId});return {response:global.qa113.unstarResponse??1};};
require('electron').dialog.showErrorBox=(title,text)=>console.error('STARTUP_ERROR',title,text);
if(!process.env.SYG_DESKTOP_PROFILE)throw Error('请运行 npm run test:desktop');
const futureVersion=require(path.join(root,'lib/version')).nextVersion(app.getVersion());
global.qa113={rate:false,translateRate:false,opened:[],githubAuthorized:false,githubStars:new Set(['qa-owner/public-project'])};
require('electron').shell.openExternal=async url=>global.qa113.opened.push(url);
const repo=name=>({full_name:name,description:'Discover useful open source projects.',language:'JavaScript',stargazers_count:42,forks_count:3,html_url:'https://github.com/'+name,created_at:'2026-10-23T00:00:00Z'});
net.fetch=async(url,options)=>{
 if(url.endsWith('/login/device/code'))return Response.json({device_code:'qa-private-device-code',user_code:'ABCD-EFGH',expires_in:600,interval:1});
 if(url.endsWith('/login/oauth/access_token'))return Response.json(global.qa113.githubAuthorized?{access_token:'qa-device-access-token',refresh_token:'qa-device-refresh-token',expires_in:28800,refresh_token_expires_in:15897600}:{error:'authorization_pending'});
 if(url.includes('api.github.com')){
  if(global.qa113.rate)return new Response('{}',{status:429,headers:{'retry-after':String(global.qa113.rateAfter||120)}});
  if(new URL(url).pathname==='/user')return Response.json({id:9001,login:'future-test',name:'测试用户',bio:'开源项目发现者',public_repos:2,followers:12,following:3});
  if(url.includes('/user/starred?')){const page=Number(new URL(url).searchParams.get('page')||1),all=[...global.qa113.githubStars];return Response.json(all.slice((page-1)*30,page*30).map(name=>({starred_at:'2026-10-31T00:00:00Z',repo:repo(name)})),{headers:all.length>page*30?{link:'<https://api.github.com/user/starred?page='+(page+1)+'>; rel="next"'}:{}});}
  if(url.includes('/user/repos?'))return Response.json([repo('future-test/owned-project'),{...repo('future-test/private-project'),private:true}]);
  if(url.includes('/user/starred/')){const name=new URL(url).pathname.slice('/user/starred/'.length);if(options.method==='PUT')global.qa113.githubStars.add(name);if(options.method==='DELETE')global.qa113.githubStars.delete(name);return new Response(null,{status:options.method==='GET'&&!global.qa113.githubStars.has(name)?404:204});}
  if(url.includes('/releases?'))return Response.json([{tag_name:'v'+futureVersion,prerelease:true,html_url:'https://github.com/Johnyu21/search-your-gits/releases/tag/v'+futureVersion,assets:[{name:'Search-Your-Gits-Setup-'+futureVersion+'-x64.exe',state:'uploaded',size:90000000}]}]);
  if(url.includes('/rate_limit'))return Response.json({resources:{core:{limit:60,remaining:55,reset:Math.floor(Date.now()/1000)+3600}}});
  if(url.includes('/readme'))return Response.json({encoding:'base64',content:Buffer.from('# Search Your Gits\n\n## Usage\nExplore projects and read news.').toString('base64'),name:'README.md'});
  if(url.includes('/search/')&&new URL(url).searchParams.get('q').startsWith('pushed:'))return Response.json({items:Array.from({length:Number(new URL(url).searchParams.get('per_page'))},(_,i)=>({...repo('discovery/project'+i),stargazers_count:10000-i,pushed_at:'2026-10-31T00:00:00Z'})),total_count:1200});
  if(url.includes('/search/')&&new URL(url).searchParams.get('q').startsWith('precision-demo'))return Response.json({items:[{...repo('small/precision-demo'),stargazers_count:2},{...repo('huge/precision-demo-extra'),stargazers_count:9000},{...repo('popular/precision-demo'),stargazers_count:800},{...repo('medium/precision-demo'),stargazers_count:100}],total_count:4});
  if(url.includes('/search/'))return Response.json({items:[repo('community/related'),repo('Johnyu21/search-your-gits')],total_count:2});
  return Response.json(repo('Johnyu21/search-your-gits'));
 }
 if(url.includes('artificialanalysis.ai/leaderboards/models'))return new Response('<table><thead><tr><th>Model</th><th>Context</th><th>Creator</th><th>Artificial Analysis Intelligence Index</th></tr></thead><tbody>'+[['测试模型Z',90],['测试模型B',80],['测试模型A',80],['测试模型C',70]].map(([name,score])=>'<tr><td>'+name+'</td><td>128k</td><td>测试厂商</td><td>'+score+'</td></tr>').join('')+'</tbody></table>');
 if(url.includes('openrouter.ai/api/v1/models'))return Response.json({data:[{id:'test/high',name:'输入高价模型',pricing:{prompt:'.000009',completion:'.000001'},architecture:{output_modalities:['text']}},{id:'test/low',name:'输入低价模型',pricing:{prompt:'.000001',completion:'.000009'},architecture:{output_modalities:['text']}},{id:'test/free',name:'免费模型',pricing:{prompt:'0',completion:'0'},architecture:{output_modalities:['text']}},{id:'test/unknown',name:'未公布价格模型',pricing:{prompt:'-1',completion:'-1'},architecture:{output_modalities:['text']}}]});
 if(url.includes('mymemory')){if(global.qa113.translateRate)return new Response('{}',{status:429,headers:{'retry-after':'120'}});return Response.json({responseStatus:200,responseData:{translatedText:'发现实用的开源项目。'}});}
 if(url.includes('github.com/trending'))return new Response([['Johnyu21/search-your-gits',42,12],['community/small',5,90],['community/middle',30,20]].map(([name,stars,growth])=>'<article class="Box-row"><h2><a href="/'+name+'">'+name+'</a></h2><p>Discover useful open source projects.</p><span itemprop="programmingLanguage">JavaScript</span><a class="Link--muted" href="/'+name+'/stargazers">'+stars+'</a><span class="float-sm-right">'+growth+' stars this week</span></article>').join(''));
 return new Response('{}',{status:503});
};
require(path.join(root,'lib/github-config.json')).clientId='';
require(path.join(root,'lib/github-config.json')).oauthClientId='';
require(path.join(root,'main.js'));
