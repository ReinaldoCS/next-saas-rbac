import { type FormEvent, useState, useTransition } from 'react'

interface FormState {
  success: boolean
  message: string | null
  errors: Record<string, string[]> | null
}

export function useFormState(
  action: (data: FormData) => Promise<FormState>,
  onSuccess?: () => Promise<void> | void,
  initialState?: FormState,
) {
  const [formState, setFormState] = useState<FormState>(
    initialState ?? { success: false, message: null, errors: null },
  )

  const [isPending, setTransition] = useTransition()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)

    setTransition(async () => {
      const state = await action(data)

      setFormState(state)

      if (state.success) {
        form.reset()

        if (onSuccess) {
          await onSuccess()
        }
      }
    })
  }

  return [formState, handleSubmit, isPending] as const
}
