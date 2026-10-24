const cheerio = require('cheerio');
const DAY=86400000;
function parseTrending(html){
 const $=cheerio.load(html); const rows=[];
 $('article.Box-row').each((_,el)=>{const e=$(el),name=e.find('h2 a').attr('href')?.replace(/^\//,'').trim();
 if(!/^[\w.-]+\/[\w.-]+$/.test(name||''))return;
 const links=e.find('a.Link--muted'); let stars=null,forks=null;
 links.each((_,a)=>{const href=$(a).attr('href')||''; const n=Number($(a).text().replace(/[^0-9]/g,''));if(href.endsWith('/stargazers'))stars=n;if(href.endsWith('/forks'))forks=n;});
 const growth=e.find('span.float-sm-right').text().replace(/[^0-9]/g,'');
 rows.push({name,description:e.find('p').text().trim().replace(/\s+/g,' '),language:e.find('[itemprop="programmingLanguage"]').text().trim()||'未标注',stars,forks,growth:growth?Number(growth):null,url:'https://github.com/'+name}); });
 if(!rows.length)throw new Error('GitHub Trending 未返回项目，可能是网页结构变化或访问受限。');
 return rows;
}
function fromAPI(r){return {name:r.full_name,description:r.description||'',language:r.language||'未标注',stars:r.stargazers_count,forks:r.forks_count,url:r.html_url,created:r.created_at,updated:r.pushed_at,license:r.license?.spdx_id||'未标注',topics:r.topics||[],issues:r.open_issues_count,homepage:r.homepage||'',branch:r.default_branch||'未获取',watchers:r.subscribers_count,sizeKB:r.size,archived:Boolean(r.archived),fork:Boolean(r.fork)};}
function queryFor(o,now=new Date()){const days={weekly:7,monthly:30,quarterly:90}[o.period]; if(!days)throw new Error('无效周期');const start=new Date(now.getTime()-days*DAY).toISOString().slice(0,10);return ['created:>='+start,'archived:false','fork:false',o.language?'language:"'+o.language+'"':'',o.search||''].filter(Boolean).join(' ');}
function record(db,rows,now=new Date()){const day=now.toISOString().slice(0,10);const cutoff=new Date(now.getTime()-100*DAY).toISOString().slice(0,10); for(const row of rows){if(!Number.isFinite(row.stars))continue;const old=db.history[row.name]||{repo:row,points:[]};old.repo={...old.repo,...row}; old.points=old.points.filter(p=>p.day>=cutoff&&p.day!==day);old.points.push({day,stars:row.stars});old.points.sort((a,b)=>a.day.localeCompare(b.day));db.history[row.name]=old;} }
function quarter(db,now=new Date()){const cutoff=new Date(now.getTime()-90*DAY).toISOString().slice(0,10),today=now.toISOString().slice(0,10);return Object.values(db.history).flatMap(h=>{const p=h.points.filter(x=>x.day>=cutoff&&x.day<=today);if(p.length<2)return [];const a=p[0],b=p.at(-1);return [{...h.repo,stars:b.stars,growth:b.stars-a.stars,baseline:a.day,lastObserved:b.day,coverage:Math.round((Date.parse(b.day)-Date.parse(a.day))/DAY)}];}).sort((a,b)=>b.growth-a.growth||b.stars-a.stars);}
function csv(rows){const cell=x=>'"'+String(x??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"';return '\ufeff'+[['排名','仓库','介绍','语言','Star 总数','周期增长（如适用）','Fork','基准日期','最近观测日期','观测天数','链接'],...rows.map((r,i)=>[i+1,r.name,r.description,r.language,r.stars,r.growth,r.forks,r.baseline,r.lastObserved,r.coverage,r.url])].map(r=>r.map(cell).join(',')).join('\r\n');}
module.exports={parseTrending,fromAPI,queryFor,record,quarter,csv};
