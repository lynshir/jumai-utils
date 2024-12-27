{
  "compilerOptions": {
    "target": "es2020", //指定ECMAScript目标版本
    "module": "esnext", //指定生成哪个模块系统代码
    "moduleResolution": "node", //决定如何处理模块
    "importHelpers": true, //从 tslib 导入辅助工具函数（比如 __extends， __rest等）
    "jsx": "react",
    "esModuleInterop": true, //自动增加默认导出项
    "sourceMap": true, //生成相应的 .map文件
    "baseUrl": "./", //解析非相对模块名的基准目录
    "strict": false, //启用所有严格类型检查选项
    "allowSyntheticDefaultImports": true, //允许从没有设置默认导出的模块中默认导入
    "outDir": "dist", //重定向输出目录
    "forceConsistentCasingInFileNames": true, //禁止对同一个文件的不一致的引用
    "noImplicitReturns": true, //不是函数的所有返回路径都有返回值时报错
    "suppressImplicitAnyIndexErrors": true, //阻止 --noImplicitAny对缺少索引签名的索引对象报错
    "noUnusedLocals": false, // 有未使用的变量时，抛出错误
    "allowJs": true, // 允许编译 javascript 文件
    "skipLibCheck": true, //忽略所有的声明文件（ *.d.ts）的类型检查
    "resolveJsonModule": true, //导入 JSON Module
    "isolatedModules": false, //将每个文件作为单独的模块
    "noEmit": true, //不生成输出文件
    "useDefineForClassFields": false,
    "experimentalDecorators": true, //启用实验性的ES装饰器
    "emitDecoratorMetadata": false, //给源码里的装饰器声明加上设计类型元数据
    "noImplicitAny": false, //在表达式和声明上有隐含的 any类型时报错
    "strictNullChecks": false, //在严格的 null检查模式下， null和 undefined值不包含在任何类型里，只允许用它们自己和 any来赋值（有个例外， undefined可以赋值到 void）
    "noImplicitThis": false, //当 this表达式的值为 any类型的时候，生成一个错误
    "alwaysStrict": false //以严格模式解析并为每个源文件生成 "use strict"语句
  },
  "include": ["src"],
  "exclude": ["node_modules", "lib", "es", "dist", "docs"]
}
