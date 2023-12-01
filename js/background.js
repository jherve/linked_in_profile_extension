function downloadAsJson(content, fileName) {
  const blob = new Blob([JSON.stringify(content, null, "  ")], { type: "text/json" });
  const profileUrl = URL.createObjectURL(blob);

  browser.downloads.download({ url: profileUrl, filename: fileName, saveAs: true });
}

// The main event loop
browser.browserAction.onClicked.addListener(async (tab) => {
  try {
    const profile = await browser.storage.local.get();
    downloadAsJson(
      {
        basics: profile.basics,
        work: profile.work,
        volunteer: profile.volunteer,
        education: profile.education,
        skills: profile.skills,
        projects: profile.projects,
      },
      "profile.json"
    );
  } catch (error) {
    error(error);
  }
});
