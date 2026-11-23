export type { MicroAppFormConfig };

type MicroAppFormConfig = {
  errorMessage?: (error: unknown) => string | undefined;
};
