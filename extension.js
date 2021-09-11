const vscode = require('vscode');
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

	if (!lineText.endsWith('x-') && !lineText.endsWith('e-') && !lineText.endsWith('=') && !lineText.endsWith('.')) {
		return undefined;
	}
	// 简单匹配 class 6 event 22 field 4 TypeParameter 24 keyword 13 method 1 value 11
	if (/\x\-$/g.test(lineText)) {
		const dependencies = ['x-repeat', 'x-show', "x-if", "x-else","x-elseif","x-data","x-field", "x-module", "x-model", "x-route", "x-router","x-animation","x-plug","x-recur","x-validity"];
		return dependencies.map(dep => {
			// vscode.CompletionItemKind 表示提示的类型 
			let item = new vscode.CompletionItem(dep, 24);
			 item.insertText = languages === 'html' ? dep : dep.substr(2);
			item.documentation = new vscode.MarkdownString(`nodom ${dep.substr(2)} directive`);
			return item;
		})
	} else if (/\e\-$/g.test(lineText)) {
		const Dependencies = ['e-click', 'e-touchstart', "e-mousemove", "e-mouseout", "e-mouseover", "e-change", "e-focus", "e-mousedown"];
		return Dependencies.map(dep => {
			let item = new vscode.CompletionItem(dep, 22);
			item.insertText = languages === 'html' ? dep : dep.substr(2);
			item.documentation = new vscode.MarkdownString(`nodom ${dep.substr(2)} event`);
			return item;
		})
	} 
	else{
		const text = document.getText();
			handlesDep(text);
			//表达式
		if (/\.$/g.test(lineText)) {
			const Dependencies = [];
			for (const item in Module.model) {
				Dependencies.push(item);
			}
			return Dependencies.map(dep => {
				let item = new vscode.CompletionItem(dep, 4);
				item.insertText = "{{" + dep + "}}";
				item.documentation = new vscode.MarkdownString(`nodom ${dep.substr(2)} expression`);
				return item;
			})
		}
		/**
		 * x-指令取得data
		 */
		else if (/x\-\w+\=$/g.test(lineText)) {
			const Dependencies = [];
			for (const item in Module.model) {
				Dependencies.push(item);
			}
			return Dependencies.map(dep => {
				let item = new vscode.CompletionItem(dep, 11);
				item.insertText = "{{" + dep + "}} ";
				return item;
			});
		}
		/**
		 * e-开头的事件
		 */
		else if (/e\-\w+\=$/g.test(lineText)) {
			const Dependencies = [];
			for (const item in Module.methods) {
				Dependencies.push(item);
			}
			return Dependencies.map(dep => {
				let item = new vscode.CompletionItem(dep, 11);
				item.insertText = "\"" + dep + "\"";
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
	let con = str.substring(0, str.indexOf('extends')) + '{';
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
	const obj = new Function('return ' + con)(); //模块对象
	if (typeof obj == 'function') {
		Module = Reflect.construct(obj, []);
	}

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
	}, '-', '=', '.');

	let auto = vscode.workspace.onDidChangeTextDocument(event => {
		insertAutoCloseTag(event);
		deleteDot(event);
	});
	context.subscriptions.push(comp, auto);

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