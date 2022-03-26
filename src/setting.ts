import { App, PluginSettingTab, Setting } from "obsidian";
import { basename } from "path";
import ViewerPlugin from "./index";
import { t } from "./translations/helper";

export interface ViewerSettings {
	Filename: string;
	Folder: string;
	NewPane: boolean;
	Beginning: string;
	Heading: string;
	Spacing: number;
	Filter: string;
	Future: boolean;
	Quantity: number;
	Start: string;
	End: string;
}

export const DEFAULT_SETTINGS: ViewerSettings = {
	Filename: "Viewer",
	Folder: "",
	NewPane: false,
	Beginning: "",
	Heading: "",
	Spacing: 0,
	Filter: "recent",
	Future: false,
	Quantity: 30,
	Start: "",
	End: "",
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
			.setName(t("Open in New Pane"))
			.setDesc(t("Open Viewer in a new pane. (Default: OFF)"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.NewPane)
					.onChange((value) => {
						this.plugin.settings.NewPane = value;
						this.plugin.saveSettings();
					})
			);

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
			.setName(t("Size of Spacing"))
			.setDesc(t("The size of spacing to display. (Default: 0)"))
			.addText((text) =>
				text
					.setPlaceholder("0")
					.setValue((this.plugin.settings.Spacing || 0) + "")
					.onChange(async (value) => {
						this.plugin.settings.Spacing = parseInt(value);
						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);

		// Filter 设置
		new Setting(containerEl)
			.setName(t("Daily Notes Filter"))
			.setDesc(
				t(
					"Recent: Displaying recent daily notes. Range: Displaying daily notes from a start date to a end date."
				)
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("recent", t("Recent"))
					.addOption("range", t("Range"))
					.setValue(this.plugin.settings.Filter)
					.onChange((value) => {
						this.plugin.settings.Filter = value;

						recent.toggleClass(
							"recent-hide",
							this.plugin.settings.Filter !== "recent"
						);

						range.toggleClass(
							"range-hide",
							this.plugin.settings.Filter !== "range"
						);

						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);

		// Recent 设置
		const recent = containerEl.createEl("div", { cls: "recent-hide" });
		recent.toggleClass(
			"recent-hide",
			this.plugin.settings.Filter !== "recent"
		);

		new Setting(recent)
			.setName(t("Display Future Daily Notes"))
			.setDesc(t("Display Future Daily Notes. (Default: OFF)"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.Future)
					.onChange((value) => {
						this.plugin.settings.Future = value;
						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);

		new Setting(recent)
			.setName(t("Quantity to Display"))
			.setDesc(t("The quantity of daily notes to display. (Default: 30)"))
			.addText((text) =>
				text
					.setPlaceholder("0")
					.setValue((this.plugin.settings.Quantity || 0) + "")
					.onChange(async (value) => {
						this.plugin.settings.Quantity = parseInt(value);
						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);

		// Range 设置
		const range = containerEl.createEl("div", { cls: "range-hide" });
		range.toggleClass(
			"range-hide",
			this.plugin.settings.Filter !== "range"
		);

		new Setting(range)
			.setName(t("Start Date"))
			.setDesc(t("Start Date."))
			.addText((text) =>
				text
					.setPlaceholder("YYYY-MM-DD")
					.setValue(this.plugin.settings.Start)
					.onChange(async (value) => {
						this.plugin.settings.Start = value;
						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);

		new Setting(range)
			.setName(t("End Date"))
			.setDesc(t("End Date."))
			.addText((text) =>
				text
					.setPlaceholder("YYYY-MM-DD")
					.setValue(this.plugin.settings.End)
					.onChange(async (value) => {
						this.plugin.settings.End = value;
						this.plugin.saveSettings();
						this.plugin.updateFileOnSettingChange();
					})
			);
	}
}
