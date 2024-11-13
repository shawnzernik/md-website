import { Entity, PrimaryColumn, Column } from "typeorm";
import { CopyInterface } from "common/src/tre/logic/CopyInterface";
import { ContentDto } from "common/src/app/models/ContentDto";

@Entity("contents")
export class ContentEntity implements ContentDto, CopyInterface<ContentDto> {
    @PrimaryColumn({ name: "guid" })
    public guid: string = "";

    @Column({ name: "uri" })
    public uri: string = "";

    @Column({ name: "content" })
    public content: string = "";

    public copyFrom(source: ContentDto): void {
        this.guid = source.guid;
        this.uri = source.uri;
        this.content = source.content;
    }

    public copyTo(dest: ContentDto): void {
        dest.guid = this.guid;
        dest.uri = this.uri;
        dest.content = this.content;
    }
}