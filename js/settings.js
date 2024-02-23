const linkedInForm = document.querySelector("form#linkedin-id");

linkedInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = e.target.querySelector("input");
  browser.storage.sync.set({ username: input.value });
});


(async () => {
  const { username } = await browser.storage.sync.get("username");
  linkedInForm.querySelector("input").value = username || "";
})();
