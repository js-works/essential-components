export type { FileUploadTheme, FileUploadThemeColor };

type FileUploadThemeColor = string | { light: string; dark: string };

type FileUploadTheme = {
  accentColor?: FileUploadThemeColor;
  accentTextColor?: FileUploadThemeColor;
  textColor?: FileUploadThemeColor;
  mutedColor?: FileUploadThemeColor;
  borderColor?: FileUploadThemeColor;
  surfaceColor?: FileUploadThemeColor;
  successColor?: FileUploadThemeColor;
  dangerColor?: FileUploadThemeColor;
  borderRadius?: string;
  buttonBorderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
};
