const configLoader=require('./scripts/config-loader.cjs'),fs=require('node:fs'),path=require('node:path');
const sourceWorkbook=configLoader.workbookPath(),snapshot=configLoader.compile(sourceWorkbook);
if(sourceWorkbook!==configLoader.canonical)fs.copyFileSync(sourceWorkbook,configLoader.canonical);
configLoader.publish(snapshot);
fs.writeFileSync('dist/monster-data-v14.js','window.MONSTERS_V14='+JSON.stringify(JSON.parse(fs.readFileSync('config/v14-monsters.json','utf8')))+';\n');
require('esbuild').buildSync({entryPoints:['src/renderer.js'],bundle:true,minify:true,format:'iife',outfile:'dist/renderer.js',legalComments:'eof'});
require('esbuild').buildSync({entryPoints:['src/monster-gallery.js'],bundle:true,minify:true,format:'iife',outfile:'dist/monster-gallery.js'});
// Produce a separate deployment tree; retain the original local files untouched.
const source=path.resolve('dist'),output=path.join(source,'client');
function copySafe(src,dst){fs.mkdirSync(dst,{recursive:true});for(const entry of fs.readdirSync(src,{withFileTypes:true})){const input=path.join(src,entry.name),relative=path.relative(source,input).replaceAll('\\','/');if(relative==='client')continue;const target=path.join(dst,entry.name);if(entry.isDirectory())copySafe(input,target);else if(entry.isFile())fs.copyFileSync(input,target)}}
copySafe(source,output);
