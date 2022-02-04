/**
 * Gets source instance name.
 * @param {string | undefined} sourceInstanceName
 * @return {string}
 */
export function getSourceInstanceName(sourceInstanceName?: string): string {
  if (sourceInstanceName) {
    return sourceInstanceName;
  }

  // TODO: Make 'Default' unique each time the program was ran.
  return `Default`;
}
