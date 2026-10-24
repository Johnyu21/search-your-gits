const {fromAPI}=require('./core');
const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function simpleQuery(query){return /^[\p{L}\p{N}_. /-]{1,100}$/u.test(query)&&!query.includes(':');}
function matchScore(row,query){if(!simpleQuery(query))return 0;const q=normalize(query),full=normalize(row.name),name=normalize(row.name.split('/').at(-1));if(!q)return 0;if(full===q)return 4;if(name===q)return 3;if(name.startsWith(q))return 2;if(name.includes(q))return 1;return 0;}
function boostMatches(rows,query){const unique=new Map();for(const row of rows)if(row?.name&&!unique.has(row.name.toLowerCase()))unique.set(row.name.toLowerCase(),row);return [...unique.values()].map((r,i)=>({...r,exactMatch:matchScore(r,query)>=3,_i:i})).sort((a,b)=>matchScore(b,query)-matchScore(a,query)||a._i-b._i).map(({_i,...r})=>r);}
async function exactCandidates(o,get){
 const query=o.query.trim();if(!simpleQuery(query))return [];
 if(/^[\w.-]+\/[\w.-]+$/.test(query)){const r=fromAPI(await get('https://api.github.com/repos/'+query));return !o.language||r.language.toLowerCase()===o.language.toLowerCase()?[r]:[];}
 const name=query.replace(/\s+/g,'-');if(!name)return [];
 const q=name+' in:name'+(o.language?' language:"'+o.language+'"':'');
 const data=await get('https://api.github.com/search/repositories?'+new URLSearchParams({q,per_page:'30'}));return (data.items||[]).map(fromAPI).filter(r=>matchScore(r,query)>=3);
}
module.exports={normalize,matchScore,boostMatches,exactCandidates};
