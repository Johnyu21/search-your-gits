const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
let relay;
async function healthy() {
  try { const r = await fetch('http://127.0.0.1:8787/health', { signal: AbortSignal.timeout(800) }); return r.ok && (await r.json()).ready === true; }
  catch { return false; }
}
async function start() {
  const env = { ...process.env };
  if (fs.existsSync(path.join(root, 'server/.env')) && !env.FEEDBACK_API_URL) {
    if (!await healthy()) {
      relay = spawn(process.execPath, ['--env-file=server/.env', 'server/feedback-server.cjs'], { cwd: root, windowsHide: true, stdio: ['ignore', 'inherit', 'inherit'] });
      relay.on('error', () => console.error('反馈服务启动失败，请检查本机 Node 环境。'));
      for (let i = 0; i < 30; i++) {
        if (await healthy()) break;
        if (relay.exitCode !== null) break;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    if (await healthy()) env.FEEDBACK_API_URL = 'http://127.0.0.1:8787/feedback';
    else throw new Error('本机反馈服务未就绪，请检查 server/.env 配置与 8787 端口。');
  }
  delete env.ELECTRON_RUN_AS_NODE;
  // Electron 是交互式应用；隐藏首窗会吞掉 Windows 上的启动图。
  const app = spawn(require('electron'), ['.'], { cwd: root, env, windowsHide: false, stdio: 'inherit' });
  app.on('error', () => { console.error('开发程序启动失败。'); if (relay) relay.kill(); process.exitCode = 1; });
  app.on('exit', code => { if (relay) relay.kill(); process.exitCode = code || 0; });
}
process.on('exit', () => { if (relay) relay.kill(); });
start().catch(error => { console.error(error.message); if (relay) relay.kill(); process.exitCode = 1; });
