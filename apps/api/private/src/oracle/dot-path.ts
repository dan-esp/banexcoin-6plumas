export const readDotPath = (value: unknown, path: string): unknown => {
  if (!path.trim()) {
    return undefined;
  }

  return path.split('.').reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, value);
};
