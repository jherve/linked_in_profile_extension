async function getFullProfile() {
  const profile = await browser.storage.local.get();

  return {
    basics: profile.basics,
    work: profile.work,
    volunteer: profile.volunteer,
    education: profile.education,
    skills: profile.skills,
    projects: profile.projects,
  };
}

document.querySelector("form#download").addEventListener("submit", async (e) => {
  e.preventDefault();
  const profile = await getFullProfile();
  browser.runtime.sendMessage({ download_profile: profile });
});
