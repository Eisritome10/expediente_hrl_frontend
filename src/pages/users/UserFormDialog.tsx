import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import { userCreateFormSchema, userEditFormSchema, type UserCreateFormValues, type UserEditFormValues } from '@/schemas/user.schema'
import { getUserErrorMessage } from '@/pages/users/user-error-messages'
import type { User } from '@/types/entities'
import type { UserRole } from '@/types/auth'
import { FormAlert } from '@/components/ui/FormAlert'

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  RESEARCHER: 'Investigador',
}

export function UserFormDialog({
  open,
  onClose,
  user,
}: {
  open: boolean
  onClose: () => void
  user: User | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={user ? 'Editar usuario' : 'Nuevo usuario'}>
      {open &&
        (user ? (
          <UserEditFields key={user.id} user={user} onClose={onClose} />
        ) : (
          <UserCreateFields onClose={onClose} />
        ))}
    </Dialog>
  )
}

function UserCreateFields({ onClose }: { onClose: () => void }) {
  const [formError, setFormError] = useState<string | null>(null)
  const createUser = useCreateUser()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { username: '', fullName: '', password: '', status: 'ACTIVE' },
  })

  const status = watch('status')

  const onSubmit = async (values: UserCreateFormValues) => {
    setFormError(null)
    try {
      await createUser.mutateAsync({
        username: values.username.trim(),
        fullName: values.fullName.trim(),
        password: values.password,
        role: 'ADMIN',
        status: values.status,
      })
      onClose()
    } catch (error) {
      setFormError(getUserErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Usuario" htmlFor="username" error={errors.username?.message} required>
        <Input id="username" autoFocus placeholder="jperez" error={errors.username?.message} {...register('username')} />
      </FormField>

      <FormField label="Nombre completo" htmlFor="fullName" error={errors.fullName?.message} required>
        <Input id="fullName" placeholder="Juan Pérez" error={errors.fullName?.message} {...register('fullName')} />
      </FormField>

      <FormField label="Contraseña" htmlFor="password" error={errors.password?.message} required>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
      </FormField>

      <FormField label="Rol" htmlFor="role">
        <Input id="role" readOnly disabled value={roleLabels.ADMIN} />
      </FormField>

      <Switch
        checked={status === 'ACTIVE'}
        onChange={(checked) => setValue('status', checked ? 'ACTIVE' : 'INACTIVE')}
        label="Cuenta activa"
        description="Permite iniciar sesión en el panel administrativo."
      />

      {formError && (
        <FormAlert>{formError}</FormAlert>
      )}

      <div className="mt-1 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  )
}

function UserEditFields({ user, onClose }: { user: User; onClose: () => void }) {
  const [formError, setFormError] = useState<string | null>(null)
  const updateUser = useUpdateUser()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { fullName: user.fullName, status: user.status },
  })

  const status = watch('status')

  const onSubmit = async (values: UserEditFormValues) => {
    setFormError(null)
    try {
      await updateUser.mutateAsync({ id: user.id, payload: { fullName: values.fullName.trim(), status: values.status } })
      onClose()
    } catch (error) {
      setFormError(getUserErrorMessage(error))
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Usuario" htmlFor="editUsername">
        <Input id="editUsername" readOnly disabled value={user.username} />
      </FormField>

      <FormField label="Nombre completo" htmlFor="fullName" error={errors.fullName?.message} required>
        <Input id="fullName" autoFocus error={errors.fullName?.message} {...register('fullName')} />
      </FormField>

      <FormField label="Rol" htmlFor="editRole">
        <Input id="editRole" readOnly disabled value={roleLabels[user.role]} />
      </FormField>

      <Switch
        checked={status === 'ACTIVE'}
        onChange={(checked) => setValue('status', checked ? 'ACTIVE' : 'INACTIVE')}
        label="Cuenta activa"
        description="Permite iniciar sesión en el panel administrativo."
      />

      {formError && (
        <FormAlert>{formError}</FormAlert>
      )}

      <div className="mt-1 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
