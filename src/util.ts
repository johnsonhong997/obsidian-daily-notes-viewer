import { App, TFile } from "obsidian";
import { getAllDailyNotes } from "obsidian-daily-notes-interface";
import { ViewerSettings } from "./setting";

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
		let linkText: string;
		linkText =
			setting.Heading?.length > 0
				? `${dailyNote}` + "#^" + setting.Heading
				: `${dailyNote}`; // 显示全部内容或指定标题后的内容
		links.push(`![[${linkText}]]`);
	}

	let maximum = setting.Maximum;
	links = links.sort().reverse().slice(0, maximum); // 对链接进行降序排序，设定数量

	let fileText: string = "";
	let lines = setting.Lines;
	for (let link of links) {
		fileText += `${link}\n`;

		// 设定插入间隔
		for (let i = 0; i < lines; i++) {
			fileText += `\n`;
		}
	}

	// 设置开头的内容
	let beginning = setting.Beginning;

	// 检测 Viewer 文件是否存在，创建 Viewer 文件或更新 Viewer 内容
	let regex = /^\s*$/i;
	let path = getPath(setting);
	let filename = setting.Filename;
	let file = app.vault.getAbstractFileByPath(path) as TFile;
	if (!regex.test(filename)) {
		if (file === null) {
			await app.vault.create(path, `${beginning}\n${fileText}`);
			return;
		} else {
			await app.vault.modify(file, `${beginning}\n${fileText}`);
			return;
		}
	}
};

export const getPath = (setting: ViewerSettings) => {
	let filename = setting.Filename;
	let folder = setting.Folder;
	let regex = /^\s*$/i;
	let path;

	if (regex.test(folder)) {
		path = `${filename}.md`;
	} else {
		path = `${folder}/${filename}.md`;
	}
	return path;
};
