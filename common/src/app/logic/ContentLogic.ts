import { ContentDto } from "../models/ContentDto";
import { ContentMimeTypeDto } from "../models/ContentMimeTypeDto";

export class ContentLogic {
    public static normalize(dto: ContentDto, mimeTypes: ContentMimeTypeDto[]): void {
        this.normalizeName(dto);
        this.normalizeContents(dto, mimeTypes);
    }
    public static normalizeContents(dto: ContentDto, mimeTypes: ContentMimeTypeDto[]) {
        let mimeType: ContentMimeTypeDto | null = null;
        mimeTypes.forEach((t) => {
            if (!mimeType && t.mimetype == dto.mimeType)
                mimeType = t;
        });

        if (!mimeType)
            throw new Error(`MIME type '${dto.mimeType}' is not valid!`);

        let isEncoded = dto.content.startsWith("base64::");

        let isBinary = false;
        for (let cnt = 0; cnt < dto.content.length; cnt++) {
            let code = dto.content.charCodeAt(cnt);
            if ((code < 32 || code > 126) && code !== 9 && code !== 10 && code !== 13) {
                isBinary = true;
                break;
            }
        }

        if (isEncoded && isBinary)
            throw new Error("The contents is both encoded and binary - this should not be possible!");

        if (isBinary || (mimeType as ContentMimeTypeDto).encode) {
            dto.base64Encoded = true;
            dto.content = "base64::" + btoa(dto.content);
            dto.encodedSize = dto.content.length;
        }
    }
    public static normalizeName(dto: ContentDto) {
        let parts = dto.pathAndName.split("/");

        let pathAndName = "/";
        for (let cnt = 0; cnt < parts.length; cnt++) {
            let part = parts[cnt].trim();
            if (part.length > 0 && part !== "." && part !== "..")
                pathAndName += part + "/";
        }

        dto.pathAndName = pathAndName;
    }
}

