interface GcryptFS {
    readFileSync(path: string, options?: { encoding?: BufferEncoding | null; flag?: string }): Buffer | string;
    writeFileSync(
        path: string,
        data: string | Buffer,
        options?: { encoding?: "utf8" | "ascii" | "binary" | "base64" | "hex" | null }
    ): void;
    existsSync(path: string): boolean;
    mkdirSync(path: string, options?: { recursive?: boolean; mode?: number }): void;

    // async methods
    readFile(path: string, options?: { encoding?: string; flag?: string }): Promise<string | Buffer>;
    writeFile(path: string, data: string | Buffer, options?: { encoding?: string; mode?: number; flag?: string }): Promise<void>;
    mkdir(path: string, options?: { recursive?: boolean; mode?: number }): Promise<void>;
}
