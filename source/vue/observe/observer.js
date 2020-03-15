import {observer} from "./index";
import {arrayMethods, observerArray,dependArray} from "./array";
import Dep from "./dep";

export function defineReactive(data,key,value) { // 核心方法，定义响应式的数据变化
    // vue不支持ie8以及ie8以下的浏览器
    // 如果value依旧是一个对象，需要深度观察，继续调observe
    // observer(value) // 递归观察
    let childOb = observer(value)
    // console.log(childOb,value)
    // 相同的属性用的是同一个dep
    let dep = new Dep()
    // let test = key + ':' + value
    // console.log(dep,'刚注册的dep',test)
    Object.defineProperty(data,key,{ // 可能是data = {arr:[{a:1},2,3]}
        //取了arr的值后，需要把其对应数组的依赖也收集起来，这样数组变化，页面才会更新
        //** 依赖收集
        get() {
            // console.log(dep,'访问时的dep',test)
            if (Dep.target) { //有值用的是渲染watcher
                // 我们希望存入的watcher不能重复，重复会造成更新时多次渲染å
                // dep.addSub(Dep.target) // 所以这样写不合适，只要获取属性的值就会一直添加
                dep.depend() // 想让dep中可以存放watcher，还想让这个watcher里可以存放dep
                // 是一个多对多的关系

                // 这里是为了给[{a:1},2,3]这个数组收集依赖,之前只是给arr做了依赖收集
                //
                if (childOb) { //** 数组的依赖收集
                    childOb.dep.depend() // 数组也收集了当前渲染watcher，这里的childOb.dep就是[{a:1},2,3].__ob__.dep

                    // 但是数组里面可能还有数组，所以要递归的去依赖收集
                    dependArray(value)
                }
            }
            return value
        },
        //** 通知依赖更新
        set(newValue) {
            if (newValue === value) return;
            observer(newValue) // 如果新增的是一个对象，也要监控
            // console.log(newValue)
            value = newValue
            dep.notify()
        }
    })
}

class Observer {
    constructor(data){ //data 对应我们刚才定义的vm._data
        //将用户的数据使用defineProperty重新定义
        this.dep = new Dep() // 此dep专门为数组而设定

        // 把这个Observer实例放到对象（包括数组）的__ob__属性上，目的是取到实例上的dep
        Object.defineProperty(data,'__ob__',{
            get:()=>this // this就是Observer实例
        })
        if (Array.isArray(data)) {
            // 修改数组的原型对象为改写后的
            data.__proto__ = arrayMethods // 拦截数组的方法
            // 调用数组的方法时，手动通知更新
            observerArray(data) // 拦截数组的每一项
        }else {
            this.walk(data)
        }
    }
    walk(data){
        let keys = Object.keys(data)
        for(let i =0;i < keys.length;i++){
            let key = keys[i] // 用户传入key
            let value = data[keys[i]] // 用户传入的值

            // 对每一个属性都进行defineProperty
            defineReactive(data,key,value)
        }
    }
}

export default Observer
