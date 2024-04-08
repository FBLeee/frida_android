function bytesToHex(arr) {
    var str = '';
    var k, j;
    for (var i = 0; i < arr.length; i++) {
        k = arr[i];
        j = k;
        if (k < 0) {
            j = k + 256;
        }
        if (j < 16) {
            str += "0";
        }
        str += j.toString(16);
    }
    return str;
}



var allKeys = {};

Java.perform(function () {
    var cipher = Java.use("javax.crypto.Cipher");




    for (let index = 0; index < cipher.init.overloads.length; index++) {
        cipher.init.overloads[index].implementation = function () {
            allKeys[this.toString()] = arguments[1].getEncoded();
            this.init.apply(this, arguments);
        }
    }

    for (let index = 0; index < cipher.doFinal.overloads.length; index++) {
        cipher.doFinal.overloads[index].implementation = function () {
            var dict = {};
            if (this.opmode.value == 1) {
                dict["模式"] = "加密"; //模式 加密解密
            }
            else {
                dict["模式"] = "解密"; //模式 加密解密
            }

            dict["方法"] = this.transformation.value; //加密类型
            var iv = this.spi.value.engineGetIV();
            if (iv) {
                dict["iv"] = bytesToHex(iv);
            } else {
                dict["iv"] = "";
            }
            if (allKeys[this.toString()]) {
                dict["key"] = bytesToHex(allKeys[this.toString()])

            } else {
                dict["key"] = "";
            }
            var retVal = this.doFinal.apply(this, arguments);

            dict["明文"] = "";
            dict["密文"] = "";
            if (arguments.length >= 1 && arguments[0].$className != "java.nio.ByteBuffer") {
                if (this.opmode.value == 1) {
                    dict['明文'] = bytesToHex(arguments[0]);
                    dict["密文"] = bytesToHex(retVal);
                }
                else {
                    dict['密文'] = bytesToHex(arguments[0]);
                    dict["明文"] = bytesToHex(retVal);
                }

            }
            console.log(JSON.stringify(dict));
            return retVal;
        }
    }
})

