import Observer from "./observer";
import Watcher from "./watcher";
import Dep from "./dep";

export function initState(vm) {
    // 做不同的初始化工作
    let opts = vm.$options
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed){
        initComputed(vm,opts.computed)
    }
    if (opts.watch) {
        initWatch(vm)
    }
}
export function observer(data) {
    if (typeof data !== 'object' || data == null) {
        return
    }
    if (data.__ob__){ // 已经被监控过了
        return data.__ob__
    }
    return new Observer(data)
}
function proxy(vm,source,key) { //代理数据，这样vm.msg = vm._data.msg
    Object.defineProperty(vm,key,{
        get() {
            return vm[source][key]
        },
        set(newValue) {
            vm[source][key] = newValue
        }
    })
}
function initData(vm) { // 将数据，通过object.defineProperty重写
    let data = vm.$options.data
    // 备份并判断data是不是个函数
    data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}
    // 将对vm上的取值和赋值操作，都代理给vm._data
    for (let key in data) {
        proxy(vm,'_data',key)
    }

    observer(data) // 观察数据
}

function createComputedGetter(vm,key) {
    let watcher = vm._watchersComputed[key] // 这个watcher就是我们定义的计算属性watcher
    return function () { //用户去计算属性的值时，会走到这里
        if (watcher) {
            // 如果dirty是false的话，不需要重新执行计算属性中的方法
            if (watcher.dirty) { // 如果页面取值，而且dirty是true，就会去调用watcher的get方法
                watcher.evaluate() // 计算值
            }
            if (Dep.target) { // watcher 就是计算属性watcher dep = [firstName.dep,lastName.dep]
                watcher.depend() // 向dep中subs里传入当前指针所在的渲染watcher
            }
            return watcher.value
        }
    }
}
// 计算属性特点 默认不执行，等用户取值的时候再执行，会缓存取值的结果
// 如果依赖的值发生变化了，将更新dirty属性为true，再次取值时，会重新取值
function initComputed(vm,computed) {
    // 核心原理，创建watcher
    // 将计算属性的配置，放到vm上
    let watchers = vm._watchersComputed = Object.create(null) // 创建存储属性的watcher的对象
    for(let key in computed) {
        let def = computed[key]
        // new Watcher此时什么都不做，只是配置了lazy和dirty
        watchers[key] = new Watcher(vm,def,()=>{},{lazy:true}) // lazy让计算不会立即执行
        // vm.fullName，先定义响应式
        Object.defineProperty(vm, key, {
            get: createComputedGetter(vm,key)
        })
    }
}
function createWatcher(vm,key,handler) {
    return vm.$watch(key,handler)
}
function initWatch(vm) {
    let watch = vm.$options.watch // 获取用户传入的watch

    for(let key in watch){ // msg(){}
        let handler = watch[key]
        createWatcher(vm,key,handler)
    }
}
