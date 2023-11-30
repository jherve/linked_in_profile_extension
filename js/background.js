function downloadAsJson(content, fileName) {
  const blob = new Blob([JSON.stringify(content, null, "  ")], { type: "text/json" });
  const profileUrl = URL.createObjectURL(blob);

  browser.downloads.download({ url: profileUrl, filename: fileName, saveAs: true });
}

// The main event loop
browser.browserAction.onClicked.addListener(async (tab) => {
  try {
    const profile = await browser.storage.local.get();
    downloadAsJson(profile, "profile.json");
  } catch (error) {
    error(error);
  }
});
