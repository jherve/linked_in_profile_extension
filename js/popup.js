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

async function refreshDisplayedProfile() {
  const profile = await getFullProfile();
  document.querySelector("#profile").innerHTML = `<pre>${JSON.stringify(profile, null, 2)}</pre>`;
}

document.querySelector("form#download").addEventListener("submit", async (e) => {
  e.preventDefault();
  const profile = await getFullProfile();
  browser.runtime.sendMessage({ download_profile: profile });
});

(async () => {
  await refreshDisplayedProfile();
})();
