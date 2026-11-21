const fs=require('fs');
const def=require('../config/v11-definition.json'),bp=require('../config/blueprint.json');
for(const [id,d] of Object.entries(def)){
 bp.C.heroes[id]={name:d.name,title:d.title,role:d.role,color:d.color,stats:{growth:{}},passive:{id:id+'-passive',name:{ana:'生化步枪',dva:'机甲与弹射',zarya:'能量转换'}[id],desc:d.passive},skills:d.skills.map((s,i)=>({name:s.name,key:'QWER'[i],icon:['⌖','⬡','✦','◉'][i],maxRank:i===3?3:5,target:s.target,ally:!!s.ally,heroOnly:!!s.ally,damageType:s.damageType||'magic',desc:s.desc})),maxLevel:18};
}
fs.writeFileSync('config/blueprint.json',JSON.stringify(bp));
