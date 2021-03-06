const vscode = require('vscode');
const nodom = require('./dist/nodom.cjs');
const nodomKeys = Reflect.ownKeys(nodom);
const fs = require('fs/promises');
const path = require('path');
//new function 需要 不可删除
const NM = nodom.Module;
console.log(NM);
const elements = [...nodom.DefineElementManager.elements.keys()].map((v) => {
	return v.toLowerCase()
});
const directives = [...nodom.DirectiveManager.directiveTypes.keys()];
let Module;
/**
 * 自动提示实现
 * 
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 * @param {*} context 
 */
function provideCompletionItems(document, position, ) {
	const languages = document.languageId;
	const line = document.lineAt(position);
	// 只截取到光标位置
	const lineText = line.text.substring(0, position.character);


	if (!/(x-|e-|=|\.|\<)$/.test(lineText)) {
		return undefined;
	}
	// 简单匹配 class 6 event 22 field 4 TypeParameter 24 keyword 13 method 1 value 11
	if (/\x\-$/g.test(lineText)) {
		//指令
		const dependencies = directives.map(v => 'x-' + v);
		return dependencies.map(dep => {
			// vscode.CompletionItemKind 表示提示的类型 
			let item = new vscode.CompletionItem(dep, 24);
			item.insertText = languages === 'html' ? dep : dep.substr(2);
			item.documentation = new vscode.MarkdownString(`nodom ${dep.substr(2)} directive`);
			return item;
		})
	} else if (/\e\-$/g.test(lineText)) {
		//事件
		const Dependencies = ['e-click', 'e-touchstart', "e-mousemove", "e-mouseout", "e-mouseover", "e-change", "e-focus", "e-mousedown"];
		return Dependencies.map(dep => {
			// 22
			let item = new vscode.CompletionItem(dep, 1);
			item.insertText = languages === 'html' ? dep : dep.substr(2);
			item.documentation = new vscode.MarkdownString(`nodom ${dep.substr(2)} event`);
			return item;
		})
	} else if (/\<$/g.test(lineText)) {
		//查找默认导出
		const text = document.getText();
		let regImp = /import\s*([{}\w\s\,]+?)from\s*['"]([^'"]*?)['"]/g;
		let res, con = [];
		while ((res = regImp.exec(text)) !== null) {
			let ans = res[1].trimEnd();
			if (ans.includes(',') || ans.includes('{')) {
				//默认导出
				if (/^[\w\s]+\,/.test(ans)) {
					let index = ans.indexOf(',');
					con.push(ans.substring(0, index));
					ans = ans.substr(index + 1);
				}
			} else {
				con.push(ans.trim());
			}

		}
		let registerModules = /registModule\s*\(\s*(\w+)\s*,/g;

		while ((res = registerModules.exec(text)) !== null) {
			con.push(res[1].trim());
		}
		//标签提示
		let diy = elements.map(dep => {
			let item = new vscode.CompletionItem(dep, 12);
			item.insertText = new vscode.SnippetString(dep + '  cond=${1}>${0}</' + dep + '>');
			item.documentation = new vscode.MarkdownString(`nodom ${dep} 自定义元素`);
			return item;
		});
		if (con.length > 0) {
			//过滤Nodom关键字
			con = con.filter((value) => {
				if (nodomKeys.includes(value)) {
					return false;
				}
				return true;
			});

			return con.map(key => {
				key = key.trim();
				let item = new vscode.CompletionItem(key, 6);
				item.insertText = new vscode.SnippetString(key + '>${1}</' + key + '>');
				item.documentation = new vscode.MarkdownString(`nodom ${key} 模块`);
				return item;
			}).concat(diy);
		} else {
			return diy;
		}


	} else {
		//提示数据
		const text = document.getText();
		handlesDep(text);
		const methods = [];
		let b = Reflect.getPrototypeOf(Module);
		let keys = Object.getOwnPropertyNames(b).concat(Object.keys(Module));
		keys.forEach(v => {
			if (typeof Module[v] === 'function' && !['constructor', 'template', 'data'].includes(v)) {
				methods.push(v);
			}
		});
		//表达式
		if (/\.$/g.test(lineText)) {
			const Dependencies = [];
			for (const item in Module.data()) {
				Dependencies.push(item);
			};
			return Dependencies.map(dep => {
				let item = new vscode.CompletionItem(dep, 4);
				item.insertText = "{{" + dep + "}}";
				item.documentation = new vscode.MarkdownString(`Nodom ${dep.substr(2)} expression`);
				return item;
			});
		}
		/**
		 * x-指令取得data
		 */
		else if (/x\-\w+\=$/g.test(lineText)) {
			const Dependencies = [];
			for (const item in Module.data()) {
				Dependencies.push(item);
			}
			return Dependencies.map(dep => {
				let item = new vscode.CompletionItem(dep, 11);
				item.insertText = "{{" + dep + "}} ";
				item.documentation = new vscode.MarkdownString(`Nodom Model数据： ${dep} `);
				return item;
			});
		}
		/**
		 * e-开头的事件
		 */
		else if (/e\-\w+\=$/g.test(lineText)) {
			return methods.map(dep => {
				let item = new vscode.CompletionItem(dep, 11);
				item.insertText = "\"" + dep + "\"";
				item.documentation = new vscode.MarkdownString(`Nodom 模块方法： ${dep} `);
				return item;
			})
		}

	}

}
//处理模块依赖
function handlesDep(text) {
	const front = text.indexOf('class');
	const last = text.length;
	let str = text.substring(front, last);
	let index = 0;
	//去除继承关系
	// let con = str.substring(0, str.indexOf('extends')) + '{';
	// str = str.substring(str.indexOf('{') + 1);
	let con = '{';
	str = str.substring(str.indexOf('{') + 1);
	let arr = ['{']
	while (arr.length != 0) {
		if (str[index] == '{') {
			arr.push('{');
			con += str[index];
			index++;
		} else if (str[index] == '}') {
			con += str[index];
			index++;
			arr.pop();
		} else {
			con += str[index];
			index++;
		}
	};

	// const obj = new Function('return class A ' + con)(); //模块对象
	// if (typeof obj == 'function') {
	// 	Module = Reflect.construct(obj, []);
	// }
	let res = eval('(function(){return class Exp extends NM' + con + '})()');
	Module = Reflect.construct(res, []);
}

/**
 * 光标选中当前自动补全item时触发动作，一般情况下无需处理
 * @param {*} item 
 * @param {*} token 
 */
function resolveCompletionItem() {
	return null;
}


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let comp = vscode.languages.registerCompletionItemProvider(['javascript', 'typescript', 'html'], {
		provideCompletionItems,
		resolveCompletionItem
	}, '-', '=', '.', '<');

	let auto = vscode.workspace.onDidChangeTextDocument(event => {
		// provideItem(event);
		insertAutoCloseTag(event);
		deleteDot(event);
	});
	//Todo格式化

	// 创建module
	const createModule = vscode.commands.registerCommand(
		'createModule',
		(uri) => {
			// 如果右键点击文件夹，这里就是文件夹的路径
			const dirPath = uri.fsPath;
			// 需要实现一个生成index.ts文件的函数
			genModule(dirPath);
		}
	);


	// 注册到监听队列中
	context.subscriptions.push(comp, auto, createModule);

}

function genModule(url) {
	vscode.window.showInputBox({ // 这个对象中所有参数都是可选参数
		ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
		placeHolder: '输入模块名', // 在输入框内的提示信息
		prompt: '创建模块名同名模块', // 在输入框下方的提示信息
	}).then(function (msg) {
		let str = `import {Module} from 'nodom3';

export default class ${msg} extends Module {
    data() {
        return {

        }
    }
    template(props) {
        return \`
				<div>
		
				</div>
			   \`
    }
}`
		fs.writeFile(path.join(url, msg + '.js'), str, (err) => console.log(err));
	});
}

/***
 * 处理表达式的点
 */
function deleteDot(event) {
	//只处理点
	if (!event.contentChanges[0] || !/^\{{2}.*\}{2}$/.test(event.contentChanges[0].text)) {
		return;
	}
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	let selection = editor.selection;
	//光标
	let originalPosition = selection.start.translate(0, -1);
	editor.edit((editBuilder) => {
		editBuilder.delete(new vscode.Range(originalPosition, selection.start));
	})
}

function insertAutoCloseTag(event) {

	if (!event.contentChanges[0]) {
		return;
	}
	let isRightAngleBracket = CheckRightAngleBracket(event.contentChanges[0]);
	if (!isRightAngleBracket && event.contentChanges[0].text !== "/") {
		return;
	}

	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}

	let config = vscode.workspace.getConfiguration('nodom', editor.document.uri);
	if (!config.get("enableAutoCloseTag", true)) {
		return;
	}

	let languageId = editor.document.languageId;
	let languages = config.get("activationOnLanguage", ["*"]);
	let disableOnLanguage = config.get("disableOnLanguage", []);
	if ((languages.indexOf("*") === -1 && languages.indexOf(languageId) === -1) || disableOnLanguage.indexOf(languageId) !== -1) {

		return;
	}

	let selection = editor.selection;
	//光标
	let originalPosition = selection.start.translate(0, 1);
	let excludedTags = config.get("excludedTags", []);
	let isSublimeText3Mode = config.get("SublimeText3Mode", false);
	let enableAutoCloseSelfClosingTag = config.get("enableAutoCloseSelfClosingTag", true);
	let isFullMode = config.get("fullMode");

	if ((isSublimeText3Mode || isFullMode) && event.contentChanges[0].text === "/") {
		let text = editor.document.getText(new vscode.Range(new vscode.Position(0, 0), originalPosition));
		let last2chars = "";
		if (text.length > 2) {
			last2chars = text.substr(text.length - 2);
		}
		if (last2chars === "</") {
			let closeTag = getCloseTag(text, excludedTags);
			if (closeTag) {
				let nextChar = getNextChar(editor, originalPosition);
				if (nextChar === ">") {
					closeTag = closeTag.substr(0, closeTag.length - 1);
				}
				editor.edit((editBuilder) => {
					editBuilder.insert(originalPosition, closeTag);
				}).then(() => {
					if (nextChar === ">") {
						editor.selection = moveSelectionRight(editor.selection, 1);
					}
				});
			}
		}
	}
	//不是</ >,或自闭合标签
	if (((!isSublimeText3Mode || isFullMode) && isRightAngleBracket) ||
		(enableAutoCloseSelfClosingTag && event.contentChanges[0].text === "/")) {
		let textLine = editor.document.lineAt(selection.start);
		let text = textLine.text.substring(0, selection.start.character + 1);
		let result = /<([_a-zA-Z][a-zA-Z0-9:\-_.]*)(?:\s+[^<>]*?[^\s/<>=]+?)*?\s?(\/|>)$/.exec(text);

		if (result !== null && ((occurrenceCount(result[0], "'") % 2 === 0) &&
				(occurrenceCount(result[0], "\"") % 2 === 0) && (occurrenceCount(result[0], "`") % 2 === 0))) {
			if (result[2] === ">") {
				//1,tagname
				if (excludedTags.indexOf(result[1].toLowerCase()) === -1) {
					editor.edit((editBuilder) => {
						editBuilder.insert(originalPosition, "</" + result[1] + ">");
					}).then(() => {
						editor.selection = new vscode.Selection(originalPosition, originalPosition);
					});
				}
			} else {
				if (textLine.text.length <= selection.start.character + 1 || textLine.text[selection.start.character + 1] !== '>') { // if not typing "/" just before ">", add the ">" after "/"
					editor.edit((editBuilder) => {
						if (config.get("insertSpaceBeforeSelfClosingTag")) {
							const spacePosition = originalPosition.translate(0, -1);
							editBuilder.insert(spacePosition, " ");
						}
						editBuilder.insert(originalPosition, ">");
					})
				}
			}
		}
	}
}

function CheckRightAngleBracket(contentChange) {
	return contentChange.text === ">" || CheckRightAngleBracketInVSCode_1_8(contentChange);
}

function CheckRightAngleBracketInVSCode_1_8(contentChange) {
	return contentChange.text.endsWith(">") && contentChange.range.start.character === 0 &&
		contentChange.range.start.line === contentChange.range.end.line &&
		!contentChange.range.end.isEqual(new vscode.Position(0, 0));
}

function getCloseTag(text, excludedTags) {
	let regex = /<(\/?[_a-zA-Z][a-zA-Z0-9:\-_.]*)(?:\s+[^<>]*?[^\s/<>=]+?)*?\s?>/g;
	let result = null;
	let stack = [];
	while ((result = regex.exec(text)) !== null) {
		let isStartTag = result[1].substr(0, 1) !== "/";
		let tag = isStartTag ? result[1] : result[1].substr(1);
		if (excludedTags.indexOf(tag.toLowerCase()) === -1) {
			if (isStartTag) {
				stack.push(tag);
			} else if (stack.length > 0) {
				let lastTag = stack[stack.length - 1];
				if (lastTag === tag) {
					stack.pop()
				}
			}
		}
	}
	if (stack.length > 0) {
		let closeTag = stack[stack.length - 1];
		if (text.substr(text.length - 2) === "</") {
			return closeTag + ">";
		}
		if (text.substr(text.length - 1) === "<") {
			return "/" + closeTag + ">";
		}
		return "</" + closeTag + ">";
	} else {
		return null;
	}
}

function getNextChar(editor, position) {
	let nextPosition = position.translate(0, 1);
	let text = editor.document.getText(new vscode.Range(position, nextPosition));
	return text;
}

function moveSelectionRight(selection, shift) {
	let newPosition = selection.active.translate(0, shift);
	let newSelection = new vscode.Selection(newPosition, newPosition);
	return newSelection;
}

function occurrenceCount(source, find) {
	return source.split(find).length - 1;
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}