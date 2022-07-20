export interface InputDirectorySource {
  repositoryUrl:string;
  branch: string;
  directory: string | undefined;
  targetDir: string | undefined;
}

export interface DirectorySource extends InputDirectorySource
{
  repositoryName: string;
  repositoryPath: string;
}
