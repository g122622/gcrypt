/**
 * File: \src\api\core\types\KVPEngineBase.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-14 21:18:46
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import EncryptionEngineBase from "./EncryptionEngineBase";

/**
 * 这是KVPEngine的抽象类，是所有KVPEngine的实现标准
 *
 */
abstract class KVPEngineBase {
    public abstract init(entryFileSrc: string, encryptionEngine: EncryptionEngineBase);
    public abstract hasData(key: string): Promise<boolean>;
    public abstract getData(key: string): Promise<Buffer>;
    public abstract setData(key: string, valve: Buffer): Promise<void>;
    public abstract deleteData(key: string): Promise<void>;
}

export default KVPEngineBase;
