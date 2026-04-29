const fs = require('fs');
const handlebars = require('handlebars');
const handlebarsWax = require('handlebars-wax');
const moment = require('moment');

handlebars.registerHelper({
  removeProtocol: url => url.replace(/.*?:\/\//g, ''),
  concat: (...args) => args.filter(arg => typeof arg !== 'object').join(''),
  // Arguments: {address, city, subdivision, postalCode, countryCode}
  // formatAddress: (...args) => addressFormat(args).join(' '),
  formatAddress: (...args) => args.filter(arg => typeof arg !== 'object').join(' '),
  formatDate: date => moment(date).format('MM/YYYY'),
  lowercase: s => s.toLowerCase(),
  eq: (a, b) => a === b,
  fluencyDots: (fluency) => {
    const levels = {
      Native: 5,
      Fluent: 4,
      Conversational: 3,
      Intermediate: 3,
      Basic: 2,
      Beginner: 1,
    };
    const filled = levels[fluency] !== undefined ? levels[fluency] : 0;
    return new handlebars.SafeString(
      '<span class="dot filled"></span>'.repeat(filled) +
      '<span class="dot"></span>'.repeat(5 - filled),
    );
  },
});

function render(resume) {
  const dir = `${__dirname}/src`;
  const css = fs.readFileSync(`${dir}/style.css`, 'utf-8');
  const resumeTemplate = fs.readFileSync(`${dir}/resume.hbs`, 'utf-8');

  const Handlebars = handlebarsWax(handlebars);

  Handlebars.partials(`${dir}/partials/**/*.{hbs,js}`);

  const enrichedResume = {
    ...resume,
    openSourceProjects: (resume.projects || []).filter(p => !p.closed),
    closedSourceProjects: (resume.projects || []).filter(p => p.closed),
  };

  return Handlebars.compile(resumeTemplate)({
    style: `<style>${css}</style>`,
    resume: enrichedResume,
  });
}

module.exports = {
  render,
  pdfRenderOptions: {
    mediaType: 'print',
    format: 'A4',
    margin: {
      top: '0.4in',
      bottom: '0.4in',
      left: '0',
      right: '0',
    },
  },
};
