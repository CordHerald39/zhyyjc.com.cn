import {readFile,writeFile,mkdir,copyFile,mkdtemp,rm,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadArticles} from './content.mjs';
import {validateSite} from './validate.mjs';
import {templates} from './site-template.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
const c=JSON.parse(await readFile('site.config.json'));const origin=c.origin||'https://'+c.domain;const articles=await loadArticles('content/articles',['tutorials']);const t=templates(c,articles);const output=await mkdtemp(path.join(root,'.build-'));const routes=[];
async function page(route,title,description,body,extra={}){const folder=path.join(output,route);await mkdir(folder,{recursive:true});await writeFile(path.join(folder,'index.html'),t.shell(title,description,route,body,extra));routes.push({route,date:extra.dateModified});}
try{
 for(const f of ['style.css','site.js','logo.svg','favicon.svg'])await copyFile('src/'+f,path.join(output,f));
 await page('/',c.title,c.description,t.home());
 for(const [route,title,description,fn] of [['network','节点与速度方案','了解地区节点分布、套餐速度规格与连接检查方法。','network'],['streaming','流媒体解锁方案','查看流媒体平台、地区和播放验收标准。','streaming'],['pricing','套餐价格','比较月付与年付套餐、月度流量和计费规则。','pricing'],['downloads','客户端下载','Windows、Android、macOS 与 Linux 客户端下载指引。','downloads'],['tutorials','使用教程','机场订阅导入、客户端安装与连接排查教程。','tutorials'],['faq','常见问题','了解套餐流量、客户端和订阅管理的常见问题。','questions'],['subscription','机场订阅说明','了解订阅地址、令牌保护和客户端配置更新。','subscription'],['subscribe','套餐详情与开通准备','核对选择的套餐、付费周期和开通前准备。','subscribe'],['about','关于品牌','了解品牌信息与客户端使用资料。','about'],['privacy','隐私说明','了解页面交互与外部链接的数据处理情况。','privacy'],['terms','服务与计费说明','了解服务范围、使用要求及计费规则。','terms']])await page('/'+route+'/',c.name+'加速器'+title,c.name+'：'+description,t[fn]());
 for(const p of t.platforms)await page('/downloads/'+p[0]+'/',c.name+' '+p[1]+'客户端下载与安装指南',p[5],t.software(p));
 for(const a of articles)await page('/tutorials/'+a.slug+'/',a.title+' | '+c.name,a.description,t.article(a),{'@type':'Article',headline:a.title,datePublished:a.date,dateModified:a.updated,author:{'@type':'Organization',name:a.author}});
 await writeFile(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(x=>'<url><loc>'+origin+x.route+'</loc>'+(x.date?'<lastmod>'+x.date+'</lastmod>':'')+'</url>').join('')+'</urlset>');
 await writeFile(path.join(output,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');if(!c.domain.startsWith('127.0.0.1'))await writeFile(path.join(output,'CNAME'),c.domain+'\n');await writeFile(path.join(output,'.nojekyll'),'');
 await writeFile(path.join(output,'404.html'),t.shell('页面未找到 | '+c.name,'返回首页或下载中心继续浏览。','/404.html','<section class="wrap section"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>这条路径暂时没有内容。</h1><p>可以返回首页，或从下载中心重新开始。</p><div class="actions"><a class="button" href="/">返回首页</a><a class="button secondary" href="/downloads/">客户端下载</a></div></section>').replace('index,follow,max-image-preview:large','noindex'));
 await validateSite(output,origin);const dist=path.join(root,'dist');if(path.dirname(dist)!==path.resolve(root))throw Error('Unsafe output');await rm(dist,{recursive:true,force:true});await rename(output,dist);console.log('Built '+c.domain+': '+routes.length+' pages, '+articles.length+' articles; internal links verified.');
}catch(e){if(path.dirname(output)===path.resolve(root)&&path.basename(output).startsWith('.build-'))await rm(output,{recursive:true,force:true});throw e;}
