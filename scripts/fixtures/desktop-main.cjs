// Desktop test fixture: isolated profile and synthetic HTTP responses; excluded from the EXE.
const path=require('node:path');const root=path.resolve(__dirname,'../..');
const {app,net}=require('electron');app.setPath('userData',process.env.SYG_DESKTOP_PROFILE);app.getVersion=()=>require(path.join(root,'package.json')).version;
require('electron').dialog.showErrorBox=(title,text)=>console.error('STARTUP_ERROR',title,text);
if(!process.env.SYG_DESKTOP_PROFILE)throw Error('请运行 npm run test:desktop');
const futureVersion=require(path.join(root,'lib/version')).nextVersion(app.getVersion());
global.qa113={rate:false,translateRate:false,opened:[]};
require('electron').shell.openExternal=async url=>global.qa113.opened.push(url);
const repo=name=>({full_name:name,description:'Discover useful open source projects.',language:'JavaScript',stargazers_count:42,forks_count:3,html_url:'https://github.com/'+name,created_at:'2026-10-23T00:00:00Z'});
net.fetch=async(url,options)=>{
 if(url.includes('api.github.com')){
  if(global.qa113.rate)return new Response('{}',{status:429,headers:{'retry-after':String(global.qa113.rateAfter||120)}});
  if(url.includes('/releases?'))return Response.json([{tag_name:'v'+futureVersion,prerelease:true,html_url:'https://github.com/Johnyu21/search-your-gits/releases/tag/v'+futureVersion,assets:[{name:'Search-Your-Gits-Setup-'+futureVersion+'-x64.exe',state:'uploaded',size:90000000}]}]);
  if(url.includes('/rate_limit'))return Response.json({resources:{core:{limit:60,remaining:55,reset:Math.floor(Date.now()/1000)+3600}}});
  if(url.includes('/readme'))return Response.json({encoding:'base64',content:Buffer.from('# Search Your Gits\n\n## Usage\nExplore projects and read news.').toString('base64'),name:'README.md'});
  if(url.includes('/search/'))return Response.json({items:[repo('community/related'),repo('Johnyu21/search-your-gits')],total_count:2});
  return Response.json(repo('Johnyu21/search-your-gits'));
 }
 if(url.includes('artificialanalysis.ai/leaderboards/models'))return new Response('<table><thead><tr><th>Model</th><th>Context</th><th>Creator</th><th>Artificial Analysis Intelligence Index</th></tr></thead><tbody>'+[['测试模型Z',90],['测试模型B',80],['测试模型A',80],['测试模型C',70]].map(([name,score])=>'<tr><td>'+name+'</td><td>128k</td><td>测试厂商</td><td>'+score+'</td></tr>').join('')+'</tbody></table>');
 if(url.includes('openrouter.ai/api/v1/models'))return Response.json({data:[{id:'test/high',name:'输入高价模型',pricing:{prompt:'.000009',completion:'.000001'},architecture:{output_modalities:['text']}},{id:'test/low',name:'输入低价模型',pricing:{prompt:'.000001',completion:'.000009'},architecture:{output_modalities:['text']}},{id:'test/free',name:'免费模型',pricing:{prompt:'0',completion:'0'},architecture:{output_modalities:['text']}},{id:'test/unknown',name:'未公布价格模型',pricing:{prompt:'-1',completion:'-1'},architecture:{output_modalities:['text']}}]});
 if(url.includes('mymemory')){if(global.qa113.translateRate)return new Response('{}',{status:429,headers:{'retry-after':'120'}});return Response.json({responseStatus:200,responseData:{translatedText:'发现实用的开源项目。'}});}
 if(url.includes('github.com/trending'))return new Response('<article class="Box-row"><h2><a href="/Johnyu21/search-your-gits">Johnyu21 / search-your-gits</a></h2><p>Discover useful open source projects.</p><span itemprop="programmingLanguage">JavaScript</span><a class="Link--muted" href="/Johnyu21/search-your-gits/stargazers">42</a><span class="float-sm-right">12 stars this week</span></article>');
 return new Response('{}',{status:503});
};
require(path.join(root,'main.js'));
