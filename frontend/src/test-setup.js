// jsdom (the fake browser used by the tests) has no <dialog> methods yet. These stand-ins do
// the part the tests can see: open shows it, close hides it and fires "close".
HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true
}
HTMLDialogElement.prototype.close = function close() {
  this.open = false
  this.dispatchEvent(new Event('close'))
}
