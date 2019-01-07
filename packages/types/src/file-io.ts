export type TempFolderCreator = () => {
  name: string;
  cleanup(): void;
};
