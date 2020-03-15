import Vue from 'vue'

let vm = new Vue({
    el: '#app',
    data() {
        return {
            msg: 'hello'
        }
    },
    render(h) {
        return h('p', {id: 'aa', class: 'bb'}, this.msg)
    }
})

setTimeout(() => {
    vm.msg = 'xxh'
}, 1000);