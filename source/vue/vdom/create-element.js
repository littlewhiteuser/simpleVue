// 虚拟节点相关方法
export function vnode(tag,props,key,children,text) {
    return {
        tag,
        props,
        key,
        children,
        text
    }
}
