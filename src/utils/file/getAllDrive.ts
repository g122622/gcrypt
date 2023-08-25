/**
 * @Description 获取电脑中所盘符及其名称
 * @Author WJW
 * @Date 2022-01-25
 */

import process from 'child_process'
// cmd命令
const cmdOrder = {
    getAllDrive: () => ("wmic logicaldisk where drivetype=3 get deviceid"),
    getOneDriveName: (drive: string) => (`wmic logicaldisk where name="${drive}:" get volumename`)
}

/**
 * 获取电脑中所有盘符及其名称
 * @returns 电脑中所有盘符及其名称
 */
export default async function getAllDrive(): Promise<{
    drive: string;
    name: string;
}[]> {
    return new Promise((resolve, reject) => {
        // 获取电脑中所有盘符
        process.exec(cmdOrder.getAllDrive(), (error: any, stdout: any) => {
            if (error !== null) {
                console.error(error);
                return;
            }
            let stdoutArr = [...stdout];
            let res: string[] = [];
            stdoutArr.forEach((v: string, i: number) => {
                if (v === ':') {
                    res.push(stdoutArr[i - 1]);
                }
            })
            let resList: {
                drive: string,
                name: string
            }[] = [];
            let promiseArr: Promise<any>[] = [];
            // 获取所有盘符的所有名称
            res.forEach((v: string) => {
                promiseArr.push(
                    new Promise((resolve, reject) => {
                        process.exec(cmdOrder.getOneDriveName(v), (error: any, stdout: any) => {
                            if (error !== null) {
                                console.error(error);
                                return;
                            }
                            let stdoutArr = [...stdout];
                            let res: string[] = [];
                            stdoutArr.forEach((v: string, i: number) => {
                                if (v !== ' ' && v !== '\n' && v !== '\r') {
                                    res.push(v);
                                }
                            })
                            res.splice(0, 10);
                            resList.push({
                                drive: v,
                                name: res.join('')
                            });
                            resolve(true);
                        })
                    })
                )
            })
            Promise.all(promiseArr).then(res => {
                resolve(resList);
            });
        });
    })
}
