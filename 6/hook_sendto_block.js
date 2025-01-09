var TAG = "ffcmb: ";
console.log(TAG + 'Android cmb 6');

function Where(stack) {
    var at = ""
    for (var i = 0; i < stack.length; ++i) {
        at += stack[i].toString() + "\n " + TAG;
    }
    return at
}


function print_arg(addr) {
    try {
        var range = Process.findRangeByAddress(addr);
        if (range != null) {
            return hexdump(addr) + '\n';
        } else {
            return ptr(addr) + '\n';
        }
    } catch (error) {
        return ptr(addr) + '\n';
    }
}

// bytes转大端数据
function bytesToBigNum(bytes) {
    var val = 0;
    for (var i = 0; i < bytes.length; i++) {
        val += bytes[i];
        if (i < bytes.length - 1) {
            val = val << 8;
        }
    }
    return val;
}

// 数字转ip
function numToIp(number) {
    var ip = number % 256;
    for (var i = 0; i < 3; i++) {
        number = Math.floor(number / 256);
        ip = number % 256 + '.' + ip;
    }
    return ip;
}



function hook_sendto() {
    Interceptor.attach(Module.findExportByName('libc.so', 'sendto'), {
        onEnter: function (args) {
            // jave层的堆栈
            var threadef = Java.use('java.lang.Thread');
            var threadinstance = threadef.$new();
            var stack = threadinstance.currentThread().getStackTrace();

            var n = args[2].toUInt32();
            console.log('----------sendto start------------------' + '\nsendto fd=' + args[0] + '\nsendto buf len=' + args[2] + '\nsendto buf=' + hexdump(args[1], { length: n }), '\nsendto addrlen=' + args[5], '\nArtMethod Invoke: ' + 'sendto' + ' called from:\n' +
                Thread.backtrace(this.context, Backtracer.ACCURATE)
                    .map(DebugSymbol.fromAddress).join('\n') + '\n' + "\nJava层调用栈 " + Where(stack) + '\nsendto flags=' + args[3] + '\n----------sendto end------------------\r\n');
        },
    })
}
function hook_native() {

    // var base_ibxxx = Module.findBaseAddress("libxxx.so");
    // var sub_xxx = base_ibxxx.add(0xxxx);
    // Interceptor.attach(sub_xxx, {
    //  onEnter: function (args) {
    //      this.args0 = args[0];
    //      this.args1 = args[1];
    //      this.args2 = args[2];
    //      console.log("setValue called from:" +Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n') + '\n');
    //      console.log("this.args0: ", this.args0);
    //  },
    //  onLeave: function (retval) {
    //  }
    // })
}

function main() {
    hook_sendto();
    // hook_native();
}

setImmediate(main);