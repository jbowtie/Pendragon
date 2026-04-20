import  PENDialog  from "./pen-dialog.mjs";

export class PendragonRollTableConfig extends foundry.applications.sheets.RollTableSheet {
  constructor(data, context) {
    data.img = 'icons/svg/d20.svg'
    super(data, context)
  }

  static DEFAULT_OPTIONS = {
    classes: ["PendragonRoll", "themed", "theme-light"],
    position: {
      width: 720,
    },
    tag: "form",
    form: {
      submitOnChange: true,
    },
     window: {
      resizable: true,
    },
    actions: {
      drawResult: PendragonRollTableConfig._onDrawResult,
    }    
  };

  /** @override */
  static PARTS = {
    sheet: {
      template: "templates/sheets/roll-table/view.hbs",
      templates: ["templates/sheets/roll-table/result-details.hbs"],
      scrollable: ["table[data-results] tbody"],
      root: true
    },
    header: {template: "templates/sheets/roll-table/edit/header.hbs"},
    tabs: {template: "templates/generic/tab-navigation.hbs"},
    results: {
      template: "templates/sheets/roll-table/edit/results.hbs",
      templates: ["templates/sheets/roll-table/result-details.hbs"],
      scrollable: ["table[data-results] tbody"]
    },
    form: {
      closeOnSubmit: false,
      submitOnClose: true,
      submitOnChange: true,
    },    
    summary: {template: "systems/Pendragon/templates/roll-table/summary.hbs"},
    footer: {template: "templates/generic/form-footer.hbs"}
  };


  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.allowMod = this.document.flags.Pendragon?.penTable?.penModRoll ?? false
    return context
  }  

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    return context;
  }  


  // -----------------------------------LISTENERS-----------------------------------------
  //Activate event listeners using the prepared sheet HTML
  async _onRender(context, _options) {
    await super._onRender(context, _options);
    this.element.querySelectorAll('.modRoll').forEach(n => n.addEventListener("click", PendragonRollTableConfig._onModToggle.bind(this)))
  }  


  static async _onModToggle(event) {
    let modRoll = await this.document.flags.Pendragon?.penTable?.penModRoll;
    await this.document.update ({
        'flags.Pendragon.penTable.penModRoll': !modRoll,
    });
  }

  // -----------------------------------ACTIONS-----------------------------------------
  /**
   * Roll and draw a TableResult.
   * @this {RollTableSheet}
   * @type {ApplicationClickAction}
   */
  static async _onDrawResult(event,button) {
    if ( this.form ) {await this.submit({operation: {render: false}})};
    button.disabled = true;
    const table = this.document;
    let formula = await PendragonRollTableConfig.askMod(table)
    if (!formula) {
      button.disabled = false;
      return;
    };

    const roll = new Roll(formula);
    const tableRoll = await table.roll({roll});      
    const draws = table.getResultsForRoll(tableRoll.roll.total);
    if ( draws.length > 0 ) {
      if ( game.settings.get("core", "animateRollTable") ) await this._animateRoll(draws);
      await table.draw(tableRoll);
    }
    
    // Reenable the button if drawing with replacement since the draw won't trigger a sheet re-render
    if ( table.replacement ) button.disabled = false;
  }

  static async askMod (table) {
    let formula = table.formula;
    let askMod = table.flags.Pendragon?.penTable?.penModRoll ?? false;

    const available = table.results;
    if (!available) {return formula;}
    const availableRange = available.reduce((range, result) => {
      const r = result.range;
      if ( !range[0] || (r[0] < range[0]) ) range[0] = r[0];
      if ( !range[1] || (r[1] > range[1]) ) range[1] = r[1];
      return range;
    }, [null, null]);
    
    let roll = Roll.create(formula);
    let minMod = availableRange[0] - (await roll.reroll({minimize: true})).total;
    let maxMod = availableRange[1] - (await roll.reroll({maximize: true})).total;

    if(minMod === 0 && maxMod === 0) {return formula}

    let actMod = 0
    if (minMod === maxMod) {
      actMod = minMod
    } else {
      let data ={minMod,maxMod,formula,tableName: table.name}
      const html = await foundry.applications.handlebars.renderTemplate('systems/Pendragon/templates/dialog/tableMod.hbs',data);
      let modifier = await PENDialog.prompt({
        window: {title: table.name},
        content: html,
        ok: { callback: (event, button) => button.form.modifier.value || 0 },
      });
      if (!modifier) {return false};
      actMod = Math.max(Math.min(modifier, maxMod),minMod)
    }
    if (actMod <0) {
      formula = ([formula, actMod].join(""))
    } else if (actMod>0) {
      formula = ([formula, actMod].join("+"))
    }
    return formula
  }
}

