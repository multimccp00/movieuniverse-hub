// Two dropdowns to pick the playlists to compare. onCompare(a, b) gets the two ids.
import { useState } from 'react'
import './CompareForm.css'

export default function CompareForm({ playlists, initialA = '', initialB = '', onCompare }) {
  const [a, setA] = useState(initialA)
  const [b, setB] = useState(initialB)

  function handleSubmit(event) {
    event.preventDefault()
    onCompare(a, b)
  }

  // One dropdown; used twice. "by ana" because different users can have lists with the same name.
  const picker = (label, value, setValue) => (
    <label className="stack compare-form__field">
      <span>{label}</span>
      <select className="input" value={value} onChange={(e) => setValue(e.target.value)} required>
        <option value="">Choose a playlist</option>
        {playlists.map((p) => (
          <option key={p.id} value={p.id}>{p.name} (by {p.owner})</option>
        ))}
      </select>
    </label>
  )

  return (
    <form className="compare-form" onSubmit={handleSubmit}>
      {picker('First playlist', a, setA)}
      {picker('Second playlist', b, setB)}
      <button className="btn btn--primary" type="submit" disabled={!a || !b || a === b}>
        Compare
      </button>
    </form>
  )
}
