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

async function refreshLinkedInUsername() {
  const { username } = await browser.storage.sync.get("username");
  const base = `https://www.linkedin.com/in/${username}`;
  const urls = {
    main: base,
    skills: `${base}/details/skills/`,
    projects: `${base}/details/projects/`,
    experience: `${base}/details/experience/`,
    education: `${base}/details/education/`,
  };

  const links = Object.entries(urls)
    .map((u) => `<a href=${u[1]}>${u[0]}</a>`)
    .join("\n");
  document.querySelector("#links").innerHTML = links;
}

document.querySelector("form#download").addEventListener("submit", async (e) => {
  e.preventDefault();
  const profile = await getFullProfile();
  browser.runtime.sendMessage({ download_profile: profile });
});

browser.storage.local.onChanged.addListener(() => refreshDisplayedProfile());
browser.storage.sync.onChanged.addListener(() => refreshLinkedInUsername());

(async () => {
  await refreshLinkedInUsername();
  await refreshDisplayedProfile();
})();
