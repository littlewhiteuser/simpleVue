// 主要是拦截用户调用的push，shift unshift pop reverse sort splice等会改变原数组的方法

import {observer} from "./index";

let oldArrayProtoMethods = Array.prototype

export let arrayMethods = Object.create(oldArrayProtoMethods)

let methods = [
    'push',
    'shift',
    'unshift',
    'pop',
    'sort',
    'splice',
    'reverse'
]
export function observerArray(inserted) {
    for (let i = 0;i < inserted.length; i++) {
        observer(inserted[i]) // 没有对数组的索引进行监控，因为这样太消耗性能
    }
}
export function dependArray(value) {
    for (let i = 0;i < value.length; i++) {
        let currentItem = value[i] //可能也是一个数组 [[[]]]
        currentItem.__ob__ && currentItem.__ob__.dep.depend()
        if (Array.isArray(currentItem)) {
            dependArray(currentItem) // 递归地去收集子项数组的依赖
        }
    }
}
methods.forEach(method => {
    arrayMethods[method] = function (...args) { // 函数劫持  切片编程
        let r = oldArrayProtoMethods[method].apply(this,args)
        let inserted
        switch(method){
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2) //执行splice，args是(index,count,args) 随意slice(2)获取args
                break
            default:
                break
        }
        if (inserted) observerArray(inserted)

        console.log('劫持数据方法成功')
        //** 数组方法调用时
        this.__ob__.dep.notify() // 通知视图更新
        return r
    }
})
