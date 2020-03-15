## 虚拟dom渲染和diff比较的思路

- 根据dom的结构，定义一个生成虚拟dom的方法h
  这个方法包含的参数（tag，props，...children）
  区分children的类型，object和文本，定义一个vnode方法，对应返回一个对象

- 将生成的虚拟dom（一般用vnode指代），递归地去生成真实dom，插入到页面中
  并在vnode中添加一个el属性，映射到对应的真实dom
  在递归过程中，vnode.el就可以作为children的父节点，往里面append对应的child

- 将vnode上的props属性更新上el上，对一些特殊的单独判断处理，比如
  style是个对象，要循环，class要通过el.className添加，on通过addListeners添加

- 更新时，用新的属性去更新老的属性
    - 老的中有属性，新的中没有
    - 老的style中有，新的style中没有

- 比对新老vnode
  - 标签不一样，replaceChild
  - 标签一样，可能是undefined，是的话直接替换文本
  - 标签一样，属性不一样，复用标签，updateProperties属性
  - 开始比对children
  - 老的新的都有孩子，走核心方法，updateChildren
  - 老的有孩子，新的没孩子
  - 老的没孩子，新的有孩子

- updateChildren，双指针比对
  - 比对新老的startVnode，头指针后羿
  - 比对新老的endVnode，尾指针前移
  - 比对老的startVnode和新的endVnode，老的头指针后移（并将startVnode插入到尾指针后面），新的尾指针前移
  - 比对老的endVnode和新的startVnode
  - 最后乱序比较

    