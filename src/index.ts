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
import { ViewerSettingTab, DEFAULT_SETTINGS, ViewerSettings } from './setting';
import { createOrUpdateViewer } from "./util";
import {getDateFromFile} from "obsidian-daily-notes-interface";

export default class ViewerPlugin extends Plugin {
	public settings: ViewerSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ViewerSettingTab(this.app, this));
		this.registerFileMonitor();
		this.createFileAfterOnLoad();

		this.addRibbonIcon(
			"calendar-glyph",
			"Open Viewer",
			async (evt: MouseEvent) => {
				this.openViewer();
			}
		);

		this.addCommand({
			id: "open-viewer",
			name: "Open Viewer",
			callback: () => {
				this.openViewer();
			},
		});
	}

	public async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	private onFileCreated(file: TFile): void {
		if (this.app.workspace.layoutReady) {
			if (getDateFromFile(file, 'day')) {
				createOrUpdateViewer(this.app, this.settings);
			}
		}
	}

	private onFileDeleted(file: TFile): void {
		if (this.app.workspace.layoutReady) {
			if (getDateFromFile(file, 'day')) {
				createOrUpdateViewer(this.app, this.settings);
			}
		}
	}

	// 当开启插件后，自动创建 Viewer 文件。
	private async createFileAfterOnLoad() {
		await createOrUpdateViewer(this.app, this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// 当关闭插件时，自动删除 Viewer 文件
	async onunload() {
		const file = await this.app.vault.adapter.exists("Viewer.md");
		if(!file) {
			return;
		}
		await this.app.vault.adapter.remove("Viewer.md");
	}

	// 支持监控文件变化，自动更新 Viewer 内容
	registerFileMonitor() {
		this.onFileCreated = this.onFileCreated.bind(this);
		this.onFileDeleted = this.onFileDeleted.bind(this);

		this.registerEvent(this.app.vault.on('create', this.onFileCreated));
		this.registerEvent(this.app.vault.on('delete', this.onFileDeleted));
	}

	openViewer = async () => {
		let leaf;
		await createOrUpdateViewer(this.app, this.settings);
		if(this.app.workspace.activeLeaf instanceof MarkdownView) {
			leaf = this.app.workspace.getLeaf(false);
		} else {
			leaf = this.app.workspace.getLeaf(false);
		}

		const viewer = this.app.vault.getAbstractFileByPath("Viewer.md") as TFile;
		leaf.openFile(viewer);
	};
}
