import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
const config=JSON.parse(await readFile('site.config.json','utf8'));
const require=createRequire(import.meta.url);
const {default:lighthouse}=await import(pathToFileURL(require.resolve('lighthouse')).href);
const {launch}=await import(pathToFileURL(createRequire(require.resolve('lighthouse')).resolve('chrome-launcher')).href);
const output=path.join(root,'reports','lighthouse');await mkdir(path.join(output,'chrome-profile'),{recursive:true});
const chrome=await launch({chromeFlags:['--headless'],userDataDir:path.join(output,'chrome-profile')});
const sitemap=await readFile('dist/sitemap.xml','utf8');
const routes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
let summary=[];
if(process.argv.includes('--resume')){try{summary=JSON.parse(await readFile(path.join(output,'summary.json'),'utf8'));}catch{}}
const passed=new Set(summary.filter(r=>Object.values(r.scores).every(s=>s===100)).map(r=>r.url));
try{
 for(const route of routes){
  const url='http://127.0.0.1:'+config.previewPort+route;
  if(passed.has(url))continue;
  const result=await lighthouse(url,{port:chrome.port,output:['json','html'],onlyCategories:['performance','accessibility','best-practices','seo']});
  const name=route==='/'?'home':route.split('/').filter(Boolean).join('-');
  await writeFile(path.join(output,name+'.json'),result.report[0]);await writeFile(path.join(output,name+'.html'),result.report[1]);
  const row={url,scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,v.score*100])),failures:Object.values(result.lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,title:a.title,score:a.score}))};
  summary=summary.filter(r=>r.url!==url);summary.push(row);await writeFile(path.join(output,'summary.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(row));
  if(Object.values(row.scores).some(s=>s<100)){process.exitCode=1;break;}
 }
}finally{await chrome.kill();}

