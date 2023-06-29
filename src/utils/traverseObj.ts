import lodash from "lodash";

/**
 * 可用来递归遍历一个包含嵌套关系的复杂对象
 * @param obj
 * @param cb
 */
function traverseObj(obj, cb: (key: string, value: any) => void) {
    lodash.forEach(obj, function (value, key) {
        if (lodash.isPlainObject(value)) {
            traverseObj(value, cb);
        } else {
            cb(key, value)
        }
    });
}

export default traverseObj
