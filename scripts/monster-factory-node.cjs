// Tests and offscreen exports compile the exact production mesh source in memory.
const path=require('path'),Module=require('module'),root=path.resolve(__dirname,'..');
const result=require('esbuild').buildSync({entryPoints:[path.join(root,'src/monster-models.js')],bundle:true,platform:'node',format:'cjs',write:false,external:['three']});
const factory=new Module(path.join(__dirname,'compiled-monster-factory.cjs'),module);factory.filename=path.join(__dirname,'compiled-monster-factory.cjs');factory.paths=module.paths;factory._compile(result.outputFiles[0].text,factory.filename);module.exports=factory.exports;
