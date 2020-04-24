const fs = require('fs');
const { watch } = require('chokidar');
const { basename, join } = require('path');

const assets = require(`${process.cwd()}/package.json`).assets || [];
const persistent = process.argv.slice(2)[0] !== 'once';

assets.map((entry) => {
	const targets = toArray(entry.target);

	return toArray(entry.source).map((source) => {
		return watch(source, { persistent })
			.on('add', (path) => copy(source, path, targets))
			.on('change', (path) => copy(source, path, targets))
			.on('unlink', (path) => remove(source, path, targets))
			.on('addDir', (path) => source !== path && copy(source, path, targets))
			.on('unlinkDir', (path) => remove(source, path, targets));
	});
});

function toArray(element) {
	return Array.isArray(element) ? element : [element];
}

function getTargetPath(source, file, target) {
	return file.replace(source, target);
}

function remove(source, file, targets) {
	targets.forEach((target) => console.log(removeFileSync(getTargetPath(source, file, target))));
}

function copy(source, file, targets) {
	targets.forEach((target) => console.log(copyFolderRecursiveSync(file, getTargetPath(source, file, target))));
}

function copyFileSync(source, target) {
	let targetFile = target;

	//if target is a directory a new file with the same name will be created
	if (fs.existsSync(target)) {
		if (fs.lstatSync(target).isDirectory()) {
			targetFile = join(target, basename(source));
		}
	} else {
		target
			.substring(0, target.lastIndexOf('/'))
			.split('/')
			.reduce((memo, folder) => {
				memo += folder;
				verifyFolderExists(memo);
				return `${memo}/`;
			}, '');
	}

	fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function verifyFolderExists(folder) {
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
	}
}

function copyFolderRecursiveSync(source, target) {
	if (fs.lstatSync(source).isDirectory()) {
		verifyFolderExists(target);

		fs.readdirSync(source).forEach((file) => {
			const curSource = join(source, file);

			if (fs.lstatSync(curSource).isDirectory()) {
				copyFolderRecursiveSync(curSource, target);
			} else {
				copyFileSync(curSource, target);
			}
		});
	} else {
		copyFileSync(source, target);
	}

	return `copying ${source} => ${target}`;
}

function removeFileSync(path) {
	if (fs.existsSync(path)) {
		if (fs.lstatSync(path).isDirectory()) {
			fs.readdirSync(path).forEach((file) => removeFileSync(`${path}/${file}`));
			fs.rmdirSync(path);
		} else {
			fs.unlinkSync(path); // delete file
		}
	}

	return `removing ${path}`;
}
