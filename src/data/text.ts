/** Words the player reads in menus. */
export const TEXT = {
  settings: {
    title: 'Settings',
    export: 'Export save',
    import: 'Import save',
    exported: 'Save exported.',
    importConfirm: 'Replace the current game with this save?',
    importYes: 'Replace',
    importNo: 'Cancel',
    imported: 'Save imported.',
    close: 'Esc to close',
  },
  saveFileName: (date: string) => `unrot-save-${date}.json`,
}
