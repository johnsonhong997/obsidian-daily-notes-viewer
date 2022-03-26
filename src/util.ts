import { App, TFile } from "obsidian";
import { getAllDailyNotes, getDateUID } from "obsidian-daily-notes-interface";
import moment from "moment";
import { ViewerSettings } from "./setting";

export const createOrUpdateViewer = async (
	app: App,
	setting: ViewerSettings
): Promise<void> => {
	// 获取 daily notes 的 basename
	let allDailyNotesBasename: string[];
	if (setting.Filter === "recent") {
		allDailyNotesBasename = getRecent(setting);
	} else if (setting.Filter === "range") {
		allDailyNotesBasename = getRange(setting);
	}

	// 将 basename 转成链接
	let links: string[] = [];
	for (let dailyNote of allDailyNotesBasename) {
		let linkText: string;
		linkText =
			setting.Heading?.length > 0
				? `${dailyNote}` + "#^" + setting.Heading
				: `${dailyNote}`; // 显示全部内容或指定标题后的内容
		links.push(`![[${linkText}]]`);
	}

	let fileText: string = "";
	let spacing = setting.Spacing;
	for (let link of links) {
		fileText += `${link}\n`;

		// 设定插入间隔
		for (let i = 0; i < spacing; i++) {
			fileText += `\n`;
		}
	}

	// 设置开头的内容
	let beginning = setting.Beginning;

	// 检测 Viewer 文件是否存在，创建 Viewer 文件或更新 Viewer 内容
	let pathRegex = /^\s*$/;
	let path = getPath(setting);
	let filename = setting.Filename;
	let file = app.vault.getAbstractFileByPath(path) as TFile;
	if (!pathRegex.test(filename)) {
		let contentNew = `${beginning}\n${fileText}`;
		if (file === null) {
			await app.vault.create(path, contentNew);
			return;
		} else {
			let contentOld = await app.vault.cachedRead(file);
			if (contentNew !== contentOld) {
				await app.vault.modify(file, contentNew);
			}
			return;
		}
	}
};

const getRecent = (setting: ViewerSettings) => {
	// 获取 today note 的 UID
	let now = moment();
	let today = getDateUID(now, "day");

	// 获取 daily notes 的 basename
	let allDailyNotes = getAllDailyNotes();
	let allDailyNotesUID = Object.keys(allDailyNotes).sort().reverse();
	let allDailyNotesRecent: any = {};
	if (setting.Future) {
		for (let i = 0; i < allDailyNotesUID.length; i++) {
			allDailyNotesRecent[allDailyNotesUID[i]] =
				allDailyNotes[allDailyNotesUID[i]];
		}
	} else {
		for (let i = 0; i < allDailyNotesUID.length; i++) {
			if (allDailyNotesUID[i] <= today) {
				allDailyNotesRecent[allDailyNotesUID[i]] =
					allDailyNotes[allDailyNotesUID[i]];
			}
		}
	}
	let allDailyNotesBasename: string[] = [];
	for (let [string, TFile] of Object.entries(allDailyNotesRecent)) {
		allDailyNotesBasename.push(TFile.basename);
	}
	allDailyNotesBasename = allDailyNotesBasename.slice(0, setting.Quantity);
	return allDailyNotesBasename;
};

const getRange = (setting: ViewerSettings) => {
	// 获取 Range 的 UID
	let startDate = moment(setting.Start);
	let endDate = moment(setting.End);
	let startDateUID = getDateUID(startDate, "day");
	let endDateUID = getDateUID(endDate, "day");

	// 获取 daily notes 的 basename
	let allDailyNotes = getAllDailyNotes();
	let allDailyNotesUID = Object.keys(allDailyNotes).sort();
	let allDailyNotesRange: any = {};
	let dateRegex = /^\d{4}\-\d{2}\-\d{2}$/;
	if (dateRegex.test(setting.Start) && dateRegex.test(setting.End)) {
		for (let i = 0; i < allDailyNotesUID.length; i++) {
			if (
				allDailyNotesUID[i] >= startDateUID &&
				allDailyNotesUID[i] <= endDateUID
			) {
				allDailyNotesRange[allDailyNotesUID[i]] =
					allDailyNotes[allDailyNotesUID[i]];
			}
		}
	}
	let allDailyNotesBasename: string[] = [];
	for (let [string, TFile] of Object.entries(allDailyNotesRange)) {
		allDailyNotesBasename.push(TFile.basename);
	}
	return allDailyNotesBasename;
};

export const getPath = (setting: ViewerSettings) => {
	let filename = setting.Filename;
	let folder = setting.Folder;
	let pathRegex = /^\s*$/;
	let path;

	if (pathRegex.test(folder)) {
		path = `${filename}.md`;
	} else {
		path = `${folder}/${filename}.md`;
	}
	return path;
};
