// document.write('环境搭建')
// 节约性能，先把真实节点，用一个对象表示，在通过对象渲染到页面上
// for(let key in app){
//     console.log(key)
// }

// 初始化  将虚拟节点，渲染到页面
// <div id="container"><span style="color:red">hello</span>zf</div>
import {h,render} from '../vdom'

let oldVnode = h('div',
    {id:'container',key:1,class:'aa'},
    h('span',{style:{color:'red',background:'yellow'}},'hello'),
    'zf')

//  patchVnode 用新的虚拟节点  和老的虚拟节点做对比  更新真实dom元素
let newVnode = h('div',
    {id: "aaa"},
    h('span',{style: {color:'green'}},'world'),
    'px'
)

let container = document.getElementById('app')
render(oldVnode, container)



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
