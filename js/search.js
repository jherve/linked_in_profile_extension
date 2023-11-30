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
    Unknown: Symbol(null)
}

function getContext(url) {
    if (url.hostname == "www.linkedin.com" && url.pathname.match(/\/in\/[^\/]+\/details\/projects\//)) {
        return Context.LinkedInProfileProjects;
    } else if (url.hostname == "www.linkedin.com" && url.pathname.match(/\/in\/[^\/]+\/$/)) {
        return Context.LinkedInProfileMain;
    } else {
        return Context.Unknown;
    }
}

function sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

async function waitForElement(selector) {
    let el;
    let loops = 0;
    while (el == undefined || loops < 10) {
        el = document.querySelector(selector);
        loops++;
        await sleep(200);
    }
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
        return el.innerText.split(": ").at(-1).split(/ [·•] /);
    else
        return el
}

async function getLinkedInProfileMainContent() {
    const summary = document.querySelector("#about + div + div span").innerText;
    const [_ignored, main_skills] = document.querySelectorAll("#about + div + div + div span[aria-hidden=true]");
    const allExperiences = document.querySelectorAll("#experience + div + div.pvs-list__outer-container .pvs-entity");
    await waitForElement("#experience + div + div.pvs-list__outer-container .pvs-entity div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)")
    const experiences = Array.from(allExperiences).map(el => {
        const [title, company_status, time_span, location, desc, skills] = getLinkedInCardContent(el);
        const [company, status] = splitString(company_status.innerText);
        const [span, duration] = splitString(time_span.innerText);

        return {
            title: title.innerText,
            company: company,
            status: status,
            span: span,
            duration: duration,
            location: location.innerText,
            desc: desc.innerText,
            skills: toListOfSkills(skills)
        };
    });
    const allEducations = document.querySelectorAll("#education + div + div.pvs-list__outer-container .pvs-entity");
    const educations = Array.from(allEducations).map(el => {
        const [entity, diploma, time_span, desc, skills] = getLinkedInCardContent(el);
        return {
            entity: entity.innerText,
            diploma: diploma.innerText,
            time_span: time_span.innerText,
            desc: desc.innerText,
            skills: toListOfSkills(skills)
        };
    });
    const allVolunteering = document.querySelectorAll("#volunteering_experience + div + div.pvs-list__outer-container .pvs-entity");
    const volunteerings = Array.from(allVolunteering).map(el => {
        const [role, entity, time_span, desc] = getLinkedInCardContent(el);
        const [span, duration] = splitString(time_span.innerText);
        return {
            role: role.innerText,
            entity: entity.innerText,
            span: span,
            duration: duration,
            desc: desc.innerText
        };
    });

    return {
        summary,
        main_skills: toListOfSkills(main_skills),
        experiences,
        educations,
        volunteerings
    }
}

async function getLinkedInProfileProjectContent() {
    await waitForElement(".pvs-list__container ul.pvs-list div.pvs-entity > div:nth-child(1) > div:nth-child(1)");
    const allProjects = document.querySelectorAll(".pvs-entity");
    info("projects", Array.from(allProjects).map(el => {
        const project = el.querySelector(":scope > div > div > div div div div :not(ul) span[aria-hidden=true]");
        const time_spans = el.querySelector(":scope span > span[aria-hidden=true]");
        const entities = el.querySelector(":scope > div > div > ul > li > div > div span[aria-hidden=true]");
        const desc_skills = el.querySelectorAll(":scope ul > li ul > li > div div div span[aria-hidden=true]");

        return {project, time_spans, entities, desc_skills};
    }));
}

(async () => {
    // Kinda hackish workaround to access modules shared between
    // background and content : https://stackoverflow.com/a/53033388
    const url = new URL(document.URL);
    const context = getContext(url);

    if (context == Context.LinkedInProfileMain) {
        info("profile", await getLinkedInProfileMainContent());
    } else if (context == Context.LinkedInProfileProjects) {
        await getLinkedInProfileProjectContent();
    }
})();
