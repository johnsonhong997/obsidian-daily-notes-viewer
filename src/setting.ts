import { App, PluginSettingTab, Setting } from "obsidian";
import ViewerPlugin from "./index";
import { t } from "./translations/helper";

export interface ViewerSettings {
	Filename: string;
	Folder: string;
	Beginning: string;
	Heading: string;
	Maximum: number;
	Lines: number;
	NewLeaf: boolean;
}

export const DEFAULT_SETTINGS: ViewerSettings = {
	Filename: "Viewer",
	Folder: "",
	Beginning: "",
	Heading: "",
	Maximum: 30,
	Lines: 0,
	NewLeaf: false,
};

export class ViewerSettingTab extends PluginSettingTab {
	plugin: ViewerPlugin;

	private applyDebounceTimer: number = 0;

	constructor(app: App, plugin: ViewerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	// applySettingsUpdate() {
	// 	clearTimeout(this.applyDebounceTimer);
	// 	const plugin = this.plugin;
	// 	this.applyDebounceTimer = window.setTimeout(() => {
	// 		plugin.saveSettings();
	// 	}, 100);
	// }

	async hide() {}

	async display() {
		await this.plugin.loadSettings();

		const { containerEl } = this;
		this.containerEl.empty();

		this.containerEl.createEl("h1", { text: t("Regular Options") });

		new Setting(containerEl)
			.setName(t("Viewer Filename"))
			.setDesc(
				t(
					"The filename of Viewer. If empty, Viewer will not be created."
				)
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.Filename)
					.onChange(async (value) => {
						this.plugin.settings.Filename = value;
						this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("Viewer Folder"))
			.setDesc(
				t(
					"The location of Viewer. If empty, Viewer will be placed in the Vault root."
				)
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.Folder)
					.onChange(async (value) => {
						this.plugin.settings.Folder = value;
						this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setDesc(
			t(
				"Notice: If you change the filename or folder of Viewer, you need to click the ribbon icon to create a new Viewer. The old Viewer will no longer work, you can delete it."
			)
		);

		this.containerEl.createEl("h1", { text: t("Advanced Options") });

		new Setting(containerEl)
			.setName(t("Content at Beginning"))
			.setDesc(t("The content to display at the beginning of Viewer."))
			.addTextArea((text) =>
				text
					.setPlaceholder("content")
					.setValue(this.plugin.settings.Beginning)
					.onChange(async (value) => {
						this.plugin.settings.Beginning = value;
						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);

		new Setting(containerEl)
			.setName(t("Content under Specified Heading"))
			.setDesc(
				t(
					"The content under the specified heading to display in Viewer."
				)
			)
			.addText((text) =>
				text
					.setPlaceholder("heading")
					.setValue(this.plugin.settings.Heading)
					.onChange(async (value) => {
						this.plugin.settings.Heading = value;
						// this.applySettingsUpdate();
						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);

		new Setting(containerEl)
			.setName(t("Quantity to Display"))
			.setDesc(t("The quantity of daily notes to display. (Default: 30)"))
			.addText((text) =>
				text
					.setPlaceholder("0")
					.setValue((this.plugin.settings.Maximum || 0) + "")
					.onChange(async (value) => {
						this.plugin.settings.Maximum = parseInt(value);
						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);

		new Setting(containerEl)
			.setName(t("Size of Spacing"))
			.setDesc(t("The size of spacing to display. (Default: 0)"))
			.addText((text) =>
				text
					.setPlaceholder("0")
					.setValue((this.plugin.settings.Lines || 0) + "")
					.onChange(async (value) => {
						this.plugin.settings.Lines = parseInt(value);
						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);

		new Setting(containerEl)
			.setName(t("Open in New Pane"))
			.setDesc(t("Open Viewer in a new pane. (Default: OFF)"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.NewLeaf)
					.onChange((value) => {
						this.plugin.settings.NewLeaf = value;
						this.plugin.saveSettings();
					})
			);
	}
}
