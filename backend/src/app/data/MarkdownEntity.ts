import { Entity, PrimaryColumn, Column } from "typeorm";
import { CopyInterface } from "common/src/tre/logic/CopyInterface";
import { MarkdownDto } from "common/src/app/models/MarkdownDto";

@Entity("markdowns")
export class MarkdownEntity implements MarkdownDto, CopyInterface<MarkdownDto> {
    @PrimaryColumn({ name: "guid" })
    public guid: string = "";

    @Column({ name: "title" })
    public title: string = "";

    @Column({ name: "menus_guid" })
    public menusGuid: string = "";

    @Column({ name: "bootstrap_icon" })
    public bootstrapIcon: string = "";

    @Column({ name: "uri" })
    public uri: string = "";

    @Column({ name: "content" })
    public content: string = "";

    public copyFrom(source: MarkdownDto): void {
        this.guid = source.guid;
        this.title = source.title;
        this.menusGuid = source.menusGuid;
        this.bootstrapIcon = source.bootstrapIcon;
        this.uri = source.uri;
        this.content = source.content;
    }

    public copyTo(dest: MarkdownDto): void {
        dest.guid = this.guid;
        dest.title = this.title;
        dest.menusGuid = this.menusGuid;
        dest.bootstrapIcon = this.bootstrapIcon;
        dest.uri = this.uri;
        dest.content = this.content;
    }
}