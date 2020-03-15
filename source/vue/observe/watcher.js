import {pushTarget,popTarget} from "./dep";
import {util} from "../util";

let id = 0 // 每次产生一个watcher，都要有一个唯一标识
class Watcher {
    /**
     *
     * @param vm 当前组件的实例 new Vue
     * @param exprOrFn 用户可能传入的是一个表达式，也可能是一个函数
     * @param cb 用户传入的回调函数 vm.$watch('msg',cb)
     * @param opts // 一些其他操作
     */
    constructor(vm,exprOrFn,cb=()=>{},opts={}){
        this.vm = vm
        this.exprOrFn = exprOrFn
        if(typeof exprOrFn === 'function'){
            this.getter = exprOrFn; // getter就是new Watcher传入的第二个函数
        }else {
            this.getter = function () { //调用此方法，会把vm上的对应表达式取出来
                return util.getValue(vm,exprOrFn) // 将表达式的值返回
            }
        }
        if (opts.user){ // 标识是用户自己写的watcher
            this.user = true
        }
        this.lazy = opts.lazy  // 如果值为true，说明是计算属性
        this.dirty = this.lazy
        this.cb = cb
        this.deps = []
        this.depsId = new Set()
        this.opts = opts
        this.id = id++

        // 创建用户自己的watcher时，取到表达式对应的值 （老值）
        // 如果当前我们是计算属性的话，就不会默认调用get方法
        this.value = this.lazy ? undefined : this.get() // 默认创建一个watcher，都会调用自身的get方法
    }
    get(){
        // 用户watcher生成时，this是用户watcher，getter时获取表达式的值
        // 被get方法拦截，dep添加用户watcher到subs，数据更新后subs里的watcher依次执行
        pushTarget(this) //this是渲染watcher Dep.target = watcher
        // 默认创建watcher时 只执行此方法，对应_update

        // fullName(){return this.firstName + this.lastName}
        // 这个函数调用时，拦截两个属性，将当前计算watcher存入各自的dep里
        let value = this.getter.call(this.vm) // 让当前传入的函数执行
        popTarget()
        console.log(value)
        return value
    }
    evaluate(){
        this.value = this.get()
        this.dirty = false
    }
    addDep(dep){ // 同一个watcher 不应该重复记录dep
        // console.log(dep)
        let id = dep.id // 例如：msg 的dep
        if(!this.depsId.has(id)){
            console.log('添加')
            this.depsId.add(id)
            this.deps.push(dep) // 这样就让watcher 记住了当前的dep
            dep.addSub(this) // 同时让dep记住了这个watcher
        }
    }
    depend(){
        let i = this.deps.length
        while (i--) {
            console.log(i)
            this.deps[i].depend()
        }
    }
    update(){ //对应发布时，watcher里调用的方法
        setTimeout(()=>{
            console.log('我是宏任务哟')
        },0)
        // this.get() // 如果立即调用get 会导致页面刷新 ，所以要用异步来更新
        if (this.lazy) {
            this.dirty = true
        } else {
            queueWatcher(this)
        }
    }
    run(){ // 把get放在这里来，通过下面的方便异步操作
        let value = this.get() // 新值
        // console.log('run')
        if (this.value !== value) {
            this.cb(value,this.value) // 用户watcher的cb
        }
    }
}
let has = {}
let queue = []
function flushQueue(){
    // 等待当前这一轮全部更新后，再去让留下的watcher 依次执行
    // queue.forEach(watcher => {
    //     watcher.run()
    // })
    queue.forEach(watcher=>watcher.run())
    has = {}
    queue = []
}
function queueWatcher(watcher) { // 对重复watcher进行过滤操作
    let id = watcher.id
    if(has[id] == null){
        has[id] = true
        queue.push(watcher) // 相同的watcher只会存一个到queue中

        // 延迟清空队列
        // setTimeout(flushQueue,0) //模拟异步清空队列，下面写正式方法
        nextTick(flushQueue) // 异步方法会等待所有同步方法执行完再执行
    }
}

let callbacks = []
function flushCallbacks(){
    callbacks.forEach(cb=>cb())
}
function nextTick(cb) { // cb就是flushQueue
    callbacks.push(cb)

    let timerFunc = () => {
        flushCallbacks()
    }

    if (Promise) {
        return Promise.resolve().then(timerFunc)
    }
    if (MutationObserver) {
        let observer = new MutationObserver(timerFunc)
        let textNode = document.createTextNode('1')
        observer.observe(textNode,{characterData: true})
        textNode.textContent = '2'
        return
    }
    if (setImmediate) { // 高版本IE支持
        return setImmediate(timerFunc)
    }
    setTimeout(timerFunc,0)
}

// 这个方法可能用户自己也会调用，所以我们期望用户传入的函数，在cb之后调用
// 就是等待页面更新后再去获取dom元素
// Vue.nextTick(()=>{
//
// })

export default Watcher
