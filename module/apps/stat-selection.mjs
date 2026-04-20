import PENDialog from "../setup/pen-dialog.mjs";

export class StatsSelectDialog extends PENDialog {

  _onRender(context, _options) {
    this.element.querySelectorAll('.up.rollable').forEach(n => n.addEventListener("click", this._upArrow.bind(this)))
    this.element.querySelectorAll('.down.rollable').forEach(n => n.addEventListener("click", this._downArrow.bind(this)))
  }

  async _upArrow(event) {
    await this._onSelectArrowClicked(event, 1)
  }

  async _downArrow(event) {
    await this._onSelectArrowClicked(event, -1)
  }

  async _onSelectArrowClicked(event, change) {
    const form = event.currentTarget.closest('.stats-input')
    const chosen = event.currentTarget.closest('.large-icon')
    let choice = chosen.dataset.set
    //Don't allow spend over pointsMax
    if (this.options.data.added + change > this.options.data.pointsMax) { change = 0 }
    //Stats only allowed in range 8-15  
    if ((this.options.data.stats[choice].value + change) < 8 || (this.options.data.stats[choice].value + change) > 15) { change = 0 }
    //Change the stat value & points spent
    this.options.data.stats[choice].value = this.options.data.stats[choice].value + change
    this.options.data.added = this.options.data.added + change

    //Update points spent and the stats value on the form

    const divCount = form.querySelector('.count')
    divCount.innerText = this.options.data.added
    const statVal = form.querySelector('.item-' + choice)
    statVal.innerText = this.options.data.stats[choice].value
  }

  static async create(culture) {
    let destination = 'systems/Pendragon/templates/dialog/statsInput.hbs';
    let winTitle = game.i18n.localize("PEN.inputStats");
    let data = {
      stats: {
        siz: { value: 10, label: game.i18n.localize('PENDRAGON.StatSiz'), bonus:culture.system.stats.siz.bonus },
        dex: { value: 10, label: game.i18n.localize('PENDRAGON.StatDex'), bonus:culture.system.stats.dex.bonus },
        str: { value: 10, label: game.i18n.localize('PENDRAGON.StatStr'), bonus:culture.system.stats.str.bonus },
        con: { value: 10, label: game.i18n.localize('PENDRAGON.StatCon'), bonus:culture.system.stats.con.bonus },
        app: { value: 10, label: game.i18n.localize('PENDRAGON.StatApp'), bonus:culture.system.stats.app.bonus }
      },
      culture,
      pointsMax: 60,
      added: 50
    }
    const html = await foundry.applications.handlebars.renderTemplate(destination, data);

    return new Promise(resolve => {
      const dlg = StatsSelectDialog.wait(
        {
          window: { title: winTitle },
          form: { closeOnSubmit: false },
          content: html,
          data,
          buttons: [{
            label: game.i18n.localize("PEN.confirm"),
            callback: (event, button, dialog) => {
              if (dialog.options.data.added < dialog.options.data.pointsMax) {
                button.disabled = true
              } else {
                dialog.options.form.closeOnSubmit = true
                return resolve(dialog.options.data.stats)
              }
            }
          }],
        })
    })
  }

}