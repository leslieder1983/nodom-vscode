# nodom

## 特性

### 语法高亮

nodom 为模块中的模板（ template）提供语法高亮。使之像原生的HTML。支持template**函数**以及 **``** 模板字符串。

#### 用法

```js
export class MRepeat extends Module {
    template() {
        return `
		<div> 我是模板的内容</div>
	`}
    //或者
    template = `
		<div> 我是模板的内容</div>
	`
}
```



### 代码片段

在编辑器中输入预制的关键词，可以帮助产生需要的代码。

#### 在HTML/JavaScript/TypeScript中

| 关键词               |                             描述                             |
| -------------------- | :----------------------------------------------------------: |
| nodom                |         生成nodom初始化代码（只有在HTML文件中有效）          |
| ncm                  |                     生成nodom模块类代码                      |
| ndf                  |                     生成methods内的函数                      |
| onCreate             |                 生成methods内的onCreate函数                  |
| onBeforeFirstRender  | Generate the nodom onBeforeFirstRender function(生成nodom onBeforeFirstRender函数) |
| onBeforeRenderToHtml | Generate the nodom onBeforeRenderToHtml function(生成nodom onBeforeRenderToHtml函数) |
| onBeforeRender       | Generate the nodom onBeforeRender function(生成nodom onBeforeRender函数) |
| onBeforeRenderToHTML | Generate the nodom onBeforeRenderToHTML function(生成nodom onBeforeRenderToHTML函数) |
| onFirstRender        | Generate the nodom onFirstRender function(生成nodom onFirstRender函数) |
| onRender             | Generate the nodom onRender function(生成nodom onRender函数) |
| onReceive            | Generate the nodom onReceive function(生成nodom onReceive函数) |

 比如生成一个nodom模块，在js/ts中输入ncm,待提示框显示，选择ncm(tab或回车)。即可生成如下代码：

 ```js
 import {Module} from '../js/nodom.js'

export class  extends Module {

   model = {
       
   }
   methods = {
       
   }
   template() {
       return `
           
       `
   }

}
 ```

 并且预留了数个待编辑位,依次输入即可。

### 代码提示

nodom为事件、指令、表达式提供了代码提示。并补全代码。关键字为：

**x-** 

**e-** 

**x-@@=**

 **e-@@=**

 **.**

* 当输入**x-**时，显示所有nodom支持的指令列表。
* 当输入**e-**时，显示常用的nodom事件列表。
* 在指令后输入**=**时，显示当前模块中model已定义的数据名。
* 在事件后输入**=**时，显示当前模块中methods内已定义的方法名。
* 在当前模块中model已定义数据后,在任意地方输入**.**可快速生成表达式。

示例：

如果model内有如下数据

```js
model = {
		num: 0,
		AA:1,
		add:'aa'
	}
```



在模板中输入**.**，即可根据选择快捷生成表达式

```js
{{num}} 或者{{AA}} 或者{{add}} 
```

在使用指令时可以快捷编写代码

```js
x-if={{AA}} 
```



### 自动闭合标签

在模板字符串中，可以自动闭合标签，包括自闭合标签与常规标签。

