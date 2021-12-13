# Nodom
Nodom-Vscode插件提供了多种功能。

## 特性

### 语法高亮

Nodom 为模块中的模板代码（template方法返回的字符串）提供语法高亮。使之具有原生的HTML的语法高亮效果。支持模板字符串。
``` js
`example`
```

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
插件会将字符串内的代码高亮。


### 代码片段

在编辑器中输入预制的关键词，可以快速生成Nodom开发时所需的代码。

#### 在HTML/JavaScript/TypeScript中

| 关键词               |                             描述                             |
| -------------------- | :----------------------------------------------------------: |
| Nodom                |         生成Nodom初始化代码（只有在HTML文件中有效）          |
| ncm                  |                     生成Nodom模块类代码                      |
| ndf                  |                     生成methods内的函数                      |
| onBeforeFirstRender  | Generate the Nodom onBeforeFirstRender function(生成Nodom onBeforeFirstRender函数) |
| onBeforeRenderToHtml | Generate the Nodom onBeforeRenderToHtml function(生成Nodom onBeforeRenderToHtml函数) |
| onBeforeRender       | Generate the Nodom onBeforeRender function(生成Nodom onBeforeRender函数) |
| onBeforeRenderToHTML | Generate the Nodom onBeforeRenderToHTML function(生成Nodom onBeforeRenderToHTML函数) |
| onFirstRender        | Generate the Nodom onFirstRender function(生成Nodom onFirstRender函数) |
| onRender             | Generate the Nodom onRender function(生成Nodom onRender函数) |
| beforeUnActive       | Generate the Nodom beforeUnActive function(生成Nodom beforeUnActive函数) |
| unActive            | Generate the Nodom unActive function(生成Nodom unActive函数) |

> 比如初始化一个Nodom模块，在js/ts文件内输入ncm,待提示框显示，选择ncm(按下tab或回车键)。即可生成如下代码：

 ```js
import {Module} from '../js/nodom.js'
   
   export default class   extends Module {
   
	  data() {
		return {
		 
		}
	  }
	  template() {
		  return `
		  
		  `
	  }
   }
 ```

 并且预留了数个待编辑位,编写完毕按下`Tab`键，依次输入即可。

### 代码提示/补全

Nodom为事件、指令、表达式功能提供了代码提示，并补全代码。触发该功能的关键字为：`e-`,`x-`,`=`,`.`,`<`。

* 当输入`x-`时，显示所有Nodom支持的指令。
* 当输入`e-`时，显示常用的Nodom事件。
* 在指令后输入`=`时，显示当前模块中data已定义的数据名。
* 在事件后输入`=`时，显示当前模块内已定义的方法名。
* 在任意区域输入`.`时，可快速生成包含数据的表达式。
* 在模板代码中输入`<`时，显示所有可用的自定义元素名称，以及通过用户通过`import`引入的模块名。 
  
**以上所有的提示内容，选择提示内容即可自动补全代码。(Tab键或回车键)**  

#### 示例：

如果data内有如下数据：

```js
data = {
		num: 0,
		AA:1,
		add:'aa'
	}
```
  
在模板中输入`.`，即可根据选择快捷生成表达式代码:

```js
{{num}} 或者{{AA}} 或者{{add}} 
```

编写模板代码时,在模板中输入`x-`,快速生成指令代码:

```js
x-if={{AA}} 
```  

编写模板代码时,在模板中输入`<`,快速生成自定义元素代码：

```html
 <else  cond=''></else>
```


### 自动闭合标签

插件提供自动闭合功能，可以自动闭合标签。包括：自闭合标签与常规标签。

