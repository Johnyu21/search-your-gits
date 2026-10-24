const {createHash}=require('node:crypto');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function retryTime(headers,fallback=60000,now=Date.now()){
 const retry=headers?.get?.('retry-after');
 if(retry!==null&&retry!==undefined&&retry!==''){
  const seconds=Number(retry);const at=Number.isFinite(seconds)?now+Math.max(1,seconds)*1000:Date.parse(retry);
  if(Number.isFinite(at))return at;
 }
 const reset=Number(headers?.get?.('x-ratelimit-reset'))*1000;
 return reset>now?reset+1000:now+fallback;
}
function limited(code,retryAt,message){return Object.assign(new Error(message+' 预计 '+new Date(retryAt).toLocaleString('zh-CN',{hour12:false})+' 后重试。'),{code,retryAt});}
function errorInfo(e){return {warning:e.message,code:e.code||'',retryAt:e.retryAt||0};}
class GithubNetwork{
 constructor(db,request,save,token,options={}){this.db=db;this.request=request;this.save=save;this.token=token;this.sleep=options.sleep||sleep;this.pending=new Map();db.networkLimits||={};}
 key(url){const u=new URL(url);const identity=createHash('sha256').update(this.token()||'anonymous').digest('hex').slice(0,16);return identity+':'+(u.hostname==='api.github.com'?(u.pathname.startsWith('/search/')?'search':'core'):'web');}
 get(url,api){const credential=this.token()||'',key=credential+'|'+url;if(this.pending.has(key))return this.pending.get(key);const task=this.fetch(url,api).finally(()=>this.pending.delete(key));this.pending.set(key,task);return task;}
 async fetch(url,api){
  const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||!['api.github.com','github.com'].includes(u.hostname))throw Error('GitHub 请求地址无效');
  const key=this.key(url),headers={'User-Agent':'Search-Your-Gits','Accept':api?'application/vnd.github+json':'text/html'};
  if(api&&u.hostname==='api.github.com'&&this.token())headers.Authorization='Bearer '+this.token();
  const fail=at=>limited('GITHUB_RATE_LIMIT',at,'GitHub 请求受限；已有缓存仍可浏览。可在设置中配置 GitHub Token 提高额度。');
  for(let attempt=0;attempt<3;attempt++){
   const blocked=this.db.networkLimits[key]||0;
   if(blocked>Date.now()){
    if(blocked-Date.now()<=3000&&attempt<2)await this.sleep(blocked-Date.now());else throw fail(blocked);
   }
   let r;try{r=await this.request(url,{headers,signal:AbortSignal.timeout(25000),redirect:'error'});}catch{
    if(attempt<2){await this.sleep(500*(2**attempt));continue;}throw Error('连接 GitHub 失败，请检查网络或系统代理后重试。');
   }
   if(r.ok){delete this.db.networkLimits[key];return api?r.json():r.text();}
   if(r.status===401)throw Object.assign(Error('GitHub Token 无效或已过期，请在设置中重新填写。'),{code:'GITHUB_TOKEN_INVALID'});
   const rate=r.status===429||(r.status===403&&(r.headers?.get?.('x-ratelimit-remaining')==='0'||r.headers?.get?.('retry-after')));
   if(rate){const at=retryTime(r.headers);this.db.networkLimits[key]=at;await this.save();if(at-Date.now()<=3000&&attempt<2){await this.sleep(Math.max(1,at-Date.now()));delete this.db.networkLimits[key];continue;}throw fail(at);}
   if(r.status>=500&&attempt<2){await this.sleep(500*(2**attempt));continue;}
   throw Error('GitHub 返回错误：HTTP '+r.status+(r.status===403?'，可能缺少访问权限，请检查 Token 或稍后重试。':''));
  }
 }
}
module.exports={GithubNetwork,retryTime,limited,errorInfo,sleep};
