import Vue from 'vue'

let vm = new Vue({
    el:'#app',
    data(){
        return {
            msg:'hello',
            school: {name:'zf',age:11,sex:22},
            arr: [{a:1},[2],3],
            firstName: 'curry',
            lastName: 'stephen'
        }
    },
    computed: {
        fullName(){
            return this.firstName + this.lastName
        }
    },
    watch:{
        msg(newValue,oldValue){
            console.log(newValue,oldValue)
        }
    }
    // render(h){ // 内部会调用此render方法 将render方法中的this 变成当前实例
    //     return h('p',{id:'a'},this.msg)
    // }
})
// console.log(vm,'实例')
// console.log(vm.arr[0].a = 11)

setTimeout(()=>{
    // vm.msg = 'world'
    // console.log(1)
    // vm.msg = 'today'
    // console.log(2)
    // vm.msg = 'is'
    // console.log(3)
    // vm.msg = 'one'
    // console.log(4)
    // vue的特点就是数组批量更新，防止重复渲染

    // -----数组更新
    // vm.arr = [1]
    // vm.arr[0].a = 100
    // vm.arr[1].push(100)
    // vm.school.name = 'xxx'
    // vm.school = 'xx'
    // console.log(vm)
    // console.log(vm.msg)

    // ---- 更改watch
    // vm.msg = 'world'

    // ----更改计算属性
    vm.firstName = 'tony'

},1000)

// 什么样的数组会被观测
// [0,1,2] 不会，observe时第一步判断就会被return，直接改变索引不能被检测掉
// [1,2,3].length--  因为数组的长度变化，没有写监控

// [{a:1}] 内部会对数组里的对象进行监控
// [].push / shift unshift 这些方法可以被监控
// vm.$set 就是调用的数组的splice方法
