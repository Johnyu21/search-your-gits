const {spawn}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),env={...process.env};
delete env.ELECTRON_RUN_AS_NODE;
async function run(fixture){
 await new Promise((resolve,reject)=>{
  const child=spawn(path.join(root,'node_modules/electron/dist/electron.exe'),[path.join(root,'scripts/fixtures',fixture)],{cwd:root,env,windowsHide:true,stdio:'inherit'});
  const timeout=setTimeout(()=>{child.kill();reject(Error('Electron network check timed out: '+fixture));},30000);
  child.on('error',error=>{clearTimeout(timeout);reject(error);});
  child.on('exit',code=>{clearTimeout(timeout);if(code===0)resolve();else reject(Error(fixture+' failed: '+code));});
 });
}
(async()=>{await run('github-network-main.cjs');await run('github-star-cache-main.cjs');})().catch(error=>{console.error(error.message);process.exitCode=1;});
