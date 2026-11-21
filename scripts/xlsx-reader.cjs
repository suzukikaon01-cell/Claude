'use strict';
// Read the OOXML subset used by the configuration workbook. No formula execution.
const fs=require('node:fs'),zlib=require('node:zlib');
function unzip(bytes){
 if(bytes.length>24*1024*1024)throw Error('配置文件超过24MB');let end=-1;
 for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(bytes.readUInt32LE(p)===0x06054b50){end=p;break}
 if(end<0)throw Error('无效XLSX ZIP目录');let count=bytes.readUInt16LE(end+10),p=bytes.readUInt32LE(end+16),out={},total=0;
 if(count>3000)throw Error('XLSX条目过多');
 for(let i=0;i<count;i++){if(bytes.readUInt32LE(p)!==0x02014b50)throw Error('损坏的ZIP目录');let method=bytes.readUInt16LE(p+10),size=bytes.readUInt32LE(p+20),raw=bytes.readUInt32LE(p+24),nl=bytes.readUInt16LE(p+28),el=bytes.readUInt16LE(p+30),cl=bytes.readUInt16LE(p+32),offset=bytes.readUInt32LE(p+42),name=bytes.toString('utf8',p+46,p+46+nl);total+=raw;if(total>80*1024*1024||raw>32*1024*1024)throw Error('XLSX展开大小超限');let begin=offset+30+bytes.readUInt16LE(offset+26)+bytes.readUInt16LE(offset+28),part=bytes.subarray(begin,begin+size);if(method!==0&&method!==8)throw Error('不支持的压缩方法');out[name]=(method===8?zlib.inflateRawSync(part,{maxOutputLength:32*1024*1024}):part).toString('utf8');p+=46+nl+el+cl;}
 for(let name of Object.keys(out))if(name.endsWith('.xml'))out[name]=out[name].replace(/<(\/?)[\w]+:/g,'<$1');return out;
}
const decode=s=>s.replace(/&#x([\da-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const attr=(s,k)=>decode(s.match(new RegExp('(?:^|\\s)'+k+'="([^"]*)"'))?.[1]||'');
const texts=s=>[...s.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(m=>decode(m[1])).join('');
function readWorkbook(file){let z=unzip(fs.readFileSync(file)),strings=[...(z['xl/sharedStrings.xml']||'').matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map(m=>texts(m[1])),rels={};for(let m of (z['xl/_rels/workbook.xml.rels']||'').matchAll(/<Relationship\s([^>]*?)\/?\s*>/g))rels[attr(m[1],'Id')]=attr(m[1],'Target').replace(/^\//,'');let out={};
 for(let m of (z['xl/workbook.xml']||'').matchAll(/<sheet\s([^>]*?)\/?\s*>/g)){let name=attr(m[1],'name'),target=rels[attr(m[1],'r:id')];if(!target)continue;let xml=z[target.startsWith('xl/')?target:'xl/'+target.replace(/^\.\//,'')];if(!xml)throw Error('工作表文件缺失: '+name);let rows=[];for(let r of xml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)){let n=+attr(r[1],'r'),row=Array(20).fill(null);for(let c of r[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){let ref=attr(c[1],'r'),type=attr(c[1],'t'),col=0;for(let a of ref.replace(/\d/g,''))col=col*26+a.charCodeAt(0)-64;if(col>20)continue;let body=c[2]||'',v=body.match(/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/)?.[1],value=v==null?null:type==='s'?strings[+v]:type==='b'?+v:type==='str'?decode(v):Number(v);if(type==='inlineStr')value=texts(body);if(/<f(?:\s|>)/.test(body))throw Error(name+'!'+ref+': 禁止单元格公式，请填写数值；计算逻辑由注册公式处理');row[col-1]=value;}rows[n-1]=row;}out[name]=Array.from({length:rows.length},(_,i)=>rows[i]||Array(20).fill(null));}
 if(Object.keys(out).join('|')!=='英雄|符文|装备')throw Error('必须且只能包含英雄、符文、装备三个工作表');return out;
}
module.exports={readWorkbook};
