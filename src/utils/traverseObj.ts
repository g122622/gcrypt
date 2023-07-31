import lodash from "lodash";

/**
 * 可用来递归遍历一个包含嵌套关系的复杂对象
 * @param obj
 * @param cb
 */
function traverseObj(obj, cb: (key: string, value: any, abort: () => void) => void) {
    lodash.forEach(obj, function (value, key) {
        let flag = true
        if (lodash.isPlainObject(value)) {
            traverseObj(value, cb);
        } else {
            cb(key, value, () => {
                // 调用abort()，提前退出
                flag = false
            })
        }
        return flag
    });
}

export default traverseObj
