export class PayloadLogic {
    private static prefix = "base64::";

    public static encode(value: Uint8Array): string {
        const base64 = this.arrayBufferToBase64(value);
        return this.prefix + base64;
    }

    public static decode(value: string): Uint8Array {
        if (!value) return new Uint8Array();

        if (!value.startsWith(this.prefix)) {
            throw new Error(`The string is not Base64 encoded - missing '${this.prefix}' prefix!`);
        }

        const base64 = value.substring(this.prefix.length);
        return this.base64ToUint8Array(base64);
    }

    private static arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        for (let i = 0; i < buffer.length; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return btoa(binary);
    }

    private static base64ToUint8Array(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const length = binaryString.length;
        const array = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            array[i] = binaryString.charCodeAt(i);
        }
        return array;
    }

    public static uint8ArrayToString(data: Uint8Array): string {
        return new TextDecoder("utf-8").decode(data);
    }

    public static stringToUint8Array(data: string): Uint8Array {
        return new TextEncoder().encode(data);
    }
}