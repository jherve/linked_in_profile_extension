# Linked In Profile JSON exporter

LinkedIn does not provide a way to download your profile in another form than a PDF, which is hardly usable by other tools you might use to manage your resume.. and does not contain all the information you input anyway.

This Firefox extension enables you to download your profile as a plain JSON file.

## Installation

1. Clone the repository
1. Run build : `npm install && npm run build`
1. Install the extension as [temporary](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing) by pointing to `extension/manifest.json` (and NOT the manifest.json from root directory).

## Usage

1. Visit your own profile, while logged-in : https://www.linkedin.com/in
1. Visit the detail pages related to your projects (/in/\<your-username\>/details/projects), your skills (/in/\<your-username\>/details/skills), ...
1. Click the extension's button, and download the JSON file
1. Profit !

## Conversion to YML file

The JSON file can easily be converted to YAML using `yq` with e.g. `cat profile.json | yq -P -oy`
