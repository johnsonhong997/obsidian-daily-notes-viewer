import { App, PluginSettingTab, Setting } from "obsidian";
import ViewerPlugin from "./index";
import { t } from "./translations/helper";

export interface ViewerSettings {
	Heading: string;
	Maximum: number;
	Lines: number;
	NewLeaf: boolean;
}

export const DEFAULT_SETTINGS: ViewerSettings = {
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

	applySettingsUpdate() {
		clearTimeout(this.applyDebounceTimer);
		const plugin = this.plugin;
		this.applyDebounceTimer = window.setTimeout(() => {
			plugin.saveSettings();
		}, 100);
	}

	async hide() {}

	async display() {
		await this.plugin.loadSettings();

		const { containerEl } = this;
		this.containerEl.empty();

		this.containerEl.createEl("h1", { text: t("Regular Options") });

		new Setting(containerEl)
			.setName(t("Display after Heading"))
			.setDesc(t("Display content after heading. (Default: Dispaly all)"))
			.addText((text) =>
				text
					.setPlaceholder("Daily Notes")
					.setValue(this.plugin.settings.Heading)
					.onChange(async (value) => {
						this.plugin.settings.Heading = value;
						this.applySettingsUpdate();
					})
			);

		new Setting(containerEl)
			.setName(t("Quantity to Display"))
			.setDesc(t("The quantity of daily notes to display. (Default: 30)"))
			.addText((text) =>
				text
					.setPlaceholder("30")
					.setValue(String(this.plugin.settings.Maximum))
					.onChange((value) => {
						this.plugin.settings.Maximum = parseInt(value);
						this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("Size of Spacing"))
			.setDesc(t("The size of spacing between daily notes. (Default: 0)"))
			.addText((text) =>
				text
					.setPlaceholder("0")
					.setValue(String(this.plugin.settings.Lines))
					.onChange((value) => {
						this.plugin.settings.Lines = parseInt(value);
						this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(t("Open in New Pane"))
			.setDesc(t("Open viewer file in a new pane. (Default: OFF)"))
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
