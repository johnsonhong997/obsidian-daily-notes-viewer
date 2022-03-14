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
import { getAllDailyNotes } from "obsidian-daily-notes-interface";
import { ViewerSettings, DEFAULT_SETTINGS, ViewerSettingTab } from "./settings";

export default class ViewerPlugin extends Plugin {
	plugin: ViewerPlugin;
	settings: ViewerSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon(
			"calendar-glyph",
			"Open Viewer",
			(evt: MouseEvent) => {
				this.createOrUpdateViewer();
				this.openViewer();
			}
		);

		this.addCommand({
			id: "open-viewer",
			name: "Open Viewer",
			callback: () => {
				this.createOrUpdateViewer();
				this.openViewer();
			},
		});

		this.addSettingTab(new ViewerSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	createOrUpdateViewer = () => {
		let maximum = this.settings.maximum;
		let lines = this.settings.lines;

		// 获取 daily notes 的 basename
		let allDailyNotes: string[] = [];
		for (let [string, TFile] of Object.entries(getAllDailyNotes())) {
			allDailyNotes.push(TFile.basename);
		}

		// 将 basename 转成链接
		let links: string[] = [];
		for (let dailyNote of allDailyNotes) {
			links.push(`![[${dailyNote}]]`);
		}

		links = links.sort().reverse().slice(0, maximum); // 设置最大天数

		let linksText: string = "";
		for (let link of links) {
			linksText += `${link}\n`;

			// 设置间隔
			for (let i = 0; i < lines; i++) {
				linksText += `\n`;
			}
		}

		// 检测 viewer 文件是否存在并创建或更新 viewer 文件
		let viewer = this.app.vault.getAbstractFileByPath("Viewer.md") as TFile;
		if (viewer === null) {
			this.app.vault.create("Viewer.md", `\n${linksText}`);
			new Notice("viewer created");
		} else {
			this.app.vault.modify(viewer, `\n${linksText}`);
			new Notice("viewer updated");
		}
	};

	getActiveLeaf(): WorkspaceLeaf {
		return this.app.workspace.getLeaf();
	}

	openViewer = () => {
		let leaf = this.getActiveLeaf();
		let viewer = this.app.vault.getAbstractFileByPath("Viewer.md") as TFile;
		leaf.openFile(viewer);
	};
}
