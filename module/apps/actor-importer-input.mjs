import { ActorImport } from "./actor-import.mjs";

const { api } = foundry.applications;

export class ActorImporterDialog extends api.HandlebarsApplicationMixin(
  api.ApplicationV2
) {
  constructor(options = {}){
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ['Pendragon', 'sheet', 'actor-importer'],
    position: {
        width: 660,
        height: 755,
    },    
    tag: "form",
    // automatically updates the item
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
    },
    window: {
      resizable: true,
      title: "PEN.actorImporter"
    },
    actions: {
      process_text: this._processText,      
    }
  }

  static PARTS = {
    form: {
      template: "systems/Pendragon/templates/dialog/actorImporter.hbs"
    }
  }

  async _prepareContext (options) {
    const context = {
      ...await super._prepareContext(options),
    }
    return context;
  }


  static async _processText(event, target) {
     const form = $(target).closest('form')
     let inputs = ActorImporterDialog.getInputs(form) 
     this.close(); 
     await ActorImport.processSourceText(inputs,'npc')
  }


  static getInputs (form) {
  const inputs = {}
  if (form.find('#src-text').length > 0) {
    inputs.text = form.find('#src-text').val().trim()
  }
  return inputs
}

}  