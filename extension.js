
const vscode = require('vscode');
const sections = require('./dataBase2.js').sections;
const allKeys = require('./dataBase1.js').allKeys;
const values = require('./dataBase2.js').values;
const valueType = require('./dataBase2.js').valueType;

function activate(context) {
	console.log('Congratulations, extension "RWini" is now active!');


	// For Semantic Tokens
    const tokenTypes = ['customVariable,test'];
    const tokenModifiers = ['default'];
    const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

	class provider {
		provideDocumentSemanticTokens(){ 
		const builder = new vscode.SemanticTokensBuilder();
		/*let customVariables = new getCustomVariable(document);
		let allVariables = [];
		for(let variableType in customVariables){
			customVariables[variableType].forEach(variable=>allVariables.push(variable))
		};
		allVariables.forEach(variable=>{
			let pattern = new RegExp(variable,"g")
			console.log(variable);
			for (let matchedVariables of document.matchAll(pattern)){
				console.log(matchedVariables);
				let cuts = document.getText().substring(0,matchedVariables.index).split('\n');
				if (cuts[cuts.length-1].match(/setUnitMemory|defineUnitMemory|\@memory|updateUnitMemory/)!=null){
					let character = cuts[cuts.length-1].length;
					builder.push(cuts.length,character,matchedVariables.length,0,0);
				}
			}
		});*/
		builder.push(4,4,4,1,0);
		return builder.build();
		}
	};
    const semanticProvider = vscode.languages.registerDocumentSemanticTokensProvider('rwini',new provider,legend);
    
	function getIfMultiline(document,position){
		let number = 0;
		for (let line=0;line<position.line;line++){
			if (document.lineAt(line).text.match(/\"\"\"/g)!=null){number+=1}
		};
		if (number%2==1){return true}
		else{return false}
	}
		


	// For Auto-Completing
	const overrideProvider = vscode.languages.registerCompletionItemProvider('rwini',{
		provideCompletionItems(){return [new vscode.CompletionItem('.')]}
	});

	const sectionProvider = vscode.languages.registerCompletionItemProvider('rwini',{
		provideCompletionItems(document,position){
			let currentLine = document.lineAt(position).text;
			if (currentLine.match(/(?<![^ ]+ *)\[/)!=null && currentLine.indexOf('_')<0 && getIfMultiline(document,position)==false){
				return Object.keys(sections).map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Property)})
			}
		}
	},'[');

	function getSection(document,position){
		var offset = 0;
		while(finding!=0 && offset<100){
			var finding = document.lineAt(position.line-offset).text.match(/(?<![^ ]+ *)\[/);
			offset++;
			if (finding!=null){
				var begin = document.lineAt(position.line-offset+1).text.indexOf('[')
				if (document.lineAt(position.line-offset+1).text.indexOf('_')>0)
				    {var end = document.lineAt(position.line-offset+1).text.indexOf('_')}
					else
					{var end = document.lineAt(position.line-offset+1).text.indexOf(']')};
				var CS = document.lineAt(position.line-offset+1).text.substring(begin+1,end);

				let currentSection=''
				switch (CS) {
					case 'arm': currentSection='leg';
					break;
					case 'hiddenAction': currentSection='action';
					break;
					case 'global_resource': currentSection='resource';
					break;
					case 'comment': currentSection='';
					break;
					case 'template': currentSection='';
					break;
					default: currentSection=CS;
					break;
				}
				return currentSection;
			}
		};
	};

	function getCustomSections(sectionName,document){
		let allCustomSections = document.getText().match(/(?<=\n *\[)\w+/mg);
		let customSections = []
		allCustomSections.map(inputSection=>{
			if (inputSection.split('_')[0]==sectionName || (inputSection.split('_')[0]=='hiddenAction' && sectionName=='action')){
				var outputSection = inputSection.split('_')[1];
		        customSections.push(outputSection)
		    }
		});
		return customSections;
	}

	function getIfFirst(document,position){
		var offset = 0;
		while(finding!=' ' && finding!=':' && offset<50){
			var finding = document.lineAt(position).text.charAt(position.character-offset-1);
			offset++;
			if (finding==' ' || finding==':'){
				var currentValuePart = document.lineAt(position).text.substring(position.character-offset+1,position.character);
				if (currentValuePart.match(/\./g)==null){return true}
				else{return false}
			}
		};
	};

	class getCustomVariable {
		constructor(document){
		    var memoryNumber = document.getText().match(/(?<=number\[?\]? +)\w+|(?<=@memory +)\w+(?=: *number\[?\]?)/ig);
			if (memoryNumber == null){this.memoryNumber = []} else {this.memoryNumber = memoryNumber};
			var resourceNumber = document.getText().match(/(?<=\[resource_)\w+/ig);
			if (resourceNumber == null){this.resourceNumber = []} else {this.resourceNumber = resourceNumber};
		    var memoryFloat = document.getText().match(/(?<=float\[?\]? +)\w+|(?<=@memory +)\w+(?=: *float\[?\]?)/ig);
			if (memoryFloat == null){this.memoryFloat = []} else {this.memoryFloat = memoryFloat};
		    var memoryUnit = document.getText().match(/(?<=unit\[?\]? +)\w+|(?<=@memory +)\w+(?=: *unit\[?\]?)/ig);
			if (memoryUnit == null){this.memoryUnit = []} else {this.memoryUnit = memoryUnit};
			var memoryString = document.getText().match(/(?<=string +)\w+|(?<=@memory +)\w+(?=: *string)/ig);
			if (memoryString == null){this.memoryString = []} else {this.memoryString = memoryString};
			var memoryBool = document.getText().match(/(?<=boolean\[?\]? +)\w+|(?<=@memory +)\w+(?=: *boolean\[?\]?)/ig);
			if (memoryBool == null){this.memoryBool = []} else {this.memoryBool = memoryBool};
	    }
	};
    
	function getAllCustoms(document){
		var customValues = new getCustomVariable(document).memoryNumber.concat(new getCustomVariable(document).memoryFloat).concat(new getCustomVariable(document).memoryBool);
		return customValues.map(names=>{return new vscode.CompletionItem('memory.'.concat(names),vscode.CompletionItemKind.Constant)}).concat(
			   new getCustomVariable(document).resourceNumber.map(names=>{return new vscode.CompletionItem('resource.'.concat(names),vscode.CompletionItemKind.Constant)})).concat(
			   new getCustomVariable(document).memoryUnit.map(names=>{return new vscode.CompletionItem('memory.'.concat(names),vscode.CompletionItemKind.Field)})).concat(
			   new getCustomVariable(document).memoryString.map(names=>{return new vscode.CompletionItem('memory.'.concat(names),vscode.CompletionItemKind.Text)}))
	};


	const keyProvider = vscode.languages.registerCompletionItemProvider('rwini',{
		provideCompletionItems(document,position){
			let currentLine = document.lineAt(position).text;
			if (currentLine.match(/[:,#,_,[,@]/)==null && getIfMultiline(document,position)==false){
				let currentSection = getSection(document,position);
				let keysOfSection = Object.keys(allKeys[currentSection]);
			    return keysOfSection.map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Keyword)})
			}
		}
	},'.');

	const templateKeyProvider = vscode.languages.registerCompletionItemProvider('rwini',{
		provideCompletionItems(document,position){
			let currentLine = document.lineAt(position).text;
			if (currentLine.match(/[:,#,_,[]/)==null && getIfMultiline(document,position)==false){
			    return Object.keys(allKeys['template']).map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Module)})
			}
		}
	},'@');
    
	const commonValuesProvider = vscode.languages.registerCompletionItemProvider('rwini',{
        provideCompletionItems(document,position){
			let currentLine = document.lineAt(position).text;
            if (currentLine.match(/:/)!=null){
				let currentSection = getSection(document,position);
				let currentKey = currentLine.match(/(?<![^ ]+ *)\w+/);
				let currentValue = currentLine.substring(currentKey[0].length+1);
				let type = allKeys[currentSection][currentKey[0]][0];
				if (type.match(/(?<!unit)Ref/)==null){
					let completions 
					let values0 = [];
					switch (type) {
						case 'bool': if (currentValue.match(/[^ ]/)==null){
							completions = ['true','false'].map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Reference)});
						};
						break;
						case 'logicBoolean': if (currentValue.match(/[^ ]/)==null){
						    completions = ['true','false','if'].map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Reference)});
						};
						break;
						case 'memory': {
						    let customVariables = new getCustomVariable(document);
						    for(let variableType in customVariables){
								customVariables[variableType].forEach(variable=>values0.push(variable))
							};
							completions = values0.map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Variable)});
						};
						break;
					};
					return completions;
				}
				else{
					let sectionName = type.slice(0,-3);
					return getCustomSections(sectionName,document).map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Property)});
				}
			}
		}
	},':',' ',',');

    const firstProvider = vscode.languages.registerCompletionItemProvider('rwini',{
	    provideCompletionItems(document,position){
			let currentLine = document.lineAt(position).text;
			if (currentLine.match(/:/)!=null){
				let currentSection = getSection(document,position);
				let currentKey = currentLine.match(/(?<![^ ]+ *)\w+/);
				if (currentLine.match(/if/)!=null || ['dynamicFloat','unitRef'].includes(allKeys[currentSection][currentKey[0]][0]) ){
					let ifFirst = getIfFirst(document,position);
					if (ifFirst==true){
						return values['unitRef'].map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Field)}).concat(
							   values['function'].map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Function)})).concat(
							   getAllCustoms(document))
					}
				}
			}
	    }
    },':',' ');

	const secondProvider = vscode.languages.registerCompletionItemProvider('rwini',{
	    provideCompletionItems(document,position){
		    let currentLine = document.lineAt(position).text;
	        if (currentLine.charAt(position.character-1)=='.'){
				let currentSection = getSection(document,position);
				let currentKey = currentLine.match(/(?<![^ ]+ *)\w+/);
				if (currentLine.match(/if/)!=null || ['dynamicFloat','unitRef'].includes(allKeys[currentSection][currentKey[0]][0]) ){
					return values['propertyRef'].map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Constant)}).concat(
                           values['unitRef'].map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Field)})).concat(
						   values['boolRef'].map(names=>{return new vscode.CompletionItem(names,vscode.CompletionItemKind.Reference)})).concat(
						   new getCustomVariable(document).resourceNumber.map(names=>{return new vscode.CompletionItem('resource.'.concat(names),vscode.CompletionItemKind.Constant)}))
				}
			}
	    }
    },'.');



	// For Hover Prompts
	const keyHoverPrompt = vscode.languages.registerHoverProvider('rwini',{
	    provideHover(document,position){
			if(document.lineAt(position).text.indexOf(':')>position.character){
                var key = document.getText(document.getWordRangeAtPosition(position,/@?\w+/));
				var occurSections = [];
				var occurTypes = [];
				for(let section in allKeys){
					if (allKeys[section][key]!=undefined){
						occurSections.push(section);
						occurTypes.push(allKeys[section][key][0])
					}
					else{
						let MLKey = key.slice(0,-4);
						if (allKeys[section][MLKey]!=undefined){
							occurSections.push(section);
						    occurTypes.push(allKeys[section][MLKey][0])
						}
					}
				}
			    return new vscode.Hover(`section: [${occurSections}] , valueType: ${occurTypes}`);
			}
	    }
	});

	const valueHoverPrompt = vscode.languages.registerHoverProvider('rwini',{
	    provideHover(document,position){
            var value = document.getText(document.getWordRangeAtPosition(position));
			if(document.lineAt(position).text.indexOf(':')<position.character){
		        let valueInfo = valueType[value];
				if (valueInfo!=undefined){
			        return new vscode.Hover(`type: ${valueInfo[0]}`);
				}
				else{
					let customVariables = new getCustomVariable(document);
					for(let variable in customVariables){
						if (customVariables[variable].includes(value)){return new vscode.Hover(`type: ${variable}`)}
					}
				}
			}
	    }
	});



	// For Diagnostic
	const collection = vscode.languages.createDiagnosticCollection('rwiniKey');
	vscode.workspace.onDidChangeTextDocument(event=>{
		const diagnostics = [];
		const totalLineNumber = event.document.getText().split('\n').length;
		let allSections = event.document.getText().matchAll(/(?<=\n *\[)[^_\]]+/img);
		for(let section of allSections){
			if (sections[section[0]]==undefined){
				let cuts = event.document.getText().substring(0,section.index).split('\n');
				let character = cuts[cuts.length-1].length;
				let position = new vscode.Position(cuts.length-1,character);
				let endPosition = new vscode.Position(cuts.length-1,character+section[0].length);
				let range = new vscode.Range(position,endPosition);
				if (getIfMultiline(event.document,position)==false){
				    const diagnostic = new vscode.Diagnostic(range,`Unknown section: ${section[0]}`,vscode.DiagnosticSeverity.Error);
				    diagnostics.push(diagnostic)
				}
			}
		};
		for (let line=0;line<totalLineNumber;line++){
			let currentLine = event.document.lineAt(line).text;
			let currentKey = currentLine.match(/(?<![^ ]+ *)\w+/);
			if (currentKey!=null && currentKey[0].match(/[body|leg|arm|effect]_/)==null){
				let keyPostion = currentLine.indexOf(currentKey[0]);
				let position = new vscode.Position(line,keyPostion);
				let currentSection = getSection(event.document,position);
				if (allKeys[currentSection]!=undefined && currentSection!='' && getIfMultiline(event.document,position)==false){ 
					if (allKeys[currentSection][currentKey[0]]==undefined && allKeys[currentSection][currentKey[0].slice(0,-4)]==undefined){
						let endPosition = new vscode.Position(line,keyPostion+currentKey[0].length);
						let range = new vscode.Range(position,endPosition);
						const diagnostic = new vscode.Diagnostic(range,`Can not find key \'${currentKey}\' under section: ${currentSection}`,vscode.DiagnosticSeverity.Error);
						diagnostics.push(diagnostic)
					}
					else{
						let currentValue = currentLine.match(/(?<=(?<![^ ]+ *)\w+: *)[\w,\.]+/);
						if (currentValue!=null && currentValue[0].match(/\${.+}/)==null){
							let valuePostion = currentLine.indexOf(currentValue[0]);
							let position = new vscode.Position(line,valuePostion);
							let endPosition = new vscode.Position(line,valuePostion+currentValue[0].length);
							let range = new vscode.Range(position,endPosition);
							let EVT = allKeys[currentSection][currentKey[0]][0];
							const preDiagnostic = new vscode.Diagnostic(range,`Unexpected value:\'${currentValue}\'(type=\'${valueType[currentValue]}\'), Key: ${currentKey}(expectedType=\'${EVT}\')`,vscode.DiagnosticSeverity.Error);
							switch (EVT) {
								case 'bool': {
									if (valueType[currentValue]==undefined){diagnostics.push(preDiagnostic)}
									else{if (valueType[currentValue][0]!='bool'){diagnostics.push(preDiagnostic)}}
								};
								break;
								case 'int': {
									if (currentValue[0].match(/[^0-9]/)!=null){diagnostics.push(preDiagnostic)}
								};
								break;
								case 'float': {
									if (currentValue[0].match(/[^0-9\.]/)!=null){diagnostics.push(preDiagnostic)}
								};
								break;
							}
					    }
					}
				}
			}
		}
		collection.set(event.document.uri,diagnostics);
	})



	context.subscriptions.push(
		semanticProvider,

		overrideProvider,
		sectionProvider,
		keyProvider,
		templateKeyProvider,
		commonValuesProvider,
		firstProvider,
		secondProvider,

		keyHoverPrompt,
		valueHoverPrompt,

	);
}


function deactivate(){}
module.exports = {activate,deactivate}




