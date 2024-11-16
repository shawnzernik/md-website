import * as React from "react";
import { createRoot } from "react-dom/client";
import { ErrorMessage, Navigation } from "../../tre/components/Navigation";
import { BasePage, BasePageState } from "../../tre/components/BasePage";
import { Heading } from "../../tre/components/Heading";
import { Form } from "../../tre/components/Form";
import { Field } from "../../tre/components/Field";
import { Input } from "../../tre/components/Input";
import { ContentDto } from "common/src/app/models/ContentDto";
import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FlexRow } from "../../tre/components/FlexRow";
import { Button } from "../../tre/components/Button";
import { ContentService } from "../services/ContentService";
import { AuthService } from "../../tre/services/AuthService";
import { TextArea } from "../../tre/components/TextArea";
import { UserService } from "../../tre/services/UserService";
import { SettingService } from "../../tre/services/SettingService";
import { SelectOption } from "../../tre/components/SelectOption";
import { Select } from "../../tre/components/Select";
import { AuthLogic } from "../../tre/logic/AuthLogic";
import { Dictionary } from "common/src/tre/Dictionary";
import { Checkbox } from "../../tre/components/Checkbox";
import { SecurableService } from "../../tre/services/SecurableService";
import { ContentMimeTypeDto } from "common/src/app/models/ContentMimeTypeDto";
import { ContentLogic } from "common/src/app/logic/ContentLogic";

interface Props { }
interface State extends BasePageState {
    model: ContentDto;
    userOptions: any[];
    mimeOptions: any[];
    securableOptions: any[];

}

class Page extends BasePage<Props, State> {
    private auth: AuthLogic;
    private mimeTypeToDescription: Dictionary<string> = {};
    private mimeTypes: ContentMimeTypeDto[];

    public constructor(props: Props) {
        super(props);

        const date = new Date(Date.now());

        this.state = {
            ...BasePage.defaultState,
            model: {
                guid: UUIDv4.generate(),
                pathAndName: "",
                mimeType: "",
                encodedSize: 0,
                created: date,
                createdBy: "",
                modified: date,
                modifiedBy: "",
                content: "",
                base64Encoded: false,
                securablesGuid: ""
            },
            userOptions: [<SelectOption display="" value="" />],
            mimeOptions: [<SelectOption display="" value="" />],
            securableOptions: [<SelectOption display="" value="" />],
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.events.setLoading(true);

        const userOptions = [<SelectOption display="" value="" />];
        const mimeOptions = [<SelectOption display="" value="" />];
        const securableOptions = [<SelectOption display="" value="" />];

        const token = await AuthService.getToken();

        const userList = await UserService.list(token);
        for (const user of userList)
            userOptions.push(<SelectOption display={user.emailAddress} value={user.guid} />);

        const securableList = await SecurableService.list(token);
        for (const securable of securableList)
            securableOptions.push(<SelectOption display={securable.displayName} value={securable.guid} />);

        const mimeTypesSetting = await SettingService.getKey(token, "Content:MIME Types");
        try {
            this.mimeTypes = JSON.parse(mimeTypesSetting.value) as ContentMimeTypeDto[];
        }
        catch (err) {
            await ErrorMessage(this, err);
            return;
        }

        this.mimeTypeToDescription = {};
        for (const mimeType of this.mimeTypes) {
            this.mimeTypeToDescription[mimeType.mimetype] = mimeType.description;
            this.mimeTypes.push(mimeType)
            mimeOptions.push(<SelectOption display={mimeType.description} value={mimeType.mimetype} />);
        }

        const publicKey = await AuthService.publicKey();
        this.auth = await AuthLogic.tokenLogin(token, publicKey);

        const model = this.jsonCopy(this.state.model);
        model.createdBy = this.auth.user.guid;
        model.modifiedBy = this.auth.user.guid;
        await this.updateState({
            mimeOptions: mimeOptions,
            userOptions: userOptions,
            securableOptions: securableOptions,
            model: model
        });

        const guid = this.queryString("guid");
        if (!guid) {
            await this.events.setLoading(false);
            return;
        }

        const content = await ContentService.get(token, guid);
        await this.updateState({ model: content });

        await this.events.setLoading(false);
    }

    public async saveClicked() {
        this.events.setLoading(true);
        try {
            const token = await AuthService.getToken();
            const tempModel = this.jsonCopy(this.state.model);

            const guid = this.queryString("guid");
            if (guid) {
                tempModel.modifiedBy = this.auth.user.guid;
                tempModel.modified = new Date(Date.now());
            }

            tempModel.encodedSize = tempModel.content.length;

            await ContentService.save(token, tempModel);
            window.location.replace("content.html?guid=" + this.state.model.guid);
            return;
        }
        catch (err) {
            await ErrorMessage(this, err);
            await this.events.setLoading(false);
        }
    }

    public async deleteClicked() {
        this.events.setLoading(true);
        try {
            const token = await AuthService.getToken();

            const tempModel = await ContentService.get(token, this.state.model.guid);
            tempModel.deletedBy = this.auth.user.guid;
            tempModel.deleted = new Date(Date.now());
            await ContentService.save(token, tempModel);

            window.location.replace("content.html?guid=" + this.state.model.guid);
            return;
        }
        catch (err) {
            await ErrorMessage(this, err);
            await this.events.setLoading(false);
        }
    }

    public async restoreClicked() {
        this.events.setLoading(true);
        try {
            const token = await AuthService.getToken();

            const tempModel = await ContentService.get(token, this.state.model.guid);
            tempModel.deletedBy = null;
            tempModel.deleted = null;
            tempModel.modifiedBy = this.auth.user.guid;
            tempModel.modified = new Date(Date.now());
            await ContentService.save(token, tempModel);

            window.location.replace("content.html?guid=" + this.state.model.guid);
            return;
        }
        catch (err) {
            await ErrorMessage(this, err);
            await this.events.setLoading(false);
        }
    }

    public render(): React.ReactNode {
        return (
            <Navigation
                state={this.state} events={this.events}
                topMenuGuid="b1e3c680-0f62-4931-8a68-4be9b4b070f7"
                leftMenuGuid="527f06a9-0378-47c6-9b16-a9c0b72c757e"
            >
                <Heading level={1}>Content Edit</Heading>
                <Form
                    page={this}
                    fileUploaded={async (fileinfo) => {
                        if (!this.mimeTypeToDescription[fileinfo.mimetype]) {
                            await ErrorMessage(this, new Error(`MIME type '${fileinfo.mimetype}' is invalid!`));
                            return;
                        }

                        let parts = this.state.model.pathAndName.split("/");
                        let pathAndName = "/";
                        for (let cnt = 0; cnt < parts.length - 1; cnt++) {
                            let part = parts[cnt].trim();
                            if (part.length > 0 && part !== "." && part !== "..")
                                pathAndName += part + "/";
                        }
                        pathAndName += fileinfo.name;


                        const newModel = this.jsonCopy(this.state.model);
                        newModel.pathAndName = pathAndName;
                        newModel.content = fileinfo.contents;
                        newModel.mimeType = fileinfo.mimetype;
                        newModel.encodedSize = fileinfo.contents.length;

                        ContentLogic.normalize(newModel, this.mimeTypes);

                        await this.updateState({
                            model: newModel
                        });
                    }}
                >
                    <Field label="GUID" size={3}><Input
                        readonly={true}
                        value={this.state.model.guid}
                    /></Field>
                    <Field label="Path and Name"><Input
                        value={this.state.model.pathAndName}
                        onChange={async (value) => {
                            const newModel = this.jsonCopy(this.state.model);
                            newModel.pathAndName = value;
                            await this.updateState({ model: newModel });
                        }}
                    /></Field>
                    <FlexRow gap="0">
                        <Field label="Securable" size={2}><Select
                            value={this.state.model.securablesGuid}
                            onChange={async (value) => {
                                const newModel = this.jsonCopy(this.state.model);
                                newModel.securablesGuid = value;
                                await this.updateState({ model: newModel });
                            }}
                        >{this.state.securableOptions}</Select></Field>
                        <Field label="MIME Type" size={2}><Select
                            value={this.state.model.mimeType}
                            onChange={async (value) => {
                                const newModel = this.jsonCopy(this.state.model);
                                newModel.mimeType = value;
                                await this.updateState({ model: newModel });
                            }}
                        >{this.state.mimeOptions}</Select></Field>
                        <Field label="Encoded Size" size={1}><Input
                            value={this.state.model.encodedSize.toString()}
                            onChange={async (value) => {
                                const newModel = this.jsonCopy(this.state.model);
                                newModel.encodedSize = Number.parseInt(value);
                                await this.updateState({ model: newModel });
                            }}
                        /></Field>
                        <Field label="Base64 Encoded" size={1}><Checkbox
                            checked={this.state.model.base64Encoded}
                            onChange={async (value) => {
                                const newModel = this.jsonCopy(this.state.model);
                                newModel.base64Encoded = value;
                                await this.updateState({ model: newModel });
                            }}
                        /></Field>
                    </FlexRow>
                    <FlexRow gap="0">
                        <Field label="Created" size={2}><Input
                            value={this.state.model.created ? this.state.model.created.toString() : ""}
                        /></Field>
                        <Field label="Created By" size={3}><Select
                            value={this.state.model.createdBy}
                        >{this.state.userOptions}</Select></Field>
                    </FlexRow>
                    <FlexRow gap="0">
                        <Field label="Modified" size={2}><Input
                            value={this.state.model.modified ? this.state.model.modified.toString() : ""}
                        /></Field>
                        <Field label="Modified By" size={3}><Select
                            value={this.state.model.modifiedBy}
                        >{this.state.userOptions}</Select></Field>
                    </FlexRow>
                    <FlexRow gap="0">
                        <Field label="Deleted" size={2}><Input
                            value={this.state.model.deleted ? this.state.model.deleted.toString() : ""}
                        /></Field>
                        <Field label="Deleted By" size={3}><Select
                            value={this.state.model.deletedBy}
                        >{this.state.userOptions}</Select></Field>
                    </FlexRow>
                    {
                        this.state.model.content.startsWith("base64::")
                            ? <Field label="Content"><TextArea
                                value={"base64 binary"}
                            /></Field>
                            : <Field label="Content"><TextArea
                                value={this.state.model.content}
                                onChange={async (value) => {
                                    const newModel = this.jsonCopy(this.state.model);
                                    newModel.content = value;
                                    await this.updateState({ model: newModel });
                                }}
                            /></Field>

                    }
                </Form>
                <FlexRow gap="1em">
                    {this.state.model.deleted ? null : <Button label="Save" onClick={this.saveClicked.bind(this)} />}
                    {this.state.model.deleted ? null : <Button label="Delete" onClick={this.deleteClicked.bind(this)} />}
                    {this.state.model.deleted ? <Button label="Restore" onClick={this.restoreClicked.bind(this)} /> : null}
                </FlexRow>
            </Navigation>
        );
    }
}

window.onload = () => {
    const element = document.getElementById("root");
    const root = createRoot(element);
    root.render(<Page />)
};
window.onpageshow = (event) => {
    if (event.persisted) {
        window.location.reload();
    }
};