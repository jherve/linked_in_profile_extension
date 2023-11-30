// The main event loop
browser.browserAction.onClicked.addListener(async (tab) => {
  try {
    const profile = await browser.storage.local.get();
    const blob = new Blob([JSON.stringify(profile, null, "  ")], { type: "text/json" });
    const profileUrl = URL.createObjectURL(blob);

    browser.downloads.download({ url: profileUrl, filename: "profile.json", saveAs: true });
  } catch (error) {
    error(error);
  }
});
