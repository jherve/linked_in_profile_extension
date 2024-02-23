function downloadAsJson(content, fileName) {
  const blob = new Blob([JSON.stringify(content, null, "  ")], { type: "text/json" });
  const profileUrl = URL.createObjectURL(blob);

  browser.downloads.download({ url: profileUrl, filename: fileName, saveAs: true });
}

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.download_profile) {
    try {
      downloadAsJson(msg.download_profile, "profile.json");
    } catch (error) {
      console.error(error);
    }
  } else {
    console.error("[bg] received unhandled message", msg);
  }
});
