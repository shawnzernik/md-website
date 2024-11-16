import * as React from "react";
import { ButtonTheme } from "./ButtonTheme";
import { FormTheme } from "./FormTheme";
import { Dialogue, ErrorMessage } from "./Navigation";
import { BasePage, BasePageState } from "./BasePage";

export interface UploadedFile {
    name: string;
    mimetype: string;
    contents: string;
}

interface Props {
    page?: any;
    children?: React.ReactNode;
    fileUploaded?: (fileinfo: UploadedFile) => void;
}

interface State {
    highlighted: boolean;
}

export class Form extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            highlighted: false
        };
    }

    public render(): React.ReactNode {
        let styles: React.CSSProperties = {};
        if (this.state.highlighted)
            styles = { backgroundColor: "#ffd" };
        else
            styles = {};

        let div;
        if (this.props.fileUploaded) {
            if (!this.props.page)
                throw new Error("Form taking upload must take page!");

            div = <div
                onDragEnter={(e) => {
                    e.preventDefault();
                    this.setState({ highlighted: true });
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    this.setState({ highlighted: true });
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    this.setState({ highlighted: false });
                }}
                onDrop={async (e) => {
                    e.preventDefault();
                    this.setState({ highlighted: false });

                    const files: FileList = e.dataTransfer.files;
                    if (files.length > 1) {
                        this.props.page.events.setMessage({
                            title: "Error",
                            content: "Form can only take one upload at a time!",
                            buttons: { label: "OK", onClicked: () => { } }
                        });
                    }

                    const file = files.item(0);
                    const buff = await file.arrayBuffer();
                    const base64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(buff))));

                    this.props.fileUploaded({
                        name: file.name,
                        mimetype: file.type,
                        contents: "btoa::" + base64
                    });
                }}
                style={{ ...FormTheme, ...styles }
                }
            > {this.props.children}</div >;
        } else {
            div = <div
                style={{ ...FormTheme, ...styles }}
            >{this.props.children}</div>;
        }
        return div;
    }
}