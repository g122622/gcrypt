/**
 * File: \src\test\KVPEngineHybridUnit.ts
 * Project: Gcrypt
 * Created Date: 2024-02-15 17:52:34
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-16 15:09:55
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import KVPEngineHybrid from "@/api/core/KVPEngines/KVPEngineHybrid";
import EncryptionEngineNoop from "@/api/core/encryptionEngines/EncryptionEngineNoop";
import getDigest from "@/api/hash/getDigest";
import fs from "fs-extra";
import sleep from "@/utils/sleep";

const dir = "E:/暂存/新建文件夹 (47)/新建文件夹 (3)";
const file1Path = "G:/设备备份2/9班/Weixin Image_20240213210622.jpg";
const file2Path = "G:/设备备份2/9班/23ac38057f9baaf6db2189d12598fc2d.mp4";
const file3Path = "G:/设备备份2/9班/Weixin Image_20240202211131.jpg";
const file4Path = "G:/capability.zip";
const file5Path = "G:/设备备份2/9班/Weixin Image_20240202210030.jpg";

export default async function test() {
    await fs.emptyDir(dir);

    const encryptionEngine = new EncryptionEngineNoop();
    const KVPEngine = new KVPEngineHybrid();
    await encryptionEngine.init("");
    await KVPEngine.init(dir + "/随便", encryptionEngine);

    // 小文件写入与读取1
    await KVPEngine.setData("key1", Buffer.from("gy"));
    const res1 = (await KVPEngine.getData("key1")).toString();
    console.log(res1 === "gy");
    console.log((await KVPEngine.hasData("key1")) === true);

    // 小文件写入与读取2
    await KVPEngine.setData("key2", Buffer.from(" const thumbnailStr = thumbnailBuf.toString() "));
    const res2 = (await KVPEngine.getData("key2")).toString();
    console.log(res2 === " const thumbnailStr = thumbnailBuf.toString() ");
    console.log((await KVPEngine.hasData("key2")) === true);

    // 大文件写入与读取1
    const file1Buf = await fs.readFile(file1Path);
    await KVPEngine.setData("key3", file1Buf);
    const res3 = await KVPEngine.getData("key3");
    console.log(getDigest(res3) === getDigest(file1Buf));
    console.log((await KVPEngine.hasData("key3")) === true);

    // 小文件写入与读取3
    await KVPEngine.setData("key4", Buffer.from("apple与西瓜"));
    const res4 = (await KVPEngine.getData("key4")).toString();
    console.log(res4 === "apple与西瓜");
    console.log((await KVPEngine.hasData("key4")) === true);

    // 检查之前的结果是否正确
    const res5 = (await KVPEngine.getData("key1")).toString();
    console.log(res5 === "gy");
    const res6 = await KVPEngine.getData("key3");
    console.log(getDigest(res6) === getDigest(file1Buf));

    // 文件删除测试1
    await KVPEngine.deleteData("key1");
    console.log((await KVPEngine.hasData("key2")) === true);
    console.log((await KVPEngine.hasData("key3")) === true);
    await KVPEngine.deleteData("key2");
    console.log((await KVPEngine.hasData("key1")) === false);
    await KVPEngine.deleteData("key3");
    console.log((await KVPEngine.hasData("key2")) === false);
    console.log((await KVPEngine.hasData("key3")) === false);
    console.log((await KVPEngine.hasData("key4")) === true);

    /* 此时只剩key4：apple与西瓜 */

    // 边界测试：读取已删除的文件
    console.log((await KVPEngine.getData("key1")) === null);
    console.log((await KVPEngine.getData("key2")) === null);
    console.log((await KVPEngine.getData("key3")) === null);

    // 检查之前的结果是否正确
    console.log((await KVPEngine.getData("key4")).toString() === "apple与西瓜");

    // 文件删除测试2
    await KVPEngine.deleteData("key4");
    console.log((await KVPEngine.getData("key4")) === null);

    /* 此时key全空 */

    // 大文件写入与读取2
    const file2Buf = await fs.readFile(file2Path);
    await KVPEngine.setData("Weixin等等 Image_20240202211131.jpg", file2Buf);
    const res7 = await KVPEngine.getData("Weixin等等 Image_20240202211131.jpg");
    console.log(getDigest(res7) === getDigest(file2Buf));

    // 大文件写入与读取3
    const file3Buf = await fs.readFile(file3Path);
    await KVPEngine.setData("@23ac38057f9baaf6db2189d12598fc2d.mp4 ", file3Buf);
    const res8 = await KVPEngine.getData("@23ac38057f9baaf6db2189d12598fc2d.mp4 ");
    console.log(getDigest(res8) === getDigest(file3Buf));

    // 小文件写入与读取4 同一key
    const file4Buf = await fs.readFile(file4Path);
    for (let i = 0; i < 16; i++) {
        await KVPEngine.setData("key9", file4Buf);
        const res9 = await KVPEngine.getData("key9");
        console.log(getDigest(res9) === getDigest(file4Buf));
    }

    // 小文件写入与读取4 不同key
    for (let i = 0; i < 16; i++) {
        await KVPEngine.setData("diffkey" + i, file4Buf);
        const res10 = await KVPEngine.getData("diffkey" + i);
        console.log(getDigest(res10) === getDigest(file4Buf));
    }

    // 不同文件读写一致性检验
    await KVPEngine.setData("key10", file1Buf);
    const res12 = await KVPEngine.getData("key10");
    console.log(getDigest(res12) === getDigest(file1Buf));
    await KVPEngine.setData("key11", file2Buf);
    const res13 = await KVPEngine.getData("key11");
    console.log(getDigest(res13) === getDigest(file2Buf));
    await KVPEngine.setData("key12", file3Buf);
    const res14 = await KVPEngine.getData("key12");
    console.log(getDigest(res14) === getDigest(file3Buf));
    await KVPEngine.setData("key13", file4Buf);
    const res15 = await KVPEngine.getData("key13");
    console.log(getDigest(res15) === getDigest(file4Buf));

    // 清空所有key
    await KVPEngine.deleteData("Weixin等等 Image_20240202211131.jpg");
    await KVPEngine.deleteData("@23ac38057f9baaf6db2189d12598fc2d.mp4 ");
    await KVPEngine.deleteData("key9");
    for (let i = 0; i < 16; i++) {
        await KVPEngine.deleteData("diffkey" + i);
    }
    await KVPEngine.deleteData("key10");
    await KVPEngine.deleteData("key11");
    await KVPEngine.deleteData("key12");
    await KVPEngine.deleteData("key13");

    /* 此时key全空 */

    // hasData测试
    for (let i = 0; i < 16; i++) {
        const res = await KVPEngine.hasData("key" + i);
        console.log(!res);
    }

    // 鲁棒性一致性测试-删除不存在的key，必须有异常
    let flag = false;
    try {
        await KVPEngine.deleteData("key13");
    } catch (error) {
        flag = true;
    } finally {
        console.log(flag);
    }
    // 鲁棒性一致性测试-同一key重复写入数据，不该有异常
    flag = false;
    try {
        await KVPEngine.setData("key13", file4Buf);
        await KVPEngine.setData("key13", Buffer.from("123gy放到"));
        await KVPEngine.setData("key13", Buffer.from([1, 2, 3]));
    } catch (error) {
        flag = true;
        throw error;
    } finally {
        console.log(!flag);
    }
    // 鲁棒性一致性测试-获取不存在的数据，不该有异常
    flag = false;
    let res;
    try {
        res = await KVPEngine.getData("不存在的key");
    } catch (error) {
        flag = true;
        throw error;
    } finally {
        console.log(!flag && res === null);
    }
    // 鲁棒性一致性测试-写入空文件，不该有异常
    flag = false;
    try {
        await KVPEngine.setData("key14", Buffer.from([]));
        console.log((await KVPEngine.getData("key14")).toString() === "");
    } catch (error) {
        flag = true;
        throw error;
    } finally {
        console.log(!flag);
    }

    // 疑难文件写入与读取1
    const file5Buf = await fs.readFile(file5Path);
    await KVPEngine.setData("file5Buf", file5Buf);
    const foo = await KVPEngine.getData("file5Buf");
    console.log(getDigest(foo) === getDigest(file5Buf));
    console.log((await KVPEngine.hasData("file5Buf")) === true);

    // 并发调用测试（锁）
    KVPEngine.setData("dupkey", file1Buf);
    await sleep(10);
    KVPEngine.setData("dupkey", file2Buf);
    await sleep(17);
    KVPEngine.setData("dupkey", file3Buf);
    await sleep(17);
    KVPEngine.setData("dupkey", file4Buf);
    KVPEngine.setData("dupkey", file5Buf);
    await sleep(3000);
    console.log(getDigest(await KVPEngine.getData("dupkey")) !== getDigest(file1Buf));
    console.log(getDigest(await KVPEngine.getData("dupkey")) !== getDigest(file2Buf));
    console.log(getDigest(await KVPEngine.getData("dupkey")) !== getDigest(file3Buf));
    console.log(getDigest(await KVPEngine.getData("dupkey")) !== getDigest(file4Buf));
    console.log(getDigest(await KVPEngine.getData("dupkey")) === getDigest(file5Buf));

    console.log("---test end---");
}
