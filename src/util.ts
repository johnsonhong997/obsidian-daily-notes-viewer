import {
	App,
	Notice,
	TFile,
} from "obsidian";
import { getAllDailyNotes } from "obsidian-daily-notes-interface";
import { ViewerSettings } from "./setting";

export const createOrUpdateViewer = async (app: App, setting: ViewerSettings): Promise<void> =>  {
	// 获取 daily notes 的 basename
	let allDailyNotes: string[] = [];
	for (let [string, TFile] of Object.entries(getAllDailyNotes())) {
		allDailyNotes.push(TFile.basename);
	}

	// 将 basename 转成链接
	let links: string[] = [];
	for (let dailyNote of allDailyNotes) {
		let path: string;
		path = setting.Heading?.length > 0 ? `${dailyNote}` + "#^" + setting.Heading : `${dailyNote}`;

		links.push(`![[${path}]]`);
	}

	links = links.sort().reverse(); // 对链接进行降序排序

	let linksText: string = "";
	for (let link of links) {
		linksText += `${link}\n`;
	}

	// 检测 viewer 文件是否存在并创建或更新 viewer 文件
	let viewer = app.vault.getAbstractFileByPath("Viewer.md") as TFile;
	if (viewer === null) {
		await app.vault.create("Viewer.md", `\n${linksText}`);
		new Notice("viewer created");
		return;
	} else {
		await app.vault.modify(viewer, `\n${linksText}`);
		new Notice("viewer updated");
		return;
	}
};
