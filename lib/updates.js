const cheerio=require('cheerio');
const REPOSITORY='Johnyu21/search-your-gits',RELEASES='https://github.com/'+REPOSITORY+'/releases';
function versionParts(v){const m=String(v).match(/^v?(\d+)\.(\d+)\.(\d+)$/);return m?m.slice(1).map(Number):null;}
function newer(a,b){const x=versionParts(a),y=versionParts(b);if(!x||!y)return false;for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]>y[i];return false;}
function releaseLink(value){try{const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='github.com'||u.username||u.password||!u.pathname.startsWith('/'+REPOSITORY+'/releases/tag/'))return null;return u.href;}catch{return null;}}
function chooseRelease(releases,current,preview=true){return releases.filter(r=>!r.draft&&(preview||!r.prerelease)&&versionParts(r.tag_name)&&newer(r.tag_name,current)&&releaseLink(r.html_url)&&r.assets?.some(a=>a.state==='uploaded'&&a.size>0&&/^Search-Your-Gits-Setup-.*-x64\.exe$/.test(a.name))).sort((a,b)=>newer(a.tag_name,b.tag_name)?-1:1).map(r=>({version:r.tag_name.replace(/^v/,''),url:releaseLink(r.html_url),preview:!!r.prerelease,notes:String(r.body||'').slice(0,8000),published:r.published_at}))[0]||null;}
class Updates{
 constructor(db,get,save,current){this.db=db;this.get=get;this.save=save;this.current=current;}
 async check(force=false){const cached=this.db.updateCache,preview=this.db.settings?.updatePreview!==false;if(!force&&cached&&cached.preview===preview&&Date.now()-Date.parse(cached.checkedAt)<6*3600000)return {...cached,available:cached.release&&newer(cached.release.version,this.current)?cached.release:null,source:'cache'};
  try{const releases=await this.get('https://api.github.com/repos/'+REPOSITORY+'/releases?per_page=30',true);if(!Array.isArray(releases))throw Error('更新服务响应异常');const result={release:chooseRelease(releases,this.current,preview),checkedAt:new Date().toISOString(),preview,source:'network'};this.db.updateCache=result;await this.save();return {...result,available:result.release};}
  catch(e){if(cached)return {...cached,available:cached.release&&newer(cached.release.version,this.current)&&(preview||!cached.release.preview)?cached.release:null,source:'stale',warning:'暂时无法检查更新，显示上次检查结果。',retryAt:e.retryAt||0};
   // Atom 是公开发布页的订阅源，不消耗 REST API 的账户额度。
   if(preview)try{const xml=await this.get(RELEASES+'.atom',false),$=cheerio.load(xml,{xmlMode:true});const candidates=[];$('entry').each((_,el)=>{const href=$(el).find('link').attr('href'),url=releaseLink(href),version=url?decodeURIComponent(new URL(url).pathname.split('/').at(-1)):'';if(versionParts(version)&&newer(version,this.current))candidates.push({version:version.replace(/^v/,''),url,preview:true,notes:'来自公开发布订阅，请在发布页查看版本说明及安装包。',published:$(el).find('updated').text()});});candidates.sort((a,b)=>newer(a.version,b.version)?-1:1);return {available:candidates[0]||null,checkedAt:new Date().toISOString(),source:'feed',warning:'GitHub API 暂不可用，已读取公开发布订阅。'};}catch{}
   throw Object.assign(Error('暂时无法检查更新，可直接前往 GitHub 发布页。'),{code:e.code,retryAt:e.retryAt});
  }
 }
}
module.exports={Updates,newer,chooseRelease,releaseLink,RELEASES};
