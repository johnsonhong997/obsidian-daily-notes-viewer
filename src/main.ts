import {
	App,
	Editor,
	editorViewField,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	WorkspaceLeaf,
} from "obsidian";
import { createOrUpdateViewer } from "./util";

export default class ViewerPlugin extends Plugin {
	async onload() {
		this.addRibbonIcon(
			"calendar-glyph",
			"Open Viewer",
			(evt: MouseEvent) => {
				createOrUpdateViewer(this.app);
				this.openViewer();
			}
		);

		this.addCommand({
			id: "open-viewer",
			name: "Open Viewer",
			callback: () => {
				createOrUpdateViewer(this.app);
				this.openViewer();
			},
		});
	}

	onunload() {}

	getActiveLeaf(): WorkspaceLeaf {
		return this.app.workspace.getLeaf();
	}

	openViewer = () => {
		let leaf = this.getActiveLeaf();
		let viewer = this.app.vault.getAbstractFileByPath("Viewer.md") as TFile;
		leaf.openFile(viewer);
	};
}
