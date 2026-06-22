interface BrowserStorageWindow {
  readonly localStorage?: Storage | null;
}

export const getBrowserStorage = (
  browserWindow: BrowserStorageWindow | undefined = globalThis.window,
): Storage | null => {
  try {
    return (browserWindow as BrowserStorageWindow).localStorage ?? null;
  } catch {
    return null;
  }
};
