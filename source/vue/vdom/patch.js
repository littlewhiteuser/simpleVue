// 这个文件除了第一次的初始化渲染之外
// 还要做对比操作，更新dom

export function render(vnode, container) { // 让虚拟节点渲染成真实节点
    let el = createElm(vnode)
    container.appendChild(el)
    return el
}

// 创建真实节点的方法
function createElm(vnode) {
    let {tag,props,key,children,text} = vnode
    if(typeof tag === 'string') {
        // 说明tags是一个标签, 将真实节点赋值给虚拟节点vnode.el,一个虚拟节点，对应一个真实节点
        // 挂上真实节点，为后续做一个映射关系
        vnode.el = document.createElement(tag)
        updateProperties(vnode) // 更新el上的属性
        children.forEach(child => { // child是已经生成好的虚拟节点
            return render(child,vnode.el) // 递归渲染子节点成真实节点
        })
    }else {
        // 说明是一个文本
        vnode.el = document.createTextNode(text) // 生成一个文本节点
    }
    // 递归创建的过程
    console.log(vnode)
    return vnode.el
}

// 更新属性也会调用此方法
function updateProperties(vnode,oldProps={}) {
    // 文本没有属性，做个空处理
    let newProps = vnode.props || {}  // 获取当前节点中的属性
    let el = vnode.el // 真实节点

    // 根据新的虚拟节点，来修改dom元素
    let newStyle = newProps.style
    let oldStyle = oldProps.style
    for(let key in oldStyle){
        if (!newStyle[key]){
            el.style[key] = '' // style不能delete，只能置空或者removeAttribute
        }
    }

    // 因为是用新节点的属性来更新老节点
    // 所以如果是新节点中没有的属性，那么久直接删除
    for(let key in oldProps){
        if (!newProps[key]){
            delete el[key]
        }
    }

    for (let key in newProps) {
        // style可能包含的还是个对象，所以要继续处理
        if (key === 'style') {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName]
            }
        }else if (key === 'class') {
            el.className = newProps[key]
        } else {
            el[key] = newProps[key]
        }
    }
}

export function patch(oldVnode,newVnode) {
    // 1.先比对标签是否一样  replaceChild
    if (oldVnode.tag !== newVnode.tag){
        oldVnode.el.parentNode.replaceChild(createElm(newVnode),oldVnode.el)
    }
    // 2.标签一样，可能都是undefined，比较文本
    if (!oldVnode.tag){
        if (oldVnode.text !== newVnode.text){
            // textContent和innerText类似，但是节点操作一般用这个
            oldVnode.el.textContent = newVnode.text
        }
    }

    // 标签一样，可能属性不一样
    let el = newVnode.el = oldVnode.el // 标签一样，直接复用
    updateProperties(newVnode,oldVnode.props)

    // vue里必须要有一个根节点
    // 比价孩子
    let oldChildren = oldVnode.children || [];
    let newChildren = newVnode.children || [];

    // 新老都有孩子
    if (oldChildren.length>0&&newChildren.length>0){
        updateChildren(el,oldChildren,newChildren)
    }else if (oldChildren.length > 0) {
        el.innerHTML = ''
    }else if (newChildren.length > 0) {
        for (let i =0 ;i < newChildren.length;i++){
            let child = newChildren[i]
            el.appendChild(createElm(child))
        }
    }
    return el
}
function isSameVnode(oldVnode,newVnode) {
    // 如果新老的标签和key都相同，那么可以认为是同一个节点，可以服用节点
    // 这里的key比较，就是为什么不建议用索引作为key的原因
    // 例如反序，会因为tag和索引相同，而误认为是同一个，导致重新渲染，性能不高
    return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
}
function updateChildren(parent,oldChildren,newChildren) {
    // vue增加了很多优化策略，因为在浏览器中操作dom最常见的方法是
    // 开头或者结尾插入，涉及到正序和倒序
    let oldStartIndex = 0
    let oldStartVnode = oldChildren[0]
    let oldEndIndex = oldChildren.length -1
    let oldEndVnode = oldChildren[oldEndIndex]

    let newStartIndex = 0
    let newStartVnode = newChildren[0]
    let newEndIndex = newChildren.length - 1
    let newEndVnode = newChildren[newEndIndex]

    function makeIndexByKey(children) {
        let map = {}
        children.forEach((item, index) => {
            map[item.key] = index
        })
        return map
    }
    let map = makeIndexByKey(oldChildren)
    // 新老之中有一个结束循环，就跳出
    while(oldStartIndex<=oldEndIndex && newStartIndex<=newEndIndex){
        // 乱序比较中，会有将匹配到的old节点直接向前移动的情况，会在原位置补充一个undefined
        // 所以指针移动到undefined时，直接跳过
        if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        }
        //老的start和新的start相等时
        else if(isSameVnode(oldStartVnode, newStartVnode)) {
            patch(oldStartVnode, newStartVnode) // 用新属性来更新老属性
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            patch(oldStartVnode, newEndVnode)
            // 将oldStartVnode移动到尾部
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            patch(oldEndVnode, newStartVnode)
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else {
            // 乱序 不复用 最麻烦的情况
            let moveIndex = map[newStartVnode.key]
            if (moveIndex == undefined) {
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            } else {
                // 获取要移动的节点
                let moveVnode = oldChildren[moveIndex]
                oldChildren[moveIndex] = undefined
                patch(moveVnode, newStartVnode)
                parent.insertBefore(moveVnode.el, oldStartVnode.el)
            }
            // 将新节点的指针向后移动
            newStartVnode = newChildren[++newStartIndex]
        }
    }
    // 如果是新的vnode有剩余，说明需要将剩下的插入
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // parent.appendChild(createElm(newChildren[i]))
            // 可能是往前面插入，也可能是往后面插入，所以appendChild不合适
            // insertBefore(插入的元素，null) = appendChild

            // 获取被插入的元素，将尾指针+1，获得的是头或者null，null相当于尾部append
            // 往头部添加时，被插入元素已经在之前的对比中，和old内的节点复用了
            // 所以newChildren[newEndIndex+1]中也有el了，和old中的el是一样的，就可以直接使用了
            let ele = newChildren[newEndIndex+1] == null ? null : newChildren[newEndIndex+1].el
            parent.insertBefore(createElm(newChildren[i]), ele)
        }
    }

    // 如果是老的有剩余，就逐个删除非undefined的节点
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            let child = oldChildren[i]
            if (child != undefined) {
                parent.removeChild(child.el)
            }
        }
    }
    // 循环时，尽量不要使用索引作为key，可能会导致重新创建当前元素的所有子元素，影响性能
}
