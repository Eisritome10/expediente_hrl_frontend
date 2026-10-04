import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput, FormField } from '@/components/ui/Input'
import { homePathForRole } from '@/lib/role-home'
import { ApiError } from '@/types/common'
import { getAuthErrorMessage } from '@/pages/auth/auth-error-messages'
import { FormAlert } from '@/components/ui/FormAlert'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Ingresa tu usuario, DNI o correo.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (user) return <Navigate to={homePathForRole(user.role)} replace />

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      const sessionUser = await login(values.identifier, values.password)
      const from = (location.state as { from?: string } | null)?.from
      // Un investigador nunca aterriza en el panel administrativo, aunque haya llegado desde una ruta de admin.
      const redirectTo = sessionUser.role === 'RESEARCHER' ? homePathForRole('RESEARCHER') : (from ?? '/')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(getAuthErrorMessage(error))
      } else if (error instanceof Error && error.message) {
        setFormError(error.message)
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
        <FormField
          label="Usuario, DNI o correo"
          htmlFor="identifier"
          hint="Los investigadores ingresan con su DNI."
          error={errors.identifier?.message}
          required
        >
          <Input
            id="identifier"
            autoComplete="username"
            autoFocus
            error={errors.identifier?.message}
            {...register('identifier')}
          />
        </FormField>

        <FormField label="Contraseña" htmlFor="password" error={errors.password?.message} required>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </FormField>

        {formError && <FormAlert>{formError}</FormAlert>}

        <Button type="submit" loading={isSubmitting} className="mt-1 w-full py-3">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
    </Card>
  )
}
