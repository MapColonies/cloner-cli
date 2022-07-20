import Path from 'path';
import { promises as fsp, createWriteStream } from 'fs';
import { singleton } from 'tsyringe';
import { simpleGit } from 'simple-git';
import archiver from 'archiver';
import { DirectorySource, InputDirectorySource } from './directorySource';

@singleton()
export class ExtractManager {
  public async zipSources(inputFile: string, targetFile: string, useTar: boolean): Promise<void> {
    const input = await fsp.readFile(inputFile, { encoding: 'utf-8' });
    const inputSources = JSON.parse(input) as InputDirectorySource[];
    const cloneTarget = Path.join('.', 'clones');
    const sources: DirectorySource[] = this.parseInputSources(inputSources, cloneTarget);

    await this.cloneAll(sources);
    const archive = this.createArchive(targetFile, useTar);
    await this.addDirectoriesToArchive(sources, archive);
    console.log('finalizing archive');
    await archive.finalize();
    console.log('removing clones');
    await fsp.rm(cloneTarget, { recursive: true });
  }

  private parseInputSources(inputSources: InputDirectorySource[], target: string): DirectorySource[] {
    const sources: DirectorySource[] = [];
    inputSources.forEach((source) => {
      if (source.repositoryUrl.endsWith('/')) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        source.repositoryUrl = source.repositoryUrl.slice(0, -1);
      }
      const repoName = source.repositoryUrl.substring(source.repositoryUrl.lastIndexOf('/'));
      const repoPath = Path.join(target, repoName);
      sources.push({ ...source, repositoryName: repoName, repositoryPath: repoPath });
    });
    return sources;
  }

  private async cloneAll(sources: DirectorySource[]): Promise<void> {
    const repositories = new Set<string>();
    const ops = [];
    const git = simpleGit();
    for (const source of sources) {
      if (repositories.has(source.repositoryUrl)) {
        continue;
      }
      console.log(`cloning ${source.repositoryUrl}`);
      repositories.add(source.repositoryUrl);
      ops.push(git.clone(source.repositoryUrl, source.repositoryPath));
    }
    await Promise.all(ops);
    console.log(`finished cloning all repositories`);
  }

  private createArchive(targetFile: string, useTar = false): archiver.Archiver {
    const output = createWriteStream(targetFile);
    const archive = archiver(useTar ? 'tar' : 'zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });
    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function () {
      console.log(`${archive.pointer()} total bytes`);
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function () {
      console.log('Data has been drained');
    });
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.log(err.message);
      } else {
        // throw error
        throw err;
      }
    });
    // good practice to catch this error explicitly
    archive.on('error', function (err) {
      throw err;
    });
    // pipe archive data to the file
    archive.pipe(output);
    return archive;
  }

  private async addDirectoriesToArchive(sources: DirectorySource[], archive: archiver.Archiver): Promise<void> {
    for (const source of sources) {
      const src = source.repositoryPath;
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      const srcDir = source.directory ? Path.join(src, source.directory) : src;
      console.log(`adding ${srcDir} to archive`);
      const git = simpleGit(src);
      await git.checkout(source.branch);
      await git.pull();
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      const targetDir = source.targetDir ? source.targetDir : source.repositoryName;
      archive.directory(srcDir, targetDir);
    }
  }
}
