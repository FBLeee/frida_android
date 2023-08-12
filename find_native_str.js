// color着色
var Color = {
    RESET: "\x1b[39;49;00m", Black: "0;01", Blue: "4;01", Cyan: "6;01", Gray: "7;01", Green: "2;01", Purple: "5;01", Red: "1;01", Yellow: "3;01",
    Light: {
        White: "0;11", Black: "4;11", Cyan: "6;11", Gray: "7;01", Green: "2;11", Purple: "5;11", Red: "1;11", Yellow: "3;11"
    }
};
var LOG = function (input, kwargs) {
    kwargs = kwargs || {};
    var logLevel = kwargs['l'] || 'log', colorPrefix = '\x1b[3', colorSuffix = 'm';
    if (typeof input === 'object')
        input = JSON.stringify(input, null, kwargs['i'] ? 2 : null);
    if (kwargs['c'])
        input = colorPrefix + kwargs['c'] + colorSuffix + input + Color.RESET;
    console[logLevel](input);
};


var TAG = "-------: ";

function Where(stack) {
    var at = ""
    for (var i = 0; i < stack.length; ++i) {
        at += stack[i].toString() + "\n " + TAG;
    }
    return at
}


function find_Natives() {
    let symbols = Module.enumerateSymbolsSync("libart.so");
    let addrRegisterNatives = null;
    let addrGetStringUTFChars = null;
    var addrNewStringUTF = null;

    for (let i = 0; i < symbols.length; i++) {
        let symbol = symbols[i];

        //_ZN3art3JNI15RegisterNativesEP7_JNIEnvP7_jclassPK15JNINativeMethodi
        if (symbol.name.indexOf("art") >= 0 &&
            symbol.name.indexOf("JNI") >= 0 &&
            symbol.name.indexOf("CheckJNI") < 0) {
            if (symbol.name.indexOf("RegisterNatives") >= 0) {
                addrRegisterNatives = symbol.address;
                console.log("RegisterNatives is at ", symbol.address, symbol.name);
                hook_RegisterNatives(addrRegisterNatives)
            }


            if (symbol.name.indexOf("GetStringUTFChars") >= 0) {
                addrGetStringUTFChars = symbol.address;
                console.log("addrGetStringUTFChars is at ", symbol.address, symbol.name);
                hook_GetStringUTFChars(addrGetStringUTFChars)
            }


            if (symbol.name.indexOf("NewStringUTF") >= 0) {
                addrNewStringUTF = symbol.address;
                console.log("addrNewStringUTF is at ", symbol.address, symbol.name);
                hook_NewStringUTF(addrNewStringUTF)
            }

        }
    }

}

function hook_RegisterNatives(addrRegisterNatives) {
    if (addrRegisterNatives != null) {
        Interceptor.attach(addrRegisterNatives, {
            onEnter: function (args) {
                let java_class = args[1];
                let class_name = Java.vm.tryGetEnv().getClassName(java_class);
                let methods_ptr = ptr(args[2]);
                let method_count = parseInt(args[3]);
                for (let i = 0; i < method_count; i++) {
                    let name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3));
                    let sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize));
                    let fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize * 2));

                    let name = Memory.readCString(name_ptr);
                    let sig = Memory.readCString(sig_ptr);
                    let symbol = DebugSymbol.fromAddress(fnPtr_ptr)
                    if (symbol.moduleName == "libxxxxxx.so") {
                        LOG("\r[*]" + "<" + symbol.moduleName + ">" + "java_class:" + class_name + " \tname:" + name + " \tfnOffset:" + symbol.name + "\tcallee:" + DebugSymbol.fromAddress(this.returnAddress) + "\tsig:" + sig + "\t(" + (i + 1) + "/" + parseInt(args[3]) + ")", { c: Color.Green });
                    }
                }
            }
        });
    }
}



function hook_GetStringUTFChars(addrGetStringUTFChars) {
    if (addrGetStringUTFChars != null) {
        Interceptor.attach(addrGetStringUTFChars, {
            onEnter: function (args) { },
            onLeave: function (retval) {
                if (retval != null) {
                    var bytes = Memory.readCString(retval);
                    console.log("[GetStringUTFChars] result:" + bytes);
                    // 在这过滤字符串
                }
            }
        });
    }
}



function hook_NewStringUTF(addrNewStringUTF) {
    if (addrNewStringUTF != null) {
        Interceptor.attach(addrNewStringUTF, {
            onEnter: function (args) {
                if (args[1] != null) {
                    var string = Memory.readCString(args[1]);

                    if (string != null) {
                        if (string.toString().indexOf("hello") >= 0) {
                            console.log("[NewStringUTF] bytes:" + string);

                            // jave层的堆栈
                            var threadef = Java.use('java.lang.Thread');
                            var threadinstance = threadef.$new();

                            var stack = threadinstance.currentThread().getStackTrace();
                            console.log("hook stcak: " + Where(stack));

                        }
                    }

                }
            },
            onLeave: function (retval) { }
        });
    }
}

function main() {
    find_Natives();
}



setImmediate(main);
