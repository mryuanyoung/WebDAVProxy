const { readdir, stat } = require('fs/promises')
const Path = require('path')

export async function getAllFiles(DIR, filesList) {
    try {
        const files = await readdir(DIR);
        for (const file of files) {
            const filePath = Path.join(DIR, file);
            const fileStat = await stat(filePath);
            if (fileStat.isDirectory()) {
                await getAllFiles(filePath, filesList);
            }
            else {
                const fileName = file.split('.')[0]
                filesList.push(Path.join(DIR, fileName));
            }
        }
    } catch (err) {
        console.error(err);
    }
}