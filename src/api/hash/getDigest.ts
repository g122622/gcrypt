import crypto from "crypto"

export default function getDigest(data: Buffer, digestType: string) {
    const hash = crypto.createHash(digestType).update(data).digest("hex");
    return hash
}
