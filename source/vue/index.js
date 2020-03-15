import {initState} from "./observe";
import Watcher from "./observe/watcher";
import {compiler,util} from './util'
import {h,patch,render} from './vdom/index'

function Vue(options){ // vue中原始用户传入的数据
    this._init(options); // 初始化vue 并且将用户选项传入
}
Vue.prototype._init = function (options) {
    // vue中初始化  this.$options 表示的是vue中参数
    let vm = this; // vm表示当前实例
    vm.$options = options;

    // MVVM原理  需要数据重新初始化
    // 拦截数组的方法，和对象的属性
    initState(vm); // data computed  watch

    // 初始化工作
    if (vm.$options.el) {
        vm.$mount()
    }
}
// 渲染页面 将组件进行挂载
function query(el){
    if (typeof el === 'string') {
        return document.querySelector(el)
    }
    return  el
}
// 定义_render方法，返回vnode
Vue.prototype._render = function () {
    let vm = this
    let render = vm.$options.render
    let vnode = render.call(vm, h)
    return vnode
}
Vue.prototype._update = function (vnode) {
    // 用用户传入的数据，去更新视图
    let vm = this
    let el = vm.$el
    // ------使用虚拟dom
    let preVnode = vm.preVnode // 第一次肯定没有preVnode
    if (!preVnode) { // 初次渲染
        vm.preVnode = vnode // 把上一次的节点保存起来
        render(vnode, el)
    } else {
        // 更新操作
        vm.$el = patch(preVnode, vnode)
    }

    // ------这是1.0的做法  之后会用虚拟dom重写
    // 循环这个元素  将里面的内容换成传入的数据
    // let node = document.createDocumentFragment() // 文档碎片
    // let firstChild
    // while (firstChild = el.firstChild) {
    //     node.appendChild(firstChild) // 将原el内的第一项，不断的移动到文档碎片里
    // }
    // // todo 对文本进行替换
    // console.log(node)
    // compiler(node,vm)
    // console.log(node)
    // el.appendChild(node)
    // console.log('一轮更新结束')
    // 需要匹配{{}}的方式来进行替换

    // 依赖收集  属性变化了  需要重新渲染watcher 和 dep
}
Vue.prototype.$mount = function () {
    let vm = this
    let el = vm.$options.el
    el = vm.$el = query(el) // 获取当前挂载的节点，vm.$el就是要挂载的第一个元素

    // 渲染时通过watcher来渲染的
    // 渲染watcher 就是用来渲染的watcher
    // vue是组件级别更新  new Vue 产生一个组件

    let updateComponent = () => { // 更新组件 或者渲染的逻辑
        vm._update(vm._render()) // 更新组件
    }
    new Watcher(vm,updateComponent) //渲染watcher，默认会调用updateComponent方法里的_update方法

    // 如果数据更新了
}
Vue.prototype.$watch = function (expr,handler) {
    let vm = this
    // expr 就是watch传入的key
    // 原理就是创建一个watcher
    new Watcher(vm,expr,handler,{user:true})
}

export default Vue
