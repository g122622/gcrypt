declare module "memoryUsage" {
    export interface memoryUsage {
        arrayBuffers: number,
        external: number,
        heapTotal: number,
        heapUsed: number,
        rss: number,
    }
}
