import type { GameContext } from '../context'
import { TEXT } from '../data/text'
import { exportSave, importSave } from '../state/storage'
import { SaveError } from '../state/upgrades'
import { button, el } from './dom'
import type { Menus } from './menus'

const T = TEXT.settings

/** The settings menu. For now it holds save export and import. */
export function openSettings(ctx: GameContext, menus: Menus) {
  const status = el('p', { class: 'status' })
  const actions = el('div', { class: 'row' })
  const picker = el('input')
  picker.type = 'file'
  picker.accept = '.json,application/json'
  picker.hidden = true

  const showMain = () => {
    actions.replaceChildren(button(T.export, doExport), button(T.import, () => picker.click()))
  }

  const doExport = async () => {
    await ctx.store.saveNow()
    const url = URL.createObjectURL(exportSave(ctx.store.state))
    const a = el('a')
    a.href = url
    a.download = TEXT.saveFileName(new Date().toISOString().slice(0, 10))
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    status.textContent = T.exported
  }

  picker.addEventListener('change', async () => {
    const file = picker.files?.[0]
    picker.value = ''
    if (!file) return
    try {
      const state = await importSave(file)
      status.textContent = T.importConfirm
      actions.replaceChildren(
        button(T.importYes, async () => {
          await ctx.store.replace(state)
          ctx.clock.restart()
          status.textContent = T.imported
          showMain()
        }),
        button(T.importNo, () => {
          status.textContent = ''
          showMain()
        }),
      )
    } catch (err) {
      status.textContent = err instanceof SaveError ? err.message : String(err)
    }
  })

  showMain()
  menus.open(
    el('section', { class: 'panel menu' }, [
      el('h1', { text: T.title }),
      actions,
      status,
      picker,
      el('p', { class: 'hint', text: T.close }),
    ]),
  )
}
