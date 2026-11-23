const {test}=require('node:test');
const assert=require('node:assert/strict');
const {benchmark}=require('../lib/tools-data');
test('能力天梯按分数降序，同分保留来源顺序，缺失分数不参与排序',()=>{
 const rows=[['最高模型',90],['同分 Z',80],['同分 A',80],['零分模型',0],['未评分','—']];
 const html='<table><thead><tr><th>Model</th><th>Context</th><th>Creator</th><th>Artificial Analysis Intelligence Index</th></tr></thead><tbody>'+rows.map(([name,score])=>'<tr><td>'+name+'</td><td>128k</td><td>测试厂商</td><td>'+score+'</td></tr>').join('')+'</tbody></table>';
 const result=benchmark(html);assert.deepEqual(result.map(r=>r.name),['最高模型','同分 Z','同分 A','零分模型']);assert.deepEqual(result.map(r=>r.score),[90,80,80,0]);
});

const fs=require('node:fs');
test('真实来源多行表头按 Intelligence Index 读分数，不把耗时和价格读成能力与厂商',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'fixtures/aa-leaderboard.html'),'utf8');
 const rows=benchmark(html);
 assert.deepEqual(rows.map(r=>r.score),[65,62,61]);
 assert.deepEqual(rows.map(r=>r.creator),['Anthropic','OpenAI','Google']);
 assert.ok(rows.every(r=>r.context==='1M'));
 assert.ok(rows[0].url.startsWith('https://artificialanalysis.ai/models/'));
});

test('能力列可调整位置，缺少能力列时不能把其他数字冒充评分',()=>{
 const html='<table><thead><tr><th>Cost per Task</th><th>Context Window</th><th>Artificial Analysis Intelligence Index</th><th>Model</th></tr></thead><tbody><tr><td>999</td><td>1M</td><td>42.5</td><td><img alt="Lab">模型甲</td></tr><tr><td>200</td><td>1M</td><td>—</td><td>未评分</td></tr></tbody></table>';
 const rows=benchmark(html);assert.equal(rows.length,1);assert.equal(rows[0].score,42.5);assert.equal(rows[0].creator,'Lab');
 assert.throws(()=>benchmark(html.replace('Artificial Analysis Intelligence Index','Time per Task')),/结构发生变化/);
});
test('错误旧缓存不再展示，更新失败仅回退新解析器生成的缓存',async()=>{
 const {ToolsData}=require('../lib/tools-data');const fixture=fs.readFileSync(require('node:path').join(__dirname,'fixtures/aa-leaderboard.html'),'utf8');
 const db={toolsCache:{'benchmark:aa':{rows:[{name:'错误旧数据',score:999,sourceOrder:0}],fetchedAt:new Date().toISOString()}}};let offline=true,calls=0;
 const tools=new ToolsData(db,async(url,options)=>{calls++;assert.equal(options.cache,'no-store');if(offline)throw Error('offline');return {ok:true,headers:{get:()=>null},text:async()=>fixture};},async()=>{});
 assert.equal((await tools.ladder()).rows.length,0);offline=false;const fresh=await tools.ladder();assert.equal(fresh.rows[0].score,65);const count=calls;assert.equal((await tools.ladder()).source,'cache');assert.equal(calls,count);
 offline=true;const stale=await tools.ladder(true);assert.equal(stale.source,'stale');assert.equal(stale.fetchedAt,fresh.fetchedAt);assert.equal(stale.rows[0].score,65);
});
