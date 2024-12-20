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
            console.log('----------sendto start------------------');
            console.log('sendto fd=' + args[0]);
            console.log('sendto buf len=' + args[2]);
            var n = args[2].toUInt32();
            console.log('sendto buf=' + hexdump(args[1], { length: n }));
            console.log('sendto flags=' + args[3]);
            //console.log('sendto dest_addr'+print_arg(args[4]));
            try {
                console.log('sendto dest_addr.sin_port=' + bytesToBigNum(new Uint8Array(ptr(args[4]).add(2).readByteArray(2)))); // 端口号,大端存储
                n = bytesToBigNum(new Uint8Array(ptr(args[4]).add(4).readByteArray(4))); // ip,大端存储
                console.log('sendto dest_addr.sin_addr=' + numToIp(n));
            } catch (errors) {
                console.log(errors);
                console.log(print_arg(args[4]));
            }

            console.log('sendto addrlen=' + args[5]);
            console.log('ArtMethod Invoke: ' + 'sendto' + ' called from:\n' +
                Thread.backtrace(this.context, Backtracer.ACCURATE)
                    .map(DebugSymbol.fromAddress).join('\n') + '\n');
            console.log('----------sendto end------------------');
        },
    })
}



function hook_java() {
    Java.perform(function () {
    });
}

function hook_native() {

    // var base_ibxxx = Module.findBaseAddress("libxxx.so");
    // var sub_xxx = base_ibxxx.add(0xxxx);
    // Interceptor.attach(sub_xxx, {
    // 	onEnter: function (args) {
    // 		this.args0 = args[0];
    // 		this.args1 = args[1];
    // 		this.args2 = args[2];
    // 		console.log("setValue called from:" +Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n') + '\n');
    // 		console.log("this.args0: ", this.args0);
    // 	},
    // 	onLeave: function (retval) {
    // 	}
    // })
}

function main() {
    // hook_java();
    // hook_native();
    hook_sendto();
}

setImmediate(main);