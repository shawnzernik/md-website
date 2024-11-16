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

    @Column({ name: "base64_encoded" })
    public base64Encoded: boolean = false;

    @Column({ name: "encoded_size" })
    public encodedSize: number = 0;

    @Column({ name: "securables_guid" })
    public securablesGuid: string = "";

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

    public copyFrom(source: ContentDto): void {
        this.guid = source.guid;
        this.pathAndName = source.pathAndName;
        this.mimeType = source.mimeType;
        this.base64Encoded = source.base64Encoded;
        this.encodedSize = source.encodedSize;
        this.securablesGuid = source.securablesGuid;
        this.created = source.created;
        this.createdBy = source.createdBy;
        this.modified = source.modified;
        this.modifiedBy = source.modifiedBy;
        this.deleted = source.deleted;
        this.deletedBy = source.deletedBy;
    }

    public copyTo(dest: ContentDto): void {
        dest.guid = this.guid;
        dest.pathAndName = this.pathAndName;
        dest.mimeType = this.mimeType;
        dest.base64Encoded = this.base64Encoded;
        dest.encodedSize = this.encodedSize;
        dest.securablesGuid = this.securablesGuid;
        dest.created = this.created;
        dest.createdBy = this.createdBy;
        dest.modified = this.modified;
        dest.modifiedBy = this.modifiedBy;
        dest.deleted = this.deleted;
        dest.deletedBy = this.deletedBy;
    }
}