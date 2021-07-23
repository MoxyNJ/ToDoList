# 用 react 制作一个todolist

## 1 环境搭建

-   create-react-app 创建 react 脚手架
-   删除不需要的文件：



-   在 public 中，创建 index.html
-   在 src 中，创建 App.jsx、index.jsx



index.html 是最终展示页面的地址，是主页，有一个id= "root"的入口 div，react 最终会在这里渲染页面 。

index.jsx，引入：react、reeact-dom、App 组建后，这里作为React渲染主组件 App 的入口，将所有组件内容渲染到 index.html 的 root div 中。

App.jsx：是页面最外层的组件，所有组件的祖先组件，也就是说剩下的所有组件都放到 App 的内层中。



引入：Antd

