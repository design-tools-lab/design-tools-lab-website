const { FontAwesomeIcon } = require("@campj/eleventy-fa-icons");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets/css/style.css");
  eleventyConfig.addPassthroughCopy("src/assets/images");

  eleventyConfig.addPairedAsyncShortcode(
    "bibtex",
    require("eleventy-plugin-bibtex")
  );

  eleventyConfig.addNunjucksShortcode("FontAwesomeIcon", FontAwesomeIcon);

  // Sort alumni by when they ended their time in the lab, most recent first.
  // Ties (same end semester) put whoever was in the lab longest first (earliest
  // start). Each academic year is ordered fall, spring, summer.
  const seasonOrder = { fall: 0, spring: 1, summer: 2 };
  const semesterKey = (season, year) => {
    const s = season.toLowerCase();
    // Fall starts the academic year; spring/summer belong to the year that began the prior fall.
    const academicYear = s === "fall" ? Number(year) : Number(year) - 1;
    return academicYear * 10 + seasonOrder[s];
  };
  const dateKeys = (dates) => {
    const matches = [...String(dates || "").matchAll(/(spring|summer|fall)\s+(\d{4})/gi)];
    if (matches.length === 0) return { start: Infinity, end: -Infinity };
    const first = matches[0];
    const last = matches[matches.length - 1];
    return { start: semesterKey(first[1], first[2]), end: semesterKey(last[1], last[2]) };
  };
  eleventyConfig.addCollection("alumni", (collectionApi) =>
    collectionApi.getFilteredByTag("alumni").sort((a, b) => {
      const ka = dateKeys(a.data.dates);
      const kb = dateKeys(b.data.dates);
      // Most recent end first; tie-break by earliest start (longest tenure) first.
      return kb.end - ka.end || ka.start - kb.start;
    })
  );

  return {
    dir: {
      input: "src",
      data: "_data",
      includes: "_includes",
      layouts: "_layouts"
    }
  };
}