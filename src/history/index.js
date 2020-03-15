// document.write('环境搭建')
// 节约性能，先把真实节点，用一个对象表示，在通过对象渲染到页面上
// for(let key in app){
//     console.log(key)
// }

// 初始化  将虚拟节点，渲染到页面
// <div id="container"><span style="color:red">hello</span>zf</div>

// h方法就是源码里的createElement，返回值时一个虚拟dom
// render方法是将Vnode渲染成真实dom
import { h, render, patch } from './vdom'

let oldVnode = h('div',
    { id: 'container', key: 1, class: 'aa' },
    h('li', { style: { color: 'red' }, key: 'a' }, 'a'),
    h('li', { style: { color: 'red' }, key: 'b' }, 'b'),
    h('li', { style: { color: 'red' }, key: 'c' }, 'c'),
    h('li', { style: { color: 'red' }, key: 'd' }, 'd'),
)
console.log(oldVnode)
//  patchVnode 用新的虚拟节点  和老的虚拟节点做对比  更新真实dom元素
let newVnode = h('div',
    { id: "aaa" },
    h('li', { style: { color: 'red' }, key: 'e' }, 'e'),
    h('li', { style: { color: 'red' }, key: 'a' }, 'a'),
    h('li', { style: { color: 'red' }, key: 'f' }, 'f'),
    h('li', { style: { color: 'red' }, key: 'c' }, 'c'),
    h('li', { style: { color: 'red' }, key: 'n' }, 'n'),
)

let container = document.getElementById('app')
render(oldVnode, container)

setTimeout(() => {
    patch(oldVnode, newVnode)
}, 1000);



// {
//     tag:'div',
//     props:{},
//     children:[{
//         tag:undefined,
//         props:undefined,
//         children:undefined,
//         text:'hello'
//     }]
// }
// <div>hello</div>
// new Vue({
//     render(h){
//         return h('div',{},'hello')
//     }
// })
