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
import ViewerPlugin from "./main";
import { DEFAULT_maximum, DEFAULT_lines } from "./constants";

//定义设置接口
export interface ViewerSettings {
	maximum: number;
	lines: number;
}

//定义默认设置
export const DEFAULT_SETTINGS: ViewerSettings = {
	maximum: DEFAULT_maximum,
	lines: DEFAULT_lines,
};

//设置选项卡
export class ViewerSettingTab extends PluginSettingTab {
	plugin: ViewerPlugin;

	constructor(app: App, plugin: ViewerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		this.containerEl.empty();

		new Setting(containerEl)
			.setName("Maximum")
			.setDesc(
				"The maximum number of daily notes to display in viewer (default 30)"
			)
			.addText((text) =>
				text
					.setPlaceholder(String(DEFAULT_maximum))
					.setValue(String(this.plugin.settings.maximum))
					.onChange((value) => {
						this.plugin.settings.maximum = parseInt(value);
						this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Lines")
			.setDesc(
				"The size of space between daily notes in viewer (default 0)"
			)
			.addText((text) =>
				text
					.setPlaceholder(String(DEFAULT_lines))
					.setValue(String(this.plugin.settings.lines))
					.onChange((value) => {
						this.plugin.settings.lines = parseInt(value);
						this.plugin.saveSettings();
					})
			);
	}
}
