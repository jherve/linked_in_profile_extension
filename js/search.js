function debug(...stuff) {
  console.debug("[content]", ...stuff);
}
function info(...stuff) {
  console.info("[content]", ...stuff);
}
function error(...stuff) {
  console.error("[content]", ...stuff);
}

const Context = {
  LinkedInProfileMain: Symbol("LinkedInProfileMain"),
  LinkedInProfileProjects: Symbol("LinkedInProfileProjects"),
  LinkedInProfileSkills: Symbol("LinkedInProfileSkills"),
  Unknown: Symbol(null),
};

function isOwnProfile() {
  // This is our profile if there are some edit buttons
  const allEdits = document.querySelectorAll("a[href*=edit]");
  return allEdits.length > 0;
}

function getContext(url) {
  if (
    url.hostname == "www.linkedin.com" &&
    url.pathname.match(/\/in\/[^\/]+\/details\/projects\//)
  ) {
    return Context.LinkedInProfileProjects;
  } else if (
    url.hostname == "www.linkedin.com" &&
    url.pathname.match(/\/in\/[^\/]+\/details\/skills\//)
  ) {
    return Context.LinkedInProfileSkills;
  } else if (url.hostname == "www.linkedin.com" && url.pathname.match(/\/in\/[^\/]+\/$/)) {
    return Context.LinkedInProfileMain;
  } else {
    return Context.Unknown;
  }
}

function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function waitForElement(selector) {
  let el;
  let loops = 0;
  while (el == undefined && loops < 10) {
    debug("waiting for", selector);
    el = document.querySelector(selector);
    loops++;
    await sleep(200);
  }
  debug("found", selector, el);
  return el;
}

function getLinkedInCardContent(el) {
  return el.querySelectorAll("span[aria-hidden=true]");
}

function splitString(string) {
  return string.split(/ [·•] /);
}

function toListOfSkills(el) {
  if (el)
    return el.innerText
      .split(": ")
      .at(-1)
      .split(/ [·•] /);
  else return el;
}

async function waitForPageLoad(context) {
  if (context == Context.LinkedInProfileMain) {
    await waitForElement(
      "#experience + div + div.pvs-list__outer-container .pvs-entity div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)"
    );
  } else if (context == Context.LinkedInProfileProjects) {
    await waitForElement(
      ".pvs-list__container ul.pvs-list div.pvs-entity > div:nth-child(1) > div:nth-child(1)"
    );
  } else if (context == Context.LinkedInProfileSkills) {
    const mainListSelector = "main > section > div > div.active > div > div > div > ul";
    const initialScrollY = window.scrollY;

    await waitForElement(mainListSelector);
    const mainList = document.querySelector(mainListSelector);

    let countBeforeScroll, countAfterScroll;
    do {
      // Wait for the last item in the list to be loaded
      await waitForElement("div.active ul > li:last-child");
      countBeforeScroll = mainList.childElementCount;
      window.scrollTo(0, window.scrollMaxY);

      // Wait for a (n+1)th child to be added to the list. This will eventually timeout
      // if no such element is added to the tree.
      await waitForElement(`div.active ul > li:nth-child(${countBeforeScroll + 1})`);
      countAfterScroll = mainList.childElementCount;
    } while (countBeforeScroll != countAfterScroll);

    window.scrollTo(0, initialScrollY);
  }
}

function getLinkedInProfileMainContent() {
  const name = document.querySelector("h1");
  const title = document.querySelector(".text-body-medium");
  const summary = document.querySelector("#about + div + div span");
  const [_ignored, main_skills] = document.querySelectorAll(
    "#about + div + div + div span[aria-hidden=true]"
  );
  const allExperiences = document.querySelectorAll(
    "#experience + div + div.pvs-list__outer-container div[data-view-name]"
  );

  const experiences = Array.from(allExperiences).map((el) => {
    const [position, company_status, time_span, location, summary, skills] =
      getLinkedInCardContent(el);
    const [company, status] = splitString(company_status.innerText);
    const [span, duration] = splitString(time_span.innerText);

    return {
      name: company,
      position: position.innerText,
      location: location.innerText,
      status: status,
      span: span,
      duration: duration,
      summary: summary.innerText,
      skills: toListOfSkills(skills),
    };
  });
  const allEducations = document.querySelectorAll(
    "#education + div + div.pvs-list__outer-container div[data-view-name]"
  );
  const educations = Array.from(allEducations).map((el) => {
    const [institution, area, time_span, summary, skills] = getLinkedInCardContent(el);
    return {
      institution: institution.innerText,
      area: area.innerText,
      time_span: time_span.innerText,
      summary: summary.innerText,
      skills: toListOfSkills(skills),
    };
  });
  const allVolunteering = document.querySelectorAll(
    "#volunteering_experience + div + div.pvs-list__outer-container div[data-view-name]"
  );
  const volunteerings = Array.from(allVolunteering).map((el) => {
    const [position, entity, time_span, description] = getLinkedInCardContent(el);
    const [span, duration] = splitString(time_span.innerText);
    return {
      organization: entity.innerText,
      role: position.innerText,
      span: span,
      duration: duration,
      summary: description.innerText,
    };
  });

  return {
    basics: {
      name: name.innerText,
      label: title.innerText,
      summary: summary.innerText,
      main_skills: toListOfSkills(main_skills),
    },
    work: experiences,
    education: educations,
    volunteer: volunteerings,
  };
}

function getLinkedInProfileProjectContent() {
  const allProjects = document.querySelectorAll("ul.pvs-list > li > div > div[data-view-name]");
  return Array.from(allProjects).map((el) => {
    const name = el.querySelector(
      ":scope > div > div > div div div div :not(ul) span[aria-hidden=true]"
    );
    const time_span = el.querySelector(":scope span > span[aria-hidden=true]");
    const entity = el.querySelector(
      ":scope > div > div > ul > li > div > div span[aria-hidden=true]"
    );
    const [description, skills] = el.querySelectorAll(
      ":scope ul > li ul > li > div div div span[aria-hidden=true]"
    );

    return {
      name: name.innerText,
      time_span: time_span.innerText,
      entity: entity ? entity.innerText : null,
      description: description.innerText,
      skills: toListOfSkills(skills),
    };
  });
}

function getLinkedInProfileSkillsContent() {
  const allSkills = document.querySelectorAll(
    "div:not([hidden]) > div > div > div > ul.pvs-list a[href*='search/results/all'] span[aria-hidden=true]"
  );
  return Array.from(allSkills, (el) => el.innerText);
}

(async () => {
  const url = new URL(document.URL);
  const context = getContext(url);

  await waitForPageLoad(context);

  if (isOwnProfile() && context == Context.LinkedInProfileMain) {
    const main = getLinkedInProfileMainContent();
    browser.storage.local.set(main);
  } else if (isOwnProfile() && context == Context.LinkedInProfileProjects) {
    const projects = getLinkedInProfileProjectContent();
    browser.storage.local.set({ projects });
  } else if (isOwnProfile() && context == Context.LinkedInProfileSkills) {
    const skills = getLinkedInProfileSkillsContent();
    browser.storage.local.set({ skills });
  }
})();
