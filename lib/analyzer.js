import fs from 'fs'; import path from 'path';
const IGNORE=new Set(['node_modules','.git','__pycache__','.venv','dist','build','.next','vendor']);
const EXT_WEIGHT={
  'entry':['index.js','index.ts','main.py','app.py','main.go','index.tsx','index.jsx'],
  'config':['.json','.yaml','.yml','.toml','config.'],
  'doc':['.md','.rst','.txt']
};
export function analyze(root){
  const map={files:[], dirs:{}};
  function walk(dir, depth=0){
    if(depth>4) return;
    try{
      for(const e of fs.readdirSync(dir,{withFileTypes:true})){
        if(IGNORE.has(e.name)) continue;
        const p=path.join(dir,e.name);
        if(e.isDirectory()){walk(p,depth+1); map.dirs[p]=e.name;}
        else{
          const rel=path.relative(root,p);
          const isEntry=EXT_WEIGHT.entry.some(x=>rel.endsWith(x));
          const ext=path.extname(p);
          map.files.push({path:rel,size:fs.statSync(p).size,entry:isEntry,ext});
        }
      }
    }catch{}
  }
  walk(root);
  map.entryFiles=map.files.filter(f=>f.entry).map(f=>f.path);
  map.totalFiles=map.files.length;
  map.totalSize=map.files.reduce((a,f)=>a+f.size,0);
  return map;
}
export function generateReport(root){
  const m=analyze(root);
  let out=`# 代码库地图: ${root}\n## 概览\n- 文件数: ${m.totalFiles}\n- 总大小: ${(m.totalSize/1024).toFixed(1)} KB\n`;
  if(m.entryFiles.length) out+=`- 入口文件: ${m.entryFiles.join(', ')}\n`;
  const byExt={};
  m.files.forEach(f=>{const e=f.ext||'(无)';byExt[e]=(byExt[e]||0)+1;});
  out+=`\n## 文件类型分布\n`;
  Object.entries(byExt).sort((a,b)=>b[1]-a[1]).forEach(([e,n])=>out+=`- ${e}: ${n}个\n`);
  out+=`\n## 目录结构\n`;
  const dirs=new Set(m.files.map(f=>path.dirname(f.path)));
  dirs.forEach(d=>{const n=m.files.filter(f=>path.dirname(f.path)===d).length;out+=`- ${d||'/'}/ (${n}文件)\n`;});
  return out;
}
