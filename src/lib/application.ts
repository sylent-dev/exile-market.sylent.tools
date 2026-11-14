// The addresses of the application, in one place: the footer reads them, the download buttons too.
export const repository = "https://github.com/sylent-dev/rust-exile-market";
export const issues = `${repository}/issues`;
export const releases = `${repository}/releases`;

// The archives of the latest release, under names that never change from one version to the next
// (roadmap.md, Needed in rust-exile-market).
const latest = `${releases}/latest/download`;
export const downloads = {
  windows: `${latest}/exile-market-windows-x64.zip`,
  linux: `${latest}/exile-market-linux-x64.tar.gz`,
};

// The single setting of the download area: « Coming soon » as long as it is false, the buttons once
// the tag v0.1.0 is out and its archives answer at the addresses above (specs.md, Main action).
export const downloadsOpen: boolean = true;

// The donation page of the application (its step 18): Ko-fi, under the name « Sylent ».
export const donationPage = "https://ko-fi.com/sylentdev";

// The banner above the header links to it once this is true. It stays false as long as the legal
// notice says the site is published on a non-professional basis: the donations are revenue of the
// owner's individual business (docs/external-services.md, Legal notice).
export const donationsOpen: boolean = false;
