import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { useRef, useState } from 'react'

interface Props {
  onApply: (count: number) => void
}

export function BulkSelectOverlay({ onApply }: Props) {
  const overlayRef = useRef<OverlayPanel>(null)
  const [count, setCount] = useState('')

  return (
    <>
      <Button
        label="Custom Select"
        onClick={(e) => overlayRef.current?.toggle(e)}
      />

      <OverlayPanel ref={overlayRef}>
        <div className="flex gap-2">
          <InputText
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="Enter number"
          />
          <Button
            label="Apply"
            onClick={() => {
              const n = Number(count)
              if (n > 0) onApply(n)
              console.log('BulkSelectOverlay: apply clicked with', n)
              overlayRef.current?.hide()
            }}
          />
        </div>
      </OverlayPanel>
    </>
  )
}
