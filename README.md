# 整合一些Android frida 常用脚本

## 1.FRIDA_Android_Print_stack
    hook_stack.js
    美化frida打印安卓java调用栈，显示参数列表，返回值等等，并加上颜色，以此快速定位调用方法

### 效果
![image](https://github.com/FBLeee/FRIDA_Android_Print_stack/assets/50468890/c2250203-a273-4c5d-84de-e66186d482b5)

****  

## 2.FRIDA_Android_find_native_str
    find_native_str.js
    启动调试，过滤native层的相关字符串和打印so文件的未导出函数

### 效果
![image](https://github.com/FBLeee/frida_android_print_stack/assets/50468890/3a078c8f-dd23-4356-b981-15d6b7297d20)


**** 
## 3.FRIDA_Android_hook_native_reg
    hook_reg.js
    hook native层指定地址的寄存器的值（辅助动态调试）

****
## 4.frida反调试

### 4.1 https://github.com/thinkerMid
    ① bilibiliAntiantifrida.js   
    ② anti_frida_root.js （bangbang）

## 5.通杀常用对称加密算法
	dec.js
	
### 效果
 ![image](https://github.com/FBLeee/frida_android/assets/50468890/68f4bc6c-7466-4477-83c6-1bfaa9417a8d)

 ## 6.sendto和recvfrom
 	hook_recvfrom.js
  	hook_sendto.js

	


