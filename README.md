![](https://github.com/g122622/gcrypt/blob/image-data/badge.svg)

# gcrypt

这是我高中时期做的项目。总的来说，隐域是一个基于OpenSSL的数据加密软件，用来加密和存放那些你觉得应该加密的文件。

在隐域，你的数据通过"加密库"来统一管理。比如，如果你想加密电脑上的若干文件和文件夹，你只需要创建一个带密码的加密库，再将文件直接拖入。

与VMWare虚拟机的虚拟磁盘文件类似，一个加密库对应物理硬盘上一个.gcrypt文件，但在这个文件中可以包含上万数量的加密文件。这极大方便了网盘传输和数据的搬迁。为此，我专门实现了一个基于链式文件分配树技术的内建文件系统，用于操作加密库。核心代码位于/src/api/core下。为了应对可能出现的复杂文件树结构，我还为文件系统实现了一个粗陋的LRU缓存。

该项目使用electron+vue3全家桶开发，代码里面中英文注释都有


## Project setup 项目初始化
```
npm install
```
或者
```
yarn
```

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and minifies for production
```
npm run electron:build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
