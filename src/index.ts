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
} from "obsidian";
import { ViewerSettingTab, DEFAULT_SETTINGS, ViewerSettings } from "./setting";
import { createOrUpdateViewer, getPath } from "./util";
import { getDateFromFile } from "obsidian-daily-notes-interface";
import { t } from "./translations/helper";

export default class ViewerPlugin extends Plugin {
	public settings: ViewerSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ViewerSettingTab(this.app, this));
		this.registerFileMonitor();
		this.createFileOnLoad();

		this.addRibbonIcon(
			"calendar-glyph",
			t("Open Viewer"),
			async (evt: MouseEvent) => {
				this.openViewer();
			}
		);

		this.addCommand({
			id: "open-viewer",
			name: t("Open Viewer"),
			callback: () => {
				this.openViewer();
			},
		});
	}

	public async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private onFileCreated(file: TFile): void {
		if (this.app.workspace.layoutReady) {
			if (getDateFromFile(file, "day")) {
				createOrUpdateViewer(this.app, this.settings);
			}
		}
	}

	private onFileDeleted(file: TFile): void {
		if (this.app.workspace.layoutReady) {
			if (getDateFromFile(file, "day")) {
				createOrUpdateViewer(this.app, this.settings);
			}
		}
	}

	// 当开启插件时，自动创建 Viewer 文件
	private async createFileOnLoad() {
		await createOrUpdateViewer(this.app, this.settings);
	}

	// 当关闭插件时，自动删除 Viewer 文件
	async onunload() {
		let path = getPath(this.settings);
		const isFile = await this.app.vault.adapter.exists(path);
		if (isFile) {
			await this.app.vault.adapter.remove(path);
		}
	}

	// 当设置改变时，自动更新 Viewer 内容
	async updateFileOnSettingChange() {
		await createOrUpdateViewer(this.app, this.settings);
	}

	// 当文件变化时，自动更新 Viewer 内容
	registerFileMonitor() {
		this.onFileCreated = this.onFileCreated.bind(this);
		this.onFileDeleted = this.onFileDeleted.bind(this);

		this.registerEvent(this.app.vault.on("create", this.onFileCreated));
		this.registerEvent(this.app.vault.on("delete", this.onFileDeleted));
	}

	openViewer = async () => {
		let leaf;
		await createOrUpdateViewer(this.app, this.settings);
		if (this.settings.NewLeaf === true) {
			if (this.app.workspace.activeLeaf.view instanceof MarkdownView) {
				leaf = this.app.workspace.getLeaf(true);
			} else {
				leaf = this.app.workspace.getLeaf(false);
			}
		} else {
			leaf = this.app.workspace.getLeaf(false);
		}

		let path = getPath(this.settings);
		let viewer = this.app.vault.getAbstractFileByPath(path) as TFile;
		leaf.openFile(viewer);
	};
}
