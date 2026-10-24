const {test}=require('node:test');
const assert=require('node:assert/strict');
const {benchmark}=require('../lib/tools-data');
test('能力天梯按分数降序，同分保留来源顺序，缺失分数不参与排序',()=>{
 const rows=[['最高模型',90],['同分 Z',80],['同分 A',80],['零分模型',0],['未评分','—']];
 const html='<table><thead><tr><th>Model</th><th>Context</th><th>Creator</th><th>Artificial Analysis Intelligence Index</th></tr></thead><tbody>'+rows.map(([name,score])=>'<tr><td>'+name+'</td><td>128k</td><td>测试厂商</td><td>'+score+'</td></tr>').join('')+'</tbody></table>';
 const result=benchmark(html);assert.deepEqual(result.map(r=>r.name),['最高模型','同分 Z','同分 A','零分模型']);assert.deepEqual(result.map(r=>r.score),[90,80,80,0]);
});
