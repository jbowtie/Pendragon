/* global $ */
export default function (application, element, context, options) {
  if ((application.document.parent.getFlag('Pendragon', 'css-adventure-entry') ?? false)) {
    if (!element.classList.contains('pen-adventure-entry')) {
      element.classList.add('pen-adventure-entry')
    }

    //Force to use themed-light
    if (!element.classList.contains('theme-light')) {
      element.classList.add('themed','theme-light')
    }

    element.querySelectorAll('section.tmi-toggleable p.toggle').forEach((element) => element.addEventListener('click', (event) => {
      /* // jQuery */
      const section = $(element.closest('section.tmi-toggleable').querySelector('div.toggle'))
      if (section.is(':visible')) {
        element.innerText = 'Reveal'
        section.slideUp()
      } else {
        element.innerText = 'Hide'
        section.slideDown()
      }
    }))
  }
}