function print_stack() {
	var Exception = Java.use("java.lang.Exception");
	var ins = Exception.$new();
	// 传统的栈，是数组类型
	var straces = ins.getStackTrace();
	if (straces != undefined && straces != null) {
		//var strace = straces.toString();
		//var replaceStr = strace.replace(/,/g, \n);
		console.log("\n=============================Stack strat =======================");
		for (var i = 0; i < straces.length; i++) {
			// 栈中的类名,此类型是String
			var clazz = straces[i].getClassName();
			// 栈中的method,此类型是String
			var method = straces[i].getMethodName();
			// 遍历栈中包含类的所有方法，找到指定的method
			// theclazz类型是实例（对象）
			var theclazz = Java.use(clazz)
			var methods = theclazz.class.getMethods();
			for (var j = 0; j < methods.length; j++) {
				if (method == (methods[j].getName())) {
					// 把所有与method方法名重载的函数都打印出来(因为调用栈中不知道调用了哪个重载函数)
					// toGenericString返回一个描述此方法的字符串，包括类型参数
					let methods_str = methods[j].toGenericString();
					// 全限定名:java.lang.String
					let returnType = methods[j].getGenericReturnType().getTypeName();
					// 简单名:String
					// let returnType = methods[j].getReturnType().getSimpleName();
					let parameterTypes = methods[j].getParameterTypes().map(type => type.getTypeName()).join(", ");
					let methods_replacedString = methods_str.replace(returnType, "\u001B[32m" + returnType + "\u001B[0m");
					// todo取代标记括号内的参数类型
					// 使用正则表达式提取小括号内的字符串
					var pattern = /\((.*?)\)/;
					var match = methods_replacedString.match(pattern);
					if (match && match.length > 1) {
						var content = match[1];
						if (content && content.length > 1) {
							methods_replacedString = methods_replacedString.replace(/\([^()]+\)/, "(\x1b[31m" + parameterTypes + "\x1b[0m)");
						}
					}
					console.log(methods_replacedString);
				}
			}
		}
		console.log("=============================Stack end =======================\r\n");

		Exception.$dispose();
	}
}
function hook_java() {
	Java.perform(function () {
		let HelloJni = Java.use("com.example.hellojni.HelloJni");
		HelloJni["sign2"].implementation = function (str) {
			print_stack()
			console.log('sign2 is called');
			let ret = this.sign2(str);
			console.log('sign2 ret value is ' + ret);
			return ret;
		};
	});
}
function hook_native() {
}
function main() {
	hook_java();
	hook_native();
}
setImmediate(main);