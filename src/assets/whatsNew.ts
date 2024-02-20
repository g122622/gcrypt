/**
 * File: \src\assets\whatsNew.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-20 17:44:57
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

export default {
    "1.0.2": ["新增更新详情弹框", "顶栏增加版本展示", "支持选择主题色"],
    "1.1.0": ["侧边栏优化", "右键菜单弹出位置优化", "文件管理器滚动条修复", "文件管理器增加底部状态条",
        "文件可以支持选择了", "支持回车键确定密码", "任务管理器支持状态显示", "修复bug", "列表查找性能优化"],
    "1.2.0": ["文件哈希现已开放", "新增功能：屏幕捕获防护", "更新内容UI展示优化"],
    "1.3.0": ["支持窗口锁定（应用锁）"],
    "1.3.1": ['应用锁bug修复'],
    "1.4.0": ['支持从外部拖入文件以导入', "完全重写加密引擎，支持异步加密，且显著优化输出文件大小", "改正一处错别字", "临时文件自动销毁"],
    "1.5.0": ['若干bug和细节修复', '任务处理并行化，显著提高运行效率', '支持导出文件', '支持快捷打开store所在的目录'],
    "2.0.0": ['若干bug和细节修复', '增加内置文件选择器', '内置浏览器可用', '内置代码编辑器可用', "列表性能优化"],
    "2.1.0": ['支持单例锁', "bug修复", "侧边栏当前标签展示优化"],
    "2.1.1": ["v-switch组件夜间模式下的显示bug修复"],
    "2.3.0": ['应用锁定时会自动关闭devtools，确保安全性', "界面优化", "应用锁交互逻辑优化", "支持高级文本框（历史记录、智能填充）"],
    "2.5.0": ['应用关闭时若有任务未完成则会提示', "界面bug修复", "设置支持搜索"],
    "2.6.0": ['优化标签页文字显示', '支持快捷键锁定app', "界面优化", "去除SQLite二进制库的引用，缩减包体积", "app终于有自己的图标了"],
    "3.0.0": ['当前任务数可以在顶栏看到了', "更新关于页面", "将electron升级到27，vue和vuetify相应升级",
        "重写窗口锁定控制逻辑，修复一系列bug，提高安全性", "更换了一些图标", "侧边栏增加文件管理器", "修复文件管理器底部tip无法hover的bug"],
    "3.1.0": ['列表虚拟化，显著提升列表渲染速度', "优化启动速度", "将js文件编译为字节码",
    ],
    "3.2.0": ['界面优化', "优化启动速度", "支持文件复制与剪切"],
    "3.3.0": ['修改文件读取逻辑，支持读取mtp设备的文件', "支持文件批量复制与剪切",
        '构建过程使用缓存，加快构建速度', "核心优化：去除冗余代码，修复移动文件bug", "修复移动和复制文件后缩略图没有的问题",
        '支持保存每个文件夹的布局选项'],
    "3.4.0": ['新的均衡型存储引擎：KVPEngineHybrid', "优化adapter初始化逻辑"],
    "3.5.0": ['修复null值导致程序崩溃的bug', "优化任务执行逻辑", "增加filemgr的相关设置项", '新增JSON查看器，查看属性更方便', '关闭应用时自动解除文件占用', 'store列表圆角优化'],

}
