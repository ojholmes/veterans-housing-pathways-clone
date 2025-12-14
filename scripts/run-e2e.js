const { spawn } = require('child_process');
const fetch = require('node-fetch');

function startProcess(cmd, args, opts){
  const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  return p;
}

async function waitFor(url, timeout = 30000){
  const start = Date.now();
  while(Date.now() - start < timeout){
    try{
      const res = await fetch(url);
      if (res.ok) return true;
    }catch(e){ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Timeout waiting for ' + url);
}

(async ()=>{
  console.log('Starting backend...');
  const backend = startProcess('npm', ['start']);
  try{
    await waitFor('http://localhost:4000');
    console.log('Backend ready');
  }catch(e){ console.error(e); backend.kill(); process.exit(1) }

  console.log('Starting frontend...');
  const frontend = startProcess('npm', ['run', 'dev'], { cwd: 'frontend' });
  try{
    await waitFor('http://localhost:5173');
    console.log('Frontend ready');
  }catch(e){ console.error(e); backend.kill(); frontend.kill(); process.exit(1) }

  console.log('Running Playwright tests...');
  const test = startProcess('npx', ['playwright', 'test']);
  test.on('exit', (code)=>{
    console.log('Playwright exited with', code);
    try{ backend.kill(); }catch(e){}
    try{ frontend.kill(); }catch(e){}
    process.exit(code);
  });
})();
