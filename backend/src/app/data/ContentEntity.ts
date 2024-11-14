import { Entity, PrimaryColumn, Column } from "typeorm";
import { CopyInterface } from "common/src/tre/logic/CopyInterface";
import { ContentDto } from "common/src/app/models/ContentDto";

@Entity("contents")
export class ContentEntity implements ContentDto, CopyInterface<ContentDto> {
    @PrimaryColumn({ name: "guid" })
    public guid: string = "";

    @Column({ name: "path_and_name" })
    public pathAndName: string = "";

    @Column({ name: "mime_type" })
    public mimeType: string = "";

    @Column({ name: "encoded_size" })
    public encodedSize: number = 0;

    @Column({ name: "created" })
    public created: Date = new Date();

    @Column({ name: "created_by" })
    public createdBy: string = "";

    @Column({ name: "modified" })
    public modified: Date = new Date();

    @Column({ name: "modified_by" })
    public modifiedBy: string = "";

    @Column({ name: "deleted", nullable: true })
    public deleted?: Date;

    @Column({ name: "deleted_by", nullable: true })
    public deletedBy?: string;

    @Column({ name: "view_uri" })
    public viewUri: string = "";

    @Column({ name: "edit_uri" })
    public editUri: string = "";

    @Column({ name: "content" })
    public content: string = "";

    public copyFrom(source: ContentDto): void {
        this.guid = source.guid;
        this.pathAndName = source.pathAndName;
        this.mimeType = source.mimeType;
        this.encodedSize = source.encodedSize;
        this.created = source.created;
        this.createdBy = source.createdBy;
        this.modified = source.modified;
        this.modifiedBy = source.modifiedBy;
        this.deleted = source.deleted;
        this.deletedBy = source.deletedBy;
        this.viewUri = source.viewUri;
        this.editUri = source.editUri;
        this.content = source.content;
    }

    public copyTo(dest: ContentDto): void {
        dest.guid = this.guid;
        dest.pathAndName = this.pathAndName;
        dest.mimeType = this.mimeType;
        dest.encodedSize = this.encodedSize;
        dest.created = this.created;
        dest.createdBy = this.createdBy;
        dest.modified = this.modified;
        dest.modifiedBy = this.modifiedBy;
        dest.deleted = this.deleted;
        dest.deletedBy = this.deletedBy;
        dest.viewUri = this.viewUri;
        dest.editUri = this.editUri;
        dest.content = this.content;
    }
}