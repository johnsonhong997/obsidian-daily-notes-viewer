import { App, Notice, TFile } from "obsidian";
import { getAllDailyNotes } from "obsidian-daily-notes-interface";
import { ViewerSettings } from "./setting";
import { t } from "./translations/helper";

export const createOrUpdateViewer = async (
	app: App,
	setting: ViewerSettings
): Promise<void> => {
	// 获取 daily notes 的 basename
	let allDailyNotes: string[] = [];
	for (let [string, TFile] of Object.entries(getAllDailyNotes())) {
		allDailyNotes.push(TFile.basename);
	}

	// 将 basename 转成链接
	let links: string[] = [];
	for (let dailyNote of allDailyNotes) {
		let path: string;
		path =
			setting.Heading?.length > 0
				? `${dailyNote}` + "#^" + setting.Heading
				: `${dailyNote}`;

		links.push(`![[${path}]]`);
	}

	let maximum = setting.Maximum;
	links = links.sort().reverse().slice(0, maximum); // 对链接进行降序排序，设定数量

	let linksText: string = "";
	let lines = setting.Lines;
	for (let link of links) {
		linksText += `${link}\n`;

		// 插入间隔
		for (let i = 0; i < lines; i++) {
			linksText += `\n`;
		}
	}

	// 检测 Viewer 文件是否存在，创建 Viewer 文件或更新 Viewer 内容
	let viewer = app.vault.getAbstractFileByPath("Viewer.md") as TFile;
	if (viewer === null) {
		await app.vault.create("Viewer.md", `\n${linksText}`);
		new Notice(t("Viewer created"));
		return;
	} else {
		await app.vault.modify(viewer, `\n${linksText}`);
		new Notice(t("Viewer updated"));
		return;
	}
};
