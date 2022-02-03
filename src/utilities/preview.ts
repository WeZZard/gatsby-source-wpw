function isPreviewEnabled(): boolean {
  if (process.env.GATSBY_IS_PREVIEW_ENABLED) {
    return true;
  }
  if (typeof (process.env.gatsby_executing_command) == "string") {
    if (process.env.gatsby_executing_command.includes("develop")) {
      return true;
    }
  }
  return false;
}

export default isPreviewEnabled;
