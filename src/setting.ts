import { App, PluginSettingTab, Setting } from 'obsidian';
import ViewerPlugin from "./index";
import {t} from "./translations/helper";
import {createOrUpdateViewer} from "./util";

export interface ViewerSettings {
	Heading: string;

}

export const DEFAULT_SETTINGS: ViewerSettings = {
	Heading: '',
};

export class ViewerSettingTab extends PluginSettingTab {
	plugin: ViewerPlugin;
	//eslint-disable-next-line
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

	//eslint-disable-next-line
	async hide() {}

	async display() {
		await this.plugin.loadSettings();

		const { containerEl } = this;
		this.containerEl.empty();

		this.containerEl.createEl('h1', { text: t('Regular Options') });

		new Setting(containerEl)
			.setName(t('Display After Heading'))
			.setDesc(t('Display content after heading. None by default'))
			.addText((text) =>
				text
					.setPlaceholder('JOURNAL')
					.setValue(this.plugin.settings.Heading)
					.onChange(async (value) => {
						this.plugin.settings.Heading = value;
						this.applySettingsUpdate();
					}),
			);
	}
}
