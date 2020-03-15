// ?: 匹配不捕获
// + 至少一个
// ? 尽可能少匹配
const defaultRE = /\{\{((?:.|\r?\n)+?)\}\}/g
export const util = {
    getValue(vm,expr){
        // debugger
        // vm是实例，expr是执行过程，要返回一个用来替换的
        let keys = expr.split('.')
        return keys.reduce((memo,current) => {
            // debugger
            memo = memo[current] // 等于vm => vm.school => vm.school.name
            return memo
        },vm)
    },
    compilerText(node,vm){ //编译文本 替换类似{{school.name}}
        if (!node.expr){ // 为了针对更新时，{{school.name}}已经变成了实际的数据
            node.expr = node.textContent
        }
        node.textContent = node.expr.replace(defaultRE,function (...args) {
            // args就是正则匹配后的数组
            return JSON.stringify(util.getValue(vm,args[1]))
            // return util.getValue(vm,args[1])
        })
    }
}
export function compiler(node,vm) { // node是传入的文档碎片
    let childNodes = node.childNodes; // 当前是第一层
    [...childNodes].forEach(child => {
        if(child.nodeType == 1){ //1 元素  3表示文本
            compiler(child,vm); // 编译当前元素的孩子节点
        }else if(child.nodeType == 3){
            util.compilerText(child,vm);
        }
    })
}
