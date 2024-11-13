import { MarkdownDto } from "common/src/app/models/MarkdownDto";
import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FetchWrapper } from "../../tre/services/FetchWrapper";

export class MarkdownService {
    public static async get(token: string, guid: string): Promise<MarkdownDto> {
        const ret = await FetchWrapper.get<MarkdownDto>({
            url: "/api/v0/markdown/" + guid,
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }

    public static async list(token: string): Promise<MarkdownDto[]> {
        const ret = await FetchWrapper.get<MarkdownDto[]>({
            url: "/api/v0/markdowns",
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }

    public static async save(token: string, dto: MarkdownDto): Promise<void> {
        await FetchWrapper.post({
            url: "/api/v0/markdown",
            body: dto,
            corelation: UUIDv4.generate(),
            token: token
        });
    }

    public static async delete(token: string, guid: string): Promise<void> {
        await FetchWrapper.delete({
            url: "/api/v0/markdown/" + guid,
            corelation: UUIDv4.generate(),
            token: token
        });
    }
}