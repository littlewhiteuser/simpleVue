let id = 0
class Dep{
    constructor(){
        this.id = id++
        this.subs = []
    }
    addSub(watcher){ // 订阅 就是将调用addSub时传入的内容保存在subs数组里
        this.subs.push(watcher)
        // console.log(this.subs.length)
    }
    notify(){ // 发布
        console.log(this.subs)
        this.subs.forEach(watcher => watcher.update())
    }
    depend(){
        if (Dep.target){
            Dep.target.addDep(this)
        }
    }
}
// 用来保存当前的watcher
let stack = []
export function pushTarget(watcher) {
    Dep.target = watcher
    stack.push(watcher)
}
export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}
export default Dep //用来收集依赖 收集的是一个个watcher

// let dep = new Dep()
// dep.addSub({
//     update(){
//         console.log(1)
//     }
// })
// dep.addSub({
//     update(){
//         console.log(2)
//     }
// })
// dep.notify()
