import * as assert from 'assert';
import { fixImports, EditorAccess, PackageInfo } from '../main';

class FakeEditor implements EditorAccess {
    fileName: string;
    lines: string[];

    constructor(fileName: string, lines: string[]) {
        this.fileName = fileName;
        this.lines = lines;
    }

    getFileName(): string {
        return this.fileName;
    }

    getLineCount(): number {
        return this.lines.length;
    }

    getLineAt(idx: number): string {
        return this.lines[idx];
    }

    replaceLineAt(idx: number, newLine: string): Thenable<boolean> {
        this.lines[idx] = newLine;
        return Promise.resolve(true);
    }
}

suite('#fixImports test', () => {
    test('replace a couple of wrong imports, keep the rest', async () => {
        const pathSep = '/';
        const editor: EditorAccess = new FakeEditor('root/lib/foo/1.dart', [
            '',
            'import "package:this_package/foo/2.dart";',
            'import "package:other_package/foo/1.dart";',
            '',
            'import   "package:this_package/bar/1.dart";',
            'import "package:other_package/sam.dart";',
        ]);
        const packageInfo: PackageInfo = {
            projectRoot: 'root',
            projectName: 'this_package',
        };
        const result: number = await fixImports(editor, packageInfo, pathSep);
        assert.equal(2, result);
        assert.equal('import "2.dart";', editor.getLineAt(1));
        assert.equal('import "package:other_package/foo/1.dart";', editor.getLineAt(2));
        assert.equal('import "../bar/1.dart";', editor.getLineAt(4));
        assert.equal('import "package:other_package/sam.dart";', editor.getLineAt(5));
    });
});