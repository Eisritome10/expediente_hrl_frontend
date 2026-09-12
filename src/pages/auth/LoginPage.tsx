import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { ApiError } from '@/types/common'

const loginSchema = z.object({
  username: z.string().min(1, 'Ingresa tu usuario.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      await login(values.username, values.password)
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setFormError('Usuario o contraseña incorrectos.')
      } else {
        setFormError('No se pudo conectar con el servidor. Intenta nuevamente.')
      }
    }
  }

  return (
    <Card className="p-6">
      <h1 className="mb-1 text-lg font-semibold text-text">Iniciar sesión</h1>
      <p className="mb-5 text-sm text-text-muted">Ingresa tus credenciales para continuar.</p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Usuario" htmlFor="username" error={errors.username?.message}>
          <Input id="username" autoComplete="username" autoFocus {...register('username')} />
        </FormField>

        <FormField label="Contraseña" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
        </FormField>

        {formError && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <WarningCircleIcon size={18} className="shrink-0" />
            {formError}
          </div>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-1 w-full">
          Ingresar
        </Button>
      </form>
    </Card>
  )
}
